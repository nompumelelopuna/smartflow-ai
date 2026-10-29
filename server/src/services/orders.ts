import { db } from '../db';

export const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'] as const;
const EDITABLE = ['supplier_id', 'description', 'quantity', 'unit_price', 'order_date', 'expected_delivery',
  'actual_delivery', 'status', 'tracking_number', 'notes', 'business_unit', 'placed_at', 'pod_received'];
const DATES = ['order_date', 'expected_delivery', 'actual_delivery', 'placed_at'];

export const today = () => new Date().toISOString().slice(0, 10);

export interface OrderRow {
  id: number; order_number: string; supplier_id: number; supplier_name: string;
  description: string; quantity: number; unit_price: number; order_date: string;
  expected_delivery: string | null; actual_delivery: string | null; status: string;
  tracking_number: string | null; notes: string | null;
  business_unit: string | null; placed_at: string | null; pod_received: number;
}

export function listOrders(filter: { status?: string; q?: string } = {}): OrderRow[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.status) { where.push('o.status = ?'); params.push(filter.status); }
  if (filter.q) {
    where.push('(o.order_number LIKE ? OR o.description LIKE ? OR s.name LIKE ? OR o.business_unit LIKE ?)');
    params.push(...Array(4).fill(`%${filter.q}%`));
  }
  return db.prepare(`SELECT o.*, s.name AS supplier_name FROM orders o JOIN suppliers s ON s.id = o.supplier_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY o.order_date DESC, o.id DESC`).all(...params) as OrderRow[];
}

export const getOrder = (id: number) =>
  db.prepare(`SELECT o.*, s.name AS supplier_name FROM orders o JOIN suppliers s ON s.id = o.supplier_id
    WHERE o.id = ?`).get(id) as OrderRow | undefined;

function clean(b: Record<string, any>) {
  const p: Record<string, any> = {};
  for (const k of EDITABLE) if (k in b) {
    const v = b[k];
    p[k] = typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : v;
  }
  if ('pod_received' in p) p.pod_received = p.pod_received ? 1 : 0;
  return p;
}

export function createOrder(b: Record<string, any>) {
  const p = clean(b);
  const next = (db.prepare('SELECT COALESCE(MAX(id),0)+1 AS n FROM orders').get() as { n: number }).n;
  const status = p.status ?? 'pending';
  const info = db.prepare(`INSERT INTO orders (order_number, supplier_id, description, quantity, unit_price,
    order_date, expected_delivery, status, tracking_number, notes, business_unit, placed_at, pod_received)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(`PO-${1000 + next}`, p.supplier_id, p.description,
    p.quantity ?? 1, p.unit_price ?? 0, p.order_date ?? today(), p.expected_delivery ?? null, status,
    p.tracking_number ?? null, p.notes ?? null, p.business_unit ?? null,
    p.placed_at ?? (status === 'shipped' || status === 'delivered' ? today() : null), p.pod_received ?? 0);
  return getOrder(Number(info.lastInsertRowid))!;
}

export function updateOrder(id: number, b: Record<string, any>) {
  const existing = getOrder(id)!;
  const p = clean(b);
  const status = p.status ?? existing.status;
  if ((status === 'shipped' || status === 'delivered') && !(p.placed_at ?? existing.placed_at)) p.placed_at = today();
  if (status === 'delivered' && !(p.actual_delivery ?? existing.actual_delivery)) p.actual_delivery = today();
  const keys = Object.keys(p);
  if (keys.length)
    db.prepare(`UPDATE orders SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`).run(...keys.map(k => p[k]), id);
  return getOrder(id);
}

export const deleteOrder = (id: number) => db.prepare('DELETE FROM orders WHERE id = ?').run(id).changes > 0;

export function validateOrder(b: Record<string, any>, partial = false): string | null {
  if (!partial || 'description' in b) if (typeof b.description !== 'string' || !b.description.trim()) return 'description is required';
  if (!partial || 'supplier_id' in b)
    if (!db.prepare('SELECT 1 FROM suppliers WHERE id = ?').get(b.supplier_id)) return 'valid supplier_id is required';
  if ('quantity' in b && !(Number.isInteger(Number(b.quantity)) && Number(b.quantity) > 0)) return 'quantity must be a positive whole number';
  for (const k of ['description', 'tracking_number', 'notes', 'business_unit'])
    if (typeof b[k] === 'string' && b[k].length > 500) return `${k} is too long`;
  if ('unit_price' in b && !(Number(b.unit_price) >= 0)) return 'unit_price cannot be negative';
  if ('status' in b && !STATUSES.includes(b.status)) return 'invalid status';
  for (const k of DATES) if (b[k] && !/^\d{4}-\d{2}-\d{2}$/.test(b[k])) return `${k} must be YYYY-MM-DD`;
  return null;
}
