import { useEffect, useState } from 'react';
import { api, money } from '../api';
import StatCard from '../components/StatCard';
import { REPORT_META, ReportKey, Summary } from '../types';

const barColors: Record<string, string> = {
  pending: 'bg-slate-400', shipped: 'bg-blue-500', delivered: 'bg-emerald-500', cancelled: 'bg-zinc-400',
};

export default function Dashboard({ openReport }: { openReport: (k: ReportKey) => void }) {
  const [s, setS] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { api.summary().then(setS).catch(e => setError((e as Error).message)); }, []);
  if (error) return <p className="text-red-600">Could not load dashboard: {error}</p>;
  if (!s) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total orders" value={s.total} />
        <StatCard label="Open order value" value={money(s.openValue)} />
        <StatCard label="On-time rate" value={s.onTimeRate === null ? '—' : `${s.onTimeRate}%`} tone="green" />
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Exception reports</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {REPORT_META.map(r => (
            <StatCard key={r.key} label={r.title} value={s.counts[r.key]} tone={s.counts[r.key] ? 'amber' : 'green'}
              onClick={() => openReport(r.key)} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Orders by status</h2>
          {(Object.entries(s.byStatus) as [string, number][]).map(([k, v]) => (
            <div key={k} className="mb-2">
              <div className="flex justify-between text-xs capitalize text-slate-600"><span>{k}</span><span>{v}</span></div>
              <div className="h-2 rounded bg-slate-100">
                <div className={`h-2 rounded ${barColors[k]}`} style={{ width: `${s.total ? (v / s.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Spend by supplier</h2>
          <table className="w-full text-sm"><tbody>
            {s.bySupplier.map(x => (
              <tr key={x.name} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5">{x.name}</td>
                <td className="text-slate-500">{x.orders}</td>
                <td className="text-right font-medium">{money(x.value)}</td>
              </tr>
            ))}
          </tbody></table>
        </section>
      </div>
    </div>
  );
}
