'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { CheckSquare, Plus, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Check as CheckType } from '../types/gastronomy';

export const ChecksView: React.FC = () => {
  const { checks, addCheck } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  const [type, setType] = useState<CheckType['type']>('PROPIO');
  const [number, setNumber] = useState('');
  const [bank, setBank] = useState('Banco Galicia');
  const [issuerOrRecipient, setIssuerOrRecipient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !amount) return;

    addCheck({
      type,
      number,
      bank,
      issuerOrRecipient,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      status: 'PENDIENTE',
      notes
    });

    setNumber('');
    setAmount('');
    setIssuerOrRecipient('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Chequera y Tesorería (Propios y Terceros)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de diferidos, vencimientos bancarios y endosos a proveedores.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Registrar Cheque
        </button>
      </div>

      {/* Grilla de Cheques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map(c => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {c.type === 'PROPIO' ? (
                  <span className="flex items-center gap-1 text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                    <ArrowUpRight className="w-3 h-3" /> PROPIO EMITIDO
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    <ArrowDownLeft className="w-3 h-3" /> TERCERO RECIBIDO
                  </span>
                )}
                <span className="text-xs font-semibold text-white">{c.bank}</span>
              </div>
              <span className="text-xs font-bold text-amber-400">N° {c.number}</span>
            </div>

            <div className="flex items-center justify-between text-xs border-y border-slate-800/80 py-2">
              <div>
                <div className="text-[10px] text-slate-400">{c.type === 'PROPIO' ? 'Destinatario:' : 'Origen:'}</div>
                <div className="font-semibold text-slate-200">{c.issuerOrRecipient}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Fecha Vencimiento:</div>
                <div className="font-bold text-slate-200">{c.dueDate}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-lg font-black text-white">${c.amount.toLocaleString('es-AR')}</div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded">
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Carga Cheque */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Cheque</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddCheck} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Cheque</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="PROPIO">Propio (Emitido)</option>
                    <option value="TERCERO">De Tercero (Recibido)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">N° de Cheque</label>
                  <input
                    type="text"
                    placeholder="CHK-001234"
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Banco</label>
                  <input
                    type="text"
                    placeholder="Banco Galicia / BBVA"
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Proveedor / Cliente</label>
                  <input
                    type="text"
                    placeholder="Distribuidora de Carnes"
                    value={issuerOrRecipient}
                    onChange={e => setIssuerOrRecipient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha Cobro / Vencimiento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
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
                  Guardar Cheque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
