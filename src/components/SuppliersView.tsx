'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import {
  Plus,
  Camera,
  AlertTriangle,
  Truck,
  DollarSign,
  FileText,
  CheckCircle,
  CreditCard,
  Receipt,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { SupplierPayment } from '../types/gastronomy';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    purchases,
    supplierPayments,
    addPurchase,
    addSupplier,
    addSupplierPayment,
    totalSupplierDebt
  } = useGastronomy();

  const [activeTab, setActiveTab] = useState<'facturas' | 'pagos' | 'proveedores'>('facturas');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  // Form State Compra
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemUnitPrice, setItemUnitPrice] = useState('');

  // Form State Proveedor
  const [supName, setSupName] = useState('');
  const [supCuit, setSupCuit] = useState('');
  const [supCategory, setSupCategory] = useState('Carnes');

  // Form State Pago a Proveedor
  const [paySupplierId, setPaySupplierId] = useState(suppliers[0]?.id || '');
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payMethod, setPayMethod] = useState<SupplierPayment['paymentMethod']>('TRANSFERENCIA');
  const [payAmount, setPayAmount] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('Banco Galicia');
  const [checkDueDate, setCheckDueDate] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const handleSimulateOcr = () => {
    setIsScanningOcr(true);
    setTimeout(() => {
      setIsScanningOcr(false);
      setInvoiceNumber('FC-A-0003-0009841');
      setAmount('185000');
      setDueDate('2026-09-18');
      setItemDescription('Ojo de Bife envasado al vacío (20kg)');
      setItemUnitPrice('9250');
      alert('📷 OCR de IA finalizado: Factura procesada y datos completados automáticamente.');
    }, 1200);
  };

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const targetSup = suppliers.find(s => s.id === supplierId) || suppliers[0];

    addPurchase({
      supplierId: targetSup.id,
      supplierName: targetSup.name,
      invoiceNumber: invoiceNumber || `FC-${Date.now().toString().slice(-6)}`,
      date,
      dueDate: dueDate || date,
      amount: parseFloat(amount),
      paidAmount: 0,
      status: 'PENDIENTE',
      items: itemDescription ? [{ description: itemDescription, qty: 1, unitPrice: parseFloat(itemUnitPrice || amount) }] : []
    });

    setAmount('');
    setInvoiceNumber('');
    setItemDescription('');
    setShowPurchaseModal(false);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;

    addSupplier({
      name: supName,
      cuit: supCuit || '30-00000000-0',
      category: supCategory,
      phone: '',
      email: '',
      paymentTermDays: 15
    });

    setSupName('');
    setSupCuit('');
    setShowSupplierModal(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) return;

    const targetSup = suppliers.find(s => s.id === paySupplierId) || suppliers[0];
    const targetInvoice = purchases.find(p => p.id === payInvoiceId);

    addSupplierPayment({
      supplierId: targetSup.id,
      supplierName: targetSup.name,
      invoiceId: targetInvoice?.id,
      invoiceNumber: targetInvoice?.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      amount: parseFloat(payAmount),
      checkNumber,
      bank: checkBank,
      dueDate: checkDueDate,
      notes: payNotes
    });

    setPayAmount('');
    setCheckNumber('');
    setPayNotes('');
    setShowPaymentModal(false);
  };

  // Facturas pendientes del proveedor seleccionado en el modal de pago
  const selectedSupplierInvoices = purchases.filter(
    p => p.supplierId === paySupplierId && p.status !== 'PAGADO'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Gestión de Proveedores, Compras y Pagos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Imputación de pagos por cheque, transferencia o efectivo descontados automáticamente de facturas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <CreditCard className="w-4 h-4" />
            + Registrar Pago
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            + Factura (OCR)
          </button>
        </div>
      </div>

      {/* Tarjeta de Resumen Deuda Total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Deuda Total Acumulada</div>
          <div className="text-2xl font-black text-rose-400 mt-1">${totalSupplierDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">Sumatoria de saldos pendientes con proveedores</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Facturas por Pagar</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {purchases.filter(p => p.status !== 'PAGADO').length} facturas
          </div>
          <div className="text-[10px] text-slate-400">Facturas pendientes o parciales</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-medium">Pagos Registrados</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ${supplierPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString('es-AR')}
          </div>
          <div className="text-[10px] text-slate-400">{supplierPayments.length} pagos realizados este mes</div>
        </div>
      </div>

      {/* Pestañas Secundarias (Sub-tabs) */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('facturas')}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'facturas' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Facturas de Compra ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('pagos')}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'pagos' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Pagos Realizados ({supplierPayments.length})
        </button>
        <button
          onClick={() => setActiveTab('proveedores')}
          className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'proveedores' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Base de Proveedores ({suppliers.length})
        </button>
      </div>

      {/* VISTA 1: Facturas y Saldos */}
      {activeTab === 'facturas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Historial de Facturas de Compras de Insumos</h3>
            <span className="text-xs text-slate-400">Total: ${purchases.reduce((acc, p) => acc + p.amount, 0).toLocaleString('es-AR')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Factura #</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Vencimiento</th>
                  <th className="p-3">Monto Total</th>
                  <th className="p-3">Monto Pagado</th>
                  <th className="p-3">Saldo Restante</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchases.map(p => {
                  const paid = p.paidAmount || 0;
                  const remaining = Math.max(0, p.amount - paid);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium text-white whitespace-nowrap">{p.invoiceNumber}</td>
                      <td className="p-3 text-slate-300 font-medium">{p.supplierName}</td>
                      <td className="p-3 text-slate-400">{p.date}</td>
                      <td className="p-3 text-slate-400">{p.dueDate}</td>
                      <td className="p-3 text-white font-bold">${p.amount.toLocaleString('es-AR')}</td>
                      <td className="p-3 text-emerald-400 font-semibold">${paid.toLocaleString('es-AR')}</td>
                      <td className="p-3 text-rose-400 font-bold">${remaining.toLocaleString('es-AR')}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'PAGADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : p.status === 'PARCIAL'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: Pagos Realizados a Proveedores */}
      {activeTab === 'pagos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Histórico de Pagos e Imputaciones a Proveedores</h3>
            <span className="text-xs text-slate-400">{supplierPayments.length} pagos registrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Factura Imputada</th>
                  <th className="p-3">Medio de Pago</th>
                  <th className="p-3">Monto Pagado</th>
                  <th className="p-3">Detalle / Cheque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {supplierPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-medium text-white whitespace-nowrap">{pay.date}</td>
                    <td className="p-3 text-slate-200 font-bold">{pay.supplierName}</td>
                    <td className="p-3 text-slate-300 font-mono">{pay.invoiceNumber || 'Pago General a Cuenta'}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-amber-400 border border-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400 font-black">${pay.amount.toLocaleString('es-AR')}</td>
                    <td className="p-3 text-slate-400">
                      {pay.checkNumber ? `N° Cheque: ${pay.checkNumber} (${pay.bank})` : pay.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 3: Base de Proveedores */}
      {activeTab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {sup.category}
                </span>
                <span className="text-[10px] text-slate-400">CUIT: {sup.cuit}</span>
              </div>
              <h3 className="font-bold text-white text-sm">{sup.name}</h3>
              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                <span className="text-slate-400">Saldo pendiente:</span>
                <span className="font-bold text-rose-400">${sup.balanceDue.toLocaleString('es-AR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL REGISTRAR PAGO A PROVEEDOR */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Registrar Pago a Proveedor
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Seleccionar Proveedor</label>
                <select
                  value={paySupplierId}
                  onChange={e => {
                    setPaySupplierId(e.target.value);
                    setPayInvoiceId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Saldo Pendiente: ${s.balanceDue.toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Imputar a Factura Específica (Opcional)</label>
                <select
                  value={payInvoiceId}
                  onChange={e => {
                    setPayInvoiceId(e.target.value);
                    const inv = purchases.find(p => p.id === e.target.value);
                    if (inv) {
                      const rem = inv.amount - (inv.paidAmount || 0);
                      setPayAmount(rem.toString());
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="">-- Pago a Cuenta General --</option>
                  {selectedSupplierInvoices.map(inv => {
                    const rem = inv.amount - (inv.paidAmount || 0);
                    return (
                      <option key={inv.id} value={inv.id}>
                        Factura {inv.invoiceNumber} - Pendiente: ${rem.toLocaleString('es-AR')}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Medio de Pago</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="CHEQUE_PROPIO">Cheque Propio</option>
                    <option value="CHEQUE_TERCERO">Cheque de Tercero</option>
                    <option value="EFECTIVO">Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto del Pago ($)</label>
                  <input
                    type="number"
                    placeholder="Ej. 150000"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* Si es Cheque Propio, pedir número de cheque y fecha cobro */}
              {payMethod === 'CHEQUE_PROPIO' && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" /> Datos del Cheque (Se registrará en la Chequera automáticamente)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="N° Cheque (CHK-001)"
                      value={checkNumber}
                      onChange={e => setCheckNumber(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none"
                    />
                    <input
                      type="date"
                      value={checkDueDate}
                      onChange={e => setCheckDueDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas u Observaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Transferencia Banco Galicia comprobante 98123"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carga Factura OCR */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cargar Factura de Compra</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
              <button
                type="button"
                onClick={handleSimulateOcr}
                disabled={isScanningOcr}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                {isScanningOcr ? 'Escaneando Factura con IA...' : 'Subir Foto / PDF para OCR Automático'}
              </button>
            </div>

            <form onSubmit={handleAddPurchase} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Proveedor</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">N° de Factura</label>
                  <input
                    type="text"
                    placeholder="FC-A-0001-000123"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fecha Vencimiento</label>
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
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
