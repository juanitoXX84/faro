import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePlantCloud } from '@/cloud/usePlantCloud';
import { colors } from '@/theme';

function Gate({ children }: { children: ReactNode }) {
  const { ready } = usePlantCloud();
  if (!ready) {
    return (
      <View style={styles.boot}>
        <Text style={styles.mark}>Faro</Text>
        <ActivityIndicator color={colors.amber} />
        <Text style={styles.caption}>Abriendo la planta</Text>
      </View>
    );
  }
  return children;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Gate>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </Gate>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  mark: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  caption: {
    color: colors.muted,
    fontSize: 15,
  },
});
