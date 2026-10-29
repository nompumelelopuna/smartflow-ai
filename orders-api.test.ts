import { beforeEach, describe, expect, it } from 'vitest';
import { addSupplier, resetDb } from './db-helpers';
import { registerAgent } from './api-helpers';

beforeEach(() => { resetDb(); });

async function setup() {
  const { agent } = await registerAgent();
  return { agent, sid: addSupplier() };
}

describe('orders API', () => {
  it('creates, lists, updates and deletes an order', async () => {
    const { agent, sid } = await setup();
    const created = await agent.post('/api/orders').send({ supplier_id: sid, description: 'Bolts', quantity: 10, unit_price: 5 });
    expect(created.status).toBe(201);
    const id = created.body.id;
    expect((await agent.get('/api/orders')).body).toHaveLength(1);
    const upd = await agent.put(`/api/orders/${id}`).send({ status: 'delivered', pod_received: 1 });
    expect(upd.status).toBe(200);
    expect(upd.body.actual_delivery).toBeTruthy();
    expect(upd.body.pod_received).toBe(1);
    expect((await agent.delete(`/api/orders/${id}`)).status).toBe(204);
    expect((await agent.delete(`/api/orders/${id}`)).status).toBe(404);
  });
  it('returns 400 for invalid input and 404 for unknown orders', async () => {
    const { agent, sid } = await setup();
    expect((await agent.post('/api/orders').send({ supplier_id: sid, description: '' })).status).toBe(400);
    expect((await agent.post('/api/orders').send({ supplier_id: 9999, description: 'x' })).status).toBe(400);
    expect((await agent.put('/api/orders/9999').send({ status: 'shipped' })).status).toBe(404);
  });
  it('treats SQL-looking search text as data', async () => {
    const { agent } = await setup();
    const res = await agent.get("/api/orders").query({ q: "'; DROP TABLE orders; --" });
    expect(res.status).toBe(200);
    expect((await agent.get('/api/orders')).status).toBe(200);
  });
  it('exports CSV in ZAR with formula injection neutralised', async () => {
    const { agent, sid } = await setup();
    await agent.post('/api/orders').send({ supplier_id: sid, description: '=HYPERLINK("x")', quantity: 2, unit_price: 10.5 });
    const res = await agent.get('/api/orders/export.csv');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Value (ZAR)');
    expect(res.text).toContain(`"'=HYPERLINK(""x"")"`);
    expect(res.text).toContain('"21.00"');
  });
  it('requires login for CSV export', async () => {
    const { newAgent } = await import('./api-helpers');
    expect((await newAgent().get('/api/orders/export.csv')).status).toBe(401);
  });
});
