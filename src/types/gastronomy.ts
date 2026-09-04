export type UserRole = 'ADMIN' | 'COLLABORATOR';

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  shift: 'MEDIODIA' | 'NOCHE';
  covers: number; // Registro de cubiertos / comensales
  channel: 'SALON' | 'TAKEAWAY' | 'DELIVERY_PROPIO' | 'RAPPI' | 'PEDIDOS_YA';
  paymentMethod: 'EFECTIVO' | 'MERCADO_PAGO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA';
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  cuit: string;
  category: string; // Carne, Verdura, Bebidas, Lácteos, Envasados, etc.
  phone: string;
  email: string;
  paymentTermDays: number;
  balanceDue: number;
}

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  status: 'PENDIENTE' | 'PARCIAL' | 'PAGADO' | 'VENCIDO';
  items: { description: string; qty: number; unitPrice: number; prevUnitPrice?: number }[];
  fileUrl?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  date: string;
  paymentMethod: 'CHEQUE_PROPIO' | 'CHEQUE_TERCERO' | 'EFECTIVO' | 'TRANSFERENCIA';
  amount: number;
  checkNumber?: string;
  bank?: string;
  dueDate?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'ALQUILER' | 'LUZ' | 'GAS' | 'AGUA' | 'INTERNET' | 'SOFTWARE' | 'MANTENIMIENTO' | 'MARKETING' | 'IMPREVISTOS';
  type: 'FIJO' | 'VARIABLE' | 'SERVICIO';
  description: string;
  amount: number;
  dueDate?: string;
  status: 'PENDIENTE' | 'PAGADO';
}

export interface Check {
  id: string;
  type: 'PROPIO' | 'TERCERO';
  number: string;
  bank: string;
  issuerOrRecipient: string; // Nombre del proveedor o cliente
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'PENDIENTE' | 'COBRADO' | 'DEPOSITADO' | 'ENDOSADO' | 'ANULADO';
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'COCINA' | 'MOZO' | 'BARRA' | 'ENCAJERO' | 'LIMPIEZA' | 'GERENTE';
  baseSalary: number;
  paymentType: 'MENSUAL' | 'JORNAL';
  active: boolean;
}

export interface Advance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Tip {
  id: string;
  date: string;
  totalTips: number;
  distributedAmount: number;
}

export interface Dish {
  id: string;
  name: string;
  category: 'ENTRADA' | 'PRINCIPAL' | 'POSTRE' | 'BEBIDA';
  salesPrice: number;
  costPrice: number;
  salesVolumeMonth: number;
  classification: 'ESTRELLA' | 'VACALUCHERA' | 'INCOGNITA' | 'PERRO';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataSnippet?: any;
}
