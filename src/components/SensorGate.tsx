import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { confirmWithSensor, type SensorOutcome } from '@/cloud/sensor';
import { colors } from '@/theme';

type Request = {
  purpose: string;
  resolve: (outcome: SensorOutcome) => void;
};

export function useSensorGate() {
  const [request, setRequest] = useState<Request | null>(null);

  const ask = useCallback((purpose: string) => {
    return new Promise<SensorOutcome>((resolve) => {
      void confirmWithSensor(purpose).then((result) => {
        if (result.ok || !result.unavailable) {
          resolve(result);
          return;
        }
        setRequest({ purpose, resolve });
      });
    });
  }, []);

  const close = (outcome: SensorOutcome) => {
    request?.resolve(outcome);
    setRequest(null);
  };

  const sheet = (
    <Modal visible={request !== null} transparent animationType="fade" onRequestClose={() => close({ ok: false, reason: 'Se canceló la confirmación.', unavailable: false })}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.kicker}>Sensor de demostración</Text>
          <Text style={styles.title}>{request?.purpose}</Text>
          <Text style={styles.body}>
            Este aparato no tiene huella ni rostro disponibles. Puedes ensayar el flujo: la checada queda marcada como demostración y no sustituye un sensor real.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.primary}
            onPress={() => close({ ok: true, method: 'huella-demo' })}
          >
            <Text style={styles.primaryText}>Simular huella</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.secondary}
            onPress={() => close({ ok: true, method: 'rostro-demo' })}
          >
            <Text style={styles.secondaryText}>Simular rostro</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => close({ ok: false, reason: 'Se canceló la confirmación.', unavailable: false })}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return { ask, sheet };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,16,24,0.72)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  kicker: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    color: colors.paper,
    fontSize: 15,
    lineHeight: 22,
  },
  primary: {
    backgroundColor: colors.amber,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.inkInverse,
    fontWeight: '700',
    fontSize: 16,
  },
  secondary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 16,
  },
  cancel: {
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
