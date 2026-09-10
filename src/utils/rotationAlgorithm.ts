import { DayAssignment, Person, AppSettings } from '../types';
import {
  calculateGarrafonesForDate,
  isPersonAbsentOnDate,
  isWaterDeliveryDay,
  addDays,
} from './dateUtils';

export interface PersonStats {
  personId: string;
  name: string;
  purchasesCount: number;
  carriesCount: number;
  totalCount: number;
  lastPurchaseDate?: string;
  lastCarryDate?: string;
  rotationOrder?: number;
}

function splitIds(value: string): string[] {
  return value.split(',').map((id) => id.trim()).filter(Boolean);
}

/**
 * Calculates historical stats for all people based on confirmed and past assignments
 */
export function calculateAllStats(
  people: Person[],
  assignments: DayAssignment[],
  includePending = false
): Record<string, PersonStats> {
  const statsMap: Record<string, PersonStats> = {};

  people.forEach((p, idx) => {
    statsMap[p.id] = {
      personId: p.id,
      name: p.name,
      purchasesCount: 0,
      carriesCount: 0,
      totalCount: 0,
      lastPurchaseDate: undefined,
      lastCarryDate: undefined,
      rotationOrder: idx + 1,
    };
  });

  // Sort assignments chronologically
  const sorted = [...assignments].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((ass) => {
    const purchaseCompleted =
      ass.buyStatus === 'confirmado' || ass.buyStatus === 'comprado';
    if (includePending || purchaseCompleted) {
      splitIds(ass.buyerId).forEach((buyerId) => {
        if (!statsMap[buyerId]) return;
        statsMap[buyerId].purchasesCount += 1;
        statsMap[buyerId].totalCount += 1;
        statsMap[buyerId].lastPurchaseDate = ass.date;
      });
    }

    if (
      (includePending || ass.loadStatus === 'completado') &&
      ass.loaderIds &&
      ass.loaderIds.length > 0
    ) {
      ass.loaderIds.forEach((loaderId) => {
        if (statsMap[loaderId]) {
          statsMap[loaderId].carriesCount += 1;
          statsMap[loaderId].totalCount += 1;
          statsMap[loaderId].lastCarryDate = ass.date;
        }
      });
    }
  });

  return statsMap;
}

/**
 * Checks if a person is available to perform tasks on a specific date
 */
export function isPersonAvailableOnDate(person: Person, targetDate: string): boolean {
  if (person.status !== 'activo') return false;
  if (isPersonAbsentOnDate(person.absences, targetDate)) return false;
  return true;
}

/**
 * Strict "Rolo sin repetir" selection algorithm:
 * Guarantees that within each cycle/round, every candidate takes their turn
 * before anyone can repeat.
 *
 * Sorting criteria:
 * 1. Count of assignments ASC (fewest turns in the cycle)
 * 2. Oldest last-assigned date (or never assigned)
 * 3. Base sequence index in the group (fixed stable rotation order)
 */
export function selectFairCandidate(
  candidates: Person[],
  currentCounts: Map<string, number>,
  lastAssignedDates: Map<string, string>,
  excludeIds: Set<string> = new Set()
): Person | null {
  const eligible = candidates.filter((c) => !excludeIds.has(c.id));
  if (eligible.length === 0) return null;

  const scored = eligible.map((person, index) => {
    const count = currentCounts.get(person.id) || 0;
    const lastDate = lastAssignedDates.get(person.id) || '1970-01-01';
    return { person, count, lastDate, defaultOrder: index };
  });

  // Sort: count ASC, then lastDate ASC (older first), then stable index
  scored.sort((a, b) => {
    if (a.count !== b.count) {
      return a.count - b.count;
    }
    if (a.lastDate !== b.lastDate) {
      return a.lastDate.localeCompare(b.lastDate);
    }
    return a.defaultOrder - b.defaultOrder;
  });

  return scored[0]?.person || null;
}

/**
 * Generates or retrieves the day assignment for a specific target date
 */
