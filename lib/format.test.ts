import { describe, it, expect } from 'vitest';
import { usdToKrw, formatPrice } from './format';

describe('price format', () => {
  it('원화 10원 단위 반올림', () => {
    expect(usdToKrw(4.50)).toBe(6080); // 6075 → 6080
    expect(usdToKrw(2.12)).toBe(2860); // 2862 → 2860
    expect(usdToKrw(5.39)).toBe(7280); // 7276.5 → 7280
  });
  it('USD+원화 병기 문자열', () => {
    expect(formatPrice(4.50)).toBe('$4.50 (약 6,080원)');
  });
});
