import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CloudMeta } from '@/cloud/types';
import { colors } from '@/theme';

export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      {children}
    </View>
  );
}

export function BackLink() {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
      <Text style={styles.back}>Inicio</Text>
    </Pressable>
  );
}

export function CloudBadge({ meta }: { meta: CloudMeta }) {
  const tone = meta.mode === 'cloud' ? colors.mint : meta.mode === 'offline' ? colors.coral : colors.amber;
  const label =
    meta.mode === 'cloud' ? 'En la nube' : meta.mode === 'offline' ? 'Sin enlace' : 'Este aparato';
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  back: {
    color: colors.amber,
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgElevated,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
});
