'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Sale,
  Supplier,
  PurchaseInvoice,
  SupplierPayment,
  Expense,
  Check,
  Employee,
  Advance,
  Dish,
  ChatMessage
} from '../types/gastronomy';

interface GastronomyContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'netAmount'>) => void;
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balanceDue'>) => void;
  purchases: PurchaseInvoice[];
  addPurchase: (purchase: Omit<PurchaseInvoice, 'id'>) => void;
  supplierPayments: SupplierPayment[];
  addSupplierPayment: (payment: Omit<SupplierPayment, 'id'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  checks: Check[];
  addCheck: (check: Omit<Check, 'id'>) => void;
  employees: Employee[];
  advances: Advance[];
  addAdvance: (advance: Omit<Advance, 'id'>) => void;
  dishes: Dish[];
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => Promise<void>;
  // Computed KPIs
  totalSalesNetMonth: number;
  totalPurchasesMonth: number;
  totalLaborMonth: number;
  primeCostPercentage: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  totalFixedExpensesMonth: number;
  netProfitEstMonth: number;
  breakEvenTarget: number;
  pendingChecksAmount7Days: number;
  pendingServicesAmount: number;
  totalCoversMonth: number;
  averageTicketPerCover: number;
  totalSupplierDebt: number;
}

const INITIAL_SALES: Sale[] = [
  { id: 's1', date: '2026-09-01', shift: 'MEDIODIA', covers: 35, channel: 'SALON', paymentMethod: 'EFECTIVO', grossAmount: 450000, commissionAmount: 0, netAmount: 450000 },
  { id: 's2', date: '2026-09-01', shift: 'NOCHE', covers: 42, channel: 'SALON', paymentMethod: 'MERCADO_PAGO', grossAmount: 380000, commissionAmount: 7600, netAmount: 372400 },
  { id: 's3', date: '2026-09-01', shift: 'NOCHE', covers: 15, channel: 'RAPPI', paymentMethod: 'CREDITO', grossAmount: 180000, commissionAmount: 36000, netAmount: 144000 },
  { id: 's4', date: '2026-09-02', shift: 'MEDIODIA', covers: 48, channel: 'SALON', paymentMethod: 'DEBITO', grossAmount: 520000, commissionAmount: 7800, netAmount: 512200 },
  { id: 's5', date: '2026-09-02', shift: 'NOCHE', covers: 22, channel: 'PEDIDOS_YA', paymentMethod: 'MERCADO_PAGO', grossAmount: 210000, commissionAmount: 42000, netAmount: 168000 },
  { id: 's6', date: '2026-09-03', shift: 'NOCHE', covers: 55, channel: 'SALON', paymentMethod: 'EFECTIVO', grossAmount: 610000, commissionAmount: 0, netAmount: 610000 },
  { id: 's7', date: '2026-09-03', shift: 'MEDIODIA', covers: 18, channel: 'TAKEAWAY', paymentMethod: 'TRANSFERENCIA', grossAmount: 140000, commissionAmount: 0, netAmount: 140000 },
  { id: 's8', date: '2026-09-04', shift: 'NOCHE', covers: 40, channel: 'SALON', paymentMethod: 'MERCADO_PAGO', grossAmount: 490000, commissionAmount: 9800, netAmount: 480200 },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Distribuidora Carnes del Sur', cuit: '30-71234567-8', category: 'Carnes, Achuras & Pollo', phone: '11-4567-8901', email: 'ventas@carnesdelsur.com', paymentTermDays: 15, balanceDue: 8277575 },
  { id: 'sup2', name: 'Verdulería Central BAZ', cuit: '20-31987654-3', category: 'Verdulería, Frutas & Hortalizas', phone: '11-5678-1234', email: 'pedidos@verduleriabaz.com', paymentTermDays: 7, balanceDue: 85000 },
  { id: 'sup3', name: 'Bebidas & Licores Express', cuit: '30-68912345-1', category: 'Bebidas, Vinos, Licores & Cervezas', phone: '11-3456-7890', email: 'proveedores@licoresexpress.com', paymentTermDays: 30, balanceDue: 0 },
  { id: 'sup4', name: 'BeerTan Cervezas Artesanales', cuit: '30-79812345-6', category: 'Bebidas, Vinos, Licores & Cervezas', phone: '11-9876-5432', email: 'contacto@beertan.com', paymentTermDays: 15, balanceDue: 0 },
  { id: 'sup5', name: 'Panificadora El Sol', cuit: '30-65432198-7', category: 'Panadería, Pastelería & Bollería', phone: '11-4321-8765', email: 'ventas@panificadoraelsol.com', paymentTermDays: 15, balanceDue: 0 },
  { id: 'sup6', name: 'Lácteos & Quesos San Martín', cuit: '30-74561238-9', category: 'Lácteos, Quesos & Cremas', phone: '11-8765-4321', email: 'pedidos@lacteossanmartin.com', paymentTermDays: 15, balanceDue: 0 },
  { id: 'sup7', name: 'Angelani', cuit: '30-71984210-5', category: 'Carnes, Achuras & Pollo', phone: '11-4455-6677', email: 'ventas@angelani.com.ar', paymentTermDays: 15, balanceDue: 0 },
];

