import { useEffect, useState } from 'react';
import { api } from '../api';
import OrdersTable from '../components/OrdersTable';
import { REPORT_META, ReportKey, ReportResult, Summary } from '../types';

export default function Reports({ initial }: { initial: ReportKey }) {
  const [key, setKey] = useState<ReportKey>(initial);
  const [data, setData] = useState<ReportResult | null>(null);
  const [counts, setCounts] = useState<Summary['counts'] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { setError(''); api.report(key).then(setData).catch(e => setError((e as Error).message)); }, [key]);
  useEffect(() => { api.summary().then(s => setCounts(s.counts)); }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {REPORT_META.map(r => (
          <button key={r.key} onClick={() => setKey(r.key)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${key === r.key ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
            {r.title}{counts ? ` (${counts[r.key]})` : ''}
          </button>
        ))}
      </div>
      {error && <p className="text-red-600">Could not load report: {error}</p>}
      {data && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-lg font-semibold">{data.title}</h2><p className="text-sm text-slate-500">{data.description} · {data.count} order(s)</p></div>
            <a href={`/api/reports/${key}.csv`} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700">Download CSV</a>
          </div>
          <OrdersTable orders={data.rows} compact />
        </>
      )}
    </div>
  );
}
