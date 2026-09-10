import React, { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  Users,
  Calendar,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { SingleGarrafon } from '../components/GarrafonIcon';
import { CodexBorder } from '../components/CodexPattern';
import { formatDisplayDate, formatDayOfWeek, formatShortDate } from '../utils/dateUtils';

export const CompraView: React.FC = () => {
  const {
    todayDate,
    isTodayWaterDay,
    nextDeliveryDate,
    todayAssignment,
    activeDeliveryAssignment,
    confirmPurchase,
    people,
    stats,
  } = useTlaloc();

  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(
    isTodayWaterDay ? todayDate : nextDeliveryDate
  );

  const currentAss =
    selectedTargetDate === todayDate ? todayAssignment : activeDeliveryAssignment;

  const isBuyDone =
    currentAss.buyStatus === 'comprado' ||
    currentAss.buyStatus === 'confirmado';
  const currentBuyerIds = currentAss.buyerId
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const compraPeople = people.filter(
    (person) =>
      person.status === 'activo' &&
      (person.role === 'compra' || person.role === 'ambas')
  );

  // Sort by purchases count to display fairness ranking
  const ranked = [...compraPeople].sort((a, b) => {
    const countA = stats[a.id]?.purchasesCount || 0;
    const countB = stats[b.id]?.purchasesCount || 0;
    if (countA !== countB) return countA - countB;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100">
                SECCIÓN 1 — COMPRA DE GARRAFÓN
              </h2>
              <p className="text-xs text-cyan-400/80">
                Pago rotativo y justo entre las {compraPeople.length} personas activas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTargetDate(nextDeliveryDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTargetDate === nextDeliveryDate
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                  : 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-900'
              }`}
            >
              Próxima Entrega
            </button>
            <button
              onClick={() => setSelectedTargetDate(todayDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTargetDate === todayDate
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              Hoy ({formatShortDate(todayDate)})
            </button>
          </div>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0a2740] to-[#061826] border-2 border-cyan-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <CodexBorder variant="turquoise" className="mb-4" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-mono">
                {currentAss.date === todayDate ? 'Turno de Hoy' : `Turno Programado: ${formatDisplayDate(currentAss.date)}`}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isBuyDone
                    ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {currentAss.buyStatus}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
              {currentAss.buyerName}
            </h3>

            <p className="text-sm text-cyan-300">
              {formatDisplayDate(currentAss.date)}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Cantidad</span>
                <span className="text-xl font-bold text-cyan-200">
                  {currentAss.garrafonesCount} {currentAss.garrafonesCount === 1 ? 'Garrafón' : 'Garrafones'} ({currentAss.garrafonesCount * 20}L)
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Día oficial</span>
                <span className="text-sm font-bold text-white">
                  {formatDayOfWeek(currentAss.date)} ({currentAss.garrafonesCount} {currentAss.garrafonesCount === 1 ? 'garrafón' : 'garrafones'})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 min-w-[220px]">
            <SingleGarrafon size="lg" active={true} />
            <span className="mt-3 text-xs font-semibold text-cyan-200">
              {currentAss.garrafonesCount} {currentAss.garrafonesCount === 1 ? 'garrafón requerido' : 'garrafones requeridos'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-cyan-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {currentAss.buyConfirmedAt ? (
              <p className="text-xs text-teal-300 italic flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Registrado exitosamente el {currentAss.buyConfirmedAt}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Presiona confirmar una vez adquiridos los garrafones.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isBuyDone ? (
              <button
                id="btn-compra-confirmar-page"
                onClick={() => confirmPurchase(currentAss.date, 'confirmado')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 shadow-lg shadow-cyan-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Confirmar compra</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="px-5 py-3 rounded-xl bg-teal-950 text-teal-200 border border-teal-500/40 font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Compra Completada</span>
                </div>
                <button
                  onClick={() => confirmPurchase(currentAss.date, 'pendiente')}
                  title="Marcar como pendiente"
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fairness Ranking for Purchases */}
      <div className="rounded-2xl bg-[#07192b] border border-cyan-900/60 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100">
              Rolo de Pago sin Repetir
            </h3>
          </div>
          <span className="text-xs text-amber-300 font-semibold">
            {compraPeople.length} personas activas
          </span>
        </div>

        <p className="text-xs text-slate-400 my-3">
          Nadie repite el pago hasta que todas las personas activas hayan participado en la ronda actual.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {ranked.map((person, index) => {
            const pStats = stats[person.id] || { purchasesCount: 0 };
            const isCurrent = currentBuyerIds.includes(person.id);
            const isInactive = person.status === 'inactivo';

            return (
              <div
                key={person.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : isInactive
                    ? 'bg-slate-950/50 border-slate-800 opacity-60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-cyan-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      {person.name}
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-bold">
                          TURNO
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {isInactive ? 'Inactivo temporalmente' : person.role === 'ambas' ? 'Compra y Carga' : 'Comprador'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-300">
                    {pStats.purchasesCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block">compras</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
