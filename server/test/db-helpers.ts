import { db } from '../src/db';
import { createOrder } from '../src/services/orders';

export const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
export const resetDb = () => { db.exec('DELETE FROM orders; DELETE FROM suppliers; DELETE FROM users;'); };
export const addSupplier = (name = 'Acme Supplies') =>
  Number(db.prepare('INSERT INTO suppliers (name) VALUES (?)').run(name).lastInsertRowid);
export const addOrder = (supplierId: number, o: Record<string, unknown> = {}) =>
  createOrder({ supplier_id: supplierId, description: 'Item', quantity: 2, unit_price: 100, ...o });
