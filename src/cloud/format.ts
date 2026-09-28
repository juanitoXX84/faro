import type { Priority, SensorMethod } from './types';

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('es-MX', { ...timeFormat, second: '2-digit' });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-MX', timeFormat);
}

export function formatLongDate(date: Date): string {
  const value = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function priorityLabel(priority: Priority): string {
  if (priority === 'urgente') return 'Urgente';
  if (priority === 'aviso') return 'Aviso';
  return 'Informativo';
}

export function methodLabel(method: SensorMethod): string {
  switch (method) {
    case 'huella':
      return 'Huella';
    case 'rostro':
      return 'Rostro';
    case 'iris':
      return 'Iris';
    case 'huella-demo':
      return 'Huella · demo';
    case 'rostro-demo':
      return 'Rostro · demo';
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
