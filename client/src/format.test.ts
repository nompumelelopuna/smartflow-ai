import { describe, expect, it } from 'vitest';
import { money } from './api';

describe('money', () => {
  it('formats South African rand with comma decimals', () => {
    expect(money(1234.5)).toMatch(/^R\s?1\s?234,50$/);
  });
  it('formats zero', () => {
    expect(money(0)).toMatch(/^R\s?0,00$/);
  });
});
