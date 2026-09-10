import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Droplets,
  Info,
  CalendarClock,
  CalendarX,
  Undo2,
  X,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { SingleGarrafon } from '../components/GarrafonIcon';
import { CodexBorder } from '../components/CodexPattern';
import {
  formatDisplayDate,
  formatShortDate,
  isWaterDeliveryDay,
  isWednesday,
  addDays,
} from '../utils/dateUtils';
import { getAssignmentForDate } from '../utils/rotationAlgorithm';

export const CalendarView: React.FC = () => {
  const {
    todayDate,
    people,
    assignments,
    settings,
    confirmPurchase,
    confirmLoad,
    rescheduleDeliveryDay,
    restoreDeliveryDay,
  } = useTlaloc();

  // Current calendar month view (defaults to today's month)
  const [currentYear, setCurrentYear] = useState(() => {
    return parseInt(todayDate.split('-')[0], 10);
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    return parseInt(todayDate.split('-')[1], 10) - 1; // 0-indexed
  });

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moveTargetDate, setMoveTargetDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const [y, m] = todayDate.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
    setSelectedCalendarDate(todayDate);
  };

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Generate matrix of days in current month
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    // Monday as first day of week: Sunday (0) becomes 6, Mon (1) becomes 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Empty padding cells for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Days in month
    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;

      const assignment = getAssignmentForDate(
        dateStr,
        people,
        assignments,
        settings
      );

      days.push({
        dayNumber: day,
        dateStr,
        assignment,
        isToday: dateStr === todayDate,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayDate, people, assignments, settings]);

  const selectedAssignment = useMemo(() => {
    return getAssignmentForDate(
      selectedCalendarDate,
      people,
      assignments,
      settings
    );
  }, [selectedCalendarDate, people, assignments, settings]);

  const handleDayClick = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
    setMoveTargetDate(addDays(dateStr, 7));
    setScheduleError('');
    setIsModalOpen(true);
  };

  const hasSelectedOverride = Object.prototype.hasOwnProperty.call(
    settings.deliveryOverrides,
    selectedCalendarDate
  );
  const selectedOverrideTarget = settings.deliveryOverrides[selectedCalendarDate];
  const selectedMovedFromDate = Object.entries(settings.deliveryOverrides).find(
    ([, targetDate]) => targetDate === selectedCalendarDate
  )?.[0];

  const moveSelectedDelivery = (targetDate: string | null) => {
    if (targetDate === selectedCalendarDate) {
      setScheduleError('La nueva fecha debe ser distinta.');
      return;
    }
    if (
      targetDate &&
      assignments.some((assignment) => assignment.date === targetDate)
    ) {
      setScheduleError('La fecha destino ya tiene una asignación guardada.');
      return;
    }
    rescheduleDeliveryDay(selectedCalendarDate, targetDate);
    setScheduleError('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl">
        <div>
          <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100 flex items-center gap-2">
            <span>Calendario Ritual del Agua</span>
          </h2>
          <p className="text-xs text-cyan-400/80">
            Consulta y seguimiento del flujo de asignaciones
          </p>
        </div>

        {/* Month Switcher Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/80 text-xs font-semibold text-cyan-200 border border-cyan-500/40 hover:bg-cyan-900 transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center bg-slate-900/90 rounded-xl border border-cyan-900/60 p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5 text-cyan-400" />
            </button>
            <span className="font-['Cinzel',serif] text-sm font-bold text-white px-3 min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Color Code Guide */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl bg-slate-900/60 border border-cyan-950 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
          <span className="text-slate-200 font-semibold">Miércoles (3 Garrafones • 3 pagadores • 3 cargadores)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 border border-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
          <span className="text-slate-200 font-semibold">Jueves (1 Garrafón • 1 cargador)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
            C
          </span>
          <span className="text-slate-300">Compra</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
            G
          </span>
          <span className="text-slate-300">Cargado (4 fijos)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-300">Confirmado</span>
        </div>
      </div>

      {/* Calendar Grid Table */}
      <div className="rounded-2xl bg-[#061726]/90 border border-cyan-900/60 shadow-xl overflow-hidden">
        {/* Day headers: Lun - Dom */}
        <div className="grid grid-cols-7 bg-[#082238] border-b border-cyan-900/60 text-center py-3 text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
          <span>Lun</span>
          <span>Mar</span>
          <span className="text-amber-300 font-bold">Mié (3G)</span>
          <span>Jue</span>
          <span className="text-cyan-300 font-bold">Jue (1G)</span>
          <span className="text-cyan-500/50">Sáb</span>
          <span className="text-cyan-500/50">Dom</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-cyan-950/40">
          {calendarDays.map((dayItem, index) => {
            if (!dayItem) {
              return (
                <div
                  key={`empty-${index}`}
                  className="bg-[#040f1a]/60 min-h-[90px] md:min-h-[110px]"
                />
              );
            }

            const { dayNumber, dateStr, assignment, isToday } = dayItem;
            const isDelivery = isWaterDeliveryDay(dateStr, settings);
            const isDisabled = Object.prototype.hasOwnProperty.call(
              settings.deliveryOverrides,
              dateStr
            );
            const isThree = assignment.garrafonesCount === 3;
            const isBuyDone =
              assignment.buyStatus === 'comprado' ||
              assignment.buyStatus === 'confirmado';
            const isLoadDone = assignment.loadStatus === 'completado';

            return (
              <div
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`group min-h-[90px] md:min-h-[110px] p-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  isToday
                    ? 'ring-2 ring-cyan-400 bg-cyan-950/50 shadow-inner'
                    : isDelivery
                    ? 'bg-[#071d30] hover:bg-[#0b2b47]'
                    : 'bg-[#051320]/80 hover:bg-[#081d30] opacity-85'
                }`}
              >
                {/* Day header: number + garrafones badge */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs md:text-sm font-bold rounded-lg px-1.5 py-0.5 ${
                      isToday
                        ? 'bg-cyan-400 text-slate-950'
                        : isDelivery
                        ? 'text-white group-hover:text-cyan-200'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {/* Garrafones badge indicator */}
                  {isDisabled ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-500/60">
                      <CalendarX className="w-2.5 h-2.5" />
                      No
                    </span>
                  ) : isDelivery ? (
                    <span
                      title={
                        isThree ? 'Miércoles de 3 garrafones' : 'Jueves de 1 garrafón'
                      }
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isThree
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                          : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                      }`}
                    >
                      <Droplets className="w-2.5 h-2.5" />
                      {assignment.garrafonesCount}G
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">
                      —
                    </span>
                  )}
                </div>

                {/* Assignment brief chips */}
                {isDisabled ? (
                  <div className="my-auto text-center py-1">
                    <span className="text-[10px] text-rose-300 font-semibold block">
                      {settings.deliveryOverrides[dateStr]
                        ? `Movido al ${formatShortDate(settings.deliveryOverrides[dateStr]!)}`
                        : 'Inhabilitado'}
                    </span>
                  </div>
                ) : isDelivery ? (
                  <div className="space-y-1 mt-1">
                    {/* Compra Chip */}
                    <div
                      title={`Compra: ${assignment.buyerName} (${assignment.buyStatus})`}
                      className={`flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                        isBuyDone
                          ? 'bg-teal-950/60 text-teal-200 border-teal-500/40'
                          : 'bg-cyan-950/60 text-cyan-200 border-cyan-800/40'
                      }`}
                    >
                      <span className="truncate font-medium">
                        <span className="text-cyan-400 font-bold mr-1">C:</span>
                        {assignment.buyerName.split(' ')[0]}
                      </span>
                      {isBuyDone && (
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Cargado Chip */}
                    <div
                      title={`Cargado: ${assignment.loaderNames.join(', ')} (${assignment.loadStatus})`}
                      className={`flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded border transition-colors ${
                        isLoadDone
                          ? 'bg-teal-950/60 text-teal-200 border-teal-500/40'
                          : 'bg-slate-900/80 text-teal-200 border-teal-900/60'
                      }`}
                    >
                      <span className="truncate font-medium">
                        <span className="text-teal-400 font-bold mr-1">G:</span>
                        {assignment.loaderNames[0]?.split(' ')[0]}
                        {assignment.loaderNames.length > 1 &&
                          ` +${assignment.loaderNames.length - 1}`}
                      </span>
                      {isLoadDone && (
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center py-1">
                    <span className="text-[10px] text-slate-500/70 italic block">
                      Sin entrega
                    </span>
                  </div>
                )}

                {/* Subtle indicator for today */}
                {dateStr === todayDate && (
                  <span className="text-[9px] text-cyan-300 font-bold tracking-wider uppercase text-right mt-1">
                    Hoy
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal for Selected Date */}
      {isModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            id="calendar-detail-modal"
            className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#0a233a] to-[#061524] border-2 border-cyan-500/50 shadow-2xl p-6 relative overflow-hidden"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cyan-950 border border-transparent hover:border-cyan-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <CodexBorder variant="turquoise" className="mb-2" />

            <div className="text-center pb-4 border-b border-cyan-900/60">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  {hasSelectedOverride
                    ? selectedOverrideTarget
                      ? `Entrega movida al ${formatShortDate(selectedOverrideTarget)}`
                      : 'Entrega inhabilitada'
                    : selectedMovedFromDate
                    ? `Entrega reprogramada desde el ${formatShortDate(selectedMovedFromDate)}`
                    : isWaterDeliveryDay(selectedCalendarDate, settings)
                    ? isWednesday(selectedCalendarDate)
                      ? 'Entrega Oficial: Miércoles de 3 Garrafones'
                      : 'Entrega Oficial: Jueves de 1 Garrafón'
                    : 'Día sin entrega habitual programada'}
                </span>
              </div>
              <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-100">
                {formatDisplayDate(selectedCalendarDate)}
              </h3>
            </div>

            {hasSelectedOverride ? (
              <div className="my-5 p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center">
                <CalendarX className="w-6 h-6 text-rose-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-rose-100">
                  {selectedOverrideTarget
                    ? `La asignación se aplicará el ${formatDisplayDate(selectedOverrideTarget)}.`
                    : 'Este día no tendrá entrega ni asignación.'}
                </p>
                <button
                  type="button"
                  onClick={() => restoreDeliveryDay(selectedCalendarDate)}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-cyan-200 border border-cyan-700 text-xs font-bold hover:bg-slate-800"
                >
                  <Undo2 className="w-4 h-4" />
                  Restaurar día
                </button>
              </div>
            ) : (
              <>
            {/* Garrafones badge & volume */}
            <div className="my-5 p-4 rounded-xl bg-slate-900/80 border border-cyan-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SingleGarrafon size="sm" active={true} />
                <div>
                  <h4 className="font-bold text-white text-base">
                    {selectedAssignment.garrafonesCount}{' '}
                    {selectedAssignment.garrafonesCount === 1
                      ? 'Garrafón'
                      : 'Garrafones'}
                  </h4>
                  <p className="text-xs text-cyan-300">
                    Capacidad calculada: {selectedAssignment.garrafonesCount * 20} Litros
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedAssignment.garrafonesCount === 3
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                }`}
              >
                {selectedAssignment.garrafonesCount}{' '}
                {selectedAssignment.garrafonesCount === 1 ? 'Garrafón' : 'Garrafones'}
              </span>
            </div>

            {/* Activities summary in modal */}
            <div className="space-y-4">
              {/* Compra */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-600/30 text-cyan-400">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Responsable de Compra
                    </span>
                    <span className="text-base font-bold text-white">
                      {selectedAssignment.buyerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      selectedAssignment.buyStatus === 'confirmado' ||
                      selectedAssignment.buyStatus === 'comprado'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedAssignment.buyStatus}
                  </span>
                  {selectedAssignment.buyStatus === 'pendiente' && (
                    <button
                      onClick={() =>
                        confirmPurchase(selectedCalendarDate, 'confirmado')
                      }
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>

              {/* Cargado */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-600/30 text-teal-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Responsables de Cargado
                    </span>
                    <span className="text-base font-bold text-white">
                      {selectedAssignment.loaderNames.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      selectedAssignment.loadStatus === 'completado'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedAssignment.loadStatus}
                  </span>
                  {selectedAssignment.loadStatus === 'pendiente' && (
                    <button
                      onClick={() =>
                        confirmLoad(selectedCalendarDate, 'completado')
                      }
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!selectedMovedFromDate &&
              selectedCalendarDate >= todayDate &&
              isWaterDeliveryDay(selectedCalendarDate, settings) && (
                <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-200 font-semibold text-sm">
                    <CalendarClock className="w-4 h-4" />
                    Cambiar fecha de entrega
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => moveSelectedDelivery(addDays(selectedCalendarDate, 7))}
                      className="px-3 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                    >
                      Posponer 7 días
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelectedDelivery(null)}
                      className="px-3 py-2 rounded-lg bg-rose-950 text-rose-200 border border-rose-500/50 text-xs font-bold hover:bg-rose-900"
                    >
                      Inhabilitar sin mover
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      min={todayDate}
                      value={moveTargetDate}
                      onChange={(event) => setMoveTargetDate(event.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-900 text-white text-xs"
                    />
                    <button
                      type="button"
                      disabled={!moveTargetDate}
                      onClick={() => moveSelectedDelivery(moveTargetDate)}
                      className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-40"
                    >
                      Mover a esta fecha
                    </button>
                  </div>
                  {scheduleError && (
                    <p className="text-xs text-rose-300">{scheduleError}</p>
                  )}
                </div>
              )}
              </>
            )}

            <div className="mt-6 pt-3 border-t border-cyan-950 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-950 text-cyan-200 border border-cyan-600/40 hover:bg-cyan-900 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
