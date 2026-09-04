'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Plus, Search, CheckCircle2, DollarSign, X } from 'lucide-react';
import { SearchableCombobox } from './SearchableCombobox';

const COMMON_SERVICE_PROVIDERS = [
  'Usina Popular de Electricidad',
  'Camuzzi Gas Pampeana',
  'Telecom / Personal Internet',
  'AySA / Obras Sanitarias',
  'Metrogas',
  'Edenor',
  'Edesur',
  'Alquiler Salón Comercial',
  'Fudo POS System',
  'Tasas Municipalidad'
];

const EXPENSE_CATEGORIES = [
  'LUZ',
  'GAS',
  'AGUA',
  'ALQUILER',
  'INTERNET',
  'SOFTWARE',
  'MANTENIMIENTO',
  'MARKETING',
  'IMPREVISTOS',
  'SEGUROS',
  'TASAS / MUNICIPAL',
  'HONORARIOS'
];

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  // Buscador y Filtros de la Tabla
  const [searchProvider, setSearchProvider] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Form State Modal Registrar Pago
  const [providerName, setProviderName] = useState('');
  const [category, setCategory] = useState('LUZ');
  const [type, setType] = useState<'SERVICIO' | 'FIJO' | 'VARIABLE'>('SERVICIO');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !amount || parseFloat(amount) <= 0) return;

    addExpense({
      date: paymentDate || new Date().toISOString().split('T')[0],
      category,
      type,
      description: providerName,
      amount: parseFloat(amount),
      dueDate: paymentDate || new Date().toISOString().split('T')[0],
      status: 'PAGADO'
    });

    setProviderName('');
    setAmount('');
    setShowModal(false);
  };

  // Filtrado de lista
  const filteredExpenses = expenses.filter(e => {
    const matchesProvider = searchProvider.trim() === '' ||
      e.description.toLowerCase().includes(searchProvider.toLowerCase()) ||
      e.category.toLowerCase().includes(searchProvider.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;

    const matchesDate = !filterDate || e.date === filterDate || e.dueDate === filterDate;

    return matchesProvider && matchesCategory && matchesDate;
  });

  const totalFilteredAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Registro de Pago de Servicios Públicos y Gastos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Módulo de registro directo al momento de realizar el pago de servicios (Usina, Camuzzi, Telecom, etc.) y gastos fijos.
          </p>
        </div>
        <button
          onClick={() => {
            setProviderName('');
            setAmount('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Registrar Pago de Servicio
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS POR PROVEEDOR / FECHA / CATEGORÍA */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Buscar por Proveedor / Servicio */}
          <div className="relative">
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Buscar por Nombre del Proveedor / Servicio</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej: Usina, Camuzzi, Telecom, Alquiler..."
                value={searchProvider}
                onChange={e => setSearchProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
              />
            </div>
          </div>

          {/* Filtrar por Fecha de Pago */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Filtrar por Fecha de Pago</label>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Filtrar por Categoría */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Categoría / Rubro</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-amber-500 outline-none font-medium"
            >
              <option value="ALL">Todas las Categorías</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchProvider || filterDate || filterCategory !== 'ALL') && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-[11px] text-amber-400 font-semibold">Filtros activos</span>
            <button
              onClick={() => {
                setSearchProvider('');
                setFilterDate('');
                setFilterCategory('ALL');
              }}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" /> Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* LISTADO / TABLA DE PAGOS REGISTRADOS (REEMPLAZA LAS TARJETAS) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Listado de Pagos de Servicios y Gastos Registrados
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filteredExpenses.length} pagos de servicios en el periodo.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Total Pagado: ${totalFilteredAmount.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha de Pago</th>
                <th className="p-3">Proveedor / Servicio</th>
                <th className="p-3">Categoría / Rubro</th>
                <th className="p-3">Tipo de Gasto</th>
                <th className="p-3">Monto Pagado</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{e.date || e.dueDate}</td>
                    <td className="p-3 font-bold text-amber-300 text-sm">{e.description}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-medium">
                      {e.type === 'SERVICIO' ? 'Servicio Público' : e.type === 'FIJO' ? 'Gasto Fijo' : 'Gasto Variable'}
                    </td>
                    <td className="p-3 font-black text-emerald-400 text-sm">
                      ${e.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PAGADO
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic text-xs">
                    No se encontraron pagos de servicios o gastos registrados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR PAGO DE SERVICIO / GASTO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Pago de Servicio o Gasto</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <SearchableCombobox
                  label="Nombre del Proveedor / Empresa de Servicio"
                  value={providerName}
                  onChange={setProviderName}
                  options={COMMON_SERVICE_PROVIDERS}
                  placeholder="Ej. Usina, Camuzzi, Telecom..."
                  allowCustom={true}
                  required={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SearchableCombobox
                    label="Categoría"
                    value={category}
                    onChange={setCategory}
                    options={EXPENSE_CATEGORIES}
                    placeholder="Buscar categoría..."
                    allowCustom={true}
                    required={true}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Tipo de Gasto</label>
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
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Monto Pagado ($)</label>
                  <input
                    type="number"
                    placeholder="2300000"
                    value={amount}
                    onChange={ev => setAmount(ev.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-emerald-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Fecha de Pago</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={ev => setPaymentDate(ev.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-semibold text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
