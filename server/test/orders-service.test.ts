import { beforeEach, describe, expect, it } from 'vitest';
import { createOrder, deleteOrder, getOrder, listOrders, updateOrder, validateOrder } from '../src/services/orders';
import { addOrder, addSupplier, resetDb } from './db-helpers';

let sid: number;
beforeEach(() => { resetDb(); sid = addSupplier(); });

describe('orders service', () => {
  it('creates with defaults and a PO number', () => {
    const o = createOrder({ supplier_id: sid, description: 'Bolts' });
    expect(o.order_number).toMatch(/^PO-\d+$/);
    expect(o.status).toBe('pending');
    expect(o.placed_at).toBeNull();
    expect(o.pod_received).toBe(0);
  });
  it('auto-sets placed_at when created as shipped', () => {
    expect(addOrder(sid, { status: 'shipped' }).placed_at).toBeTruthy();
  });
  it('marking delivered sets actual_delivery and placed_at', () => {
    const o = addOrder(sid);
    const u = updateOrder(o.id, { status: 'delivered' })!;
    expect(u.actual_delivery).toBeTruthy();
    expect(u.placed_at).toBeTruthy();
  });
  it('ignores non-editable fields such as id and order_number', () => {
    const o = addOrder(sid);
    const u = updateOrder(o.id, { id: 999, order_number: 'HACK', description: 'New' })!;
    expect(u.id).toBe(o.id);
    expect(u.order_number).toBe(o.order_number);
    expect(u.description).toBe('New');
  });
  it('filters by status and search text', () => {
    addOrder(sid, { description: 'Alpha widgets' });
    addOrder(sid, { description: 'Beta gears', status: 'shipped' });
    expect(listOrders({ status: 'shipped' })).toHaveLength(1);
    expect(listOrders({ q: 'alpha' })).toHaveLength(1);
    expect(listOrders()).toHaveLength(2);
  });
  it('deletes once, then reports not found', () => {
    const o = addOrder(sid);
    expect(deleteOrder(o.id)).toBe(true);
    expect(deleteOrder(o.id)).toBe(false);
    expect(getOrder(o.id)).toBeUndefined();
  });
  it('validates input', () => {
    expect(validateOrder({ supplier_id: sid, description: 'ok' })).toBeNull();
    expect(validateOrder({ supplier_id: sid, description: '' })).toContain('description');
    expect(validateOrder({ supplier_id: 99999, description: 'x' })).toContain('supplier');
    expect(validateOrder({ supplier_id: sid, description: 'x', quantity: 1.5 })).toContain('quantity');
    expect(validateOrder({ supplier_id: sid, description: 'x', unit_price: -1 })).toContain('unit_price');
    expect(validateOrder({ supplier_id: sid, description: 'x', status: 'bogus' })).toContain('status');
    expect(validateOrder({ supplier_id: sid, description: 'x', expected_delivery: '12/05/2026' })).toContain('YYYY-MM-DD');
    expect(validateOrder({ supplier_id: sid, description: 'x'.repeat(501) })).toContain('too long');
  });
});
