'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import {
  Wallet,
  Building2,
  QrCode,
  Plus,
  Edit2,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { InitialBalance } from '../types/gastronomy';

export const InitialBalancesView: React.FC = () => {
  const { initialBalances, addInitialBalance, editInitialBalance, role } = useGastronomy();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIb, setEditingIb] = useState<InitialBalance | null>(null);

  // State para nuevo saldo inicial
  const [accountType, setAccountType] = useState<InitialBalance['accountType']>('CAJA');
  const [bankName, setBankName] = useState('Banco Galicia');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Totales por tipo de cuenta
  const totalCaja = initialBalances
    .filter(ib => ib.accountType === 'CAJA')
    .reduce((acc, ib) => acc + ib.amount, 0);

  const totalMercadoPago = initialBalances
    .filter(ib => ib.accountType === 'MERCADO_PAGO')
    .reduce((acc, ib) => acc + ib.amount, 0);

  const totalBancos = initialBalances
    .filter(ib => ib.accountType === 'BANCO')
    .reduce((acc, ib) => acc + ib.amount, 0);

  const totalGeneralInicial = totalCaja + totalMercadoPago + totalBancos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    addInitialBalance({
      accountType,
      bankName: accountType === 'BANCO' ? bankName : undefined,
      date: date || new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      notes
    });

    setAmount('');
    setNotes('');
    setShowModal(false);
  };

  const handleStartEdit = (ib: InitialBalance) => {
    setEditingIb(ib);
    setAccountType(ib.accountType);
    setBankName(ib.bankName || 'Banco Galicia');
    setDate(ib.date);
    setAmount(ib.amount.toString());
    setNotes(ib.notes || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIb || !amount) return;

    editInitialBalance(editingIb.id, {
      accountType,
      bankName: accountType === 'BANCO' ? bankName : undefined,
      date,
      amount: parseFloat(amount),
      notes
    });

    setShowEditModal(false);
    setEditingIb(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            <Wallet className="w-6 h-6 text-amber-400" />
            Configuración de Saldos Iniciales
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registra los fondos de apertura de caja en efectivo, saldo en MercadoPago y saldos bancarios iniciales.
          </p>
        </div>
        <button
          onClick={() => {
            setAccountType('CAJA');
            setBankName('Banco Galicia');
            setDate(new Date().toISOString().split('T')[0]);
            setAmount('');
            setNotes('');
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Cargar Saldo Inicial
        </button>
      </div>

      {/* TARJETAS RESUMEN DE SALDOS INICIALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Caja Chica / Efectivo</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">${totalCaja.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-slate-500">Saldo de apertura en efectivo</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">MercadoPago Inicial</span>
            <QrCode className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-black text-sky-400">${totalMercadoPago.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-slate-500">Saldo acumulado en cuenta digital</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Cuentas Bancarias</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-indigo-400">${totalBancos.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-slate-500">Total saldos iniciales en bancos</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 bg-amber-500/5 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-semibold">Total Fondos Iniciales</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400">${totalGeneralInicial.toLocaleString('es-AR')}</p>
          <span className="text-[10px] text-amber-300/70">Capital inicial acumulado</span>
        </div>
      </div>

      {/* LISTADO DE SALDOS INICIALES REGISTRADOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Detalle de Saldos Iniciales Cargados</h3>
          <span className="text-xs text-slate-400 font-semibold">{initialBalances.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Cuenta / Origen</th>
                <th className="p-3">Banco / Entidad</th>
                <th className="p-3">Fecha de Apertura</th>
                <th className="p-3">Monto Inicial</th>
                <th className="p-3">Notas / Detalle</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {initialBalances.length > 0 ? (
                initialBalances.map(ib => (
                  <tr key={ib.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      {ib.accountType === 'CAJA' && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[10px]">
                          💵 CAJA CHICA / MAYOR
                        </span>
                      )}
                      {ib.accountType === 'MERCADO_PAGO' && (
                        <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-bold text-[10px]">
                          💳 MERCADOPAGO
                        </span>
                      )}
                      {ib.accountType === 'BANCO' && (
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold text-[10px]">
                          🏦 BANCO
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {ib.accountType === 'BANCO' ? (ib.bankName || 'Banco') : '-'}
                    </td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{ib.date}</td>
                    <td className="p-3 font-black text-amber-400 text-sm">${ib.amount.toLocaleString('es-AR')}</td>
                    <td className="p-3 text-slate-400 max-w-xs">
                      <div>{ib.notes || '-'}</div>
                      {ib.lastModifiedBy && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit font-semibold mt-1" title={`Editado el ${ib.lastModifiedAt ? new Date(ib.lastModifiedAt).toLocaleString() : ''}`}>
                          <ShieldCheck className="w-2.5 h-2.5 text-amber-400" /> Editado por {ib.lastModifiedBy}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleStartEdit(ib)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Editar saldo inicial"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic text-xs">
                    No se han registrado saldos iniciales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR SALDO INICIAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Saldo Inicial</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de Cuenta</label>
                <select
                  value={accountType}
                  onChange={e => setAccountType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="CAJA">Efectivo / Caja Chica / Mayor</option>
                  <option value="MERCADO_PAGO">MercadoPago</option>
                  <option value="BANCO">Cuenta Bancaria</option>
                </select>
              </div>

              {accountType === 'BANCO' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nombre del Banco</label>
                  <input
                    type="text"
                    placeholder="Ej. Banco Galicia, Banco Nación, BBVA"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha de Apertura</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto Inicial ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 500000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Arqueo inicial al comenzar gestión"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
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
                  Guardar Saldo Inicial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFICAR SALDO INICIAL */}
      {showEditModal && editingIb && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Modificar Saldo Inicial ({role})
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de Cuenta</label>
                <select
                  value={accountType}
                  onChange={e => setAccountType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="CAJA">Efectivo / Caja Chica / Mayor</option>
                  <option value="MERCADO_PAGO">MercadoPago</option>
                  <option value="BANCO">Cuenta Bancaria</option>
                </select>
              </div>

              {accountType === 'BANCO' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nombre del Banco</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
              )}

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
                  <label className="text-xs text-slate-400 block mb-1">Monto Inicial ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>La modificación se guardará bajo el usuario <strong>{role}</strong>.</span>
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
