import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import confetti from 'canvas-confetti';
import {
  Person,
  DayAssignment,
  AppSettings,
  BuyStatus,
  LoadStatus,
  AbsencePeriod,
  ActivityRole,
} from '../types';
import {
  INITIAL_PEOPLE,
  DEFAULT_SETTINGS,
  generateInitialAssignments,
} from '../data/initialData';
import {
  getTodayDateString,
  addDays,
  isWaterDeliveryDay,
  getNextDeliveryDate,
} from '../utils/dateUtils';
import {
  getAssignmentForDate,
  getFairLoadersForDate,
  getUpcomingAssignments,
  calculateAllStats,
} from '../utils/rotationAlgorithm';
import {
  isCloudSyncConfigured,
  loadCloudDatabase,
  saveCloudDatabase,
} from '../utils/googleSheetsSync';

interface TlalocContextValue {
  people: Person[];
  assignments: DayAssignment[];
  settings: AppSettings;
  todayDate: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isTodayWaterDay: boolean;
  nextDeliveryDate: string;
  activeDeliveryDate: string;
  todayAssignment: DayAssignment;
  selectedDateAssignment: DayAssignment;
  activeDeliveryAssignment: DayAssignment;
  upcomingList: DayAssignment[];
  stats: ReturnType<typeof calculateAllStats>;
  allBuyers: Person[];
  designatedLoaders: Person[];
  setDesignatedLoaders: (loaderIds: string[]) => void;
  saveAssignment: (date?: string) => void;
  updateAssignmentGarrafones: (date: string, count: number) => void;
  rescheduleDeliveryDay: (sourceDate: string, targetDate: string | null) => void;
  restoreDeliveryDay: (sourceDate: string) => void;
  confirmPurchase: (date?: string, targetStatus?: BuyStatus) => void;
  confirmLoad: (date?: string, targetStatus?: LoadStatus) => void;
  togglePersonStatus: (personId: string) => void;
  addAbsence: (
    personId: string,
    absence: Omit<AbsencePeriod, 'id' | 'createdAt'>
  ) => void;
  removeAbsence: (personId: string, absenceId: string) => void;
  addPerson: (name: string, role: ActivityRole) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  deletePerson: (personId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetRotation: () => void;
  resetToDefaults: () => void;
  exportDatabase: () => string;
  importDatabase: (jsonStr: string) => boolean;
  triggerWaterCelebration: () => void;
}

const TlalocContext = createContext<TlalocContextValue | null>(null);

const STORAGE_KEYS = {
  PEOPLE: 'tlaloc_water_people_v3',
  ASSIGNMENTS: 'tlaloc_water_assignments_v3',
  SETTINGS: 'tlaloc_water_settings_v3',
};

function migratePeople(people: Person[]): Person[] {
  return people.map((person) =>
    person.id === 'p-11' && person.name === 'Roberto'
      ? { ...person, name: 'Nico', role: 'ambas' }
      : person
  );
}

function migrateSettings(settings: Partial<AppSettings>): AppSettings {
  const legacySettings = settings as Partial<AppSettings> & {
    fridayGarrafones?: 1;
  };

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    deliveryDays: ['miercoles', 'jueves'],
    loadersCountThreeGarrafones: 3,
    loadersCountOneGarrafon: 1,
    deliveryOverrides: settings.deliveryOverrides || {},
    thursdayGarrafones:
      settings.thursdayGarrafones || legacySettings.fridayGarrafones || 1,
  };
}

function normalizeCloudDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function splitStoredList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function repairAssignments(
  cloudAssignments: DayAssignment[],
  people: Person[],
  settings: AppSettings
): DayAssignment[] {
  const today = getTodayDateString();
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const validAssignments = cloudAssignments
    .map((assignment) => ({
      ...assignment,
      date: normalizeCloudDate(assignment.date),
    }))
    .filter(
      (assignment) =>
        assignment.date &&
        assignment.buyerId &&
        (assignment.date <= today ||
          assignment.isCustomOverride ||
          isWaterDeliveryDay(assignment.date, settings))
    );

  const assignmentsToMerge =
    validAssignments.length === cloudAssignments.length
      ? validAssignments
      : [...generateInitialAssignments(), ...validAssignments];

  const uniqueAssignments = new Map<string, DayAssignment>();
  assignmentsToMerge.forEach((assignment) => {
    const buyerIds = splitStoredList(assignment.buyerId);
    const storedBuyerNames = splitStoredList(assignment.buyerName);
    const buyerNames = buyerIds.map(
      (buyerId, index) =>
        peopleById.get(buyerId)?.name || storedBuyerNames[index] || ''
    );
    const loaderNames = assignment.loaderIds.map(
      (loaderId, index) =>
        peopleById.get(loaderId)?.name || assignment.loaderNames[index] || ''
    );

    uniqueAssignments.set(assignment.date, {
      ...assignment,
      buyerId: buyerIds.join(', '),
      buyerName: buyerNames.join(', '),
      buyConfirmedBy: assignment.buyConfirmedBy
        ? buyerNames.join(', ')
        : undefined,
      loaderNames,
      loadConfirmedBy: assignment.loadConfirmedBy
        ? loaderNames.join(', ')
        : undefined,
    });
  });

  return [...uniqueAssignments.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

export const TlalocProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  const todayDate = useMemo(() => getTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);

  // 1. People State
  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PEOPLE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return migratePeople(parsed);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PEOPLE;
  });

  // 2. Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return migrateSettings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // 3. Assignments State
  const [assignments, setAssignments] = useState<DayAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return generateInitialAssignments();
  });

  // Persist People
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    } catch (e) {
      console.error('Failed to persist people to localStorage', e);
    }
  }, [people]);

  // Persist Settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings to localStorage', e);
    }
  }, [settings]);

  // Persist Assignments
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ASSIGNMENTS,
        JSON.stringify(assignments)
      );
    } catch (e) {
      console.error('Failed to persist assignments to localStorage', e);
    }
  }, [assignments]);

  useEffect(() => {
    if (!isCloudSyncConfigured) return;

    let cancelled = false;

    const hydrateFromCloud = async () => {
      try {
        const cloudData = await loadCloudDatabase();
        if (cancelled) return;

        if (cloudData) {
          if (!Array.isArray(cloudData.people) || cloudData.people.length === 0) {
            throw new Error('Google Sheets devolvió un padrón vacío');
          }
          const cloudPeople = migratePeople(cloudData.people);
          const cloudSettings = migrateSettings(cloudData.settings);
          setPeople(cloudPeople);
          setSettings(cloudSettings);
          setAssignments(
            repairAssignments(cloudData.assignments, cloudPeople, cloudSettings)
          );
        }
        setCloudSyncReady(true);
      } catch (error) {
        console.error('Failed to load data from Google Sheets', error);
      }
    };

    hydrateFromCloud();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isCloudSyncConfigured || !cloudSyncReady || people.length === 0) return;

    const timer = window.setTimeout(() => {
      saveCloudDatabase({
        version: '1.0',
        updatedAt: new Date().toISOString(),
        people,
        settings,
        assignments,
      }).catch((error) => {
        console.error('Failed to save data to Google Sheets', error);
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [cloudSyncReady, people, settings, assignments]);

  // Mesoamerican rain & water splash effect
  const triggerWaterCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#00e5bf', '#38bdf8', '#0284c7', '#10b981', '#fbbf24'],
        shapes: ['circle'],
        scalar: 1.1,
        disableForReducedMotion: true,
      });
    } catch {
      // Canvas confetti may be suppressed in test environments
    }
  }, []);

  // Delivery day helpers
  const isTodayWaterDay = useMemo(
    () => isWaterDeliveryDay(todayDate, settings),
    [todayDate, settings]
  );
  const nextDeliveryDate = useMemo(
    () => getNextDeliveryDate(todayDate, settings),
    [todayDate, settings]
  );
  const activeDeliveryDate = useMemo(() => {
    return isTodayWaterDay ? todayDate : nextDeliveryDate;
  }, [isTodayWaterDay, todayDate, nextDeliveryDate]);

  // Compute or get today's assignment
  const todayAssignment = useMemo(() => {
    return getAssignmentForDate(todayDate, people, assignments, settings);
  }, [todayDate, people, assignments, settings]);

  // Compute or get selected date assignment
  const selectedDateAssignment = useMemo(() => {
    return getAssignmentForDate(selectedDate, people, assignments, settings);
  }, [selectedDate, people, assignments, settings]);

  // Compute or get active delivery day assignment (today if water day, or next scheduled water day)
  const activeDeliveryAssignment = useMemo(() => {
    return getAssignmentForDate(activeDeliveryDate, people, assignments, settings);
  }, [activeDeliveryDate, people, assignments, settings]);

  // Calculate upcoming scheduled water delivery days
  const upcomingList = useMemo(() => {
    return getUpcomingAssignments(todayDate, 6, people, assignments, settings);
  }, [todayDate, people, assignments, settings]);

  // Active teammates participate according to their configured role.
  const allBuyers = useMemo(() => {
    return people.filter(
      (person) =>
        person.status === 'activo' &&
        (person.role === 'compra' || person.role === 'ambas')
    );
  }, [people]);

  const designatedLoaders = useMemo(() => {
    return people.filter(
      (person) =>
        person.status === 'activo' &&
        (person.role === 'cargado' || person.role === 'ambas')
    );
  }, [people]);

  const setDesignatedLoaders = useCallback((loaderIds: string[]) => {
    setPeople((prev) =>
      prev.map((p) => {
        const shouldBeLoader = loaderIds.includes(p.id);
        if (shouldBeLoader) {
          return { ...p, role: 'ambas' as const };
        } else {
          return { ...p, role: 'compra' as const };
        }
      })
    );
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    return calculateAllStats(people, assignments);
  }, [people, assignments]);

  const saveAssignment = useCallback(
    (targetDate: string = activeDeliveryDate) => {
      const assignment = getAssignmentForDate(
        targetDate,
        people,
        assignments,
        settings
      );

      setAssignments((prev) =>
        prev.some((item) => item.date === targetDate)
          ? prev
          : [...prev, assignment]
      );
    },
    [activeDeliveryDate, people, assignments, settings]
  );

  const updateAssignmentGarrafones = useCallback(
    (targetDate: string, count: number) => {
      const normalizedCount = Math.max(1, Math.min(10, Math.round(count)));

      setAssignments((prev) => {
        const current = getAssignmentForDate(
          targetDate,
          people,
          prev,
          settings
        );
        const otherAssignments = prev.filter((item) => item.date !== targetDate);
        const loaders = getFairLoadersForDate(
          targetDate,
          normalizedCount,
          people,
          otherAssignments,
          settings
        );
        const updated: DayAssignment = {
          ...current,
          garrafonesCount: normalizedCount,
          loaderIds: loaders.map((person) => person.id),
          loaderNames: loaders.map((person) => person.name),
          loadStatus: 'pendiente',
          loadConfirmedAt: undefined,
          loadConfirmedBy: undefined,
          isCustomOverride: true,
        };

        return [...otherAssignments, updated].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
      });
    },
    [people, settings]
  );

  const rescheduleDeliveryDay = useCallback(
    (sourceDate: string, targetDate: string | null) => {
      const sourceAssignment = getAssignmentForDate(
        sourceDate,
        people,
        assignments,
        settings
      );

      setAssignments((prev) => {
        const withoutSource = prev.filter(
          (assignment) =>
            assignment.date !== sourceDate && assignment.date !== targetDate
        );
        if (!targetDate) return withoutSource;

        return [
          ...withoutSource,
          {
            ...sourceAssignment,
            date: targetDate,
            isCustomOverride: true,
            isScheduledWaterDay: true,
          },
        ].sort((a, b) => a.date.localeCompare(b.date));
      });

      setSettings((prev) => ({
        ...prev,
        deliveryOverrides: {
          ...prev.deliveryOverrides,
          [sourceDate]: targetDate,
        },
      }));
    },
    [people, assignments, settings]
  );

  const restoreDeliveryDay = useCallback((sourceDate: string) => {
    setSettings((prev) => {
      const targetDate = prev.deliveryOverrides[sourceDate];
      const nextOverrides = { ...prev.deliveryOverrides };
      delete nextOverrides[sourceDate];

      if (targetDate) {
        setAssignments((current) =>
          current.filter(
            (assignment) =>
              assignment.date !== targetDate || !assignment.isCustomOverride
          )
        );
      }

      return { ...prev, deliveryOverrides: nextOverrides };
    });
  }, []);

  // Confirm Purchase
  const confirmPurchase = useCallback(
    (targetDate?: string, targetStatus: BuyStatus = 'comprado') => {
      const dateToUpdate = targetDate || todayDate;
      const currentAss = getAssignmentForDate(
        dateToUpdate,
        people,
        assignments,
        settings
      );

      const nowStr = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const stamp = `${dateToUpdate} ${nowStr}`;

      setAssignments((prev) => {
        const index = prev.findIndex((a) => a.date === dateToUpdate);
        const updatedRecord: DayAssignment = {
          ...currentAss,
          buyStatus: targetStatus,
          buyConfirmedAt: targetStatus !== 'pendiente' ? stamp : undefined,
          buyConfirmedBy: currentAss.buyerName,
        };

        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedRecord;
          return next;
        } else {
          return [...prev, updatedRecord];
        }
      });

      triggerWaterCelebration();
    },
    [todayDate, people, assignments, settings, triggerWaterCelebration]
  );

  // Confirm Load
  const confirmLoad = useCallback(
    (targetDate?: string, targetStatus: LoadStatus = 'completado') => {
      const dateToUpdate = targetDate || todayDate;
      const currentAss = getAssignmentForDate(
        dateToUpdate,
        people,
        assignments,
        settings
      );

      const nowStr = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const stamp = `${dateToUpdate} ${nowStr}`;

      setAssignments((prev) => {
        const index = prev.findIndex((a) => a.date === dateToUpdate);
        const updatedRecord: DayAssignment = {
          ...currentAss,
          loadStatus: targetStatus,
          loadConfirmedAt: targetStatus === 'completado' ? stamp : undefined,
          loadConfirmedBy: currentAss.loaderNames.join(', '),
        };

        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedRecord;
          return next;
        } else {
          return [...prev, updatedRecord];
        }
      });

      triggerWaterCelebration();
    },
    [todayDate, people, assignments, settings, triggerWaterCelebration]
  );

  // Toggle Person active/inactive status
  const togglePersonStatus = useCallback((personId: string) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === personId) {
          return {
            ...p,
            status: p.status === 'activo' ? 'inactivo' : 'activo',
          };
        }
        return p;
      })
    );
  }, []);

  // Add absence
  const addAbsence = useCallback(
    (
      personId: string,
      absence: Omit<AbsencePeriod, 'id' | 'createdAt'>
    ) => {
      const newAbsence: AbsencePeriod = {
        ...absence,
        id: `abs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      setPeople((prev) =>
        prev.map((p) => {
          if (p.id === personId) {
            return {
              ...p,
              absences: [...p.absences, newAbsence],
            };
          }
          return p;
        })
      );
    },
    []
  );

  // Remove absence
  const removeAbsence = useCallback((personId: string, absenceId: string) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === personId) {
          return {
            ...p,
            absences: p.absences.filter((a) => a.id !== absenceId),
          };
        }
        return p;
      })
    );
  }, []);

  // Add person
  const addPerson = useCallback((name: string, role: ActivityRole) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const colors = ['#0ea5e9', '#14b8a6', '#06b6d4', '#10b981', '#0284c7', '#38bdf8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newP: Person = {
      id: `p-${Date.now()}`,
      name: trimmed,
      role,
      status: 'activo',
      absences: [],
      joinedDate: getTodayDateString(),
      colorSeed: randomColor,
    };

    setPeople((prev) => [...prev, newP]);
  }, []);

  // Update person
  const updatePerson = useCallback(
    (personId: string, updates: Partial<Person>) => {
      setPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, ...updates } : p))
      );

      const updatedName = updates.name?.trim();
      if (updatedName) {
        setAssignments((prev) =>
          prev.map((assignment) => {
            const buyerIds = splitStoredList(assignment.buyerId);
            const isBuyer = buyerIds.includes(personId);
            const isLoader = assignment.loaderIds.includes(personId);

            if (!isBuyer && !isLoader) return assignment;

            const loaderNames = assignment.loaderIds.map((loaderId, index) =>
              loaderId === personId
                ? updatedName
                : assignment.loaderNames[index] || ''
            );
            const buyerNames = buyerIds.map((buyerId, index) =>
              buyerId === personId
                ? updatedName
                : splitStoredList(assignment.buyerName)[index] || ''
            );

            return {
              ...assignment,
              buyerName: isBuyer ? buyerNames.join(', ') : assignment.buyerName,
              buyConfirmedBy: isBuyer && assignment.buyConfirmedBy
                ? buyerNames.join(', ')
                : assignment.buyConfirmedBy,
              loaderNames,
              loadConfirmedBy: isLoader && assignment.loadConfirmedBy
                ? loaderNames.join(', ')
                : assignment.loadConfirmedBy,
            };
          })
        );
      }
    },
    []
  );

  // Delete person
  const deletePerson = useCallback((personId: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== personId));
  }, []);

  // Update Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset rotation / assignments
  const resetRotation = useCallback(() => {
    setAssignments([]);
  }, []);

  // Reset all to defaults
  const resetToDefaults = useCallback(() => {
    setPeople(INITIAL_PEOPLE);
    setSettings(DEFAULT_SETTINGS);
    setAssignments(generateInitialAssignments());
  }, []);

  // Export
  const exportDatabase = useCallback(() => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      people,
      settings,
      assignments,
    };
    return JSON.stringify(payload, null, 2);
  }, [people, settings, assignments]);

  // Import
  const importDatabase = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.people && Array.isArray(data.people)) {
        setPeople(data.people);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings(migrateSettings(data.settings));
      }
      if (data.assignments && Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
      }
      return true;
    } catch (err) {
      console.error('Failed to parse import JSON:', err);
      return false;
    }
  }, []);

  return (
    <TlalocContext.Provider
      value={{
        people,
        assignments,
        settings,
        todayDate,
        selectedDate,
        setSelectedDate,
        isTodayWaterDay,
        nextDeliveryDate,
        activeDeliveryDate,
        todayAssignment,
        selectedDateAssignment,
        activeDeliveryAssignment,
        upcomingList,
        stats,
        allBuyers,
        designatedLoaders,
        setDesignatedLoaders,
        saveAssignment,
        updateAssignmentGarrafones,
        rescheduleDeliveryDay,
        restoreDeliveryDay,
        confirmPurchase,
        confirmLoad,
        togglePersonStatus,
        addAbsence,
        removeAbsence,
        addPerson,
        updatePerson,
        deletePerson,
        updateSettings,
        resetRotation,
        resetToDefaults,
        exportDatabase,
        importDatabase,
        triggerWaterCelebration,
      }}
    >
      {children}
    </TlalocContext.Provider>
  );
};

export function useTlaloc(): TlalocContextValue {
  const context = useContext(TlalocContext);
  if (!context) {
    throw new Error('useTlaloc must be used within a TlalocProvider');
  }
  return context;
}
