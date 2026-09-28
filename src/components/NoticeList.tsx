import { StyleSheet, Text, View } from 'react-native';

import { formatTime, priorityLabel } from '@/cloud/format';
import type { Announcement } from '@/cloud/types';
import { colors, priorityColor } from '@/theme';

const rank: Record<Announcement['priority'], number> = {
  urgente: 0,
  aviso: 1,
  info: 2,
};

export function activeNotices(announcements: Announcement[]): Announcement[] {
  return announcements
    .filter((item) => item.active && !item.deleted)
    .sort((left, right) => rank[left.priority] - rank[right.priority] || right.createdAt - left.createdAt);
}

export function NoticeList({ announcements }: { announcements: Announcement[] }) {
  const notices = activeNotices(announcements);
  if (notices.length === 0) {
    return <Text style={styles.empty}>El tablero está en blanco.</Text>;
  }

  return (
    <View style={styles.list}>
      {notices.map((notice) => (
        <View key={notice.id} style={styles.card}>
          <View style={[styles.mark, { backgroundColor: priorityColor[notice.priority] }]} />
          <View style={styles.copy}>
            <Text style={styles.meta}>
              {priorityLabel(notice.priority)} · {formatTime(notice.createdAt)} · {notice.author}
            </Text>
            <Text style={styles.title}>{notice.title}</Text>
            <Text style={styles.body}>{notice.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  mark: {
    width: 6,
  },
  copy: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: colors.paper,
    fontSize: 15,
    lineHeight: 21,
  },
  empty: {
    color: colors.muted,
    fontSize: 16,
  },
});
