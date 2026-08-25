import { describe, it, expect } from 'vitest';
import { products, USD_TO_KRW } from './products';

describe('products data', () => {
  it('정확히 25종', () => { expect(products).toHaveLength(25); });
  it('환율 1350', () => { expect(USD_TO_KRW).toBe(1350); });
  it('모든 상품 필수필드 보유', () => {
    for (const p of products) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(['ai','streaming','creator','etc']).toContain(p.category);
      expect(p.fromUsd).toBeGreaterThan(0);
      expect(p.icon).toMatch(/^\/icons\/\d+\.(webp|png|jpg)$/);
      expect(p.features.length).toBeGreaterThan(0);
      expect(p.maxShare).toBeGreaterThanOrEqual(1);
    }
  });
  it('id 중복 없음', () => {
    expect(new Set(products.map(p => p.id)).size).toBe(25);
  });
});
