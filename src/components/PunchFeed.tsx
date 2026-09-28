import { StyleSheet, Text, View } from 'react-native';

import { findEmployee } from '@/cloud/directory';
import { formatTime, methodLabel } from '@/cloud/format';
import { punchesToday } from '@/cloud/presence';
import type { Punch } from '@/cloud/types';
import { colors } from '@/theme';

export function PunchFeed({ punches }: { punches: Punch[] }) {
  const today = punchesToday(punches).slice(0, 6);
  if (today.length === 0) {
    return <Text style={styles.empty}>Hoy todavía no hay checadas.</Text>;
  }

  return (
    <View style={styles.list}>
      {today.map((punch) => {
        const employee = findEmployee(punch.employeeId);
        const incoming = punch.kind === 'entrada';
        return (
          <View key={punch.id} style={styles.row}>
            <View style={[styles.pill, { backgroundColor: incoming ? colors.mint : colors.coral }]}>
              <Text style={styles.pillText}>{incoming ? 'Entrada' : 'Salida'}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{employee?.name ?? 'Persona desconocida'}</Text>
              <Text style={styles.meta}>
                {formatTime(punch.at)} · {methodLabel(punch.method)} · {punch.device}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 78,
    alignItems: 'center',
  },
  pillText: {
    color: colors.inkInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
  },
  name: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    color: colors.muted,
    fontSize: 15,
  },
});
