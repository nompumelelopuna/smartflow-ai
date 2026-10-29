import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, setUnauthorizedHandler } from './api';

const respond = (status: number, json: unknown) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, statusText: 'x', json: async () => json });
afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  it('posts login credentials as JSON to the right endpoint', async () => {
    const f = respond(200, { id: 1 });
    vi.stubGlobal('fetch', f);
    await api.login('a@b.co', 'pw');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('/api/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.co', password: 'pw' });
  });
  it('calls the unauthorized handler on 401 for protected routes', async () => {
    vi.stubGlobal('fetch', respond(401, { error: 'Not authenticated' }));
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await expect(api.orders()).rejects.toThrow('Not authenticated');
    expect(handler).toHaveBeenCalled();
  });
  it('does not trigger the handler for a failed login', async () => {
    vi.stubGlobal('fetch', respond(401, { error: 'Invalid email or password' }));
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await expect(api.login('a@b.co', 'bad')).rejects.toThrow('Invalid email or password');
    expect(handler).not.toHaveBeenCalled();
  });
  it('uses PUT for existing orders and POST for new ones', async () => {
    const f = respond(200, {});
    vi.stubGlobal('fetch', f);
    await api.saveOrder({ id: 5, description: 'x' });
    await api.saveOrder({ description: 'y' });
    expect(f.mock.calls[0][0]).toBe('/api/orders/5');
    expect(f.mock.calls[0][1].method).toBe('PUT');
    expect(f.mock.calls[1][0]).toBe('/api/orders');
    expect(f.mock.calls[1][1].method).toBe('POST');
  });
});
