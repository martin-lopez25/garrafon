import React, { useState } from 'react';
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  History,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CalendarCheck,
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { TlalocEmblem } from '../components/TlalocEmblem';
import { GarrafonDisplay } from '../components/GarrafonIcon';
import { CodexBorder, SteppedFretBand } from '../components/CodexPattern';
import {
  formatDisplayDate,
  formatDayOfWeek,
  formatShortDate,
  calculateGarrafonesForDate,
} from '../utils/dateUtils';
import { NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    todayDate,
    isTodayWaterDay,
    nextDeliveryDate,
    activeDeliveryDate,
    todayAssignment,
    activeDeliveryAssignment,
    upcomingList,
    assignments,
    saveAssignment,
    updateAssignmentGarrafones,
    confirmPurchase,
    confirmLoad,
    people,
    designatedLoaders,
    allBuyers,
    stats,
  } = useTlaloc();

  // If today is a delivery day (Wednesday or Thursday), default to today.
  // Otherwise, default to the upcoming scheduled delivery date.
  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(
    isTodayWaterDay ? todayDate : nextDeliveryDate
  );

  const [buyingInProgress, setBuyingInProgress] = useState(false);
  const [loadingInProgress, setLoadingInProgress] = useState(false);

  // Active assignment displayed in the main card
  const currentAss =
    selectedTargetDate === todayDate ? todayAssignment : activeDeliveryAssignment;

  const isCurrentAssToday = currentAss.date === todayDate;

  // Check if buyer has any alert or is missing
  const buyerIds = currentAss.buyerId
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const isBuyerUnavailable = buyerIds.some((buyerId) => {
    const buyer = people.find((person) => person.id === buyerId);
    return !buyer || buyer.status !== 'activo';
  });

  const handleConfirmPurchase = () => {
    setBuyingInProgress(true);
    confirmPurchase(currentAss.date, 'confirmado');
    setTimeout(() => setBuyingInProgress(false), 500);
  };

  const handleConfirmLoad = () => {
    setLoadingInProgress(true);
    confirmLoad(currentAss.date, 'completado');
    setTimeout(() => setLoadingInProgress(false), 500);
  };

  const isBuyDone =
    currentAss.buyStatus === 'comprado' ||
    currentAss.buyStatus === 'confirmado';
  const isLoadDone = currentAss.loadStatus === 'completado';
  const isAssignmentSaved = assignments.some(
    (assignment) => assignment.date === currentAss.date
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Mesoamerican Header: Tláloc Banner */}
      <section
        id="dashboard-header-hero"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#082238] via-[#091b2c] to-[#05111d] border border-cyan-800/50 p-6 md:p-8 text-center shadow-2xl"
      >
        {/* Decorative corner glyphs */}
        <div className="absolute top-2 left-3 text-cyan-700/40 text-xs font-mono select-none">
          𐀏 ≋ ☵
        </div>
        <div className="absolute top-2 right-3 text-cyan-700/40 text-xs font-mono select-none">
          ☵ ≋ 𐀏
        </div>

        {/* Ambient Water Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
          {/* Tlaloc Artistic Mask */}
          <div className="mb-3">
            <TlalocEmblem size="hero" animate={true} />
          </div>

          <h1 className="font-['Cinzel',serif] text-3xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-100 to-amber-300 drop-shadow-md">
            TLÁLOC
          </h1>

          <div className="my-2 max-w-md w-full">
            <CodexBorder variant="gold" />
          </div>

          <p className="font-serif italic text-lg md:text-xl text-cyan-100/90 tracking-wide">
            “El agua es responsabilidad de todos”
          </p>

          <p className="mt-1 text-xs md:text-sm text-cyan-400/80 font-medium">
            {formatDisplayDate(todayDate)}
          </p>

          {/* Schedule Badge: Wednesday (3) & Thursday (1) */}
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs text-cyan-200 shadow-sm">
            <span className="font-bold text-amber-400">📅 Calendario Oficial:</span>
            <span>Miércoles (3 Garrafones)</span>
            <span className="text-cyan-600">•</span>
            <span>Jueves (1 Garrafón)</span>
          </div>

          <button
            type="button"
            onClick={() => saveAssignment(currentAss.date)}
            disabled={isAssignmentSaved}
            className={`mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
              isAssignmentSaved
                ? 'bg-teal-950/70 border-teal-500/40 text-teal-300 cursor-default'
                : 'bg-cyan-400 border-cyan-200 text-slate-950 hover:bg-cyan-300 cursor-pointer shadow-lg shadow-cyan-950/50'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>
              {isAssignmentSaved ? 'Asignación guardada' : 'Guardar asignación'}
            </span>
          </button>
        </div>
      </section>

      {/* Non-Delivery Day Alert / Next Delivery Banner */}
      {!isTodayWaterDay && (
        <div
          id="dashboard-schedule-notice"
          className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-[#0b2742] via-[#092036] to-[#061828] border border-cyan-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-300 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>Hoy no hay entrega regular</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Solo Miércoles y Jueves
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Próxima entrega programada:{' '}
                <strong className="text-cyan-200">
                  {formatDisplayDate(nextDeliveryDate)}
                </strong>{' '}
                ({calculateGarrafonesForDate(nextDeliveryDate)} Garrafones).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setSelectedTargetDate(nextDeliveryDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTargetDate === nextDeliveryDate
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-900'
              }`}
            >
              Ver Próxima Entrega
            </button>
            <button
              onClick={() => setSelectedTargetDate(todayDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTargetDate === todayDate
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              Ver Día Actual
            </button>
          </div>
        </div>
      )}

      {/* Hero Card: GARRAFONES PROGRAMADOS */}
      <section
        id="dashboard-garrafones-hoy"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2740] to-[#061826] border-2 border-cyan-500/40 p-6 md:p-8 shadow-xl text-center"
      >
        <SteppedFretBand className="mb-4" />

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest font-mono">
            ◆ {isCurrentAssToday ? 'Turno de Hoy' : `Turno Programado: ${formatDisplayDate(currentAss.date)}`} ◆
          </span>
        </div>

        <h2 className="font-['Cinzel',serif] text-xl md:text-2xl font-bold text-cyan-100 tracking-wider">
          ENTREGA DE {currentAss.garrafonesCount} {currentAss.garrafonesCount === 1 ? 'GARRAFÓN' : 'GARRAFONES'} ({currentAss.garrafonesCount * 20} LITROS)
        </h2>

        {/* Big Garrafones Count Number & Visual Display */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative inline-flex items-center justify-center">
            <span className="font-['Cinzel',serif] text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-teal-300 to-cyan-500 drop-shadow-[0_4px_16px_rgba(6,182,212,0.4)]">
              {currentAss.garrafonesCount}
            </span>
            <span className="absolute -bottom-2 text-xs uppercase font-semibold text-cyan-300/80 tracking-widest">
              {currentAss.garrafonesCount === 1 ? 'Garrafón' : 'Garrafones'} ({formatDayOfWeek(currentAss.date)})
            </span>
          </div>

          <div className="mt-6 w-full flex justify-center">
            <GarrafonDisplay
              count={currentAss.garrafonesCount}
              size="lg"
              showLabel={true}
            />
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Regla Tláloc:{' '}
          <span className="text-cyan-300 font-semibold">
            Miércoles = 3 Garrafones (3 pagadores y 3 cargadores)
          </span>
          {' '}y{' '}
          <span className="text-teal-300 font-semibold">
            Jueves = 1 Garrafón (1 cargador)
          </span>
          . Pago y cargado rotan por separado, sin repetir, entre las personas habilitadas para cada actividad.
        </p>
      </section>

      {/* The Two Main Sections: COMPRA & CARGADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECCIÓN 1 — COMPRA DE GARRAFÓN */}
        <section
          id="dashboard-seccion-compra"
          className={`relative rounded-2xl border-2 transition-all p-6 md:p-7 flex flex-col justify-between shadow-xl ${
            isBuyDone
              ? 'bg-gradient-to-b from-[#06332d] to-[#041a17] border-teal-500/50'
              : 'bg-gradient-to-b from-[#082238] to-[#051422] border-cyan-500/50'
          }`}
        >
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-cyan-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100 tracking-wide">
                    SECCIÓN 1 — COMPRA DE GARRAFÓN
                  </h3>
                  <p className="text-xs text-cyan-400/80">
                    Rotación equitativa de pago entre {allBuyers.length} personas activas
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isBuyDone
                    ? 'bg-teal-900/80 text-teal-200 border border-teal-400/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isBuyDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    {currentAss.buyStatus === 'confirmado'
                      ? 'Confirmado'
                      : 'Comprado'}
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    Pendiente
                  </>
                )}
              </span>
            </div>

            {/* Content Details */}
            <div className="py-6 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Persona{buyerIds.length > 1 ? 's' : ''} responsable{buyerIds.length > 1 ? 's' : ''} de pagar:
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center text-xl font-bold text-white shadow-lg border border-cyan-400/30">
                    {currentAss.buyerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-2xl font-extrabold text-white tracking-wide">
                      {currentAss.buyerName}
                    </h4>
                    {isBuyerUnavailable ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Compañero no disponible (se sugiere reasignar)
                      </span>
                    ) : (
                      <span className="text-xs text-cyan-300/80">
                        {buyerIds.length} participante{buyerIds.length > 1 ? 's' : ''} del rolo de pago sin repetir ({allBuyers.length} compañeros)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    Cantidad a comprar
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Reducir cantidad"
                      title="Reducir cantidad"
                      disabled={currentAss.garrafonesCount <= 1}
                      onClick={() =>
                        updateAssignmentGarrafones(
                          currentAss.date,
                          currentAss.garrafonesCount - 1
                        )
                      }
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="min-w-8 text-center text-xl font-bold text-cyan-200">
                      {currentAss.garrafonesCount}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      title="Aumentar cantidad"
                      disabled={currentAss.garrafonesCount >= 10}
                      onClick={() =>
                        updateAssignmentGarrafones(
                          currentAss.date,
                          currentAss.garrafonesCount + 1
                        )
                      }
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-cyan-900 border border-cyan-700 text-cyan-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    Fecha de entrega
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {formatShortDate(currentAss.date)}
                  </span>
                </div>
              </div>

              {currentAss.buyConfirmedAt && (
                <p className="text-xs text-teal-300/90 italic flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Confirmado el {currentAss.buyConfirmedAt}
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {!isBuyDone ? (
              <button
                id="btn-confirmar-compra"
                onClick={handleConfirmPurchase}
                disabled={buyingInProgress}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-cyan-200"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Confirmar compra</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 py-3 px-4 rounded-xl bg-teal-950/70 border border-teal-500/40 text-teal-200 text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Compra registrada con éxito</span>
                </div>
                <button
                  onClick={() => confirmPurchase(currentAss.date, 'pendiente')}
                  title="Reabrir / Marcar pendiente"
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN 2 — CARGADO DE GARRAFÓN */}
        <section
          id="dashboard-seccion-cargado"
          className={`relative rounded-2xl border-2 transition-all p-6 md:p-7 flex flex-col justify-between shadow-xl ${
            isLoadDone
              ? 'bg-gradient-to-b from-[#06332d] to-[#041a17] border-teal-500/50'
              : 'bg-gradient-to-b from-[#082238] to-[#051422] border-cyan-500/50'
          }`}
        >
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-cyan-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100 tracking-wide">
                    SECCIÓN 2 — CARGADO DE GARRAFÓN
                  </h3>
                  <p className="text-xs text-cyan-400/80">
                    Rotación equitativa entre {designatedLoaders.length} cargadores habilitados
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isLoadDone
                    ? 'bg-teal-900/80 text-teal-200 border border-teal-400/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isLoadDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Completado
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    Pendiente
                  </>
                )}
              </span>
            </div>

            {/* Content Details */}
            <div className="py-6 space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Personas responsables de cargar:
                </span>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {currentAss.loaderNames.map((name, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/40 shadow-sm"
                      >
                        <span className="w-7 h-7 rounded-lg bg-cyan-800/80 text-cyan-200 text-xs font-bold flex items-center justify-center">
                          {name.charAt(0)}
                        </span>
                        <span className="text-lg font-bold text-white tracking-wide">
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-cyan-300/80 block mt-1">
                    {currentAss.loaderNames.length} persona{currentAss.loaderNames.length > 1 ? 's' : ''} asignada{currentAss.loaderNames.length > 1 ? 's' : ''} para distribuir {currentAss.garrafonesCount * 20} kg.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    Garrafones a transportar
                  </span>
                  <span className="text-lg font-bold text-cyan-200">
                    {currentAss.garrafonesCount} ({currentAss.garrafonesCount * 20} Litros)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">
                    Cargadores asignados
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {currentAss.loaderNames.length} de {designatedLoaders.length} personas
                  </span>
                </div>
              </div>

              {currentAss.loadConfirmedAt && (
                <p className="text-xs text-teal-300/90 italic flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Confirmado el {currentAss.loadConfirmedAt}
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {!isLoadDone ? (
              <button
                id="btn-confirmar-cargado"
                onClick={handleConfirmLoad}
                disabled={loadingInProgress}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-300 hover:from-teal-300 hover:to-cyan-200 shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-teal-200"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Confirmar cargado</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 py-3 px-4 rounded-xl bg-teal-950/70 border border-teal-500/40 text-teal-200 text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Cargado registrado con éxito</span>
                </div>
                <button
                  onClick={() => confirmLoad(currentAss.date, 'pendiente')}
                  title="Reabrir / Marcar pendiente"
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Fair loading rotation */}
      <section
        id="dashboard-los-4-cargadores"
        className="rounded-2xl bg-gradient-to-b from-[#092238] to-[#051322] border border-teal-600/40 p-6 md:p-7 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-900/60">
          <div>
            <h3 className="font-['Cinzel',serif] text-xl font-bold text-cyan-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-400" />
              <span>Rolo de Cargado</span>
            </h3>
            <p className="text-xs text-cyan-400/80">
              Solo participan personas con rol Cargado o Ambas, sin repetir hasta completar la ronda
            </p>
          </div>

          <button
            onClick={() => onNavigate('cargado')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-200 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Ver Rolo de Cargado
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {designatedLoaders.map((loader) => {
            const carries = stats[loader.id]?.carriesCount || 0;
            const isAssignedNow = currentAss.loaderIds.includes(loader.id);
            return (
              <div
                key={loader.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAssignedNow
                    ? 'bg-gradient-to-b from-teal-950/80 to-cyan-950/60 border-teal-400/60 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                    : 'bg-slate-900/70 border-cyan-900/40 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-white text-base">
                    {loader.name}
                  </span>
                  {isAssignedNow && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500 text-slate-950">
                      Asignado
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Turnos cargados:</span>
                    <strong className="text-teal-300 font-bold">{carries}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rol:</span>
                    <span className="text-cyan-200">Compra y Carga</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Próximas Asignaciones & Quick Access Buttons */}
      <section
        id="dashboard-proximas-asignaciones"
        className="rounded-2xl bg-gradient-to-b from-[#092036] to-[#051322] border border-cyan-800/40 p-6 md:p-7 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
          <div>
            <h3 className="font-['Cinzel',serif] text-xl font-bold text-cyan-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-cyan-400" />
              <span>Próximas Entregas (Miércoles y Jueves)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Rolo sin repetir programado para las próximas entregas oficiales
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="dashboard-btn-calendario"
              onClick={() => onNavigate('calendario')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Calendario</span>
            </button>
            <button
              id="dashboard-btn-historial"
              onClick={() => onNavigate('historial')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Historial</span>
            </button>
          </div>
        </div>

        {/* Next days queue */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingList.slice(0, 3).map((item) => (
            <div
              key={item.date}
              className="p-4 rounded-xl bg-slate-900/70 border border-cyan-900/40 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm font-bold text-cyan-200 font-['Cinzel',serif]">
                  {formatDayOfWeek(item.date)}
                </span>
                <span className="text-xs text-slate-400">
                  {formatShortDate(item.date)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/40 border border-cyan-900/30">
                  <span className="text-slate-400">Garrafones:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      item.garrafonesCount === 3
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {item.garrafonesCount} {item.garrafonesCount === 3 ? 'Garrafones (Mié)' : 'Garrafón (Jue)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
                  <span className="text-slate-400">Compra:</span>
                  <span className="font-bold text-cyan-100">{item.buyerName}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
                  <span className="text-slate-400">Cargado:</span>
                  <span className="font-semibold text-teal-200 truncate max-w-[140px]">
                    {item.loaderNames.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-cyan-950 flex justify-end">
          <button
            onClick={() => onNavigate('calendario')}
            className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 group cursor-pointer"
          >
            <span>Ver programación completa en el calendario</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
};
