import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { createId } from './format';
import { isSnapshot, mergeSnapshots, snapshotKey } from './merge';
import { createSeed } from './seed';
import type { Announcement, CloudMeta, MediaItem, Punch, SensorMethod, Snapshot } from './types';

const STORAGE_KEY = 'faro.snapshot.v1';

type Listener = (snapshot: Snapshot, meta: CloudMeta) => void;

type PlantChannel = {
  postMessage: (data: Snapshot) => void;
  onmessage: ((event: { data: unknown }) => void) | null;
};

function cloudUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_CLOUD_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (Platform.OS === 'web') return 'http://127.0.0.1:8787';
  return '';
}

async function readStored(): Promise<Snapshot | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function requestState(url: string, snapshot?: Snapshot): Promise<Snapshot> {
  const response = await fetch(`${url}/v1/state`, {
    method: snapshot ? 'POST' : 'GET',
    headers: snapshot ? { 'Content-Type': 'application/json' } : undefined,
    body: snapshot ? JSON.stringify(snapshot) : undefined,
  });
  if (!response.ok) throw new Error(`La nube respondió ${response.status}`);
  const body: unknown = await response.json();
  if (!isSnapshot(body)) throw new Error('La nube envió un estado inválido');
  return body;
}

export class PlantCloud {
  private snapshot: Snapshot | null = null;
  private meta: CloudMeta = { mode: 'local', lastSync: null, error: null };
  private listeners = new Set<Listener>();
  private started = false;
  private busy = false;
  private dirty = false;
  private generation = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private channel: PlantChannel | null = null;
  private readonly url = cloudUrl();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    if (this.snapshot) listener(this.snapshot, this.meta);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    const stored = await readStored();
    this.snapshot = stored ?? createSeed();
    if (!stored) await this.persist();
    this.meta = {
      mode: this.url ? 'offline' : 'local',
      lastSync: null,
      error: null,
    };
    this.openChannel();
    this.emit();
    if (this.url) {
      void this.sync();
      this.timer = setInterval(() => {
        void this.sync();
      }, 3000);
    }
  }

  getSnapshot(): Snapshot | null {
    return this.snapshot;
  }

  getMeta(): CloudMeta {
    return this.meta;
  }

  publishAnnouncement(input: {
    title: string;
    body: string;
    priority: Announcement['priority'];
    author: string;
  }): void {
    const now = Date.now();
    this.mutate((current) => ({
      ...current,
      announcements: [
        {
          id: createId('aviso'),
          title: input.title.trim(),
          body: input.body.trim(),
          priority: input.priority,
          author: input.author,
          createdAt: now,
          updatedAt: now,
          active: true,
        },
        ...current.announcements,
      ],
    }));
  }

  setAnnouncementActive(id: string, active: boolean): void {
    this.mutate((current) => ({
      ...current,
      announcements: current.announcements.map((item) =>
        item.id === id ? { ...item, active, updatedAt: Date.now() } : item,
      ),
    }));
  }

  removeAnnouncement(id: string): void {
    const now = Date.now();
    this.mutate((current) => ({
      ...current,
      announcements: current.announcements.map((item) =>
        item.id === id ? { ...item, deleted: true, active: false, updatedAt: now } : item,
      ),
    }));
  }

  upsertMedia(input: {
    kind: MediaItem['kind'];
    title: string;
    body: string;
    uri?: string;
    seconds: number;
  }): void {
    const now = Date.now();
    const item: MediaItem = {
      id: createId('medio'),
      kind: input.kind,
      title: input.title.trim(),
      body: input.body.trim(),
      uri: input.uri?.trim() || undefined,
      accent: input.kind === 'video' ? '#8FA3A0' : '#6FCFC4',
      seconds: input.seconds,
      active: true,
      updatedAt: now,
    };
    this.mutate((current) => ({
      ...current,
      playlist: [item, ...current.playlist],
    }));
  }

  setMediaActive(id: string, active: boolean): void {
    this.mutate((current) => ({
      ...current,
      playlist: current.playlist.map((item) =>
        item.id === id ? { ...item, active, updatedAt: Date.now() } : item,
      ),
    }));
  }

  removeMedia(id: string): void {
    const now = Date.now();
    this.mutate((current) => ({
      ...current,
      playlist: current.playlist.map((item) =>
        item.id === id ? { ...item, deleted: true, active: false, updatedAt: now } : item,
      ),
    }));
  }

  punch(input: {
    employeeId: string;
    kind: Punch['kind'];
    method: SensorMethod;
    device: string;
  }): Punch {
    const now = Date.now();
    const punch: Punch = {
      id: createId('checada'),
      employeeId: input.employeeId,
      kind: input.kind,
      method: input.method,
      at: now,
      device: input.device,
      updatedAt: now,
    };
    this.mutate((current) => ({
      ...current,
      punches: [punch, ...current.punches].slice(0, 300),
    }));
    return punch;
  }

  private mutate(change: (current: Snapshot) => Snapshot): void {
    if (!this.snapshot) return;
    const next = change(this.snapshot);
    this.snapshot = {
      ...next,
      revision: next.revision + 1,
      updatedAt: Date.now(),
    };
    this.generation += 1;
    this.dirty = true;
    void this.persist();
    this.channel?.postMessage(this.snapshot);
    this.emit();
  }

  private async persist(): Promise<void> {
    if (!this.snapshot) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot));
  }

  private openChannel(): void {
    const host = globalThis as { BroadcastChannel?: new (name: string) => PlantChannel };
    if (!host.BroadcastChannel) return;
    this.channel = new host.BroadcastChannel('faro-cloud');
    this.channel.onmessage = (event) => {
      if (!this.snapshot || !isSnapshot(event.data)) return;
      const merged = mergeSnapshots(this.snapshot, event.data);
      if (snapshotKey(merged) === snapshotKey(this.snapshot)) return;
      this.snapshot = merged;
      this.generation += 1;
      this.dirty = true;
      void this.persist();
      this.emit();
    };
  }

  private async sync(): Promise<void> {
    if (this.busy || !this.url || !this.snapshot) return;
    this.busy = true;
    const generationAtStart = this.generation;
    try {
      const remote = this.dirty
        ? await requestState(this.url, this.snapshot)
        : await requestState(this.url);
      let merged = mergeSnapshots(this.snapshot, remote);
      if (snapshotKey(merged) !== snapshotKey(remote)) {
        const pushed = await requestState(this.url, merged);
        merged = mergeSnapshots(this.snapshot ?? merged, pushed);
      }
      if (snapshotKey(merged) !== snapshotKey(this.snapshot)) {
        this.snapshot = merged;
        await this.persist();
      }
      this.dirty = this.generation !== generationAtStart;
      this.meta = { mode: 'cloud', lastSync: Date.now(), error: null };
      this.emit();
    } catch (error) {
      const raw = error instanceof Error ? error.message : '';
      const message = /fetch|network|Failed/i.test(raw)
        ? 'No hay servidor de nube en este equipo'
        : raw || 'No se pudo contactar la nube';
      this.meta = { mode: 'offline', lastSync: this.meta.lastSync, error: message };
      this.emit();
    } finally {
      this.busy = false;
    }
  }

  private emit(): void {
    if (!this.snapshot) return;
    for (const listener of this.listeners) listener(this.snapshot, this.meta);
  }
}

export const plantCloud = new PlantCloud();
