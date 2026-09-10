export type ActivityRole = 'compra' | 'cargado' | 'ambas';

export type PersonStatus = 'activo' | 'inactivo';

export type AbsenceReason = 'vacaciones' | 'falta' | 'permiso' | 'incapacidad' | 'otro';

export interface AbsencePeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: AbsenceReason;
  note?: string;
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  role: ActivityRole;
  status: PersonStatus;
  absences: AbsencePeriod[];
  joinedDate: string;
  colorSeed?: string;
}

export type BuyStatus = 'pendiente' | 'comprado' | 'confirmado';
export type LoadStatus = 'pendiente' | 'completado';

export interface DayAssignment {
  date: string; // YYYY-MM-DD
  garrafonesCount: number;
  buyerId: string;
  buyerName: string;
  loaderIds: string[];
  loaderNames: string[];
  buyStatus: BuyStatus;
  buyConfirmedAt?: string;
  buyConfirmedBy?: string;
  loadStatus: LoadStatus;
  loadConfirmedAt?: string;
  loadConfirmedBy?: string;
  notes?: string;
  isCustomOverride?: boolean;
  isScheduledWaterDay?: boolean; // true if Wednesday or Thursday
}

export interface AppSettings {
  startDateSequence: string; // YYYY-MM-DD
  startGarrafonesCount: number;
  skipWeekends: boolean;
  loadersCountThreeGarrafones: number; // fixed 3 for Wednesday
  loadersCountOneGarrafon: number; // default 1
  autoAdvanceDay: boolean;
  rainSoundsEnabled: boolean;
  deliveryDays: ('miercoles' | 'jueves')[]; // ['miercoles', 'jueves']
  wednesdayGarrafones: number;
  thursdayGarrafones: number;
  deliveryOverrides: Record<string, string | null>;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'calendario' 
  | 'compra' 
  | 'cargado' 
  | 'personas' 
  | 'disponibilidad' 
  | 'historial' 
  | 'configuracion';

export interface HistoryFilter {
  personId?: string;
  startDate?: string;
  endDate?: string;
  activity?: 'all' | 'compra' | 'cargado';
  status?: 'all' | 'completado' | 'pendiente';
}
