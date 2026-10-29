const tones = { default: 'text-slate-900', red: 'text-red-600', amber: 'text-amber-600', green: 'text-emerald-600' };

export default function StatCard({ label, value, tone = 'default', onClick }:
  { label: string; value: string | number; tone?: keyof typeof tones; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={`rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${onClick ? 'hover:border-emerald-400' : ''}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</p>
    </Tag>
  );
}
