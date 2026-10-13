import React, { useState } from 'react';
import { Save, ShoppingCart, Truck, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { GarrafonDisplay } from '../components/GarrafonIcon';
import { CodexBorder } from '../components/CodexPattern';
import { formatDisplayDate } from '../utils/dateUtils';
import { getAssignmentForDate } from '../utils/rotationAlgorithm';
import { NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = () => {
  const {
    todayDate,
    assignments,
    scheduleDelivery,
    settings,
    people,
    confirmPurchase,
    designatedLoaders,
    allBuyers,
    stats,
  } = useTlaloc();

  const [selectedTargetDate, setSelectedTargetDate] = useState(todayDate);
  const [draft, setDraft] = useState<{
    buyersCount: number;
    garrafonesCount: number;
    price: string;
  } | null>(null);
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const savedAssignment = assignments.find((item) => item.date === selectedTargetDate);
  const currentAss = savedAssignment ?? getAssignmentForDate(selectedTargetDate, people, assignments, settings);
  const values = draft ?? {
    buyersCount: savedAssignment
      ? settings.deliveryPlans?.[selectedTargetDate]?.buyersCount ??
        (savedAssignment.buyerId.split(',').filter(Boolean).length || 1)
      : 0,
    garrafonesCount: savedAssignment?.garrafonesCount ?? 0,
    price: savedAssignment?.pricePerGarrafon?.toString() ?? '',
  };
  const pricePerGarrafon = Number(values.price);
  const loadersCount = settings.deliveryPlans?.[selectedTargetDate]?.loadersCount ?? values.garrafonesCount;
  const preview = getAssignmentForDate(selectedTargetDate, people,
    assignments.filter((item) => item.date !== selectedTargetDate), {
      ...settings,
      deliveryPlans: {
        ...settings.deliveryPlans,
        [selectedTargetDate]: {
          buyersCount: values.buyersCount,
          garrafonesCount: values.garrafonesCount,
          pricePerGarrafon,
          loadersCount,
        },
      },
    });
  const isLocked = assignments.some((item) => item.date === selectedTargetDate &&
    (item.buyStatus !== 'pendiente' || item.loadStatus !== 'pendiente'));
  const canSchedule = selectedTargetDate && Number.isInteger(values.buyersCount) && values.buyersCount > 0 &&
    Number.isInteger(values.garrafonesCount) && values.garrafonesCount > 0 && values.garrafonesCount <= 10 &&
    Number.isFinite(pricePerGarrafon) && pricePerGarrafon > 0 &&
    preview.buyerId.split(',').filter(Boolean).length === values.buyersCount &&
    preview.loaderIds.length === loadersCount;
  const money = (amount: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN',
  }).format(amount);
  const updateDraft = (updates: Partial<NonNullable<typeof draft>>) => {
    setDraft({ ...values, ...updates });
    setScheduleMessage('');
    setScheduleError('');
  };
  const buyerIds = currentAss.buyerId.split(',').map((id) => id.trim()).filter(Boolean);
  const isBuyDone = currentAss.buyStatus !== 'pendiente';
  const canConfirm = !draft && assignments.some((item) => item.date === selectedTargetDate);

  return (
    <div className="space-y-8 pb-12">
      {/* Mesoamerican Header: Tláloc Banner */}
      <section
        id="dashboard-header-hero"
        className="relative overflow-hidden py-6 md:py-8 text-center"
      >
        {/* Decorative corner glyphs */}
        <div className="absolute top-2 left-3 text-cyan-700/40 text-xs font-mono select-none">
          𐀏 ≋ ☵
        </div>
        <div className="absolute top-2 right-3 text-cyan-700/40 text-xs font-mono select-none">
          ☵ ≋ 𐀏
        </div>

        <div className="relative z-10 flex flex-col items-center w-full mx-auto">
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

        </div>
      </section>

      <section id="dashboard-programar-entrega" className="py-6">
        <CodexBorder variant="gold" className="max-w-md mx-auto mb-4" />
        <h2 className="font-['Cinzel',serif] text-xl font-bold text-cyan-100 mb-4">Programar entrega</h2>
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault();
          const error = scheduleDelivery(selectedTargetDate, values.buyersCount, values.garrafonesCount, pricePerGarrafon);
          setScheduleError(error || '');
          setScheduleMessage(error ? '' : 'Entrega guardada.');
          if (!error) setDraft(null);
        }}>
          <label className="block text-sm text-cyan-200 max-w-xs">
            Fecha de entrega
            <input type="date" required value={selectedTargetDate} onChange={(event) => {
              if (!event.target.value) return;
              setSelectedTargetDate(event.target.value);
              setDraft(null);
              setScheduleError('');
              setScheduleMessage('');
            }} className="mt-1 w-full min-w-0 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-800 text-white" />
          </label>
          <fieldset disabled={isLocked} className="grid grid-cols-2 lg:grid-cols-4 gap-3 disabled:opacity-60">
            <label className="min-w-0 text-sm text-cyan-200">
              <span className="block min-h-10">Número de garrafones</span>
              <input type="number" min="1" max="10" step="1" required value={values.garrafonesCount || ''}
                onChange={(event) => updateDraft({ garrafonesCount: Number(event.target.value) })}
                className="mt-1 w-full min-w-0 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-800 text-white" />
            </label>
            <label className="min-w-0 text-sm text-cyan-200">
              <span className="block min-h-10">Precio por garrafón (MXN)</span>
              <input type="number" min="0.01" step="0.01" required value={values.price}
                onChange={(event) => updateDraft({ price: event.target.value })}
                className="mt-1 w-full min-w-0 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-800 text-white" />
            </label>
            <label className="min-w-0 text-sm text-cyan-200">
              <span className="block min-h-10">Personas que comprarán</span>
              <input type="number" min="1" step="1" required value={values.buyersCount || ''}
                onChange={(event) => updateDraft({ buyersCount: Number(event.target.value) })}
                className="mt-1 w-full min-w-0 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-800 text-white" />
            </label>
            <label className="min-w-0 text-sm text-teal-200">
              <span className="block min-h-10">Personas que cargarán</span>
              <input type="number" readOnly value={loadersCount || 0}
                className="mt-1 w-full min-w-0 px-3 py-2 rounded-lg bg-teal-950/40 border border-teal-800 text-teal-200" />
            </label>
          </fieldset>
          <div className="grid sm:grid-cols-2 gap-3 text-sm break-words">
            <p className="text-cyan-200"><span className="text-slate-400">Compradores: </span>{isLocked ? currentAss.buyerName : preview.buyerName}</p>
            <p className="text-teal-200"><span className="text-slate-400">Cargadores: </span>{(isLocked ? currentAss : preview).loaderNames.join(', ')}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <p className="text-white">Total de compra: <strong>{Number.isFinite(pricePerGarrafon) && pricePerGarrafon > 0 ? money(values.garrafonesCount * pricePerGarrafon) : 'Pendiente'}</strong></p>
            <p className="text-amber-200">Por comprador: <strong>{canSchedule ? money(values.garrafonesCount * pricePerGarrafon / values.buyersCount) : 'Pendiente'}</strong></p>
          </div>
          {isLocked ? <p className="text-xs text-amber-300">Entrega confirmada: las cantidades y el precio no se pueden modificar.</p> :
            <button type="submit" disabled={!canSchedule}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 text-sm font-bold hover:bg-cyan-300 disabled:opacity-40">
              <Save className="w-4 h-4" /> Guardar entrega
            </button>}
          {!isLocked && values.price && !canSchedule && <p className="text-xs text-rose-300">Revisa las cantidades, el precio y la disponibilidad de personas para esta fecha.</p>}
          {scheduleError && <p role="alert" className="text-sm text-rose-300">{scheduleError}</p>}
          {scheduleMessage && <p role="status" className="text-sm text-teal-300">{scheduleMessage}</p>}
        </form>
      </section>

      <section id="dashboard-garrafones-hoy" className="py-4 text-center space-y-3">
        <CodexBorder variant="gold" className="max-w-md mx-auto" />
        <p className="text-xs text-amber-200">{formatDisplayDate(currentAss.date)}</p>
        <h2 className="font-['Cinzel',serif] text-xl font-bold text-cyan-100">
          ENTREGA DE {values.garrafonesCount} {values.garrafonesCount === 1 ? 'GARRAFÓN' : 'GARRAFONES'} ({values.garrafonesCount * 20} LITROS)
        </h2>
        <p className="text-4xl font-bold text-cyan-200">{values.garrafonesCount}</p>
        <div className="flex justify-center">
          <GarrafonDisplay count={values.garrafonesCount} size="lg" showLabel={true} />
        </div>
        {Number.isFinite(pricePerGarrafon) && pricePerGarrafon > 0 && <p className="text-sm text-cyan-200">
          {money(pricePerGarrafon)} por garrafón · Total: {money(values.garrafonesCount * pricePerGarrafon)}
        </p>}
      </section>

        <section id="dashboard-seccion-compra" className="min-w-0 py-5 space-y-4">
          <CodexBorder variant="gold" className="max-w-md mx-auto" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-cyan-100">
              <ShoppingCart className="w-5 h-5 shrink-0" /> Compra de garrafón
            </h2>
            <span className={isBuyDone ? 'text-sm text-teal-300' : 'text-sm text-amber-300'}>{currentAss.buyStatus}</span>
          </div>
          <p className="text-xs text-cyan-300">Rotación equitativa de pago entre {allBuyers.length} personas activas</p>
          <div>
            <p className="text-sm text-slate-300">Personas responsables de pagar</p>
            <p className="text-lg font-semibold text-white break-words">{currentAss.buyerName}</p>
            <p className="text-xs text-cyan-300">{buyerIds.length} participante{buyerIds.length === 1 ? '' : 's'} del rol de pago sin repetir</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-300">Cantidad a comprar</dt><dd className="font-semibold text-cyan-200">{currentAss.garrafonesCount}</dd></div>
            <div><dt className="text-slate-300">Fecha de entrega</dt><dd className="text-cyan-200">{formatDisplayDate(currentAss.date)}</dd></div>
          </dl>
          {currentAss.buyConfirmedAt && <p className="text-xs text-teal-300">Confirmado el {currentAss.buyConfirmedAt}</p>}
          {!isBuyDone ? <button type="button" disabled={!canConfirm}
            onClick={() => confirmPurchase(currentAss.date, 'confirmado')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 text-sm font-bold disabled:opacity-40 hover:bg-cyan-300">
            <CheckCircle2 className="w-4 h-4" /> Confirmar compra
          </button> : <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-teal-300">Compra registrada con éxito</p>
            <button type="button" title="Reabrir compra" aria-label="Reabrir compra"
              onClick={() => confirmPurchase(currentAss.date, 'pendiente')}
              className="p-2 text-cyan-200 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
          </div>}
        </section>

      <section id="dashboard-los-4-cargadores" className="py-5 space-y-4">
        <CodexBorder variant="gold" className="max-w-md mx-auto" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-cyan-100"><Truck className="w-5 h-5" /> Rol de cargado</h2>
        </div>
        <p className="text-xs text-cyan-300">Solo participan personas con rol Cargado o Ambas, sin repetir hasta completar la ronda</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {designatedLoaders.map((loader) => <li key={loader.id} className="py-3 border-b border-cyan-900/50 space-y-1">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-semibold text-white">{loader.name}</span>
              {currentAss.loaderIds.includes(loader.id) && <span className="text-xs text-teal-300">Asignado</span>}
            </div>
            <p className="text-sm text-slate-300">Turnos cargados: <strong className="text-teal-200">{stats[loader.id]?.carriesCount || 0}</strong></p>
            <p className="text-xs text-slate-300">Rol: {loader.role === 'ambas' ? 'Compra y Carga' : 'Cargado'}</p>
          </li>)}
        </ul>
      </section>

    </div>
  );
};
