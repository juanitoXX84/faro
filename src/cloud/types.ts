export type Priority = 'info' | 'aviso' | 'urgente';

export type SensorMethod = 'huella' | 'rostro' | 'iris' | 'huella-demo' | 'rostro-demo';

export type PunchKind = 'entrada' | 'salida';

export type MediaKind = 'slide' | 'image' | 'video';

export type Employee = {
  id: string;
  name: string;
  area: string;
  shift: string;
  code: string;
  admin: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: Priority;
  author: string;
  createdAt: number;
  updatedAt: number;
  active: boolean;
  deleted?: boolean;
};

export type MediaItem = {
  id: string;
  kind: MediaKind;
  title: string;
  body: string;
  uri?: string;
  accent: string;
  seconds: number;
  active: boolean;
  updatedAt: number;
  deleted?: boolean;
};

export type Punch = {
  id: string;
  employeeId: string;
  kind: PunchKind;
  method: SensorMethod;
  at: number;
  device: string;
  updatedAt: number;
};

export type Snapshot = {
  revision: number;
  updatedAt: number;
  announcements: Announcement[];
  playlist: MediaItem[];
  punches: Punch[];
};

export type CloudMode = 'local' | 'cloud' | 'offline';

export type CloudMeta = {
  mode: CloudMode;
  lastSync: number | null;
  error: string | null;
};

export type DeviceLink = {
  employeeId: string;
  at: number;
};
