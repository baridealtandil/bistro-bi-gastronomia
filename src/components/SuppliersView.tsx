'use client';

import React, { useState } from 'react';
import { useGastronomy } from '../context/GastronomyContext';
import { Plus, Camera, AlertTriangle, Truck, DollarSign, FileText, Check } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, purchases, addPurchase, addSupplier } = useGastronomy();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
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
  const [supPhone, setSupPhone] = useState('');

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
    }, 1500);
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
      phone: supPhone,
      email: '',
      paymentTermDays: 15
    });

    setSupName('');
    setSupCuit('');
    setShowSupplierModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Gestión de Proveedores y Facturas de Compra
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Rastrea deudas, variaciones de precios de materia prima y escanea facturas por IA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            + Nuevo Proveedor
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            + Cargar Factura (OCR)
          </button>
        </div>
      </div>

      {/* Alerta de Aumentos de Precios */}
      <div className="bg-amber-950/30 border border-amber-800/50 p-4 rounded-2xl flex items-start gap-3 text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-sm block text-amber-300">Alerta de Variación de Precio Detectada</span>
          En la última compra a <strong>Distribuidora Carnes del Sur</strong>, el costo de <em>Ojo de Bife</em> subió un <strong>+7.5%</strong> ($7,900 a $8,500/kg). Se recomienda revisar margen en carta.
        </div>
      </div>

      {/* Proveedores y saldos adeudados */}
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

      {/* Tabla de Facturas de Compra */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Historial de Facturas de Compras de Insumos</h3>
          <span className="text-xs text-slate-400">{purchases.length} facturas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Factura #</th>
                <th className="p-3">Proveedor</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Vencimiento</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium text-white whitespace-nowrap">{p.invoiceNumber}</td>
                  <td className="p-3 text-slate-300">{p.supplierName}</td>
                  <td className="p-3 text-slate-400">{p.date}</td>
                  <td className="p-3 text-slate-400">{p.dueDate}</td>
                  <td className="p-3 text-white font-bold">${p.amount.toLocaleString('es-AR')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'PAGADO'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Carga Factura OCR */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cargar Factura de Compra</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
            </div>

            {/* Simulación OCR */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">CUIT</label>
                  <input
                    type="text"
                    placeholder="30-12345678-9"
                    value={supCuit}
                    onChange={e => setSupCuit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Rubro / Categoría</label>
                  <select
                    value={supCategory}
                    onChange={e => setSupCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Carnes">Carnes</option>
                    <option value="Verduras">Verduras</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Envasados">Envasados</option>
                  </select>
                </div>
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