const INITIAL_PURCHASES: PurchaseInvoice[] = [
  {
    id: 'p0', supplierId: 'sup1', supplierName: 'Distribuidora Carnes del Sur', invoiceNumber: 'FC-A-0001-0003980',
    date: '2026-08-15', dueDate: '2026-08-30', amount: 7857575, paidAmount: 0, status: 'PENDIENTE',
    items: [
      { description: 'Factura Compra Insumos Frigorífico (Agosto)', qty: 1, unitPrice: 7857575 }
    ]
  },
  {
    id: 'p1', supplierId: 'sup1', supplierName: 'Distribuidora Carnes del Sur', invoiceNumber: 'FC-A-0001-0004512',
    date: '2026-09-01', dueDate: '2026-09-16', amount: 420000, paidAmount: 0, status: 'PENDIENTE',
    items: [
      { description: 'Ojo de Bife (kg)', qty: 40, unitPrice: 8500, prevUnitPrice: 7900 },
      { description: 'Lomo (kg)', qty: 10, unitPrice: 8000, prevUnitPrice: 8000 },
    ]
  },
  {
    id: 'p2', supplierId: 'sup2', supplierName: 'Verdulería Central BAZ', invoiceNumber: 'FC-B-0002-0001290',
    date: '2026-09-02', dueDate: '2026-09-09', amount: 85000, paidAmount: 0, status: 'PENDIENTE',
    items: [
      { description: 'Papas (Bolsa 20kg)', qty: 5, unitPrice: 9000 },
      { description: 'Verdura Hoja Mix', qty: 10, unitPrice: 4000 },
    ]
  },
  {
    id: 'p3', supplierId: 'sup3', supplierName: 'Bebidas & Licores Express', invoiceNumber: 'FC-A-0005-0008819',
    date: '2026-08-25', dueDate: '2026-09-25', amount: 210000, paidAmount: 210000, status: 'PAGADO',
    items: [
      { description: 'Cerveza Artesanal 500ml (Caja)', qty: 10, unitPrice: 15000 },
      { description: 'Gaseosas 1.5L (Caja)', qty: 4, unitPrice: 15000 },
    ]
  }
];

