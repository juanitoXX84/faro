import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { readLink } from '@/cloud/device';
import { findEmployee } from '@/cloud/directory';
import { plantCloud } from '@/cloud/engine';
import { methodLabel, priorityLabel } from '@/cloud/format';
import type { MediaKind, Priority } from '@/cloud/types';
import { usePlantCloud } from '@/cloud/usePlantCloud';
import { BackLink, CloudBadge, Screen } from '@/components/Chrome';
import { PunchFeed } from '@/components/PunchFeed';
import { useSensorGate } from '@/components/SensorGate';
import { colors, priorityColor } from '@/theme';

const priorities: Priority[] = ['info', 'aviso', 'urgente'];
const kinds: { id: MediaKind; label: string }[] = [
  { id: 'slide', label: 'Diapositiva' },
  { id: 'image', label: 'Imagen' },
  { id: 'video', label: 'Video' },
];

export default function ManagementScreen() {
  const { snapshot, meta } = usePlantCloud();
  const { ask, sheet } = useSensorGate();
  const [unlocked, setUnlocked] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>('aviso');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaBody, setMediaBody] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [mediaKind, setMediaKind] = useState<MediaKind>('slide');

  useEffect(() => {
    void readLink().then((link) => {
      const person = link ? findEmployee(link.employeeId) : undefined;
      if (person?.admin) setAdminName(person.name);
    });
  }, []);

  async function unlock() {
    setNote(null);
    if (!adminName) {
      setNote('Vincula primero el teléfono de Elena Vidal, la supervisora, desde el checador.');
      return;
    }
    const outcome = await ask(`Abrir gestión de ${adminName}`);
    if (!outcome.ok) {
      setNote(outcome.reason);
      return;
    }
    setUnlocked(true);
    setNote(`Gestión abierta con ${methodLabel(outcome.method)}.`);
  }

  function publish() {
    if (title.trim().length < 3 || body.trim().length < 3) {
      setNote('El aviso necesita título y mensaje.');
      return;
    }
    plantCloud.publishAnnouncement({
      title,
      body,
      priority,
      author: adminName ?? 'Supervisión',
    });
    setTitle('');
    setBody('');
    setNote('Aviso publicado. La pantalla lo toma al momento.');
  }

  function addMedia() {
    if (mediaTitle.trim().length < 3) {
      setNote('La pieza necesita un título.');
      return;
    }
    if (mediaKind !== 'slide' && !/^https?:\/\//i.test(mediaUri.trim())) {
      setNote('La imagen o el video necesitan una dirección http o https.');
      return;
    }
    plantCloud.upsertMedia({
      kind: mediaKind,
      title: mediaTitle,
      body: mediaBody || 'Programado desde gestión remota.',
      uri: mediaUri,
      seconds: mediaKind === 'video' ? 30 : 12,
    });
    setMediaTitle('');
    setMediaBody('');
    setMediaUri('');
    setNote('Pieza agregada a la programación.');
  }

  const announcements = snapshot?.announcements.filter((item) => !item.deleted) ?? [];
  const playlist = snapshot?.playlist.filter((item) => !item.deleted) ?? [];

  return (
    <Screen>
      <View style={styles.top}>
        <BackLink />
        <CloudBadge meta={meta} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>Gestión remota</Text>
        <Text style={styles.title}>Tablero y programación</Text>
        <Text style={styles.lead}>
          {adminName
            ? `Este teléfono es de ${adminName}. El sensor confirma cada sesión de gestión.`
            : 'La gestión se abre en el teléfono vinculado a una persona con permiso de supervisor.'}
        </Text>

        {!unlocked ? (
          <Pressable accessibilityRole="button" style={styles.unlock} onPress={() => void unlock()}>
            <Text style={styles.unlockText}>Confirmar con sensor</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.section}>Nuevo aviso</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Mensaje"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multiline]}
              multiline
            />
            <View style={styles.choices}>
              {priorities.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => setPriority(item)}
                  style={[styles.choice, priority === item && { borderColor: priorityColor[item] }]}
                >
                  <Text style={styles.choiceText}>{priorityLabel(item)}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" style={styles.publish} onPress={publish}>
              <Text style={styles.publishText}>Publicar aviso</Text>
            </Pressable>

            <Text style={styles.section}>Avisos</Text>
            {announcements.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowMeta}>{item.active ? 'En pantalla' : 'Oculto'}</Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => plantCloud.setAnnouncementActive(item.id, !item.active)}>
                  <Text style={styles.action}>{item.active ? 'Ocultar' : 'Mostrar'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => plantCloud.removeAnnouncement(item.id)}>
                  <Text style={styles.danger}>Quitar</Text>
                </Pressable>
              </View>
            ))}

            <Text style={styles.section}>Nueva pieza</Text>
            <View style={styles.choices}>
              {kinds.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => setMediaKind(item.id)}
                  style={[styles.choice, mediaKind === item.id && styles.choiceOn]}
                >
                  <Text style={styles.choiceText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={mediaTitle}
              onChangeText={setMediaTitle}
              placeholder="Título de la pieza"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <TextInput
              value={mediaBody}
              onChangeText={setMediaBody}
              placeholder="Texto en pantalla"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            {mediaKind !== 'slide' ? (
              <TextInput
                value={mediaUri}
                onChangeText={setMediaUri}
                placeholder="https://…"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                style={styles.input}
              />
            ) : null}
            <Pressable accessibilityRole="button" style={styles.publish} onPress={addMedia}>
              <Text style={styles.publishText}>Agregar a la programación</Text>
            </Pressable>

            <Text style={styles.section}>Programación</Text>
            {playlist.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowMeta}>
                    {item.kind} · {item.active ? 'Activa' : 'En pausa'}
                  </Text>
                </View>
                <Pressable accessibilityRole="button" onPress={() => plantCloud.setMediaActive(item.id, !item.active)}>
                  <Text style={styles.action}>{item.active ? 'Pausar' : 'Activar'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => plantCloud.removeMedia(item.id)}>
                  <Text style={styles.danger}>Quitar</Text>
                </Pressable>
              </View>
            ))}

            <Text style={styles.section}>Checadas de hoy</Text>
            <PunchFeed punches={snapshot?.punches ?? []} />
          </>
        )}
        {note ? <Text style={styles.note}>{note}</Text> : null}
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
    paddingBottom: 40,
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
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginTop: 6,
  },
  lead: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },
  unlock: {
    marginTop: 22,
    backgroundColor: colors.amber,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  unlockText: {
    color: colors.inkInverse,
    fontSize: 17,
    fontWeight: '700',
  },
  section: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 26,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.bgElevated,
    color: colors.ink,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceOn: {
    borderColor: colors.mint,
  },
  choiceText: {
    color: colors.ink,
    fontWeight: '600',
  },
  publish: {
    backgroundColor: colors.mint,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishText: {
    color: colors.inkInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: colors.ink,
    fontWeight: '700',
  },
  rowMeta: {
    color: colors.muted,
    marginTop: 2,
  },
  action: {
    color: colors.amber,
    fontWeight: '700',
  },
  danger: {
    color: colors.coral,
    fontWeight: '700',
  },
  note: {
    color: colors.paper,
    marginTop: 16,
    lineHeight: 21,
  },
});
