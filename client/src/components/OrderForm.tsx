import { useState } from 'react';
import { api } from '../api';
import type { Order, Supplier } from '../types';

const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm';
const lab = 'block text-xs text-slate-500';

export default function OrderForm({ suppliers, order, onClose, onSaved }:
  { suppliers: Supplier[]; order?: Order; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Partial<Order>>(order ?? { supplier_id: suppliers[0]?.id, description: '', quantity: 1,
    unit_price: 0, status: 'pending', pod_received: 0 });
  const [error, setError] = useState('');
  const set = (k: keyof Order, v: unknown) => setF({ ...f, [k]: v });

  async function submit() {
    try { await api.saveOrder({ ...f, expected_delivery: f.expected_delivery || null }); onSaved(); }
    catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-lg space-y-3 rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{order ? `Edit ${order.order_number}` : 'New order'}</h2>
        <label className={lab}>Supplier
          <select className={input} value={f.supplier_id} onChange={e => set('supplier_id', Number(e.target.value))}>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></label>
        <label className={lab}>Description
          <input className={input} value={f.description ?? ''} onChange={e => set('description', e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className={lab}>Quantity
            <input className={input} type="number" min={1} value={f.quantity} onChange={e => set('quantity', Number(e.target.value))} /></label>
          <label className={lab}>Unit price (ZAR)
            <input className={input} type="number" min={0} step="0.01" value={f.unit_price} onChange={e => set('unit_price', Number(e.target.value))} /></label>
          <label className={lab}>Business unit
            <input className={input} value={f.business_unit ?? ''} onChange={e => set('business_unit', e.target.value)} /></label>
          <label className={lab}>ETA
            <input className={input} type="date" value={f.expected_delivery ?? ''} onChange={e => set('expected_delivery', e.target.value)} /></label>
          <label className={lab}>Status
            <select className={input} value={f.status} onChange={e => set('status', e.target.value)}>
              {['pending', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s}>{s}</option>)}
            </select></label>
          <label className={lab}>Tracking number
            <input className={input} value={f.tracking_number ?? ''} onChange={e => set('tracking_number', e.target.value)} /></label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.placed_at}
            onChange={e => set('placed_at', e.target.checked ? new Date().toISOString().slice(0, 10) : null)} /> Placed with supplier</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.pod_received}
            onChange={e => set('pod_received', e.target.checked ? 1 : 0)} /> POD received</label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Save</button>
        </div>
      </div>
    </div>
  );
}
