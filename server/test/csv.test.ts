import { describe, expect, it } from 'vitest';
import { csvCell, sendCsv, toCsv } from '../src/services/csv';

describe('csv', () => {
  it('quotes cells and escapes embedded quotes', () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });
  it('renders null/undefined as empty', () => {
    expect(csvCell(null)).toBe('""');
    expect(csvCell(undefined)).toBe('""');
  });
  it('neutralises spreadsheet formula injection', () => {
    for (const bad of ['=SUM(A1)', '+1', '-1', '@cmd'])
      expect(csvCell(bad)).toBe(`"'${bad}"`);
  });
  it('builds a BOM-prefixed CRLF document with headers', () => {
    const out = toCsv(['A', 'B'], [[1, 'x'], [2, 'y']]);
    expect(out.charCodeAt(0)).toBe(0xfeff);
    expect(out.slice(1)).toBe('"A","B"\r\n"1","x"\r\n"2","y"');
  });
  it('sets download headers', () => {
    const headers: Record<string, string> = {};
    let body = '';
    const res: any = { setHeader: (k: string, v: string) => { headers[k] = v; }, send: (b: string) => { body = b; } };
    sendCsv(res, 'x.csv', 'data');
    expect(headers['Content-Type']).toContain('text/csv');
    expect(headers['Content-Disposition']).toContain('x.csv');
    expect(body).toBe('data');
  });
});