export function getAssignmentForDate(
  targetDate: string,
  people: Person[],
  existingAssignments: DayAssignment[],
  settings: AppSettings
): DayAssignment {
  // Check if we already have an explicit record saved
  const existing = existingAssignments.find((a) => a.date === targetDate);
  if (existing) {
    return existing;
  }

  // Calculate garrafones based on Wednesday (3) & Thursday (1) schedule
  const isScheduled = isWaterDeliveryDay(targetDate, settings);
  const garrafonesCount = calculateGarrafonesForDate(targetDate, settings);

  // Consider all assignments prior to this targetDate to calculate current counts
  const priorAssignments = existingAssignments.filter((a) => a.date < targetDate);
  const stats = calculateAllStats(people, priorAssignments, true);

  const purchaseCounts = new Map<string, number>();
  const carryCounts = new Map<string, number>();
  const lastPurchaseMap = new Map<string, string>();
  const lastCarryMap = new Map<string, string>();

  people.forEach((p) => {
    const s = stats[p.id];
    purchaseCounts.set(p.id, s ? s.purchasesCount : 0);
    carryCounts.set(p.id, s ? s.carriesCount : 0);
    if (s?.lastPurchaseDate) lastPurchaseMap.set(p.id, s.lastPurchaseDate);
    if (s?.lastCarryDate) lastCarryMap.set(p.id, s.lastCarryDate);
  });

  // Payment and carrying are independent fair rotations within each role.
  const availableForPurchase = people.filter(
    (person) =>
      (person.role === 'compra' || person.role === 'ambas') &&
      isPersonAvailableOnDate(person, targetDate)
  );

  const participantsCount = Math.max(1, Math.round(garrafonesCount));
  const selectedBuyers: Person[] = [];
  const excludedBuyerIds = new Set<string>();

  for (
    let index = 0;
    index < Math.min(participantsCount, availableForPurchase.length);
    index++
  ) {
    const buyer = selectFairCandidate(
      availableForPurchase,
      purchaseCounts,
      lastPurchaseMap,
      excludedBuyerIds
    );
    if (!buyer) break;
    selectedBuyers.push(buyer);
    excludedBuyerIds.add(buyer.id);
    purchaseCounts.set(buyer.id, (purchaseCounts.get(buyer.id) || 0) + 1);
  }

  const availableForCarrying = people.filter(
    (person) =>
      (person.role === 'cargado' || person.role === 'ambas') &&
      isPersonAvailableOnDate(person, targetDate)
  );

  const actualLoadersCount = Math.min(
    participantsCount,
    availableForCarrying.length
  );

  const selectedLoaders: Person[] = [];
  const excludedLoaderIds = new Set<string>();

  for (let i = 0; i < actualLoadersCount; i++) {
    const loader = selectFairCandidate(
      availableForCarrying,
      carryCounts,
      lastCarryMap,
      excludedLoaderIds
    );
    if (loader) {
      selectedLoaders.push(loader);
      excludedLoaderIds.add(loader.id);
      // Increment temporary count for multiple picks on same round
      carryCounts.set(loader.id, (carryCounts.get(loader.id) || 0) + 1);
    }
  }

  return {
    date: targetDate,
    garrafonesCount,
    buyerId: selectedBuyers.map((person) => person.id).join(', '),
    buyerName:
      selectedBuyers.length > 0
        ? selectedBuyers.map((person) => person.name).join(', ')
        : 'Sin personas disponibles',
    loaderIds: selectedLoaders.map((l) => l.id),
    loaderNames:
      selectedLoaders.length > 0
        ? selectedLoaders.map((l) => l.name)
        : ['Sin personas disponibles'],
    buyStatus: 'pendiente',
    loadStatus: 'pendiente',
    isScheduledWaterDay: isScheduled,
  };
}

export function getFairLoadersForDate(
  targetDate: string,
  garrafonesCount: number,
  people: Person[],
  existingAssignments: DayAssignment[],
  settings: AppSettings
): Person[] {
  const priorAssignments = existingAssignments.filter((a) => a.date < targetDate);
  const stats = calculateAllStats(people, priorAssignments, true);
  const carryCounts = new Map<string, number>();
  const lastCarryMap = new Map<string, string>();

  people.forEach((person) => {
    const personStats = stats[person.id];
    carryCounts.set(person.id, personStats?.carriesCount || 0);
    if (personStats?.lastCarryDate) {
      lastCarryMap.set(person.id, personStats.lastCarryDate);
    }
  });

  const available = people.filter(
    (person) =>
      (person.role === 'cargado' || person.role === 'ambas') &&
      isPersonAvailableOnDate(person, targetDate)
  );
  const requestedLoaders = Math.max(1, Math.round(garrafonesCount));
  const selected: Person[] = [];
  const excludedIds = new Set<string>();

  for (let index = 0; index < Math.min(requestedLoaders, available.length); index++) {
    const loader = selectFairCandidate(
      available,
      carryCounts,
      lastCarryMap,
      excludedIds
    );
    if (!loader) break;
    selected.push(loader);
    excludedIds.add(loader.id);
    carryCounts.set(loader.id, (carryCounts.get(loader.id) || 0) + 1);
  }

  return selected;
}

/**
 * Previews upcoming scheduled delivery days (Wednesdays and Thursdays)
 * simulating cumulative fairness round-robin
 */
export function getUpcomingAssignments(
  startDate: string,
  scheduledDaysCount: number = 6,
  people: Person[],
  existingAssignments: DayAssignment[],
  settings: AppSettings
): DayAssignment[] {
  const result: DayAssignment[] = [];
  const simulatedAssignments = [...existingAssignments];

  let offset = 1;
  while (result.length < scheduledDaysCount && offset < 90) {
    const nextDate = addDays(startDate, offset);
    if (isWaterDeliveryDay(nextDate, settings)) {
      const assignment = getAssignmentForDate(
        nextDate,
        people,
        simulatedAssignments,
        settings
      );
      result.push(assignment);
      simulatedAssignments.push(assignment);
    }
    offset++;
  }

  return result;
}
