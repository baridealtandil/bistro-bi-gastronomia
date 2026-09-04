'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Plus, Sun, Moon, Users, DollarSign, Calendar, Filter, RefreshCw } from 'lucide-react';
import { Sale } from '../types/gastronomy';
import { DateRangePicker } from './DateRangePicker';

export const SalesView: React.FC = () => {
  const { sales, addSale } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  // Filtros de Ventas: Rango de Fechas (Calendario Unificado), Turno, Canal y Método de Pago
  const [startDate, setStartDate] = useState<string>('2026-09-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [filterShift, setFilterShift] = useState<string>('TODOS');
  const [filterChannel, setFilterChannel] = useState<string>('TODOS');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('TODOS');

  // Form State para Nueva Venta
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<Sale['shift']>('MEDIODIA');
  const [covers, setCovers] = useState<string>('25');
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
      shift,
      covers: parseInt(covers || '0', 10),
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

  // Filtrado Multicriterio de Ventas (Fecha, Turno, Canal y Método de Pago)
  const filteredSales = sales.filter(s => {
    if (startDate && s.date < startDate) return false;
    if (endDate && s.date > endDate) return false;
    if (filterShift !== 'TODOS' && s.shift !== filterShift) return false;
    if (filterChannel !== 'TODOS' && s.channel !== filterChannel) return false;
    if (filterPaymentMethod !== 'TODOS' && s.paymentMethod !== filterPaymentMethod) return false;
    return true;
  });

  // CÁLCULO DINÁMICO DE KPIS SEGÚN LOS FILTROS SELECCIONADOS
  const periodMediodia = filteredSales.filter(s => s.shift === 'MEDIODIA').reduce((acc, s) => acc + s.netAmount, 0);
  const periodNoche = filteredSales.filter(s => s.shift === 'NOCHE').reduce((acc, s) => acc + s.netAmount, 0);
  const periodCovers = filteredSales.reduce((acc, s) => acc + (s.covers || 0), 0);
  const periodSalesNet = filteredSales.reduce((acc, s) => acc + s.netAmount, 0);
  const periodAverageTicket = periodCovers > 0 ? periodSalesNet / periodCovers : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Ventas por Turno (Mediodía / Noche) y Cubiertos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Filtra por período, turno, canal o medio de pago para ver los indicadores dinámicos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            + Registrar Venta
          </button>
        </div>
      </div>

      {/* PANEL DE FILTROS (ALMANAQUE UNIFICADO DESDE/HASTA + TURNO + CANAL + MÉTODO DE PAGO) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            Filtros de Ventas: Período (Almanaque Unificado), Turno, Canal y Medio de Pago
          </div>
          
          <button
            onClick={() => {
              setStartDate('2026-09-01');
              setEndDate('2026-09-30');
              setFilterShift('TODOS');
              setFilterChannel('TODOS');
              setFilterPaymentMethod('TODOS');
            }}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 w-fit"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" /> Resetear Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 1. Almanaque Unificado Seleccionable "Desde - Hasta" */}
          <div className="md:col-span-1">
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">🗓️ Seleccionar Período (Desde - Hasta)</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>

          {/* 2. Filtro por Turno */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">☀️🌙 Turno</label>
            <select
              value={filterShift}
              onChange={e => setFilterShift(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none font-medium"
            >
              <option value="TODOS">Todos los Turnos</option>
              <option value="MEDIODIA">☀️ Turno Mediodía</option>
              <option value="NOCHE">🌙 Turno Noche</option>
            </select>
          </div>

          {/* 3. Filtro por Canal */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">🏪 Canal de Venta</label>
            <select
              value={filterChannel}
              onChange={e => setFilterChannel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none font-medium"
            >
              <option value="TODOS">Todos los Canales</option>
              <option value="SALON">Salón</option>
              <option value="DELIVERY">Delivery Propio</option>
              <option value="TAKE_AWAY">Take Away / Mostrador</option>
              <option value="RAPPI_PEDIDOSYA">Rappi / PedidosYa</option>
            </select>
          </div>

          {/* 4. Filtro por Método de Pago */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1 font-semibold">💳 Método de Pago</label>
            <select
              value={filterPaymentMethod}
              onChange={e => setFilterPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none font-medium"
            >
              <option value="TODOS">Todos los Medios de Pago</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="MERCADO_PAGO">Mercado Pago / QR</option>
              <option value="TARJETA_DEBITO">Tarjeta Débito</option>
              <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
              <option value="TRANSFERENCIA">Transferencia Bancaria</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARJETAS KPI DE RESUMEN QUE SE ACTUALIZAN DINÁMICAMENTE CON EL ALMANAQUE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Ventas Turno Mediodía</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white">${periodMediodia.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">En el período seleccionado</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Ventas Turno Noche</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-white">${periodNoche.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">En el período seleccionado</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Cubiertos Totales</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">{periodCovers} pax</div>
          <div className="text-[10px] text-slate-400">Comensales en el período</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Ticket Promedio / Cubierto</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">${Math.round(periodAverageTicket).toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">Venta neta por comensal</div>
        </div>
      </div>

      {/* Tabla de Ventas Filtradas por el Almanaque */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Histórico de Ventas del Período Seleccionado</h3>
          <span className="text-xs text-slate-400">{filteredSales.length} cierres listados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Turno</th>
                <th className="p-3">Cubiertos</th>
                <th className="p-3">Canal</th>
                <th className="p-3">Medio Pago</th>
                <th className="p-3">Monto Neto</th>
                <th className="p-3">Promedio / Cubierto</th>
                <th className="p-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length > 0 ? (
                filteredSales.map(s => {
                  const ticketPerCover = s.covers > 0 ? s.netAmount / s.covers : 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium text-white whitespace-nowrap">{s.date}</td>
                      <td className="p-3">
                        {s.shift === 'MEDIODIA' ? (
                          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold text-[10px] w-fit">
                            <Sun className="w-3 h-3" /> MEDIODÍA
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-bold text-[10px] w-fit">
                            <Moon className="w-3 h-3" /> NOCHE
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-white font-bold">{s.covers || 0} pax</td>
                      <td className="p-3">
                        <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {s.channel}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{s.paymentMethod}</td>
                      <td className="p-3 text-emerald-400 font-bold">${s.netAmount.toLocaleString('es-AR')}</td>
                      <td className="p-3 text-slate-300 font-medium">
                        {ticketPerCover > 0 ? `$${Math.round(ticketPerCover).toLocaleString('es-AR')}` : '-'}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{s.notes || '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 italic text-xs">
                    No hay cierres de ventas registrados en el rango de fechas seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Carga de Venta */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Cierre de Venta por Turno</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
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
                  <label className="text-xs text-slate-400 block mb-1">Turno</label>
                  <select
                    value={shift}
                    onChange={e => setShift(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                  >
                    <option value="MEDIODIA">☀️ Mediodía</option>
                    <option value="NOCHE">🌙 Noche</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cubiertos (Comensales)</label>
                  <input
                    type="number"
                    placeholder="Ej. 45"
                    value={covers}
                    onChange={e => setCovers(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto Bruto ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 450000"
                    value={grossAmount}
                    onChange={e => setGrossAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Comisión Plataforma ($)</label>
                <input
                  type="number"
                  placeholder="Ej. 0"
                  value={commissionAmount}
                  onChange={e => setCommissionAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas u Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Cierre Turno Noche - Encargado Marcos"
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
