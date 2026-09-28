import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeSnapshots, snapshotKey } from './merge.ts';
import type { Snapshot } from './types.ts';

function base(updatedAt: number): Snapshot {
  return {
    revision: 1,
    updatedAt,
    announcements: [],
    playlist: [],
    punches: [],
  };
}

test('une checadas de dos aparatos sin perder ninguna', () => {
  const phone = {
    ...base(20),
    punches: [
      {
        id: 'p1',
        employeeId: 'e-ana',
        kind: 'entrada' as const,
        method: 'huella' as const,
        at: 10,
        device: 'Teléfono',
        updatedAt: 10,
      },
    ],
  };
  const display = {
    ...base(30),
    punches: [
      {
        id: 'p2',
        employeeId: 'e-luis',
        kind: 'salida' as const,
        method: 'rostro' as const,
        at: 30,
        device: 'Pantalla',
        updatedAt: 30,
      },
    ],
  };

  const merged = mergeSnapshots(phone, display);
  assert.equal(merged.punches.length, 2);
  assert.equal(merged.updatedAt, 30);
});

test('el aviso más reciente gana y un borrado no revive', () => {
  const older = {
    ...base(10),
    announcements: [
      {
        id: 'a1',
        title: 'Viejo',
        body: 'Texto',
        priority: 'info' as const,
        author: 'Elena',
        createdAt: 1,
        updatedAt: 10,
        active: true,
      },
    ],
  };
  const newer = {
    ...base(20),
    announcements: [
      {
        id: 'a1',
        title: 'Viejo',
        body: 'Texto',
        priority: 'info' as const,
        author: 'Elena',
        createdAt: 1,
        updatedAt: 20,
        active: false,
        deleted: true,
      },
    ],
  };

  const merged = mergeSnapshots(older, newer);
  assert.equal(merged.announcements[0]?.deleted, true);
  assert.notEqual(snapshotKey(older), snapshotKey(newer));
});
