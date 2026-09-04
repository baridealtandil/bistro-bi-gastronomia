'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { SearchableCombobox, DEFAULT_GASTRONOMY_CATEGORIES } from './SearchableCombobox';
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
  Search,
  Calendar,
  Gift,
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

  // Buscador de proveedores en el modal de pago
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  // Buscador de proveedores en la pestaña "Base de Proveedores"
  const [supplierListSearch, setSupplierListSearch] = useState('');

  // Form State Compra
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemUnitPrice, setItemUnitPrice] = useState('');

  const allCategories = Array.from(new Set([...DEFAULT_GASTRONOMY_CATEGORIES, ...suppliers.map(s => s.category)]));

  // Form State Proveedor
  const [supName, setSupName] = useState('');
  const [supCuit, setSupCuit] = useState('');
  const [supCategory, setSupCategory] = useState('');
  const [supPhone, setSupPhone] = useState('');

  // Detección de coincidencia/duplicidad de proveedor
  const normalizedSupName = supName.trim().toLowerCase();
  const exactSupplierMatch = normalizedSupName
    ? suppliers.find(s => s.name.trim().toLowerCase() === normalizedSupName)
    : null;
  const similarSupplierMatch = (!exactSupplierMatch && normalizedSupName.length >= 3)
    ? suppliers.find(s => {
        const sName = s.name.trim().toLowerCase();
        return sName.includes(normalizedSupName) || normalizedSupName.includes(sName);
      })
    : null;

  // Form State Pago a Proveedor
  const [paySupplierId, setPaySupplierId] = useState(suppliers[0]?.id || '');
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payMethod, setPayMethod] = useState<SupplierPayment['paymentMethod']>('TRANSFERENCIA');
  const [payAmount, setPayAmount] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('Banco Galicia');
  const [checkDueDate, setCheckDueDate] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // CÁLCULO DE DEUDAS POR MES BASADAS EN LA FECHA DE LA FACTURA / REMITO
  const calculateDebtByMonth = (yearMonthPrefix: string) => {
    return purchases
      .filter(p => p.status !== 'PAGADO' && p.date.startsWith(yearMonthPrefix))
      .reduce((acc, p) => acc + (p.amount - (p.paidAmount || 0)), 0);
  };

  const augustDebt = calculateDebtByMonth('2026-08'); // Meses anteriores (Agosto)
  const septemberDebt = calculateDebtByMonth('2026-09'); // Mes Corriente (Septiembre)
  const octoberDebt = calculateDebtByMonth('2026-10'); // Próximo Mes (Octubre)

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
    if (exactSupplierMatch) {
      alert(`⛔ No es posible registrar el proveedor: Ya existe un registro con el nombre exacto "${exactSupplierMatch.name}".`);
      return;
    }

    addSupplier({
      name: supName,
      cuit: supCuit || '30-00000000-0',
      category: supCategory || 'Varios & Gastos Generales',
      phone: supPhone || '11-0000-0000',
      email: '',
      paymentTermDays: 15
    });

    setSupName('');
    setSupCuit('');
    setSupCategory('');
    setSupPhone('');
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
      notes: payMethod === 'BONIFICACION_ACUERDO' ? `[Acuerdo / Bonificación Comercial] ${payNotes}` : payNotes
    });

    setPayAmount('');
    setCheckNumber('');
    setPayNotes('');
    setSupplierSearchQuery('');
    setShowPaymentModal(false);
  };

  // Proveedores ordenados alfabéticamente y filtrados por el buscador
  const sortedAndFilteredSuppliers = [...suppliers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(s =>
      s.name.toLowerCase().includes(supplierListSearch.toLowerCase()) ||
      s.cuit.includes(supplierListSearch) ||
      s.category.toLowerCase().includes(supplierListSearch.toLowerCase())
    );

  // Buscador de proveedores en el modal de pago
  const filteredSuppliersForPayment = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    s.cuit.includes(supplierSearchQuery)
  );

  const selectedSupplier = suppliers.find(s => s.id === paySupplierId) || suppliers[0];

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
            Gestión de Proveedores, Compras y Bonificaciones
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deudas calculadas por fecha de factura, bonificaciones comerciales y listado en orden alfabético.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            + Nuevo Proveedor
          </button>
          <button
            onClick={() => {
              setPaySupplierId(suppliers[0]?.id || '');
              setSupplierSearchQuery('');
              setShowPaymentModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <CreditCard className="w-4 h-4" />
            + Registrar Pago / Bonificación
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            + Factura (OCR)
          </button>
        </div>
      </div>

      {/* TARJETAS SUPERIORES DE DEUDAS POR MES DE FACTURA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-rose-900/60 p-4 rounded-2xl space-y-1 bg-rose-950/20">
          <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Deuda Meses Anteriores (Agosto)
          </div>
          <div className="text-xl font-black text-rose-400">${augustDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">Facturas impagas de meses previos</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Deuda Mes Corriente (Septiembre)
          </div>
          <div className="text-xl font-black text-white">${septemberDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">Facturas emitidas este mes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs font-bold text-blue-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Deuda Próximos Meses (Octubre)
          </div>
          <div className="text-xl font-black text-white">${octoberDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">Vencimientos diferidos</div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl space-y-1 bg-amber-500/5">
          <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
            <span>Deuda Total Acumulada</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">${totalSupplierDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">Sumatoria general de saldos</div>
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
          Pagos & Bonificaciones ({supplierPayments.length})
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
                  <th className="p-3">Fecha Factura</th>
                  <th className="p-3">Vencimiento</th>
                  <th className="p-3">Monto Total</th>
                  <th className="p-3">Monto Pagado / Desc.</th>
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
                      <td className="p-3 font-semibold text-amber-300">{p.date}</td>
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

      {/* VISTA 2: Pagos Realizados y Bonificaciones */}
      {activeTab === 'pagos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Histórico de Pagos e Imputaciones a Proveedores</h3>
            <span className="text-xs text-slate-400">{supplierPayments.length} registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Factura Imputada</th>
                  <th className="p-3">Medio de Pago / Tipo</th>
                  <th className="p-3">Monto Descontado</th>
                  <th className="p-3">Detalle / Cheque / Acuerdo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {supplierPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-medium text-white whitespace-nowrap">{pay.date}</td>
                    <td className="p-3 text-slate-200 font-bold">{pay.supplierName}</td>
                    <td className="p-3 text-slate-300 font-mono">{pay.invoiceNumber || 'Pago General a Cuenta'}</td>
                    <td className="p-3">
                      {pay.paymentMethod === 'BONIFICACION_ACUERDO' ? (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                          <Gift className="w-3 h-3" /> BONIFICACIÓN / ACUERDO
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-amber-400 border border-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {pay.paymentMethod}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-emerald-400 font-black">${pay.amount.toLocaleString('es-AR')}</td>
                    <td className="p-3 text-slate-400">
                      {pay.checkNumber ? (
                        <span className="text-amber-300 font-semibold flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" /> N° Cheque: {pay.checkNumber} ({pay.bank})
                        </span>
                      ) : pay.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 3: BASE DE PROVEEDORES EN LISTADO ALFABÉTICO CON BUSCADOR */}
      {activeTab === 'proveedores' && (
        <div className="space-y-4">
          {/* Buscador de la Base de Proveedores */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar proveedor por nombre comercial, CUIT o rubro..."
                value={supplierListSearch}
                onChange={e => setSupplierListSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div className="text-xs text-slate-400">
              Mostrando <strong>{sortedAndFilteredSuppliers.length}</strong> de <strong>{suppliers.length}</strong> proveedores (Orden Alfabético)
            </div>
          </div>

          {/* Tabla de Proveedores */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Nombre Comercial</th>
                    <th className="p-3">Rubro / Categoría</th>
                    <th className="p-3">Plazo de Pago</th>
                    <th className="p-3">Saldo Pendiente</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sortedAndFilteredSuppliers.length > 0 ? (
                    sortedAndFilteredSuppliers.map(sup => (
                      <tr key={sup.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-white text-sm">{sup.name}</td>
                        <td className="p-3">
                          <span className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-700">
                            {sup.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{sup.paymentTermDays} días</td>
                        <td className="p-3 font-black text-rose-400 text-sm">
                          ${sup.balanceDue.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setPaySupplierId(sup.id);
                              setSupplierSearchQuery(sup.name);
                              setShowPaymentModal(true);
                            }}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-3 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" /> Registrar Pago
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 italic text-xs">
                        No se encontraron proveedores que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR PAGO O BONIFICACIÓN A PROVEEDOR */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Registrar Pago o Bonificación a Proveedor
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3">
              {/* Buscador Rápido de Proveedor */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buscar Proveedor (Nombre o CUIT)</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Escribe el nombre o CUIT..."
                    value={supplierSearchQuery}
                    onChange={e => setSupplierSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="mt-1 max-h-32 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/60">
                  {filteredSuppliersForPayment.length > 0 ? (
                    filteredSuppliersForPayment.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setPaySupplierId(s.id);
                          setSupplierSearchQuery(s.name);
                          setPayInvoiceId('');
                        }}
                        className={`w-full text-left p-2 text-xs flex items-center justify-between transition-colors ${
                          paySupplierId === s.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block font-semibold">{s.name}</span>
                          <span className="text-[10px] text-slate-500">CUIT: {s.cuit}</span>
                        </div>
                        <span className="font-bold text-rose-400 text-[11px]">${s.balanceDue.toLocaleString('es-AR')}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-slate-500 text-center">No se encontraron proveedores</div>
                  )}
                </div>
              </div>

              {selectedSupplier && (
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Proveedor Seleccionado:</span>
                    <span className="font-bold text-amber-400">{selectedSupplier.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Deuda Pendiente:</span>
                    <span className="font-bold text-rose-400">${selectedSupplier.balanceDue.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

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
                        Factura {inv.invoiceNumber} ({inv.date}) - Saldo: ${rem.toLocaleString('es-AR')}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Método / Tipo de Transacción</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                  >
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="CHEQUE_PROPIO">Cheque Propio</option>
                    <option value="CHEQUE_TERCERO">Cheque de Tercero (Endosado)</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="BONIFICACION_ACUERDO">🎁 Bonificación / Acuerdo Comercial</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto a Descontar ($)</label>
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

              {payMethod === 'BONIFICACION_ACUERDO' && (
                <div className="bg-purple-950/30 border border-purple-800/50 p-2.5 rounded-xl text-[11px] text-purple-200">
                  🎁 <strong>Bonificación Comercial</strong>: El monto ingresado descontará directamente el saldo de la cuenta del proveedor sin requerir egreso de efectivo ni cheques.
                </div>
              )}

              {(payMethod === 'CHEQUE_PROPIO' || payMethod === 'CHEQUE_TERCERO') && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Datos del Cheque (Se visualizará en el Módulo de Cheques)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="N° Cheque (ej. CHK-9812)"
                      value={checkNumber}
                      onChange={e => setCheckNumber(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Banco (ej. Galicia / BBVA)"
                      value={checkBank}
                      onChange={e => setCheckBank(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Fecha de Vencimiento / Cobro del Cheque</label>
                    <input
                      type="date"
                      value={checkDueDate}
                      onChange={e => setCheckDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none mt-0.5"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas / Detalle del Acuerdo</label>
                <input
                  type="text"
                  placeholder="Ej. Bonificación por volumen / Descuento nota de crédito"
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
                  Confirmar Transacción
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
                  <label className="text-xs text-slate-400 block mb-1">Fecha Emisión (Factura)</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-300"
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

      {/* Modal Nuevo Proveedor */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Nuevo Proveedor</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre Comercial / Razón Social</label>
                <input
                  type="text"
                  placeholder="Distribuidora de Lácteos SRL"
                  value={supName}
                  onChange={e => setSupName(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl p-2.5 text-xs text-white outline-none font-bold transition-colors ${
                    exactSupplierMatch
                      ? 'border-rose-500 text-rose-300'
                      : similarSupplierMatch
                      ? 'border-amber-500 text-amber-300'
                      : 'border-slate-800 focus:border-amber-500'
                  }`}
                  required
                />

                {exactSupplierMatch && (
                  <div className="mt-2 p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300 block">⛔ Proveedor ya registrado</span>
                      Ya existe un proveedor con este nombre exacto: <strong>"{exactSupplierMatch.name}"</strong> (Rubro: {exactSupplierMatch.category}).
                    </div>
                  </div>
                )}

                {similarSupplierMatch && (
                  <div className="mt-2 p-2.5 bg-amber-950/80 border border-amber-800 rounded-xl text-amber-200 text-xs flex items-start gap-2 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block">⚠️ Coincidencia detectada</span>
                      Existe un proveedor registrado con nombre similar: <strong>"{similarSupplierMatch.name}"</strong> (Rubro: {similarSupplierMatch.category}). Revisa si no es la misma empresa antes de crearlo.
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CUIT</label>
                  <input
                    type="text"
                    placeholder="30-12345678-9"
                    value={supCuit}
                    onChange={e => setSupCuit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <SearchableCombobox
                    label="Rubro / Categoría"
                    value={supCategory}
                    onChange={setSupCategory}
                    options={allCategories}
                    placeholder="Buscar o escribir rubro..."
                    allowCustom={true}
                    required={true}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Teléfono / Celular de Contacto</label>
                <input
                  type="text"
                  placeholder="11-4567-8901"
                  value={supPhone}
                  onChange={e => setSupPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg"
                >
                  Crear Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
