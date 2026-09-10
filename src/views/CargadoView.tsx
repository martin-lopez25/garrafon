import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Users,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { SingleGarrafon } from '../components/GarrafonIcon';
import { CodexBorder } from '../components/CodexPattern';
import { formatDisplayDate, formatShortDate } from '../utils/dateUtils';

export const CargadoView: React.FC = () => {
  const {
    todayDate,
    isTodayWaterDay,
    nextDeliveryDate,
    todayAssignment,
    activeDeliveryAssignment,
    confirmLoad,
    people,
    stats,
    designatedLoaders,
  } = useTlaloc();

  const [selectedTargetDate, setSelectedTargetDate] = useState<string>(
    isTodayWaterDay ? todayDate : nextDeliveryDate
  );

  const currentAss =
    selectedTargetDate === todayDate ? todayAssignment : activeDeliveryAssignment;

  const isLoadDone = currentAss.loadStatus === 'completado';

  // Sort designated loaders by carries count
  const rankedLoaders = [...designatedLoaders].sort((a, b) => {
    const countA = stats[a.id]?.carriesCount || 0;
    const countB = stats[b.id]?.carriesCount || 0;
    if (countA !== countB) return countA - countB;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-teal-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100">
                SECCIÓN 2 — CARGADO DE GARRAFÓN
              </h2>
              <p className="text-xs text-cyan-400/80">
                Rotación justa entre personas con rol Cargado o Ambas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTargetDate(nextDeliveryDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTargetDate === nextDeliveryDate
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-md'
                  : 'bg-teal-950/80 text-teal-200 border border-teal-500/40 hover:bg-teal-900'
              }`}
            >
              Próxima Entrega
            </button>
            <button
              onClick={() => setSelectedTargetDate(todayDate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTargetDate === todayDate
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              Hoy ({formatShortDate(todayDate)})
            </button>
          </div>
        </div>
      </div>

      {/* Main Focus Card */}
      <div className="rounded-2xl bg-gradient-to-b from-[#062630] to-[#04171e] border-2 border-teal-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <CodexBorder variant="teal" className="mb-4" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-mono">
                {currentAss.date === todayDate ? 'Turno de Hoy' : `Turno Programado: ${formatDisplayDate(currentAss.date)}`}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isLoadDone
                    ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {currentAss.loadStatus}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">
                Personas asignadas ({currentAss.loaderNames.length} de {designatedLoaders.length}):
              </span>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {currentAss.loaderNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-2xl md:text-3xl font-extrabold text-white tracking-wide bg-slate-900/60 px-3.5 py-1 rounded-xl border border-teal-500/40 shadow-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm text-cyan-300">
              {formatDisplayDate(currentAss.date)}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">
                  Garrafones a cargar
                </span>
                <span className="text-xl font-bold text-teal-200">
                  {currentAss.garrafonesCount} ({currentAss.garrafonesCount * 20} Litros)
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Día y cuadrilla</span>
                <span className="text-sm font-bold text-white">
                  {currentAss.loaderNames.length} cargador{currentAss.loaderNames.length > 1 ? 'es' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-teal-950/40 border border-teal-800/40 min-w-[220px]">
            <SingleGarrafon size="lg" active={true} />
            <span className="mt-3 text-xs font-semibold text-teal-200 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-teal-400" />
              {currentAss.garrafonesCount * 20} kg de peso total
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-teal-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {currentAss.loadConfirmedAt ? (
              <p className="text-xs text-teal-300 italic flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Cargado confirmado el {currentAss.loadConfirmedAt}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Presiona confirmar una vez colocados los garrafones en los dispensadores.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isLoadDone ? (
              <button
                id="btn-cargado-confirmar-page"
                onClick={() => confirmLoad(currentAss.date, 'completado')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-300 hover:from-teal-300 hover:to-cyan-200 shadow-lg shadow-teal-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>Confirmar cargado</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="px-5 py-3 rounded-xl bg-teal-950 text-teal-200 border border-teal-500/40 font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Cargado Completado</span>
                </div>
                <button
                  onClick={() => confirmLoad(currentAss.date, 'pendiente')}
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

      {/* Roster of Loaders and Fairness */}
      <div className="rounded-2xl bg-[#07192b] border border-cyan-900/60 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100">
              Rolo de Cargado sin Repetir
            </h3>
          </div>
          <span className="text-xs text-amber-300 font-semibold">
            {designatedLoaders.length} cargadores habilitados
          </span>
        </div>

        <p className="text-xs text-slate-400 my-3">
          Solo cargan personas con rol Cargado o Ambas. Se asigna primero a quien tenga menos turnos y más tiempo sin participar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {rankedLoaders.map((person, index) => {
            const pStats = stats[person.id] || { carriesCount: 0 };
            const isAssigned = currentAss.loaderIds.includes(person.id);
            const isInactive = person.status === 'inactivo';

            return (
              <div
                key={person.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isAssigned
                    ? 'bg-teal-950/70 border-teal-400/80 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                    : isInactive
                    ? 'bg-slate-950/50 border-slate-800 opacity-60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[11px] font-mono text-teal-400 font-semibold">
                      Encargado #{index + 1}
                    </span>
                    {isAssigned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400 text-slate-950 font-bold uppercase">
                        Asignado
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white">{person.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isInactive ? 'Inactivo temporalmente' : 'Activo en el rolo de cargado'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Cargas completadas:</span>
                  <span className="text-base font-extrabold text-teal-300">
                    {pStats.carriesCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
