import { Person, AppSettings, DayAssignment } from '../types';
import { addDays, getTodayDateString } from '../utils/dateUtils';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'p-1',
    name: 'Ana',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#0ea5e9',
  },
  {
    id: 'p-2',
    name: 'Carlos',
    role: 'ambas',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#14b8a6',
  },
  {
    id: 'p-3',
    name: 'Diego',
    role: 'ambas',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#06b6d4',
  },
  {
    id: 'p-4',
    name: 'Fernanda',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#38bdf8',
  },
  {
    id: 'p-5',
    name: 'Gabriela',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#2dd4bf',
  },
  {
    id: 'p-6',
    name: 'Jorge',
    role: 'ambas',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#10b981',
  },
  {
    id: 'p-7',
    name: 'Luis',
    role: 'ambas',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#0284c7',
  },
  {
    id: 'p-8',
    name: 'Mariana',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#059669',
  },
  {
    id: 'p-9',
    name: 'Miguel',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#0284c7',
  },
  {
    id: 'p-10',
    name: 'Paola',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#22d3ee',
  },
  {
    id: 'p-11',
    name: 'Nico',
    role: 'ambas',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#0d9488',
  },
  {
    id: 'p-12',
    name: 'Sofía',
    role: 'compra',
    status: 'activo',
    absences: [],
    joinedDate: '2026-08-01',
    colorSeed: '#3b82f6',
  },
];

const today = getTodayDateString();

// Default settings: Wednesday 3 garrafones, Thursday 1 garrafon
export const DEFAULT_SETTINGS: AppSettings = {
  startDateSequence: addDays(today, -14),
  startGarrafonesCount: 3,
  skipWeekends: true,
  loadersCountThreeGarrafones: 3,
  loadersCountOneGarrafon: 1,
  autoAdvanceDay: true,
  rainSoundsEnabled: true,
  deliveryDays: ['miercoles', 'jueves'],
  wednesdayGarrafones: 3,
  thursdayGarrafones: 1,
  deliveryOverrides: {},
};

export function generateInitialAssignments(): DayAssignment[] {
  return [];
}
