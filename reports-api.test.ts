import { beforeEach, describe, expect, it } from 'vitest';
import { seedIfEmpty } from '../src/seed';
import { resetDb } from './db-helpers';
import { registerAgent } from './api-helpers';

beforeEach(() => { resetDb(); });
const KEYS = ['not-placed', 'no-tracking', 'no-business-unit', 'over-eta', 'no-pod'];

describe('reports API', () => {
  it('serves every report as JSON and CSV', async () => {
    seedIfEmpty();
    const { agent } = await registerAgent();
    for (const k of KEYS) {
      const json = await agent.get(`/api/reports/${k}`);
      expect(json.status).toBe(200);
      expect(json.body.count).toBe(json.body.rows.length);
      expect(json.body.count).toBeGreaterThan(0);
      const csv = await agent.get(`/api/reports/${k}.csv`);
      expect(csv.status).toBe(200);
      expect(csv.headers['content-type']).toContain('text/csv');
      expect(csv.text).toContain('Value (ZAR)');
    }
  });
  it('404s unknown reports and summarises counts', async () => {
    seedIfEmpty();
    const { agent } = await registerAgent();
    expect((await agent.get('/api/reports/bogus')).status).toBe(404);
    expect((await agent.get('/api/reports/bogus.csv')).status).toBe(404);
    const s = await agent.get('/api/reports/summary');
    expect(s.body.total).toBe(14);
    for (const k of KEYS) expect(typeof s.body.counts[k]).toBe('number');
  });
  it('assistant runs in demo mode without an API key and validates input', async () => {
    const { agent } = await registerAgent();
    expect((await agent.get('/api/assistant/status')).body.mode).toBe('demo');
    expect((await agent.post('/api/assistant').send({ message: '' })).status).toBe(400);
    const r = await agent.post('/api/assistant').send({ message: 'overview' });
    expect(r.body.mode).toBe('demo');
  });
});
