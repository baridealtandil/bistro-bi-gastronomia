'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Plus, Search, CheckCircle2, DollarSign, X, CreditCard } from 'lucide-react';
import { SearchableCombobox } from './SearchableCombobox';
import { DateRangePicker } from './DateRangePicker';

const COMMON_EXPENSE_PROVIDERS = [
  'Supermercado (Coto / Carrefour / Jumbo)',
  'Panadería & Repostería',
  'Kiosco & Almacén de Barrio',
  'Caja Chica / Compras Rápidas',
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

const DEFAULT_EXPENSE_CATEGORIES = [
  'SUPERMERCADO',
  'PANADERIA',
  'KIOSCO',
  'CAJA CHICA',
  'VARIOS & CAJA',
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

const DEFAULT_EXPENSE_TYPES = [
  'Gasto de Caja / Varios (Supermercado, Kiosco, etc.)',
  'Servicio Público',
  'Gasto Fijo',
  'Gasto Variable',
  'Caja Chica'
];

const DEFAULT_PAYMENT_METHODS = [
  'EFECTIVO (Caja Chica)',
  'TRANSFERENCIA BANCARIA',
  'MERCADO PAGO / DIGITAL',
  'TARJETA DE DÉBITO',
  'TARJETA DE CRÉDITO',
  'CHEQUE PROPIO',
  'CHEQUE DE TERCERO',
  'DÉBITO AUTOMÁTICO'
];

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  // Buscador y Filtros de la Tabla
  const [searchProvider, setSearchProvider] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State Modal Registrar Pago
  const [providerName, setProviderName] = useState('');
  const [category, setCategory] = useState('SUPERMERCADO');
  const [type, setType] = useState('Gasto de Caja / Varios (Supermercado, Kiosco, etc.)');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO (Caja Chica)');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Lista dinámica de categorías
  const allCategories = Array.from(new Set([
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...expenses.map(e => e.category)
  ]));

  // Lista dinámica de métodos de pago
  const allPaymentMethods = Array.from(new Set([
    ...DEFAULT_PAYMENT_METHODS,
    ...expenses.map(e => e.paymentMethod).filter(Boolean) as string[]
  ]));

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !amount || parseFloat(amount) <= 0) return;

    addExpense({
      date: paymentDate || new Date().toISOString().split('T')[0],
      category: category.trim().toUpperCase() || 'VARIOS & CAJA',
      type: type.trim() || 'Gasto de Caja / Varios',
      description: providerName.trim(),
      amount: parseFloat(amount),
      paymentMethod: paymentMethod.trim() || 'EFECTIVO (Caja Chica)',
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
      e.category.toLowerCase().includes(searchProvider.toLowerCase()) ||
      (e.type && e.type.toLowerCase().includes(searchProvider.toLowerCase())) ||
      (e.paymentMethod && e.paymentMethod.toLowerCase().includes(searchProvider.toLowerCase()));

    const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;

    const matchesMethod = filterPaymentMethod === 'ALL' || e.paymentMethod === filterPaymentMethod;

    const expDate = e.date || e.dueDate || '';
    const matchesStartDate = !startDate || expDate >= startDate;
    const matchesEndDate = !endDate || expDate <= endDate;

    return matchesProvider && matchesCategory && matchesMethod && matchesStartDate && matchesEndDate;
  });

  const totalFilteredAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Registro de Gastos de Caja, Servicios y Varios
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Carga directa de pagos con especificación de origen/medio de pago (Efectivo, Transferencia, Cheque, Tarjeta, etc.).
          </p>
        </div>
        <button
          onClick={() => {
            setProviderName('');
            setCategory('SUPERMERCADO');
            setType('Gasto de Caja / Varios (Supermercado, Kiosco, etc.)');
            setPaymentMethod('EFECTIVO (Caja Chica)');
            setAmount('');
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Registrar Gasto / Pago de Caja
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS POR PROVEEDOR / ALMANAQUE / CATEGORÍA / MEDIO DE PAGO */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Buscar por Comercio / Detalle */}
          <div className="relative">
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Buscar por Comercio / Proveedor / Medio</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej: Coto, Usina, Transferencia, Efectivo..."
                value={searchProvider}
                onChange={e => setSearchProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-500 outline-none font-bold"
              />
            </div>
          </div>

          {/* Filtrar por Almanaque Rango de Fechas (Desde - Hasta) */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">📅 Seleccionar Período (Desde - Hasta)</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>

          {/* Filtrar por Categoría */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Categoría / Rubro</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-medium"
            >
              <option value="ALL">Todas las Categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtrar por Medio de Pago */}
          <div>
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Filtrar por Origen / Medio de Pago</label>
            <select
              value={filterPaymentMethod}
              onChange={e => setFilterPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-medium text-emerald-400"
            >
              <option value="ALL">Todos los Medios de Pago</option>
              {allPaymentMethods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchProvider || startDate || endDate || filterCategory !== 'ALL' || filterPaymentMethod !== 'ALL') && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-[11px] text-amber-400 font-semibold">Filtros activos</span>
            <button
              onClick={() => {
                setSearchProvider('');
                setStartDate('');
                setEndDate('');
                setFilterCategory('ALL');
                setFilterPaymentMethod('ALL');
              }}
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" /> Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* LISTADO / TABLA DE GASTOS Y SERVICIOS REGISTRADOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Listado de Gastos de Caja, Servicios y Origen de Pago
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filteredExpenses.length} comprobantes / pagos en el periodo seleccionado.
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
                <th className="p-3">Proveedor / Comercio / Concepto</th>
                <th className="p-3">Origen / Medio de Pago</th>
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
                    <td className="p-3 font-semibold">
                      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                        <CreditCard className="w-3 h-3 text-emerald-400" />
                        {e.paymentMethod || 'EFECTIVO (Caja Chica)'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-medium">
                      {e.type}
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
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic text-xs">
                    No se encontraron gastos o servicios registrados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR GASTO DE CAJA / SERVICIO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Gasto de Caja / Servicio</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              {/* Proveedor / Establecimiento */}
              <div>
                <SearchableCombobox
                  label="Proveedor / Comercio / Establecimiento"
                  value={providerName}
                  onChange={setProviderName}
                  options={COMMON_EXPENSE_PROVIDERS}
                  placeholder="Escribir o buscar (ej. Coto, Panadería, Kiosco)..."
                  allowCustom={true}
                  required={true}
                />
              </div>

              {/* Origen / Medio de Pago */}
              <div>
                <SearchableCombobox
                  label="Origen / Medio de Pago Utilizado"
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={DEFAULT_PAYMENT_METHODS}
                  placeholder="Elegir o escribir medio de pago (Efectivo, Transferencia, Cheque)..."
                  allowCustom={true}
                  required={true}
                  icon={<CreditCard className="w-3.5 h-3.5 text-emerald-400" />}
                />
              </div>

              {/* Categoría y Tipo de Gasto */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SearchableCombobox
                    label="Categoría / Rubro"
                    value={category}
                    onChange={setCategory}
                    options={allCategories}
                    placeholder="Escribir categoría..."
                    allowCustom={true}
                    required={true}
                  />
                </div>
                <div>
                  <SearchableCombobox
                    label="Tipo de Gasto"
                    value={type}
                    onChange={setType}
                    options={DEFAULT_EXPENSE_TYPES}
                    placeholder="Escribir tipo..."
                    allowCustom={true}
                    required={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Monto Pagado ($)</label>
                  <input
                    type="number"
                    placeholder="15000"
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
