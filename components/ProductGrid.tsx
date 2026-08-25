'use client';
import { useState } from 'react';
import type { Product, Category } from '@/data/types';
import { ProductCard } from './ProductCard';

const TABS: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'ai', label: 'AI 도구' },
  { key: 'streaming', label: '스트리밍·음악' },
  { key: 'creator', label: '크리에이터·생산성' },
  { key: 'etc', label: '기타·보안' },
];

export function ProductGrid({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<Category | 'all'>('all');
  const shown = cat === 'all' ? products : products.filter(p => p.category === cat);
  return (
    <section id="products" className="grid-wrap">
      <div className="tabs" role="group" aria-label="카테고리 필터">
        {TABS.map(t => (
          <button key={t.key} type="button" aria-pressed={cat === t.key}
            className={`tab ${cat === t.key ? 'tab--on' : ''}`} onClick={() => setCat(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid">
        {shown.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
