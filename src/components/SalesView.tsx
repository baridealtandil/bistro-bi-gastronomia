'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Plus, Download, Upload, Filter, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Sale } from '../types/gastronomy';

export const SalesView: React.FC = () => {
  const { sales, addSale } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState<Sale['channel']>('SALON');
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('EFECTIVO');
  const [grossAmount, setGrossAmount] = useState<string>('');
  const [commissionAmount, setCommissionAmount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grossAmount || parseFloat(grossAmount) <= 0) return;

    addSale({
      date,
      channel,
      paymentMethod,
      grossAmount: parseFloat(grossAmount),
      commissionAmount: parseFloat(commissionAmount || '0'),
      notes
    });

    setGrossAmount('');
    setCommissionAmount('0');
    setNotes('');
    setShowModal(false);
  };

  const handleSimulateCsvImport = () => {
    // Sincronización simulada de Fudo/MaxiRest
    addSale({
      date: new Date().toISOString().split('T')[0],
      channel: 'SALON',
      paymentMethod: 'MERCADO_PAGO',
      grossAmount: 340000,
      commissionAmount: 6800,
      notes: 'Importado de Fudo POS vía CSV'
    });
    alert('✅ Se importaron 12 cierres de caja de Fudo/MaxiRest correctamente.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Control de Ventas por Canal y Medio de Pago
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complementa la facturación diaria de tu comanda (Fudo/MaxiRest) registrando ingresos netos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateCsvImport}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            Importar CSV (Fudo/MaxiRest)
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            + Registrar Venta
          </button>
        </div>
      </div>

      {/* Lista de Ventas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Histórico de Cierres de Ventas</h3>
          <span className="text-xs text-slate-400">{sales.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Canal</th>
                <th className="p-3">Medio de Pago</th>
                <th className="p-3">Monto Bruto</th>
                <th className="p-3">Comisión</th>
                <th className="p-3">Monto Neto</th>
                <th className="p-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sales.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium text-white whitespace-nowrap">{s.date}</td>
                  <td className="p-3">
                    <span className="bg-slate-800 border border-slate-700 text-amber-400 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                      {s.channel}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{s.paymentMethod}</td>
                  <td className="p-3 text-slate-300 font-medium">${s.grossAmount.toLocaleString('es-AR')}</td>
                  <td className="p-3 text-rose-400">-${s.commissionAmount.toLocaleString('es-AR')}</td>
                  <td className="p-3 text-emerald-400 font-bold">${s.netAmount.toLocaleString('es-AR')}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">{s.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Carga de Venta */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Cierre de Venta</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Canal de Venta</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="SALON">Salón</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY_PROPIO">Delivery Propio</option>
                    <option value="RAPPI">Rappi</option>
                    <option value="PEDIDOS_YA">PedidosYa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Medio de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="MERCADO_PAGO">Mercado Pago</option>
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO">Crédito</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto Bruto ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 150000"
                    value={grossAmount}
                    onChange={e => setGrossAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Comisión Plataforma ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 30000"
                    value={commissionAmount}
                    onChange={e => setCommissionAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas u Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Turno Noche - Mozo Juan"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
