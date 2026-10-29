import { Router } from 'express';
import { sendCsv, toCsv } from '../services/csv';
import { createOrder, deleteOrder, getOrder, listOrders, updateOrder, validateOrder } from '../services/orders';

export const ordersRouter = Router();

ordersRouter.get('/', (req, res) =>
  res.json(listOrders({ status: req.query.status as string, q: req.query.q as string })));

ordersRouter.get('/export.csv', (_req, res) => {
  const rows = listOrders().map(o => [o.order_number, o.supplier_name, o.business_unit, o.description, o.quantity,
    (o.quantity * o.unit_price).toFixed(2), o.order_date, o.placed_at, o.expected_delivery, o.actual_delivery,
    o.status, o.tracking_number, o.pod_received ? 'Yes' : 'No']);
  sendCsv(res, 'orders.csv', toCsv(['Order', 'Supplier', 'Business unit', 'Description', 'Qty', 'Value (ZAR)',
    'Order date', 'Placed', 'ETA', 'Delivered', 'Status', 'Tracking', 'POD'], rows));
});

ordersRouter.post('/', (req, res) => {
  const err = validateOrder(req.body);
  if (err) return res.status(400).json({ error: err });
  res.status(201).json(createOrder(req.body));
});

ordersRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!getOrder(id)) return res.status(404).json({ error: 'not found' });
  const err = validateOrder(req.body, true);
  if (err) return res.status(400).json({ error: err });
  res.json(updateOrder(id, req.body));
});

ordersRouter.delete('/:id', (req, res) =>
  deleteOrder(Number(req.params.id)) ? res.status(204).end() : res.status(404).json({ error: 'not found' }));
