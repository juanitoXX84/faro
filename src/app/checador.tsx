import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { deviceLabel, readLink, saveLink, writeLink } from '@/cloud/device';
import { employees, findEmployee, initials } from '@/cloud/directory';
import { formatTime, methodLabel } from '@/cloud/format';
import { latestPunchByEmployee } from '@/cloud/presence';
import { plantCloud } from '@/cloud/engine';
import type { DeviceLink, PunchKind } from '@/cloud/types';
import { usePlantCloud } from '@/cloud/usePlantCloud';
import { BackLink, CloudBadge, Screen } from '@/components/Chrome';
import { useSensorGate } from '@/components/SensorGate';
import { avatarColor, colors } from '@/theme';

export default function CheckerScreen() {
  const { snapshot, meta } = usePlantCloud();
  const { ask, sheet } = useSensorGate();
  const [link, setLink] = useState<DeviceLink | null>(null);
  const [label, setLabel] = useState('Este teléfono');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void readLink().then(setLink);
    void deviceLabel().then(setLabel);
  }, []);

  const employee = link ? findEmployee(link.employeeId) : undefined;
  const last = employee ? latestPunchByEmployee(snapshot?.punches ?? []).get(employee.id) : undefined;

  async function bind(employeeId: string) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const person = findEmployee(employeeId);
    const outcome = await ask(`Vincular a ${person?.name ?? 'esta persona'}`);
    if (!outcome.ok) {
      setMessage(outcome.reason);
      setBusy(false);
      return;
    }
    const next = await saveLink(employeeId);
    setLink(next);
    setMessage(`Teléfono vinculado con ${methodLabel(outcome.method)}.`);
    setBusy(false);
  }

  async function punch(kind: PunchKind) {
    if (!employee || busy) return;
    setBusy(true);
    setMessage(null);
    const outcome = await ask(kind === 'entrada' ? 'Confirmar entrada' : 'Confirmar salida');
    if (!outcome.ok) {
      setMessage(outcome.reason);
      setBusy(false);
      return;
    }
    plantCloud.punch({
      employeeId: employee.id,
      kind,
      method: outcome.method,
      device: label,
    });
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // El navegador no vibra.
    }
    setMessage(`${kind === 'entrada' ? 'Entrada' : 'Salida'} registrada con ${methodLabel(outcome.method)}.`);
    setBusy(false);
  }

  async function unlink() {
    if (busy) return;
    setBusy(true);
    const outcome = await ask('Confirmar cambio de persona');
    if (!outcome.ok) {
      setMessage(outcome.reason);
      setBusy(false);
      return;
    }
    await writeLink(null);
    setLink(null);
    setMessage(null);
    setBusy(false);
  }

  return (
    <Screen>
      <View style={styles.top}>
        <BackLink />
        <CloudBadge meta={meta} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Checador</Text>
        <Text style={styles.title}>{employee ? employee.name : 'Vincula este teléfono'}</Text>
        <Text style={styles.lead}>
          {employee
            ? `${employee.area} · ${employee.code}. La checada sale a la nube y aparece en la pantalla.`
            : 'El sensor del teléfono confirma a quien ya esté enrolado en el aparato. Elige a la persona de este dispositivo.'}
        </Text>

        {employee ? (
          <View style={styles.panel}>
            <Text style={styles.meta}>
              {last
                ? `Última de hoy: ${last.kind} a las ${formatTime(last.at)} · ${methodLabel(last.method)}`
                : 'Hoy aún no hay checada de esta persona.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={[styles.entry, busy && styles.disabled]}
              onPress={() => void punch('entrada')}
            >
              <Text style={styles.entryText}>Entrada</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={[styles.exit, busy && styles.disabled]}
              onPress={() => void punch('salida')}
            >
              <Text style={styles.exitText}>Salida</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void unlink()} disabled={busy}>
              <Text style={styles.link}>Cambiar de persona</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.people}>
            {employees.map((person) => (
              <Pressable
                key={person.id}
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void bind(person.id)}
                style={styles.person}
              >
                <View style={[styles.avatar, { backgroundColor: avatarColor(person.id) }]}>
                  <Text style={styles.avatarText}>{initials(person.name)}</Text>
                </View>
                <View style={styles.personCopy}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personMeta}>
                    {person.area} · {person.code}
                    {person.admin ? ' · Supervisor' : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
      {sheet}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 28,
  },
  eyebrow: {
    color: colors.amber,
    marginTop: 18,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: 6,
  },
  lead: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },
  panel: {
    marginTop: 22,
    gap: 12,
  },
  meta: {
    color: colors.paper,
    fontSize: 15,
    marginBottom: 4,
  },
  entry: {
    backgroundColor: colors.mint,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
  entryText: {
    color: colors.inkInverse,
    fontSize: 22,
    fontWeight: '700',
  },
  exit: {
    backgroundColor: colors.coral,
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
  },
  exitText: {
    color: colors.inkInverse,
    fontSize: 22,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  link: {
    color: colors.amber,
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 10,
  },
  people: {
    marginTop: 20,
    gap: 10,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.inkInverse,
    fontWeight: '700',
  },
  personCopy: {
    flex: 1,
  },
  personName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  personMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  message: {
    color: colors.paper,
    marginTop: 16,
    fontSize: 15,
    lineHeight: 21,
  },
});
