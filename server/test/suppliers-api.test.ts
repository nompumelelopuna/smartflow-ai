import { beforeEach, describe, expect, it } from 'vitest';
import { addOrder, resetDb } from './db-helpers';
import { registerAgent } from './api-helpers';

beforeEach(() => { resetDb(); });

describe('suppliers API', () => {
  it('creates, updates and lists suppliers; rejects duplicates and bad input', async () => {
    const { agent } = await registerAgent();
    const c = await agent.post('/api/suppliers').send({ name: 'Acme', contact_email: 'a@acme.example' });
    expect(c.status).toBe(201);
    expect((await agent.post('/api/suppliers').send({ name: 'Acme' })).status).toBe(409);
    expect((await agent.post('/api/suppliers').send({ name: '' })).status).toBe(400);
    expect((await agent.post('/api/suppliers').send({ name: 'X', contact_email: 'bad' })).status).toBe(400);
    expect((await agent.put(`/api/suppliers/${c.body.id}`).send({ name: 'Acme 2' })).status).toBe(200);
    const list = await agent.get('/api/suppliers');
    expect(list.body[0].name).toBe('Acme 2');
    expect(list.body[0].order_count).toBe(0);
  });
  it('blocks deleting a supplier that has orders', async () => {
    const { agent } = await registerAgent();
    const c = await agent.post('/api/suppliers').send({ name: 'Busy' });
    addOrder(c.body.id);
    expect((await agent.delete(`/api/suppliers/${c.body.id}`)).status).toBe(409);
  });
  it('only admins can delete', async () => {
    const admin = await registerAgent('admin@example.com');
    const user = await registerAgent('user@example.com');
    const s = await admin.agent.post('/api/suppliers').send({ name: 'Gone' });
    expect((await user.agent.delete(`/api/suppliers/${s.body.id}`)).status).toBe(403);
    expect((await admin.agent.delete(`/api/suppliers/${s.body.id}`)).status).toBe(204);
  });
  it('exports suppliers as CSV', async () => {
    const { agent } = await registerAgent();
    await agent.post('/api/suppliers').send({ name: 'CSV Co' });
    const res = await agent.get('/api/suppliers/export.csv');
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('CSV Co');
  });
});
