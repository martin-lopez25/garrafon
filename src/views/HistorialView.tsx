import React, { useState, useMemo } from 'react';
import {
  History,
  Filter,
  BarChart3,
  Search,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  Droplets,
  Calendar,
  Download,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { CodexBorder } from '../components/CodexPattern';
import { formatDisplayDate, formatShortDate } from '../utils/dateUtils';

export const HistorialView: React.FC = () => {
  const { assignments, people, stats } = useTlaloc();

  // Filters
  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');
  const [filterActivity, setFilterActivity] = useState<'all' | 'compra' | 'cargado'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completado' | 'pendiente'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorted assignments (newest first)
  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => b.date.localeCompare(a.date));
  }, [assignments]);

  // Filtered
  const filteredAssignments = useMemo(() => {
    return sortedAssignments.filter((item) => {
      // Person filter
      if (selectedPersonId !== 'all') {
        const matchesBuyer = item.buyerId
          .split(',')
          .map((id) => id.trim())
          .includes(selectedPersonId);
        const matchesLoader = item.loaderIds.includes(selectedPersonId);
        if (!matchesBuyer && !matchesLoader) return false;
      }

      // Status filter
      if (filterStatus === 'completado') {
        const isCompleted =
          item.buyStatus === 'confirmado' ||
          item.buyStatus === 'comprado' ||
          item.loadStatus === 'completado';
        if (!isCompleted) return false;
      } else if (filterStatus === 'pendiente') {
        const isPending =
          item.buyStatus === 'pendiente' || item.loadStatus === 'pendiente';
        if (!isPending) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = item.date.includes(q);
        const matchesBuyerName = item.buyerName.toLowerCase().includes(q);
        const matchesLoaders = item.loaderNames.some((n) =>
          n.toLowerCase().includes(q)
        );
        if (!matchesDate && !matchesBuyerName && !matchesLoaders) return false;
      }

      return true;
    });
  }, [sortedAssignments, selectedPersonId, filterStatus, searchQuery]);

  // Calculate high-level metrics
  const totalGarrafones = useMemo(() => {
    return assignments.reduce((acc, curr) => acc + curr.garrafonesCount, 0);
  }, [assignments]);

  const totalConfirmedPurchases = useMemo(() => {
    return assignments.filter(
      (a) => a.buyStatus === 'confirmado' || a.buyStatus === 'comprado'
    ).length;
  }, [assignments]);

  const totalConfirmedLoads = useMemo(() => {
    return assignments.filter((a) => a.loadStatus === 'completado').length;
  }, [assignments]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100">
              Historial y Auditoría de Equidad
            </h2>
            <p className="text-xs text-cyan-400/80">
              Registro histórico transparente de asignaciones y confirmaciones
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#081e30] border border-cyan-900/60 shadow-md">
          <span className="text-slate-400 text-xs font-semibold block mb-1">
            Garrafones Suministrados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-300 font-['Cinzel',serif]">
              {totalGarrafones}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({totalGarrafones * 20} Litros)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#081e30] border border-cyan-900/60 shadow-md">
          <span className="text-slate-400 text-xs font-semibold block mb-1">
            Compras Completadas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-300 font-['Cinzel',serif]">
              {totalConfirmedPurchases}
            </span>
            <span className="text-xs text-teal-400 font-mono">turnos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#081e30] border border-cyan-900/60 shadow-md">
          <span className="text-slate-400 text-xs font-semibold block mb-1">
            Cargas de Agua Completadas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-['Cinzel',serif]">
              {totalConfirmedLoads}
            </span>
            <span className="text-xs text-amber-400 font-mono">turnos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#081e30] border border-cyan-900/60 shadow-md">
          <span className="text-slate-400 text-xs font-semibold block mb-1">
            Compañeros Registrados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-['Cinzel',serif]">
              {people.length}
            </span>
            <span className="text-xs text-cyan-400 font-mono">participantes</span>
          </div>
        </div>
      </div>

      {/* Fairness Distribution Charts Table */}
      <div className="rounded-2xl bg-[#061726] border border-cyan-900/60 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100">
              Distribución Equitativa por Compañero
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Verificación de reparto justo
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => {
            const pStat = stats[person.id] || {
              purchasesCount: 0,
              carriesCount: 0,
              totalCount: 0,
            };

            return (
              <div
                key={person.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-white text-sm">
                    {person.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    {person.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Purchase bar */}
                  {(person.role === 'compra' || person.role === 'ambas') && (
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Compras:</span>
                        <span className="font-bold text-cyan-300">
                          {pStat.purchasesCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              pStat.purchasesCount * 25
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cargado bar */}
                  {(person.role === 'cargado' || person.role === 'ambas') && (
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Cargadas:</span>
                        <span className="font-bold text-teal-300">
                          {pStat.carriesCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-teal-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              pStat.carriesCount * 25
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Total asignaciones:</span>
                  <span className="font-bold text-white">
                    {pStat.totalCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#081e30] border border-cyan-900/60 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por fecha o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-cyan-900 text-xs text-white focus:border-cyan-400 focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Filter by Person */}
        <select
          value={selectedPersonId}
          onChange={(e) => setSelectedPersonId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-cyan-900 text-xs text-white focus:border-cyan-400 focus:outline-none"
        >
          <option value="all">Todos los compañeros</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Filter by Status */}
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as 'all' | 'completado' | 'pendiente')
          }
          className="px-3 py-2 rounded-xl bg-slate-900 border border-cyan-900 text-xs text-white focus:border-cyan-400 focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="completado">Solo Completados</option>
          <option value="pendiente">Solo Pendientes</option>
        </select>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-[#061726] border border-cyan-900/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082238] border-b border-cyan-900/60 text-cyan-300 font-semibold uppercase tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Garrafones</th>
                <th className="px-4 py-3.5">Compra</th>
                <th className="px-4 py-3.5">Cargado</th>
                <th className="px-4 py-3.5">Estado Compra</th>
                <th className="px-4 py-3.5">Estado Cargado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((ass) => {
                  const isBuyDone =
                    ass.buyStatus === 'confirmado' ||
                    ass.buyStatus === 'comprado';
                  const isLoadDone = ass.loadStatus === 'completado';

                  return (
                    <tr
                      key={ass.date}
                      className="hover:bg-cyan-950/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-slate-200 whitespace-nowrap">
                        <span className="font-bold block text-sm">
                          {ass.date}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatShortDate(ass.date)}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                            ass.garrafonesCount === 3
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          <Droplets className="w-3 h-3" />
                          {ass.garrafonesCount} {ass.garrafonesCount === 1 ? 'Garrafón' : 'Garrafones'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{ass.buyerName}</span>
                        </div>
                        {ass.buyConfirmedAt && (
                          <span className="text-[10px] text-teal-400/80 block mt-0.5">
                            {ass.buyConfirmedAt}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-teal-400" />
                          <span>{ass.loaderNames.join(', ')}</span>
                        </div>
                        {ass.loadConfirmedAt && (
                          <span className="text-[10px] text-teal-400/80 block mt-0.5">
                            {ass.loadConfirmedAt}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            isBuyDone
                              ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isBuyDone ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {ass.buyStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            isLoadDone
                              ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isLoadDone ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {ass.loadStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
