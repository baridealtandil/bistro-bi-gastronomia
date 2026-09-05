'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Handshake, Plus, UserPlus, Wallet2, FileText, Pencil, Check as CheckIcon, X } from 'lucide-react';

export const SociosView: React.FC = () => {
  const {
    partners,
    addPartner,
    editPartner,
    partnerConsumptions,
    addPartnerConsumption,
    partnerWithdrawals,
    addPartnerWithdrawal
  } = useGastronomy();

  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [editingPartnerName, setEditingPartnerName] = useState('');

  // Form: nuevo socio
  const [newPartnerName, setNewPartnerName] = useState('');

  // Form: nuevo consumo
  const [consPartnerId, setConsPartnerId] = useState(partners[0]?.id || '');
  const [consAmount, setConsAmount] = useState('');
  const [consDescription, setConsDescription] = useState('');
  const [consDate, setConsDate] = useState(new Date().toISOString().split('T')[0]);
  const [consNotes, setConsNotes] = useState('');

  // Form: retiro
  const [wPartnerId, setWPartnerId] = useState(partners[0]?.id || '');
  const [wDate, setWDate] = useState(new Date().toISOString().split('T')[0]);
  const [wIncludeCash, setWIncludeCash] = useState(false);
  const [wCashAmount, setWCashAmount] = useState('');
  const [wCashAccountType, setWCashAccountType] = useState<'CAJA' | 'MERCADO_PAGO' | 'BANCO'>('CAJA');
  const [wBankName, setWBankName] = useState('');
  const [wNotes, setWNotes] = useState('');

  const pendingByPartner = (partnerId: string) =>
    partnerConsumptions
      .filter(pc => pc.partnerId === partnerId && !pc.settled)
      .reduce((acc, pc) => acc + pc.amount, 0);

  const totalPendingAllPartners = partners.reduce((acc, p) => acc + pendingByPartner(p.id), 0);

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;
    addPartner({ name: newPartnerName.trim(), active: true });
    setNewPartnerName('');
    setShowAddPartnerModal(false);
  };

  const handleSaveRename = (id: string) => {
    if (editingPartnerName.trim()) {
      editPartner(id, { name: editingPartnerName.trim() });
    }
    setEditingPartnerId(null);
  };

  const handleAddConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consAmount || parseFloat(consAmount) <= 0) return;
    const partner = partners.find(p => p.id === consPartnerId) || partners[0];
    if (!partner) return;

    addPartnerConsumption({
      partnerId: partner.id,
      partnerName: partner.name,
      date: consDate || new Date().toISOString().split('T')[0],
      description: consDescription.trim() || 'Consumo de comida y bebida',
      amount: parseFloat(consAmount),
      notes: consNotes.trim() || undefined
    });

    setConsAmount('');
    setConsDescription('');
    setConsNotes('');
    setShowConsumptionModal(false);
  };

  const handleAddWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const partner = partners.find(p => p.id === wPartnerId) || partners[0];
    if (!partner) return;

    const cashAmount = wIncludeCash ? parseFloat(wCashAmount || '0') : 0;
    if (wIncludeCash && (!cashAmount || cashAmount <= 0)) return;
    if (wIncludeCash && wCashAccountType === 'BANCO' && !wBankName.trim()) return;

    addPartnerWithdrawal({
      partnerId: partner.id,
      date: wDate || new Date().toISOString().split('T')[0],
      cashAmount,
      cashAccountType: wIncludeCash ? wCashAccountType : undefined,
      bankName: wIncludeCash && wCashAccountType === 'BANCO' ? wBankName.trim() : undefined,
      notes: wNotes.trim() || undefined
    });

    setWCashAmount('');
    setWIncludeCash(false);
    setWBankName('');
    setWNotes('');
    setShowWithdrawalModal(false);
  };

  const sortedConsumptions = [...partnerConsumptions].sort((a, b) => (a.date < b.date ? 1 : -1));
  const sortedWithdrawals = [...partnerWithdrawals].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-400" />
            Consumo y Retiro de Socios
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registra el consumo de comida y bebida que no se cobra en el momento, y liquidalo luego como Retiro de Socios. No afecta Ventas, Caja ni Bancos hasta que se liquida.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setNewPartnerName(''); setShowAddPartnerModal(true); }}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <UserPlus className="w-4 h-4" />
            + Agregar Socio
          </button>
          <button
            onClick={() => {
              if (partners.length > 0) setConsPartnerId(partners[0].id);
              setConsAmount(''); setConsDescription(''); setConsNotes('');
              setConsDate(new Date().toISOString().split('T')[0]);
              setShowConsumptionModal(true);
            }}
            disabled={partners.length === 0}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            + Registrar Consumo
          </button>
          <button
            onClick={() => {
              if (partners.length > 0) setWPartnerId(partners[0].id);
              setWDate(new Date().toISOString().split('T')[0]);
              setWIncludeCash(false); setWCashAmount(''); setWBankName(''); setWNotes('');
              setShowWithdrawalModal(true);
            }}
            disabled={partners.length === 0}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Wallet2 className="w-4 h-4" />
            + Registrar Retiro
          </button>
        </div>
      </div>

      {/* KPI general */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 font-medium">Consumo Pendiente de Liquidar (Todos los Socios)</div>
          <div className="text-2xl font-black text-rose-400 mt-1">${totalPendingAllPartners.toLocaleString('es-AR')}</div>
        </div>
        <div className="text-xs text-slate-400 text-right max-w-[220px]">
          Se descuenta de cada socio recién cuando se registra su Retiro. Hasta entonces no impacta ninguna cuenta.
        </div>
      </div>

      {/* Tabla de Socios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Socios</h3>
          <span className="text-xs text-slate-400">{partners.length} socios cargados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Consumo Pendiente de Liquidar</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {partners.map(p => {
                const pending = pendingByPartner(p.id);
                const isEditing = editingPartnerId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={editingPartnerName}
                            onChange={e => setEditingPartnerName(e.target.value)}
                            className="bg-slate-950 border border-amber-500 rounded-lg px-2 py-1 text-xs text-white outline-none"
                          />
                          <button onClick={() => handleSaveRename(p.id)} className="text-emerald-400 hover:text-emerald-300">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingPartnerId(null)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="p-3 font-bold text-rose-400">${pending.toLocaleString('es-AR')}</td>
                    <td className="p-3">
                      {!isEditing && (
                        <button
                          onClick={() => { setEditingPartnerId(p.id); setEditingPartnerName(p.name); }}
                          className="text-slate-400 hover:text-amber-400 flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Renombrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {partners.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-500 italic text-xs">
                    No hay socios cargados todavía. Usá &quot;+ Agregar Socio&quot; para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Consumos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Historial de Consumos
          </h3>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            {partnerConsumptions.length} consumos
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Socio</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedConsumptions.length > 0 ? (
                sortedConsumptions.map(pc => (
                  <tr key={pc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{pc.date}</td>
                    <td className="p-3 font-bold text-amber-300">{pc.partnerName}</td>
                    <td className="p-3 text-slate-400">{pc.description}</td>
                    <td className="p-3 font-black text-rose-400 text-sm">${pc.amount.toLocaleString('es-AR')}</td>
                    <td className="p-3">
                      {pc.settled ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">LIQUIDADO</span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">PENDIENTE</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic text-xs">
                    No se registraron consumos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Retiros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet2 className="w-4 h-4 text-indigo-400" />
            Historial de Retiros
          </h3>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {partnerWithdrawals.length} retiros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Socio</th>
                <th className="p-3">Consumo Liquidado</th>
                <th className="p-3">Retiro en Efectivo/Banco</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedWithdrawals.length > 0 ? (
                sortedWithdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{w.date}</td>
                    <td className="p-3 font-bold text-amber-300">{w.partnerName}</td>
                    <td className="p-3 text-slate-300">${w.consumptionAmount.toLocaleString('es-AR')}</td>
                    <td className="p-3 text-slate-300">
                      {w.cashAmount > 0
                        ? `$${w.cashAmount.toLocaleString('es-AR')} (${w.cashAccountType === 'BANCO' ? w.bankName || 'Banco' : w.cashAccountType})`
                        : '—'}
                    </td>
                    <td className="p-3 font-black text-indigo-400 text-sm">
                      ${(w.consumptionAmount + w.cashAmount).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic text-xs">
                    No se registraron retiros todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Socio */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Agregar Socio
              </h3>
              <button onClick={() => setShowAddPartnerModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleAddPartner} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">Nombre del Socio</label>
                <input
                  type="text"
                  placeholder="Ej. Gabriel Marca"
                  value={newPartnerName}
                  onChange={e => setNewPartnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none font-bold"
                  required
                />
              </div>
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowAddPartnerModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors">
                  Guardar Socio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Consumo */}
      {showConsumptionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Consumo de Socio</h3>
              <button onClick={() => setShowConsumptionModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleAddConsumption} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Socio</label>
                <select
                  value={consPartnerId}
                  onChange={e => setConsPartnerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto del Consumo ($)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={consAmount}
                    onChange={e => setConsAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-rose-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={consDate}
                    onChange={e => setConsDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Almuerzo familiar, cena con amigos"
                  value={consDescription}
                  onChange={e => setConsDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={consNotes}
                  onChange={e => setConsNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Este consumo no se cobra ni descuenta de Caja/Banco ahora — queda pendiente hasta que se registre como Retiro.
              </p>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowConsumptionModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg">
                  Guardar Consumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Retiro */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Retiro de Socio</h3>
              <button onClick={() => setShowWithdrawalModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleAddWithdrawal} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Socio</label>
                <select
                  value={wPartnerId}
                  onChange={e => setWPartnerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">Consumo pendiente a liquidar</span>
                <span className="text-sm font-black text-rose-400">
                  ${pendingByPartner(wPartnerId).toLocaleString('es-AR')}
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Fecha del Retiro</label>
                <input
                  type="date"
                  value={wDate}
                  onChange={e => setWDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={wIncludeCash}
                  onChange={e => setWIncludeCash(e.target.checked)}
                  className="w-3.5 h-3.5"
                />
                Además retiró efectivo/banco real (aparte de lo consumido)
              </label>

              {wIncludeCash && (
                <div className="space-y-3 border border-slate-800 rounded-xl p-3 bg-slate-950/40">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
                      <input
                        type="number"
                        placeholder="50000"
                        value={wCashAmount}
                        onChange={e => setWCashAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Cuenta de Origen</label>
                      <select
                        value={wCashAccountType}
                        onChange={e => setWCashAccountType(e.target.value as 'CAJA' | 'MERCADO_PAGO' | 'BANCO')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                      >
                        <option value="CAJA">CAJA (Efectivo)</option>
                        <option value="MERCADO_PAGO">MERCADOPAGO</option>
                        <option value="BANCO">BANCO (Transferencia)</option>
                      </select>
                    </div>
                  </div>

                  {wCashAccountType === 'BANCO' && (
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Banco de Origen</label>
                      <input
                        type="text"
                        placeholder="Ej. Banco Galicia"
                        value={wBankName}
                        onChange={e => setWBankName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                        required
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Este monto se descuenta del saldo de ese banco.</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Liquidación de septiembre"
                  value={wNotes}
                  onChange={e => setWNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button type="button" onClick={() => setShowWithdrawalModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs shadow-lg">
                  Confirmar Retiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
