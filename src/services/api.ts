import { User, Order, Invoice, Notification, DeliveryJob } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function healthCheck() {
  return request<{ ok: boolean; service: string }>('/health');
}

export async function loginUser(role: string, userId?: string) {
  return request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, userId }),
  });
}

export async function fetchOrders() {
  return request<Order[]>('/orders');
}

export async function fetchOrderById(orderId: string) {
  return request<Order>(`/orders/${orderId}`);
}

export async function fetchDashboardData(role: string) {
  return request<{
    role: string;
    totalOrders: number;
    activeOrders: number;
    revenue: number;
    outstanding: number;
    stageCounts: Array<{ key: string; label: string; count: number }>;
    notifications: Notification[];
  }>(`/dashboard?role=${encodeURIComponent(role)}`);
}

export async function fetchClientHomeData(userId: string) {
  return request<{
    orders: Order[];
    invoices: Invoice[];
    outstandingBalance: number;
    notifications: Notification[];
  }>(`/home?userId=${encodeURIComponent(userId)}`);
}

export async function fetchDeliveryJobs(driverId: string) {
  return request<DeliveryJob[]>(`/delivery-jobs?driverId=${encodeURIComponent(driverId)}`);
}

export async function fetchInvoices(userId: string) {
  return request<Invoice[]>(`/invoices?userId=${encodeURIComponent(userId)}`);
}

export async function fetchNotifications(userId?: string, role?: string) {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (role) params.set('role', role);
  return request<Notification[]>(`/notifications${params.toString() ? `?${params.toString()}` : ''}`);
}
