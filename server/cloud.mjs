import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const file = join(root, 'state.json');
const port = Number(process.env.PORT || 8787);

function emptyState() {
  return { revision: 0, updatedAt: 0, announcements: [], playlist: [], punches: [] };
}

function load() {
  if (!existsSync(file)) return emptyState();
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return emptyState();
  }
}

function contentKey(items) {
  return items
    .map((item) => `${item.id}:${item.updatedAt}:${item.deleted ? 'x' : 'o'}`)
    .sort()
    .join('|');
}

function snapshotKey(snapshot) {
  return [contentKey(snapshot.announcements), contentKey(snapshot.playlist), contentKey(snapshot.punches)].join('#');
}

function mergeById(left, right) {
  const map = new Map();
  for (const item of [...left, ...right]) {
    const previous = map.get(item.id);
    if (!previous || item.updatedAt >= previous.updatedAt) map.set(item.id, item);
  }
  return [...map.values()];
}

function mergeSnapshots(local, remote) {
  return {
    revision: Math.max(local.revision, remote.revision),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    announcements: mergeById(local.announcements ?? [], remote.announcements ?? []),
    playlist: mergeById(local.playlist ?? [], remote.playlist ?? []),
    punches: mergeById(local.punches ?? [], remote.punches ?? [])
      .sort((a, b) => b.at - a.at)
      .slice(0, 300),
  };
}

function isSnapshot(value) {
  return (
    value &&
    typeof value.revision === 'number' &&
    typeof value.updatedAt === 'number' &&
    Array.isArray(value.announcements) &&
    Array.isArray(value.playlist) &&
    Array.isArray(value.punches)
  );
}

let state = load();

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.url !== '/v1/state') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    return;
  }

  if (request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(state));
    return;
  }

  if (request.method === 'POST') {
    try {
      const incoming = await readBody(request);
      if (!isSnapshot(incoming)) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Estado inválido' }));
        return;
      }
      const merged = mergeSnapshots(state, incoming);
      if (snapshotKey(merged) !== snapshotKey(state)) {
        state = merged;
        mkdirSync(root, { recursive: true });
        writeFileSync(file, JSON.stringify(state));
      }
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(state));
    } catch {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'JSON inválido' }));
    }
    return;
  }

  response.writeHead(405);
  response.end();
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Nube Faro en http://127.0.0.1:${port}/v1/state`);
});
