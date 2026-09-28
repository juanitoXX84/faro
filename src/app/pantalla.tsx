import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { findEmployee } from '@/cloud/directory';
import { formatClock, formatLongDate } from '@/cloud/format';
import { peopleInside, shiftName } from '@/cloud/presence';
import { usePlantCloud } from '@/cloud/usePlantCloud';
import { BackLink, CloudBadge } from '@/components/Chrome';
import { MediaStage } from '@/components/MediaStage';
import { activeNotices, NoticeList } from '@/components/NoticeList';
import { PunchFeed } from '@/components/PunchFeed';
import { colors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DisplayScreen() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const { snapshot, meta } = usePlantCloud();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const announcements = snapshot?.announcements ?? [];
  const punches = snapshot?.punches ?? [];
  const notices = activeNotices(announcements);
  const headline = notices[0];
  const inside = peopleInside(punches)
    .map((id) => findEmployee(id)?.name.split(' ')[0])
    .filter((name): name is string => Boolean(name));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.top}>
        <BackLink />
        <Text style={styles.brand}>Faro</Text>
        <CloudBadge meta={meta} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={wide ? styles.columns : styles.stack}>
          <View style={styles.main}>
            <Text style={styles.shift}>{shiftName(now)}</Text>
            <Text style={[styles.clock, wide && styles.clockWide]}>{formatClock(now)}</Text>
            <Text style={styles.date}>{formatLongDate(now)}</Text>
            <View style={styles.ticker}>
              <Text style={styles.tickerLabel}>Tablero</Text>
              <Text style={styles.tickerText}>
                {headline ? `${headline.title}. ${headline.body}` : 'Sin avisos activos.'}
              </Text>
            </View>
            <Text style={styles.section}>Avisos</Text>
            <NoticeList announcements={announcements} />
          </View>

          <View style={[styles.side, wide && styles.sideWide]}>
            <MediaStage playlist={snapshot?.playlist ?? []} />
            <View style={styles.panel}>
              <Text style={styles.section}>En planta · {inside.length}</Text>
              <Text style={styles.inside}>
                {inside.length > 0 ? inside.join(' · ') : 'Nadie ha marcado entrada hoy.'}
              </Text>
              <Text style={[styles.section, styles.sectionGap]}>Últimas checadas</Text>
              <PunchFeed punches={punches} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  brand: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  scroll: {
    paddingBottom: 24,
  },
  columns: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  stack: {
    gap: 22,
  },
  main: {
    flex: 1.3,
    gap: 8,
  },
  side: {
    flex: 0.9,
    gap: 16,
  },
  sideWide: {
    maxWidth: 440,
  },
  shift: {
    color: colors.mint,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  clock: {
    color: colors.ink,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  clockWide: {
    fontSize: 92,
  },
  date: {
    color: colors.muted,
    fontSize: 18,
    textTransform: 'capitalize',
  },
  ticker: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tickerLabel: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tickerText: {
    color: colors.paper,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
  },
  section: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionGap: {
    marginTop: 16,
  },
  panel: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.line,
  },
  inside: {
    color: colors.paper,
    fontSize: 15,
    lineHeight: 22,
  },
});
