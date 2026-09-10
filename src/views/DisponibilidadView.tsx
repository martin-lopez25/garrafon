import React, { useState } from 'react';
import {
  UserX,
  UserCheck,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  ShieldAlert,
  Palmtree,
  Stethoscope,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { AbsenceReason } from '../types';
import { getTodayDateString, formatDisplayDate, formatShortDate } from '../utils/dateUtils';
import { CodexBorder } from '../components/CodexPattern';

export const DisponibilidadView: React.FC = () => {
  const { people, togglePersonStatus, addAbsence, removeAbsence, todayDate } =
    useTlaloc();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [reason, setReason] = useState<AbsenceReason>('vacaciones');
  const [note, setNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAbsenceModal = (personId: string) => {
    setSelectedPersonId(personId);
    setStartDate(todayDate);
    setEndDate(todayDate);
    setReason('vacaciones');
    setNote('');
    setIsModalOpen(true);
  };

  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) return;

    addAbsence(selectedPersonId, {
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
      reason,
      note: note.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  const getReasonBadge = (r: AbsenceReason) => {
    switch (r) {
      case 'vacaciones':
        return {
          label: 'Vacaciones',
          icon: Palmtree,
          className: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        };
      case 'incapacidad':
        return {
          label: 'Incapacidad',
          icon: Stethoscope,
          className: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        };
      case 'falta':
        return {
          label: 'Falta',
          icon: AlertCircle,
          className: 'bg-red-950/80 text-red-300 border-red-500/40',
        };
      case 'permiso':
        return {
          label: 'Permiso',
          icon: FileText,
          className: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
        };
      default:
        return {
          label: 'Otro',
          icon: HelpCircle,
          className: 'bg-slate-900 text-slate-300 border-slate-700',
        };
    }
  };

  // Stats
  const activeCount = people.filter((p) => p.status === 'activo').length;
  const inactiveCount = people.length - activeCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100">
                Disponibilidad de Compañeros
              </h2>
              <p className="text-xs text-cyan-400/80">
                Control de ausencias, vacaciones y estado activo en la rotación
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-teal-950/70 border border-teal-500/40 text-xs">
            <span className="text-slate-400 block text-[10px]">Activos</span>
            <span className="font-bold text-teal-300 text-base">
              {activeCount} personas
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs">
            <span className="text-slate-400 block text-[10px]">Inactivos</span>
            <span className="font-bold text-rose-300 text-base">
              {inactiveCount} personas
            </span>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-cyan-100">
            Regla de omisión justa y preservación de turno:
          </p>
          <p className="text-cyan-300/80 mt-0.5">
            Cuando deshabilitas a un compañero o programas un periodo de ausencia, el sistema lo omite automáticamente de las asignaciones de ese día. Al reincorporarse, conserva su puesto lógico en la rotación para evitar sobrecargarlo o perjudicarlo.
          </p>
        </div>
      </div>

      {/* People Availability List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.map((person) => {
          const isActive = person.status === 'activo';
          const activeAbsences = person.absences.filter(
            (a) => a.endDate >= todayDate
          );
          const isCurrentlyAbsent = person.absences.some(
            (a) => a.startDate <= todayDate && a.endDate >= todayDate
          );

          return (
            <div
              key={person.id}
              className={`p-5 rounded-2xl border transition-all ${
                !isActive || isCurrentlyAbsent
                  ? 'bg-slate-950/80 border-slate-800/80 shadow-inner'
                  : 'bg-gradient-to-b from-[#082238] to-[#051422] border-cyan-900/50 shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-white ${
                      isActive && !isCurrentlyAbsent
                        ? 'bg-gradient-to-br from-cyan-600 to-teal-700 border border-cyan-400/40 shadow-sm'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      {person.name}
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-900">
                        {person.role}
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400">
                      {isCurrentlyAbsent ? (
                        <span className="text-amber-400 font-medium">
                          Ausente hoy
                        </span>
                      ) : isActive ? (
                        <span className="text-teal-400">Activo en rotación</span>
                      ) : (
                        <span className="text-rose-400">Deshabilitado</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Active / Inactive Switch Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    id={`toggle-status-${person.id}`}
                    onClick={() => togglePersonStatus(person.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                      isActive ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    title={
                      isActive
                        ? 'Click para marcar como inactivo'
                        : 'Click para activar'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Absences Section */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Periodos de ausencia:
                  </span>
                  <button
                    id={`btn-add-absence-${person.id}`}
                    onClick={() => openAbsenceModal(person.id)}
                    className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold text-[11px] p-1 rounded hover:bg-cyan-950 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar periodo</span>
                  </button>
                </div>

                {person.absences.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-1">
                    Sin periodos de ausencia programados.
                  </p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {person.absences.map((abs) => {
                      const badge = getReasonBadge(abs.reason);
                      const Icon = badge.icon;
                      const isPast = abs.endDate < todayDate;

                      return (
                        <div
                          key={abs.id}
                          className={`flex items-center justify-between gap-2 p-2 rounded-lg text-xs border ${
                            isPast
                              ? 'bg-slate-900/40 border-slate-800 opacity-60'
                              : 'bg-slate-900 border-cyan-950'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}
                            >
                              <Icon className="w-3 h-3" />
                              {badge.label}
                            </span>
                            <span className="text-slate-300 font-mono text-[11px] truncate">
                              {formatShortDate(abs.startDate)} -{' '}
                              {formatShortDate(abs.endDate)}
                            </span>
                            {abs.note && (
                              <span className="text-slate-400 italic text-[11px] truncate hidden sm:inline">
                                ({abs.note})
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => removeAbsence(person.id, abs.id)}
                            title="Eliminar ausencia"
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Register Absence Period */}
      {isModalOpen && selectedPersonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            id="absence-modal-form"
            className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a2740] to-[#061826] border-2 border-cyan-500/50 shadow-2xl p-6 relative"
          >
            <CodexBorder variant="gold" className="mb-3" />

            <div className="pb-3 border-b border-cyan-900/60 mb-4">
              <h3 className="font-['Cinzel',serif] text-xl font-bold text-cyan-100">
                Registrar Periodo de Ausencia
              </h3>
              <p className="text-xs text-cyan-400">
                Compañero:{' '}
                <span className="text-white font-bold">
                  {people.find((p) => p.id === selectedPersonId)?.name}
                </span>
              </p>
            </div>

            <form onSubmit={handleSaveAbsence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fecha inicial de ausencia
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-900 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fecha final de ausencia
                </label>
                <input
                  type="date"
                  required
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-900 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Motivo de la ausencia
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AbsenceReason)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-cyan-900 text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="vacaciones">Vacaciones</option>
                  <option value="falta">Falta</option>
                  <option value="permiso">Permiso</option>
                  <option value="incapacidad">Incapacidad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nota o descripción opcional
                </label>
                <input
                  type="text"
                  placeholder="Ej. Viaje familiar, cita médica..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-900 text-white focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="pt-4 border-t border-cyan-950 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-bold hover:from-cyan-300 hover:to-teal-200 cursor-pointer shadow-md"
                >
                  Guardar Ausencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