const INITIAL_SUPPLIER_PAYMENTS: SupplierPayment[] = [
  {
    id: 'pay1',
    supplierId: 'sup3',
    supplierName: 'Bebidas & Licores Express',
    invoiceId: 'p3',
    invoiceNumber: 'FC-A-0005-0008819',
    date: '2026-08-28',
    paymentMethod: 'TRANSFERENCIA',
    amount: 210000,
    notes: 'Pago total de factura de bebidas por transferencia bancaria'
  }
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', date: '2026-09-01', category: 'ALQUILER', type: 'FIJO', description: 'Alquiler Salón Comercial', amount: 850000, paymentMethod: 'TRANSFERENCIA BANCARIA', dueDate: '2026-09-01', status: 'PAGADO' },
  { id: 'e2', date: '2026-09-02', category: 'LUZ', type: 'SERVICIO', description: 'Usina Popular de Electricidad', amount: 195000, paymentMethod: 'TRANSFERENCIA BANCARIA', dueDate: '2026-09-02', status: 'PAGADO' },
  { id: 'e3', date: '2026-09-02', category: 'GAS', type: 'SERVICIO', description: 'Camuzzi Gas Pampeana', amount: 82000, paymentMethod: 'EFECTIVO (Caja Chica)', dueDate: '2026-09-02', status: 'PAGADO' },
  { id: 'e4', date: '2026-09-03', category: 'SOFTWARE', type: 'FIJO', description: 'Abono Sistema POS / Fudo', amount: 35000, paymentMethod: 'TARJETA DE CRÉDITO', dueDate: '2026-09-03', status: 'PAGADO' },
];

const INITIAL_CHECKS: Check[] = [
  { id: 'c1', type: 'PROPIO', number: 'CHK-009812', bank: 'Banco Galicia', issuerOrRecipient: 'Distribuidora Carnes del Sur', issueDate: '2026-09-01', dueDate: '2026-09-08', amount: 250000, status: 'PENDIENTE', notes: 'Pago a cuenta factura de carne' },
  { id: 'c2', type: 'TERCERO', number: 'CHK-441029', bank: 'BBVA', issuerOrRecipient: 'Verdulería Central BAZ', issueDate: '2026-08-28', dueDate: '2026-09-22', amount: 180000, status: 'ENDOSADO', notes: 'Endosado como pago a proveedor de verduras' },
  { id: 'c3', type: 'PROPIO', number: 'CHK-010452', bank: 'Santander', issuerOrRecipient: 'Distribuidora Carnes del Sur', issueDate: '2026-09-02', dueDate: '2026-10-15', amount: 420000, status: 'PENDIENTE', notes: 'Diferido compra lomo y ojo de bife' },
  { id: 'c4', type: 'PROPIO', number: 'CHK-010453', bank: 'Banco Galicia', issuerOrRecipient: 'Bebidas & Licores Express', issueDate: '2026-09-03', dueDate: '2026-10-28', amount: 310000, status: 'PENDIENTE', notes: 'Diferido pedido cerveza artesanal' },
  { id: 'c5', type: 'PROPIO', number: 'CHK-011890', bank: 'Macro', issuerOrRecipient: 'Distribuidora Carnes del Sur', issueDate: '2026-09-04', dueDate: '2026-11-10', amount: 580000, status: 'PENDIENTE', notes: 'Diferido reposición frigorífica' },
  { id: 'c6', type: 'PROPIO', number: 'CHK-011891', bank: 'BBVA', issuerOrRecipient: 'Lácteos La Serenísima', issueDate: '2026-09-04', dueDate: '2026-11-25', amount: 290000, status: 'PENDIENTE', notes: 'Diferido provisión quesos y crema' },
  { id: 'c7', type: 'PROPIO', number: 'CHK-012301', bank: 'Banco Galicia', issuerOrRecipient: 'Distribuidora Carnes del Sur', issueDate: '2026-09-04', dueDate: '2026-12-12', amount: 640000, status: 'PENDIENTE', notes: 'Diferido fiesta de fin de año' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Carlos Rodríguez', role: 'COCINA', baseSalary: 650000, paymentType: 'MENSUAL', active: true },
  { id: 'emp2', name: 'Lucía Méndez', role: 'MOZO', baseSalary: 480000, paymentType: 'MENSUAL', active: true },
  { id: 'emp3', name: 'Marcos Benítez', role: 'BARRA', baseSalary: 520000, paymentType: 'MENSUAL', active: true },
  { id: 'emp4', name: 'Sofía Gomez', role: 'LIMPIEZA', baseSalary: 420000, paymentType: 'MENSUAL', active: true },
];

const INITIAL_ADVANCES: Advance[] = [
  { id: 'adv1', employeeId: 'emp1', employeeName: 'Carlos Rodríguez', date: '2026-09-02', amount: 50000, notes: 'Adelanto de quincena' },
  { id: 'adv2', employeeId: 'emp2', employeeName: 'Lucía Méndez', date: '2026-09-03', amount: 30000, notes: 'Adelanto emergente' },
];

const INITIAL_DISHES: Dish[] = [
  { id: 'd1', name: 'Ojo de Bife con Papas Rústicas', category: 'PRINCIPAL', salesPrice: 14500, costPrice: 4800, salesVolumeMonth: 180, classification: 'ESTRELLA' },
  { id: 'd2', name: 'Milanesa Napolitana para compartir', category: 'PRINCIPAL', salesPrice: 16000, costPrice: 5100, salesVolumeMonth: 210, classification: 'ESTRELLA' },
  { id: 'd3', name: 'Hamburguesa Triple Gourmet', category: 'PRINCIPAL', salesPrice: 9800, costPrice: 3100, salesVolumeMonth: 140, classification: 'VACALUCHERA' },
  { id: 'd4', name: 'Risotto de Hongos Silvestres', category: 'PRINCIPAL', salesPrice: 12000, costPrice: 5900, salesVolumeMonth: 35, classification: 'INCOGNITA' },
  { id: 'd5', name: 'Ensalada César con Pollo', category: 'ENTRADA', salesPrice: 7500, costPrice: 3800, salesVolumeMonth: 25, classification: 'PERRO' },
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'assistant',
    text: '¡Hola! Soy tu Asistente Financiero y Administrativo IA para el restaurante. Puedo responder preguntas sobre tus ventas, pagos a proveedores, cheques, sueldos y estado de rentabilidad en tiempo real. ¿En qué puedo ayudarte hoy?',
    timestamp: '18:35'
  }
];

