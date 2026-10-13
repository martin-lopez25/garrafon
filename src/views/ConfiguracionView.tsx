import React, { useState } from 'react';
import {
  Settings,
  Calendar,
  RotateCcw,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { CodexBorder } from '../components/CodexPattern';
import { getTodayDateString, formatDisplayDate } from '../utils/dateUtils';

export const ConfiguracionView: React.FC = () => {
  const {
    assignments,
    resetRotation,
    resetToDefaults,
    exportDatabase,
    importDatabase,
    todayDate,
  } = useTlaloc();

  const [showResetRotationModal, setShowResetRotationModal] = useState(false);
  const [showResetDefaultsModal, setShowResetDefaultsModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const nextAssignment = [...assignments]
    .filter((assignment) => assignment.date >= todayDate)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const money = (amount: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN',
  }).format(amount);

  const handleExport = () => {
    const data = exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tlaloc-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportSuccess(false);

    if (!importJsonText.trim()) {
      setImportError('Ingresa el contenido JSON del respaldo.');
      return;
    }

    const success = importDatabase(importJsonText.trim());
    if (success) {
      setImportSuccess(true);
      setImportJsonText('');
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError('El formato JSON es inválido o no compatible con Tláloc.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100">
              Configuración de Entregas y Rotación
            </h2>
            <p className="text-xs text-cyan-400/80">
              Programación por fecha, rotación de responsables y respaldos
            </p>
          </div>
        </div>
      </div>

      <section id="settings-delivery-rules" className="py-6 space-y-5">
        <CodexBorder variant="gold" className="mb-4" />

        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100">
            Programación de Entregas por Fecha
          </h3>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div><dt className="font-semibold text-cyan-100">Fechas de entrega</dt><dd className="mt-1 text-slate-300">Cualquier día, incluidos sábados y domingos. Solo aparecen las entregas guardadas.</dd></div>
          <div><dt className="font-semibold text-cyan-100">Garrafones y costo</dt><dd className="mt-1 text-slate-300">Cantidad y precio por garrafón definidos en cada entrega, sin alternancia fija.</dd></div>
          <div><dt className="font-semibold text-cyan-100">Compradores</dt><dd className="mt-1 text-slate-300">Cantidad independiente por fecha. Responsables asignados por rotación, según su rol y disponibilidad.</dd></div>
          <div><dt className="font-semibold text-cyan-100">Cargadores</dt><dd className="mt-1 text-slate-300">Un cargador por garrafón por defecto, con cantidad editable por fecha en el calendario. Responsables asignados por rotación.</dd></div>
        </dl>
        <div className="pt-4 border-t border-cyan-900/60 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-200"><Calendar className="w-4 h-4" /> Próxima entrega guardada</h4>
          {nextAssignment ? <>
            <p className="text-sm text-cyan-200">{formatDisplayDate(nextAssignment.date)}</p>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><dt className="text-slate-400">Garrafones</dt><dd className="text-white">{nextAssignment.garrafonesCount}</dd></div>
              <div><dt className="text-slate-400">Costo por garrafón</dt><dd className="text-white">{nextAssignment.pricePerGarrafon === undefined ? 'Sin registrar' : money(nextAssignment.pricePerGarrafon)}</dd></div>
              <div><dt className="text-slate-400">Compradores</dt><dd className="text-white">{nextAssignment.buyerId.split(',').filter((id) => id.trim()).length}</dd></div>
              <div><dt className="text-slate-400">Cargadores</dt><dd className="text-white">{nextAssignment.loaderIds.length}</dd></div>
            </dl>
          </> : <p className="text-sm text-slate-300">Sin entregas guardadas para hoy o fechas posteriores.</p>}
        </div>
      </section>

      {/* Backup & Persistence */}
      <div className="rounded-2xl bg-[#061726] border border-cyan-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100">
            Persistencia y Respaldo de Información
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Los datos se guardan de forma persistente en LocalStorage del navegador. Puedes exportar un archivo JSON para compartirlo con otros compañeros o importarlo en otro dispositivo.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Descargar Respaldo JSON</span>
          </button>
        </div>

        {/* Import Form */}
        <form onSubmit={handleImportSubmit} className="pt-4 border-t border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Restaurar desde Respaldo JSON
          </label>
          <textarea
            rows={3}
            placeholder="Pega aquí el contenido JSON del respaldo..."
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-cyan-900 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none placeholder-slate-500"
          />

          {importError && (
            <p className="text-xs text-rose-400 font-semibold">{importError}</p>
          )}
          {importSuccess && (
            <p className="text-xs text-teal-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Datos restaurados con éxito.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Respaldo</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Actions */}
      <div className="rounded-2xl bg-rose-950/20 border border-rose-900/50 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h3 className="font-['Cinzel',serif] text-lg font-bold text-rose-200">
            Zona de Mantenimiento de Rotación
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Acciones de reinicio para cuando inicie un nuevo ciclo laboral, año fiscal o se requiera volver a comenzar desde cero.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setShowResetRotationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reiniciar Historial de Rotación</span>
          </button>

          <button
            onClick={() => setShowResetDefaultsModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restablecer Datos de Fábrica (12 Personas)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Rotation */}
      {showResetRotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a233a] to-[#061524] border-2 border-rose-500/50 shadow-2xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-white">
              ¿Reiniciar Rotación?
            </h3>
            <p className="text-xs text-slate-300 my-3">
              Se borrarán las asignaciones registradas y los contadores acumulados. El algoritmo de equidad comenzará limpio a partir de hoy.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetRotationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetRotation();
                  setShowResetRotationModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Sí, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Factory Reset */}
      {showResetDefaultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a233a] to-[#061524] border-2 border-rose-500/50 shadow-2xl p-6 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-spin" />
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-white">
              ¿Restablecer Datos Iniciales?
            </h3>
            <p className="text-xs text-slate-300 my-3">
              Esto restaurará los 12 nombres originales de prueba (Ana, Carlos, Diego, etc.) y la configuración original.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetDefaultsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetDefaultsModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-lg"
              >
                Restablecer Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
