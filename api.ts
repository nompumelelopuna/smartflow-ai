import type { Order, ReportKey, ReportResult, Summary, Supplier, User } from './types';

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (f: () => void) => { onUnauthorized = f; };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', ...init });
  if (res.status === 401 && !url.startsWith('/api/auth/login') && !url.startsWith('/api/auth/me')) onUnauthorized();
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.status === 204 ? (undefined as T) : res.json();
}
const body = (method: string, data: unknown) => ({ method, body: JSON.stringify(data) });

export const api = {
  me: () => request<User>('/api/auth/me'),
  login: (email: string, password: string) => request<User>('/api/auth/login', body('POST', { email, password })),
  register: (name: string, email: string, password: string) =>
    request<User>('/api/auth/register', body('POST', { name, email, password })),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  summary: () => request<Summary>('/api/reports/summary'),
  report: (k: ReportKey) => request<ReportResult>(`/api/reports/${k}`),
  suppliers: () => request<Supplier[]>('/api/suppliers'),
  saveSupplier: (s: Partial<Supplier>) =>
    s.id ? request(`/api/suppliers/${s.id}`, body('PUT', s)) : request('/api/suppliers', body('POST', s)),
  deleteSupplier: (id: number) => request<void>(`/api/suppliers/${id}`, { method: 'DELETE' }),
  orders: (q = '', status = '') => request<Order[]>(`/api/orders?q=${encodeURIComponent(q)}&status=${status}`),
  saveOrder: (o: Partial<Order>) =>
    o.id ? request<Order>(`/api/orders/${o.id}`, body('PUT', o)) : request<Order>('/api/orders', body('POST', o)),
  deleteOrder: (id: number) => request<void>(`/api/orders/${id}`, { method: 'DELETE' }),
  assistantStatus: () => request<{ mode: 'demo' | 'live' }>('/api/assistant/status'),
  ask: (message: string) =>
    request<{ mode: 'demo' | 'live'; reply: string; note?: string }>('/api/assistant', body('POST', { message })),
};

const zar = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
export const money = (n: number) => zar.format(n);
