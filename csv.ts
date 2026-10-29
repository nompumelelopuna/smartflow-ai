import type { Response } from 'express';

// Cells starting with = + - @ are prefixed with ' to prevent spreadsheet formula injection.
export const csvCell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export const toCsv = (headers: string[], rows: unknown[][]) =>
  '\uFEFF' + [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n');

export function sendCsv(res: Response, filename: string, csv: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}
