import type { Punch } from './types';

export function isSameDay(timestamp: number, now = Date.now()): boolean {
  const left = new Date(timestamp);
  const right = new Date(now);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function punchesToday(punches: Punch[], now = Date.now()): Punch[] {
  return punches
    .filter((punch) => isSameDay(punch.at, now))
    .sort((left, right) => right.at - left.at);
}

export function latestPunchByEmployee(punches: Punch[], now = Date.now()): Map<string, Punch> {
  const latest = new Map<string, Punch>();
  const ordered = punchesToday(punches, now).slice().reverse();
  for (const punch of ordered) {
    latest.set(punch.employeeId, punch);
  }
  return latest;
}

export function peopleInside(punches: Punch[], now = Date.now()): string[] {
  const inside: string[] = [];
  for (const [employeeId, punch] of latestPunchByEmployee(punches, now)) {
    if (punch.kind === 'entrada') inside.push(employeeId);
  }
  return inside;
}

export function shiftName(date: Date): string {
  const hour = date.getHours();
  if (hour >= 6 && hour < 14) return 'Turno matutino';
  if (hour >= 14 && hour < 22) return 'Turno vespertino';
  return 'Turno nocturno';
}
