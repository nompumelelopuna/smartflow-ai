import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import OrderForm from '../components/OrderForm';
import OrdersTable from '../components/OrdersTable';
import type { Order, Supplier } from '../types';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<{ order?: Order } | null>(null);

  const load = useCallback(() => api.orders(q, status).then(setOrders), [q, status]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.suppliers().then(setSuppliers); }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search orders…" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {['pending', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
        <a href="/api/orders/export.csv" className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">Export CSV</a>
        <button onClick={() => setForm({})} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">+ New order</button>
      </div>
      <OrdersTable orders={orders} onEdit={o => setForm({ order: o })}
        onDelete={async o => { if (confirm(`Delete ${o.order_number}?`)) { await api.deleteOrder(o.id); load(); } }} />
      {form && <OrderForm suppliers={suppliers} order={form.order} onClose={() => setForm(null)}
        onSaved={() => { setForm(null); load(); }} />}
    </div>
  );
}
