import type { Announcement, MediaItem, Punch, Snapshot } from './types';

type Identified = { id: string; updatedAt: number };

function mergeById<T extends Identified>(left: T[], right: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of [...left, ...right]) {
    const previous = map.get(item.id);
    if (!previous || item.updatedAt >= previous.updatedAt) {
      map.set(item.id, item);
    }
  }
  return [...map.values()];
}

function contentKey(items: Identified[]): string {
  return items
    .map((item) => {
      const deleted = 'deleted' in item && item.deleted ? 'x' : 'o';
      return `${item.id}:${item.updatedAt}:${deleted}`;
    })
    .sort()
    .join('|');
}

export function snapshotKey(snapshot: Snapshot): string {
  return [
    contentKey(snapshot.announcements),
    contentKey(snapshot.playlist),
    contentKey(snapshot.punches),
  ].join('#');
}

export function mergeSnapshots(local: Snapshot, remote: Snapshot): Snapshot {
  const announcements: Announcement[] = mergeById(local.announcements, remote.announcements);
  const playlist: MediaItem[] = mergeById(local.playlist, remote.playlist);
  const punches: Punch[] = mergeById(local.punches, remote.punches)
    .sort((left, right) => right.at - left.at)
    .slice(0, 300);

  return {
    revision: Math.max(local.revision, remote.revision),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    announcements,
    playlist,
    punches,
  };
}

export function isSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Snapshot>;
  return (
    typeof candidate.revision === 'number' &&
    typeof candidate.updatedAt === 'number' &&
    Array.isArray(candidate.announcements) &&
    Array.isArray(candidate.playlist) &&
    Array.isArray(candidate.punches)
  );
}
