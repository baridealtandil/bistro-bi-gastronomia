'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { DateRangePicker } from './DateRangePicker';
import {
  Building2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Search,
  DollarSign,
  Edit2,
  ShieldCheck,
  CreditCard,
  Building,
  RotateCcw
} from 'lucide-react';
import { BankMovement } from '../types/gastronomy';

export const BankAccountsView: React.FC = () => {
  const {
    bankMovements,
    addBankMovement,
    editBankMovement,
    deleteBankMovement,
    initialBalances,
    role
  } = useGastronomy();

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBm, setEditingBm] = useState<BankMovement | null>(null);

  // Filtros Avanzados
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'INGRESO' | 'EGRESO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form State para Nuevo Movimiento Bancario
  const [bankName, setBankName] = useState('Banco Galicia');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Lista de bancos únicos presentes en Saldos Iniciales y Movimientos
  const allBankNames = Array.from(
    new Set([
      'Banco Galicia',
      'Banco Nación',
      'Banco Macro',
      'BBVA',
      'Santander',
      ...initialBalances.filter(ib => ib.accountType === 'BANCO' && ib.bankName).map(ib => ib.bankName!),
      ...bankMovements.map(bm => bm.bankName)
    ])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !amount) return;

    addBankMovement({
      bankName,
      date: date || new Date().toISOString().split('T')[0],
      type,
      concept,
      amount: parseFloat(amount),
      referenceNumber,
      notes
    });

    setConcept('');
    setAmount('');
    setReferenceNumber('');
    setNotes('');
    setShowModal(false);
  };

  const handleStartEdit = (bm: BankMovement) => {
    setEditingBm(bm);
    setBankName(bm.bankName);
    setDate(bm.date);
    setType(bm.type);
    setConcept(bm.concept);
    setAmount(bm.amount.toString());
    setReferenceNumber(bm.referenceNumber || '');
    setNotes(bm.notes || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBm || !concept || !amount) return;

    editBankMovement(editingBm.id, {
      bankName,
      date,
      type,
      concept,
      amount: parseFloat(amount),
      referenceNumber,
      notes
    });

    setShowEditModal(false);
    setEditingBm(null);
  };

  // Filtrado de movimientos
  const filteredMovements = bankMovements.filter(bm => {
    if (selectedBank !== 'ALL' && bm.bankName !== selectedBank) return false;
    if (filterType !== 'ALL' && bm.type !== filterType) return false;
    if (startDate && bm.date < startDate) return false;
    if (endDate && bm.date > endDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchConcept = bm.concept.toLowerCase().includes(q);
      const matchRef = (bm.referenceNumber || '').toLowerCase().includes(q);
      const matchBank = bm.bankName.toLowerCase().includes(q);
      const matchNotes = (bm.notes || '').toLowerCase().includes(q);
      if (!matchConcept && !matchRef && !matchBank && !matchNotes) return false;
    }
    return true;
  });

  // Cálculo de Saldos por Banco
  const getBankSummary = (targetBankName?: string) => {
    const relevantIB = initialBalances.filter(
      ib => ib.accountType === 'BANCO' && (!targetBankName || ib.bankName === targetBankName)
    );
    const initialSum = relevantIB.reduce((acc, ib) => acc + ib.amount, 0);

    const relevantMovements = bankMovements.filter(
      bm => !targetBankName || bm.bankName === targetBankName
    );
    const totalIngresos = relevantMovements
      .filter(bm => bm.type === 'INGRESO')
      .reduce((acc, bm) => acc + bm.amount, 0);

    const totalEgresos = relevantMovements
      .filter(bm => bm.type === 'EGRESO')
      .reduce((acc, bm) => acc + bm.amount, 0);

    const currentBalance = initialSum + totalIngresos - totalEgresos;

    return { initialSum, totalIngresos, totalEgresos, currentBalance };
  };

  const totalSummary = getBankSummary(selectedBank === 'ALL' ? undefined : selectedBank);

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Módulo de Bancos y Cuentas Corrientes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro y control de depósitos, comisiones, transferencias y movimientos bancarios con saldo dinámico.
          </p>
        </div>
        <button
          onClick={() => {
            setBankName('Banco Galicia');
            setDate(new Date().toISOString().split('T')[0]);
            setType('INGRESO');
            setConcept('');
            setAmount('');
            setReferenceNumber('');
            setNotes('');
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Registrar Movimiento Bancario
        </button>
      </div>

      {/* TARJETAS RESUMEN FINANCIERO BANCARIO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Saldo Inicial Bancos</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-200">${totalSummary.initialSum.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-slate-500">Saldo configurado de apertura</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold font-bold">Total Ingresos / Depósitos</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">+${totalSummary.totalIngresos.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-emerald-400/70">Acreditaciones y cobros bancarios</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Total Egresos / Débitos</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-black text-rose-400">-${totalSummary.totalEgresos.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-rose-400/70">Pagos, comisiones y cheques cobrados</span>
        </div>

        <div className="bg-slate-900 border border-indigo-500/30 bg-indigo-500/5 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-indigo-300 font-semibold">Saldo Disponible Actual</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-indigo-400">${totalSummary.currentBalance.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-indigo-300/70">Saldo líquido real en cuenta bancaria</span>
        </div>
      </div>

      {/* FILTROS CON ALMANAQUE Y BÚSQUEDA DE CONCEPTOS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Filtros de Búsqueda Bancaria</h3>
          </div>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Selector de Banco */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Banco / Cuenta</label>
            <select
              value={selectedBank}
              onChange={e => setSelectedBank(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-semibold"
            >
              <option value="ALL">🏦 Todos los Bancos</option>
              {allBankNames.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Selector de Tipo (Ingreso / Egreso) */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tipo de Movimiento</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-semibold"
            >
              <option value="ALL">Todos los Movimientos</option>
              <option value="INGRESO">🟢 Ingresos / Créditos</option>
              <option value="EGRESO">🔴 Egresos / Débitos</option>
            </select>
          </div>

          {/* Buscador de Concepto / Referencia */}
          <div className="relative">
            <label className="text-xs text-slate-400 block mb-1">Buscar por Concepto / N° Referencia</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ej. Cheque N° 9912, Comisión..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {(selectedBank !== 'ALL' || filterType !== 'ALL' || searchQuery || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSelectedBank('ALL');
                setFilterType('ALL');
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-amber-400 hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* TABLA LISTADO DE MOVIMIENTOS BANCARIOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Historial de Movimientos Bancarios</h3>
          <span className="text-xs text-slate-400 font-semibold">{filteredMovements.length} movimientos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Banco</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Concepto / Descripción (Manual)</th>
                <th className="p-3">N° Comprobante / Ref</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Observaciones</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovements.length > 0 ? (
                filteredMovements.map(bm => (
                  <tr key={bm.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">{bm.bankName}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{bm.date}</td>
                    <td className="p-3 whitespace-nowrap">
                      {bm.type === 'INGRESO' ? (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[10px] w-fit">
                          <ArrowDownLeft className="w-3 h-3" /> INGRESO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold text-[10px] w-fit">
                          <ArrowUpRight className="w-3 h-3" /> EGRESO
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-100">{bm.concept}</td>
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{bm.referenceNumber || '-'}</td>
                    <td className={`p-3 font-black text-sm whitespace-nowrap ${bm.type === 'INGRESO' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {bm.type === 'INGRESO' ? '+' : '-'}${bm.amount.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 text-slate-400 max-w-xs">
                      <div>{bm.notes || '-'}</div>
                      {bm.lastModifiedBy && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit font-semibold mt-1" title={`Editado el ${bm.lastModifiedAt ? new Date(bm.lastModifiedAt).toLocaleString() : ''}`}>
                          <ShieldCheck className="w-2.5 h-2.5 text-amber-400" /> Editado por {bm.lastModifiedBy}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleStartEdit(bm)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Modificar movimiento bancario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 italic text-xs">
                    No se registraron movimientos bancarios con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR MOVIMIENTO BANCARIO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Movimiento Bancario</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Banco / Cuenta</label>
                  <input
                    type="text"
                    placeholder="Banco Galicia"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Movimiento</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  >
                    <option value="INGRESO">🟢 Ingreso / Crédito</option>
                    <option value="EGRESO">🔴 Egreso / Débito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Concepto / Descripción (Escribe Libremente)</label>
                <input
                  type="text"
                  placeholder="Ej. Depósito para cubrir cheque, Comisión banco, Seña..."
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 150000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">N° Comprobante / Ref</label>
                  <input
                    type="text"
                    placeholder="TR-12345"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Observaciones</label>
                  <input
                    type="text"
                    placeholder="Detalles adicionales"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
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
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFICAR MOVIMIENTO BANCARIO */}
      {showEditModal && editingBm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Modificar Movimiento Bancario ({role})
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Banco / Cuenta</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Movimiento</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  >
                    <option value="INGRESO">🟢 Ingreso / Crédito</option>
                    <option value="EGRESO">🔴 Egreso / Débito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Concepto (Escribe Libremente)</label>
                <input
                  type="text"
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">N° Comprobante / Ref</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={e => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Observaciones</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>La modificación se registrará con el usuario <strong>{role}</strong>.</span>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Cambios ({role})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
