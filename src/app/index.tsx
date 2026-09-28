import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { peopleInside, punchesToday } from '@/cloud/presence';
import { usePlantCloud } from '@/cloud/usePlantCloud';
import { CloudBadge, Screen } from '@/components/Chrome';
import { colors } from '@/theme';

const destinations = [
  {
    href: '/pantalla',
    kicker: 'Sala y TV',
    title: 'Pantalla',
    body: 'Reloj, tablero de avisos, multimedia y checadas en vivo.',
  },
  {
    href: '/checador',
    kicker: 'Teléfono',
    title: 'Checador',
    body: 'Entrada y salida con huella o rostro, publicadas en la nube.',
  },
  {
    href: '/gestion',
    kicker: 'Supervisor',
    title: 'Gestión',
    body: 'Publica avisos y arma la programación desde el teléfono.',
  },
] as const;

export default function HomeScreen() {
  const { snapshot, meta } = usePlantCloud();
  const punches = snapshot?.punches ?? [];
  const inside = peopleInside(punches).length;
  const today = punchesToday(punches).length;

  return (
    <Screen>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.grow}>
            <Text style={styles.eyebrow}>Planta de ensamble</Text>
            <Text style={styles.title}>Faro</Text>
            <Text style={styles.subtitle}>Pantalla inteligente y checador en la nube.</Text>
          </View>
          <CloudBadge meta={meta} />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{inside}</Text>
            <Text style={styles.statLabel}>En planta</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{today}</Text>
            <Text style={styles.statLabel}>Checadas hoy</Text>
          </View>
        </View>

        <View style={styles.list}>
          {destinations.map((item) => (
            <Pressable
              key={item.href}
              accessibilityRole="button"
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <LinearGradient
                colors={['#162430', '#101A24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.kicker}>{item.kicker}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
        {meta.error ? <Text style={styles.error}>{meta.error}. Los datos siguen en este aparato.</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  grow: {
    flex: 1,
  },
  eyebrow: {
    color: colors.amber,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1.5,
    marginTop: 4,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 420,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.muted,
    marginTop: 2,
  },
  list: {
    marginTop: 18,
    gap: 12,
  },
  scroll: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.84,
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  cardBody: {
    color: colors.paper,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  error: {
    color: colors.coral,
    marginTop: 16,
    lineHeight: 20,
  },
});
