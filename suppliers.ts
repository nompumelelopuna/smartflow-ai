import { Router } from 'express';
import { db } from '../db';
import { requireAdmin } from '../services/auth';
import { sendCsv, toCsv } from '../services/csv';

export const suppliersRouter = Router();
const LIST = `SELECT s.*, (SELECT COUNT(*) FROM orders o WHERE o.supplier_id = s.id) AS order_count
  FROM suppliers s ORDER BY s.name`;

function check(b: any): string | null {
  if (typeof b?.name !== 'string' || !b.name.trim()) return 'name is required';
  if (b.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact_email)) return 'invalid email';
  return null;
}
const vals = (b: any) => [b.name.trim(), b.contact_email?.trim() || null, b.phone?.trim() || null, b.address?.trim() || null];

suppliersRouter.get('/', (_req, res) => res.json(db.prepare(LIST).all()));

suppliersRouter.get('/export.csv', (_req, res) => {
  const rows = (db.prepare(LIST).all() as any[]).map(s => [s.name, s.contact_email, s.phone, s.address, s.order_count]);
  sendCsv(res, 'suppliers.csv', toCsv(['Name', 'Email', 'Phone', 'Address', 'Orders'], rows));
});

suppliersRouter.post('/', (req, res) => {
  const err = check(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const info = db.prepare('INSERT INTO suppliers (name, contact_email, phone, address) VALUES (?,?,?,?)').run(...vals(req.body));
    res.status(201).json(db.prepare('SELECT * FROM suppliers WHERE id = ?').get(info.lastInsertRowid));
  } catch { res.status(409).json({ error: 'A supplier with that name already exists' }); }
});

suppliersRouter.put('/:id', (req, res) => {
  const err = check(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const r = db.prepare('UPDATE suppliers SET name=?, contact_email=?, phone=?, address=? WHERE id=?')
      .run(...vals(req.body), Number(req.params.id));
    r.changes ? res.json({ ok: true }) : res.status(404).json({ error: 'not found' });
  } catch { res.status(409).json({ error: 'A supplier with that name already exists' }); }
});

suppliersRouter.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if ((db.prepare('SELECT COUNT(*) AS c FROM orders WHERE supplier_id = ?').get(id) as { c: number }).c)
    return res.status(409).json({ error: 'Supplier has orders and cannot be deleted' });
  db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
  res.status(204).end();
});
