import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { AFFILIATE_URL } from '@/lib/constants';
import type { Product } from '@/data/types';

const p: Product = {
  id: 1, name: '넷플릭스', brand: 'Netflix', category: 'streaming',
  fromUsd: 5.39, skus: [{ label: '1 month', months: 1, usd: 5.99 }],
  maxShare: 5, features: ['프리미엄 4K', '5인 공유'], icon: '/icons/1.webp',
};

describe('ProductCard', () => {
  it('상품명·가격 표시', () => {
    render(<ProductCard product={p} />);
    expect(screen.getByText('넷플릭스')).toBeInTheDocument();
    expect(screen.getByText(/\$5\.39/)).toBeInTheDocument();
    expect(screen.getByText(/7,280원/)).toBeInTheDocument();
  });
  it('CTA가 제휴 URL + sponsored rel', () => {
    render(<ProductCard product={p} />);
    const link = screen.getByRole('link', { name: /최저가/ });
    expect(link).toHaveAttribute('href', AFFILIATE_URL);
    expect(link).toHaveAttribute('rel', 'sponsored nofollow noopener');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
