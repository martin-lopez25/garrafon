import { AbsencePeriod, AppSettings } from '../types';

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a Date object at midnight local time
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

/**
 * Format a date string to Spanish display format
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const today = getTodayDateString();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  const formatted = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Capitalize first letter
  const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  if (dateStr === today) {
    return `Hoy, ${capitalized}`;
  } else if (dateStr === tomorrow) {
    return `Mañana, ${capitalized}`;
  } else if (dateStr === yesterday) {
    return `Ayer, ${capitalized}`;
  }
  return capitalized;
}

export function formatDayOfWeek(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const today = getTodayDateString();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  if (dateStr === today) return 'Hoy';
  if (dateStr === tomorrow) return 'Mañana';
  if (dateStr === yesterday) return 'Ayer';

  const day = date.toLocaleDateString('es-MX', { weekday: 'long' });
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date falls on a weekend (Saturday=6, Sunday=0)
 */
export function isWeekend(dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Checks if a date is Wednesday (3)
 */
export function isWednesday(dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  return date.getDay() === 3;
}

/**
 * Checks if a date is Thursday (4)
 */
export function isThursday(dateStr: string): boolean {
  const date = parseLocalDate(dateStr);
  return date.getDay() === 4;
}

/**
 * Checks if a date is an official Tláloc water delivery day (Wednesday or Thursday)
 */
export function isWaterDeliveryDay(
  dateStr: string,
  settings?: AppSettings
): boolean {
  if (settings?.deliveryOverrides) {
    if (Object.prototype.hasOwnProperty.call(settings.deliveryOverrides, dateStr)) {
      return false;
    }
    if (Object.values(settings.deliveryOverrides).includes(dateStr)) {
      return true;
    }
  }

  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  return day === 3 || day === 4;
}

/**
 * Calculates number of garrafones for any given date:
 * - Wednesdays: 3 garrafones
 * - Thursdays: 1 garrafón
 * - Non-delivery days: returns default 3 (or alternating if forced)
 */
export function calculateGarrafonesForDate(
  dateStr: string,
  settings?: AppSettings
): number {
  const originalDate = settings?.deliveryOverrides
    ? Object.entries(settings.deliveryOverrides).find(
        ([, targetDate]) => targetDate === dateStr
      )?.[0] || dateStr
    : dateStr;
  const date = parseLocalDate(originalDate);
  const day = date.getDay();

  // Primary rule requested by user:
  // Wednesday = 3 garrafones, Thursday = 1 garrafón
  if (day === 3) {
    return settings?.wednesdayGarrafones || 3;
  }
  if (day === 4) {
    return settings?.thursdayGarrafones || 1;
  }

  // If queried on a non-scheduled day, alternate based on sequence or return 3
  if (settings) {
    const refDate = parseLocalDate(settings.startDateSequence);
    const targetDate = parseLocalDate(dateStr);
    const diffTime = targetDate.getTime() - refDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const normalizedMod = ((diffDays % 2) + 2) % 2;
    return normalizedMod === 0 ? 3 : 1;
  }

  return 3;
}

/**
 * Finds the next delivery date (Wednesday or Thursday) on or after fromDateStr
 */
export function getNextDeliveryDate(
  fromDateStr: string,
  settings?: AppSettings
): string {
  for (let i = 0; i <= 14; i++) {
    const candidate = addDays(fromDateStr, i);
    if (isWaterDeliveryDay(candidate, settings)) {
      return candidate;
    }
  }
  return fromDateStr;
}

/**
 * Finds the strictly next delivery date AFTER fromDateStr (tomorrow or later)
 */
export function getStrictNextDeliveryDate(
  fromDateStr: string,
  settings?: AppSettings
): string {
  for (let i = 1; i <= 14; i++) {
    const candidate = addDays(fromDateStr, i);
    if (isWaterDeliveryDay(candidate, settings)) {
      return candidate;
    }
  }
  return addDays(fromDateStr, 1);
}

/**
 * Returns a list of upcoming scheduled delivery dates (Wednesdays and Thursdays)
 */
export function getUpcomingDeliveryDates(
  startDateStr: string,
  count: number = 6,
  settings?: AppSettings
): string[] {
  const list: string[] = [];
  let dayOffset = 1;
  while (list.length < count && dayOffset < 90) {
    const candidate = addDays(startDateStr, dayOffset);
    if (isWaterDeliveryDay(candidate, settings)) {
      list.push(candidate);
    }
    dayOffset++;
  }
  return list;
}

/**
 * Check if a specific date falls within any absence period
 */
export function isPersonAbsentOnDate(absences: AbsencePeriod[], dateStr: string): boolean {
  if (!absences || absences.length === 0) return false;
  return absences.some(
    (abs) => dateStr >= abs.startDate && dateStr <= abs.endDate
  );
}

export function getActiveAbsenceOnDate(
  absences: AbsencePeriod[],
  dateStr: string
): AbsencePeriod | undefined {
  if (!absences) return undefined;
  return absences.find(
    (abs) => dateStr >= abs.startDate && dateStr <= abs.endDate
  );
}
