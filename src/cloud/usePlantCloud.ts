import { useEffect, useState } from 'react';

import { plantCloud } from './engine';
import type { CloudMeta, Snapshot } from './types';

export function usePlantCloud(): { ready: boolean; snapshot: Snapshot | null; meta: CloudMeta } {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(plantCloud.getSnapshot());
  const [meta, setMeta] = useState<CloudMeta>(plantCloud.getMeta());
  const [ready, setReady] = useState(plantCloud.getSnapshot() !== null);

  useEffect(() => {
    let active = true;
    const unsubscribe = plantCloud.subscribe((next, nextMeta) => {
      if (!active) return;
      setSnapshot(next);
      setMeta(nextMeta);
      setReady(true);
    });
    void plantCloud.start();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { ready, snapshot, meta };
}
