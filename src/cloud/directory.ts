import type { Employee } from './types';

export const employees: Employee[] = [
  {
    id: 'e-ana',
    name: 'Ana Ruiz',
    area: 'Producción',
    shift: 'Matutino',
    code: 'AR-104',
    admin: false,
  },
  {
    id: 'e-luis',
    name: 'Luis Ortega',
    area: 'Almacén',
    shift: 'Matutino',
    code: 'LO-221',
    admin: false,
  },
  {
    id: 'e-maya',
    name: 'Maya Chen',
    area: 'Calidad',
    shift: 'Matutino',
    code: 'MC-118',
    admin: false,
  },
  {
    id: 'e-diego',
    name: 'Diego Salas',
    area: 'Mantenimiento',
    shift: 'Vespertino',
    code: 'DS-076',
    admin: false,
  },
  {
    id: 'e-elena',
    name: 'Elena Vidal',
    area: 'Supervisión',
    shift: 'Matutino',
    code: 'EV-001',
    admin: true,
  },
  {
    id: 'e-omar',
    name: 'Omar Ibarra',
    area: 'Seguridad',
    shift: 'Nocturno',
    code: 'OI-330',
    admin: false,
  },
];

export function findEmployee(id: string): Employee | undefined {
  return employees.find((employee) => employee.id === id);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}
