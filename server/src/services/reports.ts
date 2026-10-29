import { listOrders, OrderRow, today } from './orders';

export type ReportKey = 'not-placed' | 'no-tracking' | 'no-business-unit' | 'over-eta' | 'no-pod';
const open = (o: OrderRow) => o.status !== 'delivered' && o.status !== 'cancelled';

// Report definitions. These are ASSUMED business rules - adjust `test` to match your real process.
export const REPORTS: Record<ReportKey, { title: string; description: string; test: (o: OrderRow, t: string) => boolean }> = {
  'not-placed': { title: 'Not Placed', description: 'Pending orders not yet placed with the supplier',
    test: o => o.status === 'pending' && !o.placed_at },
  'no-tracking': { title: 'No Tracking', description: 'Placed, open orders with no tracking number',
    test: o => open(o) && !!o.placed_at && !o.tracking_number },
  'no-business-unit': { title: 'No Business Unit', description: 'Non-cancelled orders with no business unit assigned',
    test: o => o.status !== 'cancelled' && !o.business_unit },
  'over-eta': { title: 'Over ETA', description: 'Open orders past their expected delivery date',
    test: (o, t) => open(o) && !!o.expected_delivery && o.expected_delivery < t },
  'no-pod': { title: 'No POD', description: 'Delivered orders with no proof of delivery received',
    test: o => o.status === 'delivered' && !o.pod_received },
};

export const isReportKey = (k: string): k is ReportKey => k in REPORTS;

export function runReport(key: ReportKey, orders: OrderRow[] = listOrders()) {
  const t = today();
  return orders.filter(o => REPORTS[key].test(o, t));
}

export const reportCsvRows = (rows: OrderRow[]) => rows.map(o => [o.order_number, o.supplier_name, o.business_unit,
  o.description, o.quantity, (o.quantity * o.unit_price).toFixed(2), o.placed_at, o.expected_delivery,
  o.status, o.tracking_number, o.pod_received ? 'Yes' : 'No']);
export const REPORT_CSV_HEADERS = ['Order', 'Supplier', 'Business unit', 'Description', 'Qty', 'Value (ZAR)',
  'Placed', 'ETA', 'Status', 'Tracking', 'POD'];
