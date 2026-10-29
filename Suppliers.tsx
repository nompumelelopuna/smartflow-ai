import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Supplier, User } from '../types';

const input = 'rounded-md border border-slate-300 px-3 py-2 text-sm';

export default function Suppliers({ user }: { user: User }) {
  const [list, setList] = useState<Supplier[]>([]);
  const [edit, setEdit] = useState<Partial<Supplier> | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => api.suppliers().then(setList), []);
  useEffect(() => { load(); }, [load]);

  async function save() {
    try { await api.saveSupplier(edit!); setEdit(null); setError(''); load(); }
    catch (e) { setError((e as Error).message); }
  }
  async function remove(s: Supplier) {
    if (!confirm(`Delete ${s.name}?`)) return;
    try { await api.deleteSupplier(s.id); load(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Suppliers</h2>
        <a href="/api/suppliers/export.csv" className="ml-auto rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100">Export CSV</a>
        <button onClick={() => setEdit({ name: '' })} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">+ New supplier</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {edit && (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          {(['name', 'contact_email', 'phone', 'address'] as const).map(k => (
            <input key={k} className={input} placeholder={k.replace('_', ' ')} value={edit[k] ?? ''} onChange={e => setEdit({ ...edit, [k]: e.target.value })} />
          ))}
          <div className="flex gap-2 md:col-span-4">
            <button onClick={save} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white">Save</button>
            <button onClick={() => { setEdit(null); setError(''); }} className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>
            {['Name', 'Email', 'Phone', 'Orders', ''].map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {list.map(s => (
              <tr key={s.id}>
                <td className="px-3 py-2 font-medium">{s.name}</td><td className="px-3 py-2">{s.contact_email ?? '—'}</td>
                <td className="px-3 py-2">{s.phone ?? '—'}</td><td className="px-3 py-2">{s.order_count}</td>
                <td className="space-x-2 px-3 py-2 text-xs">
                  <button className="text-blue-600" onClick={() => setEdit(s)}>Edit</button>
                  {user.role === 'admin' && <button className="text-red-600" onClick={() => remove(s)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
