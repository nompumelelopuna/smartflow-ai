import { beforeEach, describe, expect, it } from 'vitest';
import { REPORTS, ReportKey, runReport } from '../src/services/reports';
import { addOrder, addSupplier, daysFromNow, resetDb } from './db-helpers';

let sid: number;
const names = (k: ReportKey) => runReport(k).map(o => o.description).sort();
beforeEach(() => { resetDb(); sid = addSupplier(); });

describe('exception reports', () => {
  it('Not Placed: only pending orders without placed_at', () => {
    addOrder(sid, { description: 'in' });
    addOrder(sid, { description: 'placed', placed_at: daysFromNow(-1) });
    addOrder(sid, { description: 'shipped', status: 'shipped' });
    expect(names('not-placed')).toEqual(['in']);
  });
  it('No Tracking: placed open orders without tracking', () => {
    addOrder(sid, { description: 'in', status: 'shipped' });
    addOrder(sid, { description: 'has', status: 'shipped', tracking_number: 'T1' });
    addOrder(sid, { description: 'unplaced' });
    addOrder(sid, { description: 'done', status: 'delivered' });
    expect(names('no-tracking')).toEqual(['in']);
  });
  it('No Business Unit: excludes cancelled and orders with a unit', () => {
    addOrder(sid, { description: 'in' });
    addOrder(sid, { description: 'has', business_unit: 'Retail' });
    addOrder(sid, { description: 'cancelled', status: 'cancelled' });
    expect(names('no-business-unit')).toEqual(['in']);
  });
  it('Over ETA: open orders past ETA only', () => {
    addOrder(sid, { description: 'late', status: 'shipped', expected_delivery: daysFromNow(-3) });
    addOrder(sid, { description: 'future', status: 'shipped', expected_delivery: daysFromNow(3) });
    addOrder(sid, { description: 'noeta', status: 'shipped' });
    addOrder(sid, { description: 'delivered', status: 'delivered', expected_delivery: daysFromNow(-3) });
    expect(names('over-eta')).toEqual(['late']);
  });
  it('No POD: delivered orders without POD only', () => {
    addOrder(sid, { description: 'in', status: 'delivered' });
    addOrder(sid, { description: 'has', status: 'delivered', pod_received: 1 });
    addOrder(sid, { description: 'shipped', status: 'shipped' });
    expect(names('no-pod')).toEqual(['in']);
  });
  it('defines exactly the five requested reports', () => {
    expect(Object.keys(REPORTS).sort()).toEqual(['no-business-unit', 'no-pod', 'no-tracking', 'not-placed', 'over-eta']);
  });
});
