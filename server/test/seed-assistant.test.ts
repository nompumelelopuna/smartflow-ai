import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../src/db';
import { seedIfEmpty } from '../src/seed';
import { demoReply } from '../src/services/assistant';
import { REPORTS, ReportKey, runReport } from '../src/services/reports';
import { resetDb } from './db-helpers';

beforeEach(() => { resetDb(); });

describe('seed data', () => {
  it('seeds suppliers and orders once, and every report has at least one row', () => {
    seedIfEmpty();
    seedIfEmpty(); // idempotent
    expect((db.prepare('SELECT COUNT(*) c FROM suppliers').get() as any).c).toBe(5);
    expect((db.prepare('SELECT COUNT(*) c FROM orders').get() as any).c).toBe(14);
    for (const k of Object.keys(REPORTS) as ReportKey[]) expect(runReport(k).length).toBeGreaterThan(0);
  });
});

describe('assistant demo mode', () => {
  it('answers report questions from live data', () => {
    seedIfEmpty();
    expect(demoReply('what is over ETA?')).toContain('Over ETA');
    expect(demoReply('which have no POD')).toContain('No POD');
  });
  it('uses ZAR for spend', () => {
    seedIfEmpty();
    expect(demoReply('spend by supplier')).toContain('R ');
  });
  it('falls back to an overview', () => {
    seedIfEmpty();
    expect(demoReply('hello')).toContain('Overview');
  });
});
