import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from './db-helpers';
import { newAgent, PASSWORD, registerAgent } from './api-helpers';

beforeEach(() => { resetDb(); });

describe('authentication', () => {
  it('first registered user is admin, later users are not', async () => {
    const first = await registerAgent('a@example.com');
    expect(first.res.status).toBe(201);
    expect(first.res.body.role).toBe('admin');
    expect(first.res.body.password_hash).toBeUndefined();
    const second = await registerAgent('b@example.com');
    expect(second.res.body.role).toBe('user');
  });
  it('sets an httpOnly SameSite=Strict cookie', async () => {
    const { res } = await registerAgent();
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
  });
  it('rejects weak or invalid registrations', async () => {
    const a = newAgent();
    expect((await a.post('/api/auth/register').send({ name: 'x', email: 'x@example.com', password: 'short' })).status).toBe(400);
    expect((await a.post('/api/auth/register').send({ name: 'x', email: 'nope', password: PASSWORD })).status).toBe(400);
    expect((await a.post('/api/auth/register').send({ name: '', email: 'x@example.com', password: PASSWORD })).status).toBe(400);
  });
  it('rejects duplicate emails', async () => {
    await registerAgent('dup@example.com');
    const again = await newAgent().post('/api/auth/register').send({ name: 'x', email: 'DUP@example.com', password: PASSWORD });
    expect(again.status).toBe(409);
  });
  it('logs in with the right password and rejects wrong ones with one generic message', async () => {
    await registerAgent('u@example.com');
    const ok = await newAgent().post('/api/auth/login').send({ email: 'u@example.com', password: PASSWORD });
    expect(ok.status).toBe(200);
    const bad = await newAgent().post('/api/auth/login').send({ email: 'u@example.com', password: 'wrong-password-1' });
    const unknown = await newAgent().post('/api/auth/login').send({ email: 'none@example.com', password: PASSWORD });
    expect(bad.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(bad.body.error).toBe(unknown.body.error);
  });
  it('protects API routes, supports /me and logout', async () => {
    expect((await newAgent().get('/api/orders')).status).toBe(401);
    const { agent } = await registerAgent();
    expect((await agent.get('/api/auth/me')).body.email).toBe('admin@example.com');
    expect((await agent.get('/api/orders')).status).toBe(200);
    await agent.post('/api/auth/logout');
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });
  it('rejects a forged token', async () => {
    const res = await newAgent().get('/api/orders').set('Cookie', 'smartflow_token=not.a.jwt');
    expect(res.status).toBe(401);
  });
});
