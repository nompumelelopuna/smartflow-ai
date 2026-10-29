import { Router } from 'express';
import { sendCsv, toCsv } from '../services/csv';
import { listOrders } from '../services/orders';
import { isReportKey, REPORT_CSV_HEADERS, reportCsvRows, REPORTS, ReportKey, runReport } from '../services/reports';

export const reportsRouter = Router();

reportsRouter.get('/summary', (_req, res) => {
  const orders = listOrders();
  const byStatus: Record<string, number> = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const suppliers = new Map<string, { name: string; orders: number; value: number }>();
  let openValue = 0, onTime = 0, measured = 0;
  for (const o of orders) {
    byStatus[o.status]++;
    const value = o.quantity * o.unit_price;
    const s = suppliers.get(o.supplier_name) ?? { name: o.supplier_name, orders: 0, value: 0 };
    s.orders++; s.value += value; suppliers.set(o.supplier_name, s);
    if (o.status === 'pending' || o.status === 'shipped') openValue += value;
    if (o.status === 'delivered' && o.expected_delivery && o.actual_delivery) {
      measured++;
      if (o.actual_delivery <= o.expected_delivery) onTime++;
    }
  }
  const counts = Object.fromEntries((Object.keys(REPORTS) as ReportKey[]).map(k => [k, runReport(k, orders).length]));
  res.json({ total: orders.length, byStatus, counts, openValue,
    onTimeRate: measured ? Math.round((onTime / measured) * 100) : null,
    bySupplier: [...suppliers.values()].sort((a, b) => b.value - a.value) });
});

reportsRouter.get('/:key.csv', (req, res) => {
  const key = req.params.key;
  if (!isReportKey(key)) return res.status(404).json({ error: 'unknown report' });
  sendCsv(res, `${key}.csv`, toCsv(REPORT_CSV_HEADERS, reportCsvRows(runReport(key))));
});

reportsRouter.get('/:key', (req, res) => {
  const key = req.params.key;
  if (!isReportKey(key)) return res.status(404).json({ error: 'unknown report' });
  const rows = runReport(key);
  res.json({ key, title: REPORTS[key].title, description: REPORTS[key].description, count: rows.length, rows });
});
