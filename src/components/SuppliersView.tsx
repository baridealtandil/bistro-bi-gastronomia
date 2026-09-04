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
  ArrowRight,
  X
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

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  // Buscador principal de proveedores
  const [supplierListSearch, setSupplierListSearch] = useState('');

  // Buscador de proveedores en el modal de pago
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  // Form State Compra
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseSupplierName, setPurchaseSupplierName] = useState(suppliers[0]?.name || '');
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

  // Proveedores ordenados alfabéticamente y filtrados por el buscador principal
  const sortedAndFilteredSuppliers = [...suppliers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(s =>
      s.name.toLowerCase().includes(supplierListSearch.toLowerCase()) ||
      s.cuit.includes(supplierListSearch) ||
      s.category.toLowerCase().includes(supplierListSearch.toLowerCase())
    );

  // IDs de proveedores coincidentes con la búsqueda activa
  const matchingSupplierIds = new Set(sortedAndFilteredSuppliers.map(s => s.id));

  // Facturas filtradas según la búsqueda activa (si no hay búsqueda, usa todas)
  const filteredPurchasesForCards = supplierListSearch.trim() === ''
    ? purchases
    : purchases.filter(p => matchingSupplierIds.has(p.supplierId));

  // CÁLCULO DE DEUDAS POR MES BASADAS EN LA BÚSQUEDA DEL PROVEEDOR
  const calculateDebtByMonth = (yearMonthPrefix: string) => {
    return filteredPurchasesForCards
      .filter(p => p.status !== 'PAGADO' && p.date.startsWith(yearMonthPrefix))
      .reduce((acc, p) => acc + (p.amount - (p.paidAmount || 0)), 0);
  };

  const augustDebt = calculateDebtByMonth('2026-08'); // Meses anteriores (Agosto)
  const septemberDebt = calculateDebtByMonth('2026-09'); // Mes Corriente (Septiembre)
  const octoberDebt = calculateDebtByMonth('2026-10'); // Próximo Mes (Octubre)
  const totalFilteredDebt = augustDebt + septemberDebt + octoberDebt;

  // Facturas pendientes filtradas para la tabla de comprobantes del proveedor
  const filteredPendingPurchases = filteredPurchasesForCards.filter(p => p.status !== 'PAGADO');

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

    let targetSup = suppliers.find(
      s => s.name.toLowerCase().trim() === (purchaseSupplierName || suppliers[0]?.name || '').toLowerCase().trim()
    );

    if (!targetSup && purchaseSupplierName.trim()) {
      const newSupName = purchaseSupplierName.trim();
      addSupplier({
        name: newSupName,
        cuit: '30-00000000-0',
        category: 'Varios & Gastos Generales',
        phone: '11-0000-0000',
        email: '',
        paymentTermDays: 15
      });
      targetSup = {
        id: `sup-${Date.now()}`,
        name: newSupName,
        cuit: '30-00000000-0',
        category: 'Varios & Gastos Generales',
        phone: '11-0000-0000',
        email: '',
        paymentTermDays: 15,
        balanceDue: 0
      };
    }

    const finalSupplierId = targetSup ? targetSup.id : (suppliers[0]?.id || 'sup1');
    const finalSupplierName = targetSup ? targetSup.name : (suppliers[0]?.name || 'Proveedor General');

    addPurchase({
      supplierId: finalSupplierId,
      supplierName: finalSupplierName,
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

  // Buscador de proveedores en el modal de pago
  const filteredSuppliersForPayment = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    s.cuit.includes(supplierSearchQuery)
  );

  const selectedSupplier = suppliers.find(s => s.id === paySupplierId) || suppliers[0];

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
            Busca un proveedor para ver sus facturas pendientes y actualizar las tarjetas de deuda automáticamente.
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

      {/* TARJETAS SUPERIORES DE DEUDAS (SE RECALCULAN SEGÚN EL PROVEEDOR BUSCADO) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-rose-900/60 p-4 rounded-2xl space-y-1 bg-rose-950/20">
          <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Deuda Meses Anteriores (Agosto)
          </div>
          <div className="text-xl font-black text-rose-400">${augustDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">
            {supplierListSearch.trim() !== '' ? 'Deuda previa del proveedor' : 'Facturas impagas de meses previos'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Deuda Mes Corriente (Septiembre)
          </div>
          <div className="text-xl font-black text-white">${septemberDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">
            {supplierListSearch.trim() !== '' ? 'Deuda actual del proveedor' : 'Facturas emitidas este mes'}
          </div>
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
          <div className="text-xl font-black text-amber-400">${totalFilteredDebt.toLocaleString('es-AR')}</div>
          <div className="text-[10px] text-slate-400">
            {supplierListSearch.trim() !== '' ? 'Deuda del proveedor buscado' : 'Sumatoria general de saldos'}
          </div>
        </div>
      </div>

      {/* BUSCADOR UNIFICADO DE PROVEEDORES */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="🔍 Buscar proveedor por nombre comercial o rubro para filtrar deudas y facturas..."
            value={supplierListSearch}
            onChange={e => setSupplierListSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
          />
          {supplierListSearch && (
            <button
              onClick={() => setSupplierListSearch('')}
              className="absolute right-2.5 top-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-2 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              Limpiar Búsqueda
            </button>
          )}
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Mostrando <strong>{sortedAndFilteredSuppliers.length}</strong> de <strong>{suppliers.length}</strong> proveedores
        </div>
      </div>

      {/* TABLA BASE DE PROVEEDORES */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Base de Proveedores (Orden Alfabético)</h3>
          <span className="text-xs text-slate-400">{sortedAndFilteredSuppliers.length} proveedores listados</span>
        </div>

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
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setPurchaseSupplierName(sup.name);
                            setSupplierId(sup.id);
                            setShowPurchaseModal(true);
                          }}
                          className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3 h-3" /> Agregar Factura
                        </button>
                        <button
                          onClick={() => {
                            setPaySupplierId(sup.id);
                            setSupplierSearchQuery(sup.name);
                            setShowPaymentModal(true);
                          }}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 shrink-0"
                        >
                          <CreditCard className="w-3 h-3" /> Registrar Pago
                        </button>
                      </div>
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

      {/* SECCIÓN DE FACTURAS Y REMITOS PENDIENTES DEL PROVEEDOR BUSCADO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              {supplierListSearch.trim() !== ''
                ? `Facturas y Remitos Pendientes de Pago (${sortedAndFilteredSuppliers.map(s => s.name).join(', ')})`
                : 'Facturas de Compra & Remitos Pendientes de Pago (General)'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {supplierListSearch.trim() !== ''
                ? 'Comprobantes impagos imputados al proveedor filtrado arriba.'
                : 'Histórico de facturas ingresadas con saldo pendiente de cancelación.'}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 w-fit">
            {filteredPendingPurchases.length} comprobantes impagos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Factura / Remito #</th>
                <th className="p-3">Proveedor</th>
                <th className="p-3">Fecha Factura</th>
                <th className="p-3">Vencimiento</th>
                <th className="p-3">Monto Total</th>
                <th className="p-3">Monto Pagado</th>
                <th className="p-3">Saldo Pendiente</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPendingPurchases.length > 0 ? (
                filteredPendingPurchases.map(p => {
                  const pendingAmount = p.amount - (p.paidAmount || 0);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-amber-400">{p.invoiceNumber}</td>
                      <td className="p-3 font-bold text-white">{p.supplierName}</td>
                      <td className="p-3 text-slate-300 font-semibold">{p.date}</td>
                      <td className="p-3 text-slate-400">{p.dueDate}</td>
                      <td className="p-3 text-white font-bold">${p.amount.toLocaleString('es-AR')}</td>
                      <td className="p-3 text-emerald-400 font-semibold">${(p.paidAmount || 0).toLocaleString('es-AR')}</td>
                      <td className="p-3 text-rose-400 font-black text-sm">${pendingAmount.toLocaleString('es-AR')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.status === 'PAGADO'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : p.status === 'PARCIAL'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setPaySupplierId(p.supplierId);
                            setPayInvoiceId(p.id);
                            setPayAmount(pendingAmount.toString());
                            setSupplierSearchQuery(p.supplierName);
                            setShowPaymentModal(true);
                          }}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-3 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" /> Pagar Factura
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500 italic text-xs">
                    No hay facturas pendientes registradas para la búsqueda realizada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Compra / Factura */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" /> Cargar Factura o Remito
              </h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <button
              type="button"
              onClick={handleSimulateOcr}
              disabled={isScanningOcr}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow"
            >
              <Camera className="w-4 h-4 animate-bounce" />
              {isScanningOcr ? 'Escaneando Factura con IA...' : '📸 Escanear / Cargar Foto de Factura (IA OCR)'}
            </button>

            <form onSubmit={handleAddPurchase} className="space-y-3 pt-2">
              <div>
                <SearchableCombobox
                  label="Proveedor"
                  value={purchaseSupplierName || (suppliers[0]?.name ?? '')}
                  onChange={setPurchaseSupplierName}
                  options={suppliers.map(s => s.name)}
                  placeholder="Buscar o seleccionar proveedor..."
                  allowCustom={true}
                  required={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">N° de Factura / Remito</label>
                  <input
                    type="text"
                    placeholder="FC-A-0001-000456"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Fecha Emisión</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Detalle del Insumo / Producto (Opcional)</label>
                <input
                  type="text"
                  placeholder="Lomo de ternera (15kg)"
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
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

      {/* Modal Registrar Pago o Bonificación */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> Registrar Pago o Bonificación a Proveedor
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3">
              {/* Buscador de Proveedor en el Modal */}
              <div className="relative">
                <label className="text-xs text-slate-400 block mb-1">Buscar Proveedor (Nombre o CUIT)</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Escribe el nombre o CUIT..."
                    value={supplierSearchQuery}
                    onChange={e => setSupplierSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                  />
                </div>

                {supplierSearchQuery && filteredSuppliersForPayment.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-800">
                    {filteredSuppliersForPayment.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setPaySupplierId(s.id);
                          setSupplierSearchQuery(s.name);
                        }}
                        className="w-full text-left p-2.5 text-xs hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 transition-colors flex items-center justify-between"
                      >
                        <span className="font-bold">{s.name}</span>
                        <span className="text-[10px] text-slate-500">Saldo: ${s.balanceDue.toLocaleString('es-AR')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedSupplier && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Proveedor Seleccionado:</span>
                    <span className="font-bold text-amber-400 text-sm">{selectedSupplier.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Saldo Pendiente:</span>
                    <span className="font-black text-rose-400 text-sm">${selectedSupplier.balanceDue.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

              {/* Selector de Factura Pendiente a Imputar (Opcional) */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Imputar a Factura Específica (Opcional)</label>
                <select
                  value={payInvoiceId}
                  onChange={e => {
                    setPayInvoiceId(e.target.value);
                    const inv = purchases.find(p => p.id === e.target.value);
                    if (inv) setPayAmount((inv.amount - (inv.paidAmount || 0)).toString());
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold"
                >
                  <option value="">Pago General a Cuenta del Proveedor</option>
                  {selectedSupplierInvoices.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.invoiceNumber} - Vence: {p.dueDate} - Saldo: ${(p.amount - (p.paidAmount || 0)).toLocaleString('es-AR')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Método de Pago / Ajuste</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-amber-300"
                  >
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="CHEQUE_PROPIO">Cheque Propio (Emitido)</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                    <option value="BONIFICACION_ACUERDO">✨ Bonificación / Acuerdo Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto a Descontar ($)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none font-bold text-emerald-400"
                    required
                  />
                </div>
              </div>

              {/* Si se paga con Cheque Propio */}
              {payMethod === 'CHEQUE_PROPIO' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-300 block">Datos del Cheque Emitido</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">N° Cheque</label>
                      <input
                        type="text"
                        placeholder="CHK-001234"
                        value={checkNumber}
                        onChange={e => setCheckNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Banco</label>
                      <input
                        type="text"
                        placeholder="Galicia / BBVA"
                        value={checkBank}
                        onChange={e => setCheckBank(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Vencimiento</label>
                      <input
                        type="date"
                        value={checkDueDate}
                        onChange={e => setCheckDueDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Si es Bonificación / Acuerdo Commercial */}
              {payMethod === 'BONIFICACION_ACUERDO' && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1 text-purple-200 text-xs">
                  <span className="font-bold text-purple-300 block flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-purple-400" /> Bonificación Comercial
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Este monto se descontará directamente de la cuenta del proveedor sin requerir movimiento de efectivo o banco.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas / Motivo del Pago o Descuento</label>
                <input
                  type="text"
                  placeholder="Ej. Descuento por volumen / Pago parcial comprobante"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