const GastronomyContext = createContext<GastronomyContextType | undefined>(undefined);

export const GastronomyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(INITIAL_PURCHASES);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(INITIAL_SUPPLIER_PAYMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [advances, setAdvances] = useState<Advance[]>(INITIAL_ADVANCES);
  const [dishes] = useState<Dish[]>(INITIAL_DISHES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  useEffect(() => {
    try {
      const savedSales = localStorage.getItem('gastro_sales');
      if (savedSales) setSales(JSON.parse(savedSales));
      const savedRole = localStorage.getItem('gastro_role');
      if (savedRole) setRole(savedRole as UserRole);

      const savedSuppliers = localStorage.getItem('gastro_suppliers');
      if (savedSuppliers) {
        const parsed: Supplier[] = JSON.parse(savedSuppliers);
        const merged = [...parsed];
        for (const initSup of INITIAL_SUPPLIERS) {
          if (!merged.some(s => s.name.toLowerCase().trim() === initSup.name.toLowerCase().trim())) {
            merged.push(initSup);
          }
        }
        setSuppliers(merged);
      }

      const savedPurchases = localStorage.getItem('gastro_purchases');
      if (savedPurchases) setPurchases(JSON.parse(savedPurchases));

      const savedPayments = localStorage.getItem('gastro_supplier_payments');
      if (savedPayments) setSupplierPayments(JSON.parse(savedPayments));

      const savedExpenses = localStorage.getItem('gastro_expenses');
      if (savedExpenses) {
        const parsed: Expense[] = JSON.parse(savedExpenses);
        setExpenses(parsed.map(e => ({
          ...e,
          paymentMethod: e.paymentMethod || (e.category === 'LUZ' || e.category === 'ALQUILER' || e.category === 'SOFTWARE' ? 'TRANSFERENCIA BANCARIA' : 'EFECTIVO (Caja Chica)')
        })));
      }

      const savedChecks = localStorage.getItem('gastro_checks');
      if (savedChecks) setChecks(JSON.parse(savedChecks));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addSale = (saleData: Omit<Sale, 'id' | 'netAmount'>) => {
    const netAmount = saleData.grossAmount - saleData.commissionAmount;
    const newSale: Sale = { ...saleData, id: `s_${Date.now()}`, netAmount };
    setSales(prev => {
      const updated = [newSale, ...prev];
      try { localStorage.setItem('gastro_sales', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'balanceDue'>) => {
    const newSup: Supplier = { ...supplierData, id: `sup_${Date.now()}`, balanceDue: 0 };
    setSuppliers(prev => {
      const updated = [...prev, newSup];
      try { localStorage.setItem('gastro_suppliers', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addPurchase = (purchaseData: Omit<PurchaseInvoice, 'id'>) => {
    const newPurchase: PurchaseInvoice = { ...purchaseData, id: `p_${Date.now()}`, paidAmount: 0, status: 'PENDIENTE' };
    setPurchases(prev => {
      const updated = [newPurchase, ...prev];
      try { localStorage.setItem('gastro_purchases', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Aumentar saldo adeudado del proveedor
    setSuppliers(prev => {
      const updated = prev.map(s => s.id === purchaseData.supplierId ? { ...s, balanceDue: s.balanceDue + purchaseData.amount } : s);
      try { localStorage.setItem('gastro_suppliers', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addSupplierPayment = (paymentData: Omit<SupplierPayment, 'id'>) => {
    const newPayment: SupplierPayment = { ...paymentData, id: `pay_${Date.now()}` };
    setSupplierPayments(prev => {
      const updated = [newPayment, ...prev];
      try { localStorage.setItem('gastro_supplier_payments', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // 1. Descontar saldo adeudado del proveedor
    setSuppliers(prev => {
      const updated = prev.map(s => {
        if (s.id === paymentData.supplierId) {
          const newBalance = Math.max(0, s.balanceDue - paymentData.amount);
          return { ...s, balanceDue: newBalance };
        }
        return s;
      });
      try { localStorage.setItem('gastro_suppliers', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // 2. Si se especificó una factura, actualizar su monto pagado y estado
    if (paymentData.invoiceId) {
      setPurchases(prev => {
        const updated = prev.map(inv => {
          if (inv.id === paymentData.invoiceId) {
            const currentPaid = inv.paidAmount || 0;
            const newPaid = currentPaid + paymentData.amount;
            let newStatus: PurchaseInvoice['status'] = 'PARCIAL';
            if (newPaid >= inv.amount) {
              newStatus = 'PAGADO';
            }
            return { ...inv, paidAmount: newPaid, status: newStatus };
          }
          return inv;
        });
        try { localStorage.setItem('gastro_purchases', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }

    // 3. Si el pago se realizó con Cheque (Propio o Tercero), registrarlo/reflejarlo en el módulo Cheques
    if (paymentData.paymentMethod === 'CHEQUE_PROPIO' || paymentData.paymentMethod === 'CHEQUE_TERCERO') {
      const newCheck: Check = {
        id: `c_${Date.now()}`,
        type: paymentData.paymentMethod === 'CHEQUE_PROPIO' ? 'PROPIO' : 'TERCERO',
        number: paymentData.checkNumber || `CHK-${Date.now().toString().slice(-6)}`,
        bank: paymentData.bank || 'Banco Galicia',
        issuerOrRecipient: paymentData.supplierName,
        issueDate: paymentData.date,
        dueDate: paymentData.dueDate || paymentData.date,
        amount: paymentData.amount,
        status: paymentData.paymentMethod === 'CHEQUE_PROPIO' ? 'PENDIENTE' : 'ENDOSADO',
        notes: `Entregado como pago a proveedor ${paymentData.supplierName} (${paymentData.invoiceNumber || 'Pago general'})`
      };
      setChecks(prev => {
        const updated = [newCheck, ...prev];
        try { localStorage.setItem('gastro_checks', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...expenseData, id: `e_${Date.now()}` };
    setExpenses(prev => {
      const updated = [newExp, ...prev];
      try { localStorage.setItem('gastro_expenses', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addCheck = (checkData: Omit<Check, 'id'>) => {
    const newChk: Check = { ...checkData, id: `c_${Date.now()}` };
    setChecks(prev => {
      const updated = [newChk, ...prev];
      try { localStorage.setItem('gastro_checks', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    // Verificar si el destinatario/proveedor coincide con un proveedor en la base de datos
    const targetSupplier = suppliers.find(
      s => s.name.toLowerCase().trim() === checkData.issuerOrRecipient.toLowerCase().trim()
    );

    if (targetSupplier) {
      // 1. Descontar saldo adeudado del proveedor
      setSuppliers(prev => {
        const updated = prev.map(s => {
          if (s.id === targetSupplier.id) {
            const newBalance = Math.max(0, s.balanceDue - checkData.amount);
            return { ...s, balanceDue: newBalance };
          }
          return s;
        });
        try { localStorage.setItem('gastro_suppliers', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });

      // 2. Imputar a la factura pendiente más antigua si existe
      const oldestPendingInvoice = purchases.find(
        p => p.supplierId === targetSupplier.id && p.status !== 'PAGADO'
      );

      if (oldestPendingInvoice) {
        setPurchases(prev => {
          const updated = prev.map(inv => {
            if (inv.id === oldestPendingInvoice.id) {
              const currentPaid = inv.paidAmount || 0;
              const newPaid = currentPaid + checkData.amount;
              const newStatus: PurchaseInvoice['status'] = newPaid >= inv.amount ? 'PAGADO' : 'PARCIAL';
              return { ...inv, paidAmount: newPaid, status: newStatus };
            }
            return inv;
          });
          try { localStorage.setItem('gastro_purchases', JSON.stringify(updated)); } catch (e) {}
          return updated;
        });
      }

      // 3. Registrar el pago en el historial de pagos a proveedores
      const newPayment: SupplierPayment = {
        id: `pay_${Date.now()}`,
        supplierId: targetSupplier.id,
        supplierName: targetSupplier.name,
        invoiceId: oldestPendingInvoice?.id,
        invoiceNumber: oldestPendingInvoice?.invoiceNumber,
        date: checkData.issueDate || new Date().toISOString().split('T')[0],
        paymentMethod: checkData.type === 'PROPIO' ? 'CHEQUE_PROPIO' : 'CHEQUE_TERCERO',
        amount: checkData.amount,
        checkNumber: checkData.number,
        bank: checkData.bank,
        dueDate: checkData.dueDate,
        notes: `Pago registrado desde la Chequera (Cheque N° ${checkData.number})`
      };

      setSupplierPayments(prev => {
        const updated = [newPayment, ...prev];
        try { localStorage.setItem('gastro_supplier_payments', JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }
  };

  const addAdvance = (advanceData: Omit<Advance, 'id'>) => {
    const newAdv: Advance = { ...advanceData, id: `adv_${Date.now()}` };
    setAdvances([newAdv, ...advances]);
  };

  // Cálculos de KPIs cruzados
  const totalSalesNetMonth = sales.reduce((acc, s) => acc + s.netAmount, 0);
  const totalPurchasesMonth = purchases.reduce((acc, p) => acc + p.amount, 0);
  const totalLaborMonth = employees.reduce((acc, e) => acc + e.baseSalary, 0);
  const totalFixedExpensesMonth = expenses.filter(e => e.type === 'FIJO' || e.type === 'SERVICIO').reduce((acc, e) => acc + e.amount, 0);

  const totalCoversMonth = sales.reduce((acc, s) => acc + (s.covers || 0), 0);
  const averageTicketPerCover = totalCoversMonth > 0 ? totalSalesNetMonth / totalCoversMonth : 0;
  const totalSupplierDebt = suppliers.reduce((acc, s) => acc + s.balanceDue, 0);

  const foodCostPercentage = totalSalesNetMonth > 0 ? (totalPurchasesMonth / totalSalesNetMonth) * 100 : 0;
  const laborCostPercentage = totalSalesNetMonth > 0 ? (totalLaborMonth / totalSalesNetMonth) * 100 : 0;
  const primeCostPercentage = foodCostPercentage + laborCostPercentage;

  const netProfitEstMonth = totalSalesNetMonth - (totalPurchasesMonth + totalLaborMonth + totalFixedExpensesMonth);
  const breakEvenTarget = 2800000;

  const pendingChecksAmount7Days = checks
    .filter(c => c.status === 'PENDIENTE')
    .reduce((acc, c) => acc + c.amount, 0);

  const pendingServicesAmount = expenses
    .filter(e => e.status === 'PENDIENTE')
    .reduce((acc, e) => acc + e.amount, 0);

  const sendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          contextData: {
            totalSalesNetMonth,
            totalPurchasesMonth,
            totalLaborMonth,
            totalFixedExpensesMonth,
            primeCostPercentage,
            foodCostPercentage,
            laborCostPercentage,
            netProfitEstMonth,
            pendingChecksAmount7Days,
            pendingServicesAmount,
            totalCoversMonth,
            averageTicketPerCover,
            totalSupplierDebt,
            suppliers,
            purchases,
            supplierPayments,
            expenses,
            checks,
            employees
          }
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No pude obtener una respuesta en este momento.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataSnippet: data.snippet
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: `📊 **Resumen Financiero Automatizado**:\n\n- **Facturación Neta Total**: $${totalSalesNetMonth.toLocaleString('es-AR')}\n- **Deuda Total con Proveedores**: $${totalSupplierDebt.toLocaleString('es-AR')}\n- **Cubiertos Totales**: ${totalCoversMonth} (Ticket Promedio: $${Math.round(averageTicketPerCover).toLocaleString('es-AR')})\n- **Prime Cost Actual**: ${primeCostPercentage.toFixed(1)}%\n- **Cheques Pendientes**: $${pendingChecksAmount7Days.toLocaleString('es-AR')}\n- **Servicios por Pagar**: $${pendingServicesAmount.toLocaleString('es-AR')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    }
  };

  return (
    <GastronomyContext.Provider
      value={{
        role,
        setRole,
        sales,
        addSale,
        suppliers,
        addSupplier,
        purchases,
        addPurchase,
        supplierPayments,
        addSupplierPayment,
        expenses,
        addExpense,
        checks,
        addCheck,
        employees,
        advances,
        addAdvance,
        dishes,
        chatMessages,
        sendChatMessage,
        totalSalesNetMonth,
        totalPurchasesMonth,
        totalLaborMonth,
        primeCostPercentage,
        foodCostPercentage,
        laborCostPercentage,
        totalFixedExpensesMonth,
        netProfitEstMonth,
        breakEvenTarget,
        pendingChecksAmount7Days,
        pendingServicesAmount,
        totalCoversMonth,
        averageTicketPerCover,
        totalSupplierDebt
      }}
    >
      {children}
    </GastronomyContext.Provider>
  );
};

export const useGastronomy = () => {
  const context = useContext(GastronomyContext);
  if (!context) throw new Error('useGastronomy debe usarse dentro de GastronomyProvider');
  return context;
};
