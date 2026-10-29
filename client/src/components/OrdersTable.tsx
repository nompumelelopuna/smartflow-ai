import { money } from '../api';
import type { Order } from '../types';
import { StatusBadge } from './Badges';

export default function OrdersTable({ orders, onEdit, onDelete, compact = false }:
  { orders: Order[]; onEdit?: (o: Order) => void; onDelete?: (o: Order) => void; compact?: boolean }) {
  const heads = ['Order', 'Supplier', 'Business unit', 'Description', 'Value', 'ETA', 'Status', 'Tracking', 'POD', ...(onEdit ? [''] : [])];
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{heads.map(h => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map(o => (
            <tr key={o.id}>
              <td className="px-3 py-2 font-medium">{o.order_number}</td>
              <td className="px-3 py-2">{o.supplier_name}</td>
              <td className="px-3 py-2">{o.business_unit ?? <span className="text-amber-600">—</span>}</td>
              <td className="max-w-[16rem] truncate px-3 py-2">{o.description}</td>
              <td className="px-3 py-2">{money(o.quantity * o.unit_price)}</td>
              <td className="px-3 py-2">{o.expected_delivery ?? '—'}</td>
              <td className="px-3 py-2"><StatusBadge value={o.status} /></td>
              <td className="px-3 py-2">{o.tracking_number ?? '—'}</td>
              <td className="px-3 py-2">{o.pod_received ? 'Yes' : 'No'}</td>
              {onEdit && (
                <td className="space-x-2 px-3 py-2 text-xs">
                  <button className="text-blue-600" onClick={() => onEdit(o)}>Edit</button>
                  {onDelete && <button className="text-red-600" onClick={() => onDelete(o)}>Delete</button>}
                </td>
              )}
            </tr>
          ))}
          {!orders.length && <tr><td colSpan={heads.length} className="px-3 py-6 text-center text-slate-500">{compact ? 'Nothing to action.' : 'No orders found.'}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
