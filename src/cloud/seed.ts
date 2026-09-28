import type { Snapshot } from './types';

function minutesAgo(minutes: number, now: number): number {
  return now - minutes * 60_000;
}

export function createSeed(now = Date.now()): Snapshot {
  return {
    revision: 1,
    updatedAt: now,
    announcements: [
      {
        id: 'aviso-seguridad',
        title: 'Junta de seguridad',
        body: '7:40 en el lobby. Repaso de bloqueo de energía antes de arrancar la línea 2.',
        priority: 'urgente',
        author: 'Elena Vidal',
        createdAt: minutesAgo(40, now),
        updatedAt: minutesAgo(40, now),
        active: true,
      },
      {
        id: 'aviso-mantenimiento',
        title: 'Línea 2 fuera de ciclo',
        body: 'Mantenimiento programado a las 16:00. El material en proceso se queda en cuarentena.',
        priority: 'aviso',
        author: 'Diego Salas',
        createdAt: minutesAgo(25, now),
        updatedAt: minutesAgo(25, now),
        active: true,
      },
      {
        id: 'aviso-visita',
        title: 'Visita de calidad',
        body: 'El cliente recorre empaque a las 11:10. EPP completo en pasillos amarillos.',
        priority: 'info',
        author: 'Maya Chen',
        createdAt: minutesAgo(15, now),
        updatedAt: minutesAgo(15, now),
        active: true,
      },
    ],
    playlist: [
      {
        id: 'slide-meta',
        kind: 'slide',
        title: 'Meta del turno',
        body: '1 200 unidades buenas en ensamble. El tablero se actualiza con cada checada.',
        accent: '#E7B15A',
        seconds: 12,
        active: true,
        updatedAt: now,
      },
      {
        id: 'slide-epp',
        kind: 'slide',
        title: 'EPP en piso',
        body: 'Lentes, cofia y calzado de seguridad. Sin excepción en las líneas y en almacén.',
        accent: '#6FCFC4',
        seconds: 12,
        active: true,
        updatedAt: now,
      },
      {
        id: 'slide-calidad',
        kind: 'slide',
        title: 'Primera pieza',
        body: 'Calidad libera la primera pieza de cada orden antes de continuar el lote.',
        accent: '#E07A5F',
        seconds: 12,
        active: true,
        updatedAt: now,
      },
      {
        id: 'video-muestra',
        kind: 'video',
        title: 'Video de muestra',
        body: 'Actívalo en gestión cuando la pantalla tenga red. El clip es de demostración.',
        uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        accent: '#8FA3A0',
        seconds: 30,
        active: false,
        updatedAt: now,
      },
    ],
    punches: [
      {
        id: 'punch-ana',
        employeeId: 'e-ana',
        kind: 'entrada',
        method: 'huella',
        at: minutesAgo(180, now),
        device: 'Teléfono de Ana',
        updatedAt: minutesAgo(180, now),
      },
      {
        id: 'punch-luis',
        employeeId: 'e-luis',
        kind: 'entrada',
        method: 'huella',
        at: minutesAgo(150, now),
        device: 'Teléfono de Luis',
        updatedAt: minutesAgo(150, now),
      },
      {
        id: 'punch-maya',
        employeeId: 'e-maya',
        kind: 'entrada',
        method: 'rostro',
        at: minutesAgo(95, now),
        device: 'Teléfono de Maya',
        updatedAt: minutesAgo(95, now),
      },
    ],
  };
}
