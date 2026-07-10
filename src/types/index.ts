export type UserRole = 'admin' | 'client' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
  phone?: string;
}

export type OrderStage =
  | 'received'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received_at_facility'
  | 'sorting'
  | 'washing'
  | 'drying'
  | 'pressing'
  | 'quality_check'
  | 'packing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  weight?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  items: OrderItem[];
  status: OrderStatus;
  stage: OrderStage;
  total: number;
  weight: number;
  pickupDate: string;
  deliveryDate: string;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignedDriverId?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  amount: number;
  method: 'card' | 'ach' | 'check' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface LinenItem {
  id: string;
  clientId: string;
  name: string;
  category: string;
  parLevel: number;
  currentStock: number;
  inUse: number;
  inLaundry: number;
  damaged: number;
  unit: string;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'pickup' | 'delivery';
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  clientName: string;
  clientCompany: string;
  address: string;
  contactPhone: string;
  scheduledTime: string;
  completedTime?: string;
  notes?: string;
  driverId: string;
}

export interface Notification {
  id: string;
  userId?: string;
  role?: UserRole;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  activeOrders: number;
  totalOrders: number;
  outstandingBalance: number;
  status: 'active' | 'inactive';
}

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockLevel: number;
  reorderPoint: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
}
