const status: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700', shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-zinc-200 text-zinc-600',
};
export const StatusBadge = ({ value }: { value: string }) =>
  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${status[value]}`}>{value}</span>;
