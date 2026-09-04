'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Plus, Receipt, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('LUZ');
  const [type, setType] = useState<any>('SERVICIO');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      category,
      type,
      description,
      amount: parseFloat(amount),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'PENDIENTE'
    });

    setDescription('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Gastos Operativos y Servicios Públicos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control de costos fijos (alquiler, abonos) y servicios con alerta de vencimientos.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Cargar Gasto / Servicio
        </button>
      </div>

      {/* Tarjetas de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expenses.map(e => (
          <div key={e.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded border border-slate-700">
                  {e.category}
                </span>
                <span className="text-[10px] text-slate-400">({e.type})</span>
              </div>
              <h3 className="font-bold text-white text-sm">{e.description}</h3>
              {e.dueDate && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Vence: {e.dueDate}
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="text-base font-black text-white">${e.amount.toLocaleString('es-AR')}</div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                e.status === 'PAGADO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {e.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nuevo Gasto */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Gasto o Servicio</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Factura de Edenor / Alquiler Septiembre"
                  value={description}
                  onChange={ev => setDescription(ev.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={ev => setCategory(ev.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="LUZ">Luz</option>
                    <option value="GAS">Gas</option>
                    <option value="AGUA">Agua</option>
                    <option value="ALQUILER">Alquiler</option>
                    <option value="INTERNET">Internet</option>
                    <option value="SOFTWARE">Software / Pos</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Gasto</label>
                  <select
                    value={type}
                    onChange={ev => setType(ev.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="SERVICIO">Servicio Público</option>
                    <option value="FIJO">Gasto Fijo</option>
                    <option value="VARIABLE">Gasto Variable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
                  <input
                    type="number"
                    placeholder="85000"
                    value={amount}
                    onChange={ev => setAmount(ev.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={ev => setDueDate(ev.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
