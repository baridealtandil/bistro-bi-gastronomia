'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import {
  CheckSquare,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Search,
  Building,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Check as CheckType } from '../types/gastronomy';

export const ChecksView: React.FC = () => {
  const { checks, addCheck, suppliers } = useGastronomy();
  const [showModal, setShowModal] = useState(false);

  // Estados de Filtros Avanzados
  const [filterType, setFilterType] = useState<'ALL' | 'PROPIO' | 'TERCERO'>('ALL');
  const [filterBank, setFilterBank] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchSupplier, setSearchSupplier] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Form State para Nuevo Cheque
  const [type, setType] = useState<CheckType['type']>('PROPIO');
  const [number, setNumber] = useState('');
  const [bank, setBank] = useState('Banco Galicia');
  const [issuerOrRecipient, setIssuerOrRecipient] = useState('');
  const [supplierSearchQueryModal, setSupplierSearchQueryModal] = useState('');
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
      issuerOrRecipient: issuerOrRecipient || supplierSearchQueryModal || 'Sin Especificar',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      amount: parseFloat(amount),
      status: 'PENDIENTE',
      notes
    });

    setNumber('');
    setAmount('');
    setIssuerOrRecipient('');
    setSupplierSearchQueryModal('');
    setShowModal(false);
  };

  // Bancos únicos presentes
  const uniqueBanks = Array.from(new Set(checks.map(c => c.bank)));

  // Buscador de Proveedores en Modal de Carga de Cheque
  const matchingSuppliersModal = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearchQueryModal.toLowerCase()) ||
    s.cuit.includes(supplierSearchQueryModal)
  );

  // Cálculos de Totales por Mes para Cheques Propios (Próximos 90-120 días)
  const calculateMonthlyTotal = (yearMonthPrefix: string) => {
    return checks
      .filter(c => c.type === 'PROPIO' && c.dueDate.startsWith(yearMonthPrefix))
      .reduce((acc, c) => acc + c.amount, 0);
  };

  const septTotal = calculateMonthlyTotal('2026-09');
  const octTotal = calculateMonthlyTotal('2026-10');
  const novTotal = calculateMonthlyTotal('2026-11');
  const dicTotal = calculateMonthlyTotal('2026-12');
  const total90Days = septTotal + octTotal + novTotal + dicTotal;

  // Lógica de Filtrado de la Tabla
  const filteredChecks = checks.filter(c => {
    if (filterType !== 'ALL' && c.type !== filterType) return false;
    if (filterBank !== 'ALL' && c.bank !== filterBank) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchSupplier && !c.issuerOrRecipient.toLowerCase().includes(searchSupplier.toLowerCase()) && !c.number.toLowerCase().includes(searchSupplier.toLowerCase())) {
      return false;
    }
    if (startDate && c.dueDate < startDate) return false;
    if (endDate && c.dueDate > endDate) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Control Completo de Cheques Propios Emitidos y Diferidos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Panorama mensual de vencimientos a 90 días, filtros por banco, fecha y proveedor.
          </p>
        </div>
        <button
          onClick={() => {
            setSupplierSearchQueryModal('');
            setIssuerOrRecipient('');
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          + Registrar Cheque
        </button>
      </div>

      {/* TARJETAS DE RESUMEN MENSUAL EN $ (PRÓXIMOS 90 DÍAS) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" /> Septiembre
          </div>
          <div className="text-lg font-black text-white">${septTotal.toLocaleString('es-AR')}</div>
          <div className="text-[9px] text-slate-400">Vencimientos Mes Corriente</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-400" /> Octubre
          </div>
          <div className="text-lg font-black text-white">${octTotal.toLocaleString('es-AR')}</div>
          <div className="text-[9px] text-slate-400">Vencimientos Próximo Mes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" /> Noviembre
          </div>
          <div className="text-lg font-black text-white">${novTotal.toLocaleString('es-AR')}</div>
          <div className="text-[9px] text-slate-400">Vencimientos en 60 días</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-violet-400" /> Diciembre
          </div>
          <div className="text-lg font-black text-white">${dicTotal.toLocaleString('es-AR')}</div>
          <div className="text-[9px] text-slate-400">Vencimientos en 90 días</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-amber-500/30 p-3.5 rounded-2xl space-y-1 bg-amber-500/5">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total 90 Días</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-400">${total90Days.toLocaleString('es-AR')}</div>
          <div className="text-[9px] text-slate-400">Compromisos Totales</div>
        </div>
      </div>

      {/* BARRA DE FILTROS AVANZADOS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
          <Filter className="w-4 h-4 text-amber-400" />
          Filtros de Búsqueda y Rango de Fechas
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Buscar Proveedor o N°</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Nombre o N° Cheque..."
                value={searchSupplier}
                onChange={e => setSearchSupplier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Filtrar por Banco</label>
            <select
              value={filterBank}
              onChange={e => setFilterBank(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-amber-500 outline-none"
            >
              <option value="ALL">Todos los Bancos</option>
              {uniqueBanks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Tipo de Cheque</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-amber-500 outline-none font-semibold text-amber-400"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="PROPIO">Propios Emitidos</option>
              <option value="TERCERO">De Terceros</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Fecha Venc. Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Fecha Venc. Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {(filterBank !== 'ALL' || filterType !== 'ALL' || searchSupplier || startDate || endDate) && (
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => {
                setFilterBank('ALL');
                setFilterType('ALL');
                setFilterStatus('ALL');
                setSearchSupplier('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-amber-400 hover:underline font-semibold"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* TABLA EN FORMATO LISTADO COMPLETO DE CHEQUES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Listado General de Cheques Registrados</h3>
          <span className="text-xs text-slate-400 font-semibold">{filteredChecks.length} cheques listados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Tipo</th>
                <th className="p-3">N° Cheque</th>
                <th className="p-3">Banco</th>
                <th className="p-3">Proveedor / Destinatario</th>
                <th className="p-3">Fecha Emisión</th>
                <th className="p-3">Fecha Vencimiento</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Notas / Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredChecks.length > 0 ? (
                filteredChecks.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      {c.type === 'PROPIO' ? (
                        <span className="flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold text-[10px] w-fit">
                          <ArrowUpRight className="w-3 h-3" /> PROPIO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[10px] w-fit">
                          <ArrowDownLeft className="w-3 h-3" /> TERCERO
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{c.number}</td>
                    <td className="p-3 text-slate-200 font-medium whitespace-nowrap">{c.bank}</td>
                    <td className="p-3 text-slate-100 font-bold">{c.issuerOrRecipient}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{c.issueDate}</td>
                    <td className="p-3 font-bold text-amber-400 whitespace-nowrap">{c.dueDate}</td>
                    <td className="p-3 text-white font-black text-sm">${c.amount.toLocaleString('es-AR')}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'PENDIENTE'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : c.status === 'ENDOSADO'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{c.notes || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500 italic text-xs">
                    No se encontraron cheques que coincidan con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR CHEQUE MANUALMENTE (CON BUSCADOR DE PROVEEDOR) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Cheque Manualmente</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddCheck} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Tipo de Cheque</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Banco</label>
                  <input
                    type="text"
                    placeholder="Banco Galicia / ICBC / BBVA"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                    required
                  />
                </div>
              </div>

              {/* BUSCADOR AUTOCOMPLETADO DE PROVEEDOR / CLIENTE */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="text-xs text-slate-400 block mb-1">Buscar Proveedor / Cliente</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Escribe para buscar..."
                      value={supplierSearchQueryModal}
                      onChange={e => {
                        setSupplierSearchQueryModal(e.target.value);
                        setIssuerOrRecipient(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                      required
                    />
                  </div>

                  {/* Dropdown de opciones coincidentes */}
                  {supplierSearchQueryModal && matchingSuppliersModal.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-36 overflow-y-auto divide-y divide-slate-800">
                      {matchingSuppliersModal.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setIssuerOrRecipient(s.name);
                            setSupplierSearchQueryModal(s.name);
                          }}
                          className="w-full text-left p-2 text-xs hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 transition-colors flex items-center justify-between"
                        >
                          <span className="font-bold">{s.name}</span>
                          <span className="text-[10px] text-slate-500">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha Cobro / Vencimiento</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Indicador visual de la selección */}
              {issuerOrRecipient && (
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 text-[11px] flex items-center gap-1.5 text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Destinatario asignado: <strong className="text-white">{issuerOrRecipient}</strong></span>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Cheque entregado para cubrir factura"
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
