import type { Order } from '../types';

export const order = (over: Partial<Order> = {}): Order => ({
  id: 1, order_number: 'PO-1001', supplier_id: 1, supplier_name: 'Acme', description: 'Widgets',
  quantity: 2, unit_price: 1234.5, order_date: '2026-10-01', expected_delivery: '2026-10-20',
  actual_delivery: null, status: 'shipped', tracking_number: null, notes: null,
  business_unit: null, placed_at: '2026-10-01', pod_received: 0, ...over,
});
