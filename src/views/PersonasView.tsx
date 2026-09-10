import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  ShoppingCart,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useTlaloc } from '../context/TlalocContext';
import { ActivityRole, Person } from '../types';
import { CodexBorder } from '../components/CodexPattern';

export const PersonasView: React.FC = () => {
  const { people, addPerson, updatePerson, deletePerson } = useTlaloc();

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<ActivityRole>('compra');

  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<ActivityRole>('compra');

  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPerson(newName.trim(), newRole);
    setNewName('');
    setNewRole('compra');
  };

  const startEditing = (p: Person) => {
    setEditingPersonId(p.id);
    setEditName(p.name);
    setEditRole(p.role);
  };

  const saveEditing = (id: string) => {
    if (!editName.trim()) return;
    updatePerson(id, { name: editName.trim(), role: editRole });
    setEditingPersonId(null);
  };

  const cancelEditing = () => {
    setEditingPersonId(null);
  };

  const confirmDelete = () => {
    if (personToDelete) {
      deletePerson(personToDelete.id);
      setPersonToDelete(null);
    }
  };

  const compraCount = people.filter(
    (p) => p.role === 'compra' || p.role === 'ambas'
  ).length;
  const cargadoCount = people.filter(
    (p) => p.role === 'cargado' || p.role === 'ambas'
  ).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#092238] to-[#061726] border border-cyan-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Cinzel',serif] text-2xl font-bold text-cyan-100">
              Administración de Compañeros
            </h2>
            <p className="text-xs text-cyan-400/80">
              Gestiona el padrón del equipo, roles y participación en la rotación
            </p>
          </div>
        </div>

        {/* Roles count badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs">
            <span className="text-slate-400 block text-[10px]">Asignables a Compra</span>
            <span className="font-bold text-cyan-300 text-base">
              {compraCount} personas
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-xs">
            <span className="text-slate-400 block text-[10px]">Asignables a Cargado</span>
            <span className="font-bold text-teal-300 text-base">
              {cargadoCount} personas
            </span>
          </div>
        </div>
      </div>

      {/* Add Person Card */}
      <div className="p-6 rounded-2xl bg-[#081e30] border border-cyan-800/40 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-5 h-5 text-cyan-400" />
          <h3 className="font-['Cinzel',serif] text-lg font-bold text-cyan-100">
            Registrar Nuevo Compañero
          </h3>
        </div>

        <form
          onSubmit={handleAddPerson}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Rodrigo Ramos"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-900 text-white focus:border-cyan-400 focus:outline-none text-sm placeholder-slate-500"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipo de Actividad
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as ActivityRole)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-900 text-white focus:border-cyan-400 focus:outline-none text-sm"
            >
              <option value="compra">Solo Compra</option>
              <option value="cargado">Solo Cargado</option>
              <option value="ambas">Ambas Actividades (Compra y Cargado)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 cursor-pointer shadow-md text-sm flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </form>
      </div>

      {/* People Table / List */}
      <div className="rounded-2xl bg-[#061726] border border-cyan-900/60 shadow-xl overflow-hidden">
        <div className="p-4 bg-[#082238] border-b border-cyan-900/60 flex items-center justify-between">
          <span className="font-['Cinzel',serif] text-sm font-bold text-cyan-200">
            Lista de Compañeros ({people.length})
          </span>
          <span className="text-xs text-slate-400">
            Configuración y roles individuales
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {people.map((person, index) => {
            const isEditing = editingPersonId === person.id;

            return (
              <div
                key={person.id}
                className="p-4 hover:bg-cyan-950/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Person details or editing form */}
                {isEditing ? (
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400 text-white text-sm focus:outline-none"
                    />
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as ActivityRole)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400 text-white text-sm focus:outline-none"
                    >
                      <option value="compra">Compra</option>
                      <option value="cargado">Cargado</option>
                      <option value="ambas">Ambas</option>
                    </select>

                    <button
                      onClick={() => saveEditing(person.id)}
                      className="p-2 rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-900/60 text-cyan-200 border border-cyan-500/30 flex items-center justify-center font-bold text-sm">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {person.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            person.role === 'ambas'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : person.role === 'cargado'
                              ? 'bg-teal-950/60 text-teal-300 border-teal-500/40'
                              : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                          }`}
                        >
                          {person.role === 'ambas'
                            ? 'Compra + Cargado'
                            : person.role === 'cargado'
                            ? 'Cargado'
                            : 'Compra'}
                        </span>

                        <span
                          className={`text-[10px] font-medium ${
                            person.status === 'activo'
                              ? 'text-teal-400'
                              : 'text-rose-400'
                          }`}
                        >
                          ● {person.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => startEditing(person)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => setPersonToDelete(person)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-900/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {personToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a233a] to-[#061524] border-2 border-rose-500/50 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-['Cinzel',serif] text-white">
              ¿Eliminar a {personToDelete.name}?
            </h3>

            <p className="text-xs text-slate-300 my-3">
              Esta acción eliminará a la persona de la rotación automática y de los listados de compra y cargado.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPersonToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/50 cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
