# 네픽스버스 할인코 — 어필리에이트 랜딩 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 네픽스버스 공유구독 25종을 시인성·가독성 우선으로 재구성한 어필리에이트 단일 랜딩(Next.js 정적)을 빌드한다.

**Architecture:** Next.js App Router + `output: 'export'` 정적 사이트. 상품 데이터는 이미 추출한 `data/nfxbus-goods.raw.json`을 빌드 타임 스크립트로 `data/products.ts`(고정)로 변환. 모든 CTA는 단일 제휴 링크로 연결. 실 로직(가격 포맷·데이터 무결성·CTA/쿠폰)만 Vitest로 TDD, 시각 컴포넌트는 렌더 테스트로 링크·쿠폰·rel 속성을 검증.

**Tech Stack:** Next.js 14 (App Router, static export), TypeScript, React 18, Vitest + @testing-library/react + jsdom, next/font/google(Nanum Gothic), NanumSquare Neo(@font-face CDN), puppeteer(OG 이미지).

**Spec:** `docs/superpowers/specs/2026-08-25-nfxbus-affiliate-landing-design.md`

## Global Constraints

- 어필리에이트 링크(모든 CTA/카드/버튼): `https://www.nfxbus.com/?uc=JVZNDGBA`
- 외부 링크 속성 필수: `target="_blank" rel="sponsored nofollow noopener"`
- 쿠폰 코드: `DM6R44` (10% 추가할인). Hero·쿠폰바·이용방법·Footer 4곳 노출.
- 환율 고정: `USD_TO_KRW = 1350`. 원화 = `Math.round(usd * 1350 / 10) * 10` (10원 단위).
- 한글 카피 전체 `word-break: keep-all`. ch 단위 폭 지정 금지.
- 비공식·제휴 고지: 상단 바 + Footer 필수. "네픽스버스 공식 사이트 아님, 제휴 링크 포함".
- 상품 수: 정확히 25종. 카테고리 4종(`ai`|`streaming`|`creator`|`etc`).
- 정적 export 호환만 사용(런타임 서버 코드·API 호출 금지).

---

### Task 1: 프로젝트 스캐폴드 + 정적 빌드 파이프라인

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `next-env.d.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `vitest.config.ts`, `vitest.setup.ts`

**Interfaces:**
- Produces: 동작하는 `npm run build`(→ `out/`), `npm test`(Vitest) 환경.

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "nfxbus-hub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "node scripts/gen-products.mjs && next build",
    "start": "next start",
    "test": "vitest run",
    "gen": "node scripts/gen-products.mjs",
    "og": "node scripts/gen-og.mjs"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "@types/node": "20.14.15",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "vitest": "2.0.5",
    "@testing-library/react": "16.0.0",
    "@testing-library/jest-dom": "6.4.8",
    "jsdom": "24.1.1",
    "@vitejs/plugin-react": "4.3.1",
    "puppeteer": "23.1.0"
  }
}
```

- [ ] **Step 2: tsconfig.json / next.config.js / next-env.d.ts 작성**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020", "lib": ["dom", "dom.iterable", "ES2020"],
    "allowJs": false, "skipLibCheck": true, "strict": true,
    "noEmit": true, "esModuleInterop": true, "module": "esnext",
    "moduleResolution": "bundler", "resolveJsonModule": true,
    "isolatedModules": true, "jsx": "preserve", "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.js`:
```js
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
```

`next-env.d.ts`:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 3: vitest 설정 작성**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
  resolve: { alias: { '@': resolve(__dirname, '.') } },
});
```

`vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: 최소 layout/page/globals 작성 (빌드 통과용 자리)**

`app/globals.css`:
```css
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { word-break: keep-all; }
```

`app/layout.tsx`:
```tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '네픽스버스 할인코', description: '프리미엄 구독 최저가' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body>{children}</body></html>);
}
```

`app/page.tsx`:
```tsx
export default function Home() { return <main>placeholder</main>; }
```

- [ ] **Step 5: 의존성 설치 후 빌드/테스트 확인**

Run: `npm install && npm run gen 2>/dev/null; npx next build`
Expected: `out/` 생성(placeholder). (gen 스크립트는 Task 2에서 생성되므로 이 단계는 next build 단독 성공 확인 — gen 실패 무시)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js static export + vitest"
```

---

### Task 2: 데이터 생성 스크립트 + 상품 타입 (`data/products.ts`)

원본 `data/nfxbus-goods.raw.json`(추출 완료)을 결정론적으로 `data/products.ts`로 변환한다. 한글명·카테고리 매핑은 스크립트에 고정. features는 raw `detail` HTML의 ✅ 라인에서 추출.

**Files:**
- Create: `scripts/gen-products.mjs`
- Create: `data/types.ts`
- Generated: `data/products.ts` (스크립트 산출물, 커밋함)
- Test: `data/products.test.ts`

**Interfaces:**
- Produces: `type Product`(아래), `export const products: Product[]`, `export const USD_TO_KRW = 1350`.

- [ ] **Step 1: 타입 정의**

`data/types.ts`:
```ts
export type Category = 'ai' | 'streaming' | 'creator' | 'etc';
export type Sku = { label: string; months: number | null; usd: number };
export type Product = {
  id: number;
  name: string;      // 한글 표기명
  brand: string;     // 원 서비스명(영문)
  category: Category;
  fromUsd: number;
  skus: Sku[];
  maxShare: number;
  features: string[];
  icon: string;      // /icons/1.webp
};
```

- [ ] **Step 2: 생성 스크립트 작성**

`scripts/gen-products.mjs`:
```js
import fs from 'node:fs';
import path from 'node:path';

const raw = JSON.parse(fs.readFileSync('data/nfxbus-goods.raw.json', 'utf8')).data;

const KO = {
  1:'넷플릭스', 3:'디즈니플러스', 5:'유튜브 프리미엄', 2:'스포티파이',
  9:'타이달', 27:'디저(Deezer)', 8:'크런치롤', 7:'ChatGPT Plus',
  21:'제미나이(Gemini)', 22:'그록(Grok)', 17:'퍼플렉시티(Perplexity)',
  14:'감마(Gamma)', 29:'비드IQ(vidIQ)', 26:'그래머리(Grammarly)',
  16:'캡컷(CapCut)', 11:'캔바(Canva)', 24:'어도비(Adobe)', 15:'오피스 365',
  20:'노션(Notion)', 19:'UPDF', 28:'픽시브(pixiv)', 12:'듀오링고',
  30:'AVG 백신', 32:'스트라바(Strava)', 13:'유튜브 충전',
};
const BRAND = {
  1:'Netflix',3:'Disney+',5:'YouTube Premium',2:'Spotify',9:'Tidal',
  27:'Deezer',8:'Crunchyroll',7:'ChatGPT Plus',21:'Gemini',22:'Grok',
  17:'Perplexity',14:'Gamma',29:'vidIQ',26:'Grammarly',16:'CapCut',
  11:'Canva',24:'Adobe',15:'Office 365',20:'Notion',19:'UPDF',28:'pixiv',
  12:'Duolingo',30:'AVG',32:'Strava',13:'YouTube Recharge',
};
const CAT = {
  7:'ai',21:'ai',22:'ai',17:'ai',14:'ai',29:'ai',26:'ai',
  1:'streaming',3:'streaming',5:'streaming',2:'streaming',9:'streaming',27:'streaming',8:'streaming',
  16:'creator',11:'creator',24:'creator',15:'creator',20:'creator',19:'creator',28:'creator',12:'creator',
  30:'etc',32:'etc',13:'etc',
};
const ORDER = ['ai','streaming','creator','etc'];

function features(detailHtml) {
  const text = (detailHtml || '').replace(/<[^>]+>/g, '\n');
  return text.split('\n')
    .map(l => l.replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim())
    .filter(l => l.startsWith('✅'))
    .map(l => l.replace(/^✅\s*/, ''))
    .slice(0, 4);
}
function iconExt(url) { return url.split('?')[0].split('.').pop(); }

const products = raw
  .filter(it => KO[it.id])
  .map(it => ({
    id: it.id,
    name: KO[it.id],
    brand: BRAND[it.id],
    category: CAT[it.id],
    fromUsd: Number(it.price),
    skus: (it.skus || [])
      .map(s => ({ label: s.skuname.trim(), months: s.skumonth ?? null, usd: Number(s.price) }))
      .sort((a,b) => (a.months||0) - (b.months||0)),
    maxShare: it.maxnum ?? 1,
    features: features(it.detail),
    icon: `/icons/${it.id}.${iconExt(it.homeimg)}`,
  }))
  .sort((a,b) => (ORDER.indexOf(a.category) - ORDER.indexOf(b.category)) || (a.fromUsd - b.fromUsd));

const out =
`// AUTO-GENERATED by scripts/gen-products.mjs — do not edit by hand.
import type { Product } from './types';

export const USD_TO_KRW = 1350;

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;
fs.writeFileSync(path.join('data','products.ts'), out);
console.log('generated', products.length, 'products');
```

- [ ] **Step 3: 스크립트 실행 → products.ts 생성**

Run: `node scripts/gen-products.mjs`
Expected: `generated 25 products`, `data/products.ts` 존재.

- [ ] **Step 4: 데이터 무결성 테스트 작성**

`data/products.test.ts`:
```ts
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
```

- [ ] **Step 5: 테스트 실행**

Run: `npx vitest run data/products.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add scripts/gen-products.mjs data/types.ts data/products.ts data/products.test.ts
git commit -m "feat: generate fixed product catalog (25 items) from nfxbus data"
```

---

### Task 3: 가격 포맷 + 링크 상수 (`lib/`)

**Files:**
- Create: `lib/format.ts`, `lib/constants.ts`
- Test: `lib/format.test.ts`

**Interfaces:**
- Produces: `AFFILIATE_URL`, `COUPON`, `EXTERNAL_LINK_PROPS`, `formatPrice(usd) => string`, `usdToKrw(usd) => number`.

- [ ] **Step 1: 실패 테스트 작성**

`lib/format.test.ts`:
```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/format.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: 구현**

`lib/constants.ts`:
```ts
export const AFFILIATE_URL = 'https://www.nfxbus.com/?uc=JVZNDGBA';
export const COUPON = 'DM6R44';
export const EXTERNAL_LINK_PROPS = {
  href: AFFILIATE_URL,
  target: '_blank' as const,
  rel: 'sponsored nofollow noopener',
};
```

`lib/format.ts`:
```ts
import { USD_TO_KRW } from '@/data/products';

export function usdToKrw(usd: number): number {
  return Math.round((usd * USD_TO_KRW) / 10) * 10;
}
export function formatPrice(usd: number): string {
  const krw = usdToKrw(usd).toLocaleString('ko-KR');
  return `$${usd.toFixed(2)} (약 ${krw}원)`;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/format.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts lib/constants.ts lib/format.test.ts
git commit -m "feat: price formatting (USD+KRW) and affiliate constants"
```

---

### Task 4: ProductCard + 카드 그리드/필터 (모든 CTA 검증)

이 태스크의 렌더 테스트가 "모든 카드 버튼이 정확한 제휴 URL + rel 속성"을 보장한다.

**Files:**
- Create: `components/ProductCard.tsx`, `components/ProductGrid.tsx`
- Test: `components/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `Product`(data/types), `formatPrice`, `EXTERNAL_LINK_PROPS`, `AFFILIATE_URL`.
- Produces: `<ProductCard product={p} />`, `<ProductGrid products={[]} />` (클라이언트 필터 포함).

- [ ] **Step 1: 실패 테스트 작성**

`components/ProductCard.test.tsx`:
```tsx
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/ProductCard.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: ProductCard 구현**

`components/ProductCard.tsx`:
```tsx
import type { Product } from '@/data/types';
import { formatPrice } from '@/lib/format';
import { EXTERNAL_LINK_PROPS } from '@/lib/constants';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <div className="card__head">
        <img className="card__icon" src={product.icon} alt={product.brand} width={48} height={48} loading="lazy" />
        <div>
          <h3 className="card__name">{product.name}</h3>
          <span className="card__share">최대 {product.maxShare}인 공유</span>
        </div>
      </div>
      <p className="card__price">
        <span className="card__from">월</span> {formatPrice(product.fromUsd)}~
      </p>
      <ul className="card__features">
        {product.features.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <a className="card__cta" {...EXTERNAL_LINK_PROPS} aria-label={`${product.name} 최저가로 보기`}>
        최저가로 보기 →
      </a>
    </article>
  );
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/ProductCard.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: ProductGrid(필터) 구현**

`components/ProductGrid.tsx`:
```tsx
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
      <div className="tabs" role="tablist">
        {TABS.map(t => (
          <button key={t.key} role="tab" aria-selected={cat === t.key}
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
```

- [ ] **Step 6: Commit**

```bash
git add components/ProductCard.tsx components/ProductGrid.tsx components/ProductCard.test.tsx
git commit -m "feat: ProductCard + filterable ProductGrid with verified affiliate CTAs"
```

---

### Task 5: Hero + 쿠폰바 + 신뢰지표 + 고지바

**Files:**
- Create: `components/DisclosureBar.tsx`, `components/Hero.tsx`, `components/CouponBar.tsx`, `components/TrustStrip.tsx`
- Test: `components/CouponBar.test.tsx`

**Interfaces:**
- Consumes: `COUPON`, `EXTERNAL_LINK_PROPS`.
- Produces: 각 named 컴포넌트. `CouponBar`는 클립보드 복사 버튼 포함.

- [ ] **Step 1: 쿠폰바 실패 테스트 작성**

`components/CouponBar.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CouponBar } from './CouponBar';
import { COUPON } from '@/lib/constants';

describe('CouponBar', () => {
  it('쿠폰 코드와 복사 버튼 노출', () => {
    render(<CouponBar />);
    expect(screen.getByText(COUPON)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /복사/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/CouponBar.test.tsx`
Expected: FAIL.

- [ ] **Step 3: CouponBar 구현**

`components/CouponBar.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { COUPON } from '@/lib/constants';

export function CouponBar() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(COUPON); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <div className="coupon">
      <span className="coupon__label">10% 추가할인 쿠폰</span>
      <code className="coupon__code">{COUPON}</code>
      <button className="coupon__btn" onClick={copy} aria-label="쿠폰 복사">
        {copied ? '복사됨 ✓' : '복사'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/CouponBar.test.tsx`
Expected: PASS.

- [ ] **Step 5: DisclosureBar / Hero / TrustStrip 구현**

`components/DisclosureBar.tsx`:
```tsx
export function DisclosureBar() {
  return (
    <div className="disclosure-top">
      본 페이지는 네픽스버스 <b>공식 사이트가 아니며</b>, 제휴(어필리에이트) 링크를 포함합니다.
    </div>
  );
}
```

`components/Hero.tsx`:
```tsx
import { EXTERNAL_LINK_PROPS } from '@/lib/constants';
import { CouponBar } from './CouponBar';

export function Hero() {
  return (
    <header className="hero">
      <h1 className="hero__title">프리미엄 구독,<br/>최대 90% 저렴하게</h1>
      <p className="hero__sub">넷플릭스·ChatGPT·유튜브 등 25종 공유구독을 최저가로. 자동배송·환불보증.</p>
      <CouponBar />
      <a className="hero__cta" {...EXTERNAL_LINK_PROPS}>지금 최저가 보러가기 →</a>
    </header>
  );
}
```

`components/TrustStrip.tsx`:
```tsx
const ITEMS = [
  { t: '자동 즉시배송', d: '결제 후 바로 수령' },
  { t: '24시간 지원', d: '실시간 채팅 상담' },
  { t: '환불 보증', d: '문제 시 환불' },
  { t: '25종 라인업', d: 'AI·스트리밍·생산성' },
];
export function TrustStrip() {
  return (
    <section className="trust">
      {ITEMS.map((i) => (
        <div key={i.t} className="trust__item">
          <strong>{i.t}</strong><span>{i.d}</span>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/DisclosureBar.tsx components/Hero.tsx components/CouponBar.tsx components/TrustStrip.tsx components/CouponBar.test.tsx
git commit -m "feat: Hero, CouponBar(copy), TrustStrip, DisclosureBar"
```

---

### Task 6: 이용방법 + FAQ + Footer

**Files:**
- Create: `components/HowTo.tsx`, `components/FAQ.tsx`, `components/Footer.tsx`
- Test: `components/Footer.test.tsx`

**Interfaces:**
- Consumes: `COUPON`, `EXTERNAL_LINK_PROPS`.
- Produces: 각 named 컴포넌트. Footer는 제휴/비공식 고지 + CTA.

- [ ] **Step 1: Footer 실패 테스트 작성**

`components/Footer.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { AFFILIATE_URL } from '@/lib/constants';

describe('Footer', () => {
  it('비공식·제휴 고지 포함', () => {
    render(<Footer />);
    expect(screen.getByText(/공식 사이트가 아니/)).toBeInTheDocument();
    expect(screen.getByText(/제휴/)).toBeInTheDocument();
  });
  it('CTA 제휴 URL', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === AFFILIATE_URL)).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run components/Footer.test.tsx`
Expected: FAIL.

- [ ] **Step 3: HowTo / FAQ / Footer 구현**

`components/HowTo.tsx`:
```tsx
import { COUPON } from '@/lib/constants';
const STEPS = [
  { n: 1, t: '상품 선택', d: '원하는 구독을 고르고 네픽스버스로 이동' },
  { n: 2, t: `쿠폰 ${COUPON} 입력`, d: '결제 시 쿠폰란에 입력해 10% 추가할인' },
  { n: 3, t: '즉시 수령', d: '자동배송으로 계정/초대를 바로 받기' },
];
export function HowTo() {
  return (
    <section className="howto">
      <h2 className="sec-title">이용 방법</h2>
      <ol className="howto__list">
        {STEPS.map(s => (
          <li key={s.n} className="howto__step">
            <span className="howto__num">{s.n}</span>
            <strong>{s.t}</strong><p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

`components/FAQ.tsx`:
```tsx
const QA = [
  { q: '공유구독은 안전한가요?', a: '네픽스버스는 자동배송·환불보증·24시간 지원을 제공합니다. 결제/정책은 네픽스버스 기준을 따릅니다.' },
  { q: '결제는 어떻게 하나요?', a: '상품 선택 후 네픽스버스에서 결제합니다. 쿠폰 DM6R44 입력 시 10% 추가할인이 적용됩니다.' },
  { q: '수령은 얼마나 걸리나요?', a: '대부분 결제 즉시 자동배송됩니다. 일부 상품은 안내된 시간 내 처리됩니다.' },
  { q: '환불이 되나요?', a: '상품별 환불정책은 네픽스버스 기준을 따릅니다. 문제가 있으면 실시간 채팅으로 문의하세요.' },
];
export function FAQ() {
  return (
    <section className="faq">
      <h2 className="sec-title">자주 묻는 질문</h2>
      {QA.map((x, i) => (
        <details key={i} className="faq__item">
          <summary>{x.q}</summary>
          <p>{x.a}</p>
        </details>
      ))}
    </section>
  );
}
```

`components/Footer.tsx`:
```tsx
import { EXTERNAL_LINK_PROPS, COUPON } from '@/lib/constants';
export function Footer() {
  return (
    <footer className="footer">
      <a className="footer__cta" {...EXTERNAL_LINK_PROPS}>네픽스버스에서 최저가 보기 (쿠폰 {COUPON}) →</a>
      <p className="footer__disclosure">
        본 페이지는 네픽스버스 공식 사이트가 아니며, 제휴(어필리에이트) 링크를 포함합니다.
        구매 시 운영자가 수수료를 받을 수 있고, 가격·배송·환불·정책은 전적으로 네픽스버스 기준을 따릅니다.
        각 서비스 로고는 식별 목적으로만 사용됩니다.
      </p>
      <p className="footer__copy">© {new Date().getFullYear()} 네픽스버스 할인코</p>
    </footer>
  );
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run components/Footer.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/HowTo.tsx components/FAQ.tsx components/Footer.tsx components/Footer.test.tsx
git commit -m "feat: HowTo, FAQ, Footer with affiliate disclosure"
```

---

### Task 7: 페이지 조립 + 폰트/메타 + 스타일 (`app/`)

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: 모든 컴포넌트 + `products`.
- Produces: 완성된 원페이지. 나눔 폰트, 메타/OG, 라이트+다크.

- [ ] **Step 1: layout에 폰트/메타 적용**

`app/layout.tsx`:
```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Nanum_Gothic } from 'next/font/google';

const nanum = Nanum_Gothic({ subsets: ['latin'], weight: ['400','700','800'], display: 'swap', variable: '--font-nanum' });

export const metadata: Metadata = {
  title: '네픽스버스 할인코 — 프리미엄 구독 최저가 25종',
  description: '넷플릭스·ChatGPT·유튜브 등 프리미엄 공유구독 25종을 최저가로. 쿠폰 DM6R44로 10% 추가할인.',
  openGraph: {
    title: '네픽스버스 할인코 — 프리미엄 구독 최저가',
    description: '공유구독 25종 최저가 + 10% 추가할인 쿠폰',
    images: ['/og.png'], type: 'website', locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={nanum.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquareNeo@1.0/nanumsquareneo.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: page.tsx 조립**

`app/page.tsx`:
```tsx
import { products } from '@/data/products';
import { DisclosureBar } from '@/components/DisclosureBar';
import { Hero } from '@/components/Hero';
import { TrustStrip } from '@/components/TrustStrip';
import { ProductGrid } from '@/components/ProductGrid';
import { HowTo } from '@/components/HowTo';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <DisclosureBar />
      <main>
        <Hero />
        <TrustStrip />
        <ProductGrid products={products} />
        <HowTo />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: globals.css 스타일 작성 (시인성·가독성 우선, 라이트+다크)**

`app/globals.css` (핵심 토큰·레이아웃; 색 대비 WCAG AA, keep-all, 반응형 grid):
```css
:root{
  color-scheme: light dark;
  --bg:#f7f8fa; --surface:#ffffff; --text:#14161a; --muted:#5b6270;
  --line:#e6e8ec; --brand:#e50914; --brand-ink:#fff; --accent:#0b74de;
  --price:#c81e1e; --radius:16px; --maxw:1120px;
  --font-head:'NanumSquareNeo', var(--font-nanum), sans-serif;
  --font-body:var(--font-nanum), sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{ --bg:#0f1115; --surface:#171a20; --text:#f2f4f7; --muted:#a2acbd;
    --line:#262b34; --price:#ff6b6b; --accent:#5aa2ff; }
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:var(--font-body);
  word-break:keep-all;line-height:1.6;-webkit-font-smoothing:antialiased;}
h1,h2,h3{font-family:var(--font-head);word-break:keep-all;line-height:1.25;}
main{max-width:var(--maxw);margin:0 auto;padding:0 20px;}
a{color:inherit;text-decoration:none;}

.disclosure-top{background:#111;color:#e8e8e8;font-size:13px;text-align:center;padding:8px 16px;}
.disclosure-top b{color:#fff;}

.hero{text-align:center;padding:56px 16px 32px;}
.hero__title{font-size:clamp(30px,6vw,52px);font-weight:800;margin:0 0 14px;}
.hero__sub{font-size:clamp(15px,2.4vw,19px);color:var(--muted);margin:0 auto 22px;max-width:640px;}
.hero__cta,.footer__cta{display:inline-block;background:var(--brand);color:var(--brand-ink);
  font-weight:800;font-size:18px;padding:15px 30px;border-radius:999px;margin-top:8px;}

.coupon{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;
  background:var(--surface);border:2px dashed var(--brand);border-radius:14px;padding:10px 16px;margin:0 auto 8px;}
.coupon__label{font-weight:700;color:var(--brand);}
.coupon__code{font-family:var(--font-head);font-weight:800;font-size:20px;letter-spacing:2px;
  background:var(--brand);color:#fff;padding:4px 12px;border-radius:8px;}
.coupon__btn{border:1px solid var(--line);background:var(--surface);color:var(--text);
  padding:7px 14px;border-radius:8px;font-weight:700;cursor:pointer;}

.trust{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px auto;}
.trust__item{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:16px;text-align:center;display:flex;flex-direction:column;gap:4px;}
.trust__item strong{font-size:16px;}
.trust__item span{color:var(--muted);font-size:13px;}

.grid-wrap{margin:40px auto;}
.sec-title{text-align:center;font-size:clamp(22px,4vw,32px);font-weight:800;margin:8px 0 24px;}
.tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:22px;}
.tab{border:1px solid var(--line);background:var(--surface);color:var(--muted);
  padding:9px 16px;border-radius:999px;font-weight:700;cursor:pointer;font-size:14px;}
.tab--on{background:var(--text);color:var(--bg);border-color:var(--text);}

.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:18px;display:flex;flex-direction:column;gap:10px;transition:transform .12s,box-shadow .12s;}
.card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.10);}
.card__head{display:flex;align-items:center;gap:12px;}
.card__icon{border-radius:10px;object-fit:contain;background:#fff;padding:2px;}
.card__name{font-size:17px;font-weight:800;margin:0;}
.card__share{font-size:12px;color:var(--muted);}
.card__price{font-size:19px;font-weight:800;color:var(--price);margin:2px 0;}
.card__from{font-size:13px;color:var(--muted);font-weight:700;}
.card__features{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px;
  font-size:13px;color:var(--muted);}
.card__features li::before{content:'✓ ';color:var(--accent);font-weight:800;}
.card__cta{margin-top:auto;text-align:center;background:var(--text);color:var(--bg);
  font-weight:800;padding:11px;border-radius:10px;}

.howto{margin:48px auto;}
.howto__list{list-style:none;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.howto__step{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:22px;text-align:center;}
.howto__num{display:inline-flex;width:38px;height:38px;align-items:center;justify-content:center;
  background:var(--brand);color:#fff;border-radius:999px;font-weight:800;font-family:var(--font-head);margin-bottom:10px;}
.howto__step strong{display:block;font-size:16px;margin-bottom:6px;}
.howto__step p{color:var(--muted);font-size:14px;margin:0;}

.faq{margin:48px auto;max-width:760px;}
.faq__item{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:4px 18px;margin-bottom:10px;}
.faq__item summary{cursor:pointer;font-weight:700;padding:14px 0;list-style:none;}
.faq__item summary::-webkit-details-marker{display:none;}
.faq__item p{color:var(--muted);margin:0 0 14px;}

.footer{max-width:var(--maxw);margin:40px auto 0;padding:32px 20px 48px;border-top:1px solid var(--line);text-align:center;}
.footer__disclosure{color:var(--muted);font-size:13px;max-width:720px;margin:18px auto;line-height:1.7;}
.footer__copy{color:var(--muted);font-size:12px;}

@media (max-width:900px){
  .grid,.trust{grid-template-columns:repeat(2,1fr);}
  .howto__list{grid-template-columns:1fr;}
}
@media (max-width:520px){
  .grid{grid-template-columns:1fr;}
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: `out/index.html` 생성, 에러 없음.

- [ ] **Step 5: 전체 테스트 재확인**

Run: `npx vitest run`
Expected: 모든 테스트 PASS.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat: assemble one-page landing with Nanum fonts, meta, responsive styles"
```

---

### Task 8: OG 이미지 2400×1260 생성

메모리 원칙: 이 머신엔 ImageMagick/cairosvg 없음 → puppeteer로 HTML→PNG 렌더.

**Files:**
- Create: `scripts/gen-og.mjs`
- Generated: `public/og.png` (2400×1260)

- [ ] **Step 1: OG 생성 스크립트 작성**

`scripts/gen-og.mjs`:
```js
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const html = `<!doctype html><html><head><meta charset="utf8"><style>
  *{margin:0;box-sizing:border-box;font-family:sans-serif}
  .w{width:2400px;height:1260px;background:linear-gradient(135deg,#e50914,#7a0510);
     color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:40px;padding:120px;text-align:center}
  h1{font-size:150px;font-weight:900;line-height:1.1}
  p{font-size:72px;opacity:.95}
  .b{font-size:64px;background:#fff;color:#e50914;font-weight:900;padding:24px 56px;border-radius:999px}
</style></head><body><div class="w">
  <h1>프리미엄 구독<br/>최대 90% 저렴하게</h1>
  <p>넷플릭스 · ChatGPT · 유튜브 등 25종</p>
  <div class="b">쿠폰 DM6R44 — 10% 추가할인</div>
</div></body></html>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 1260, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
fs.mkdirSync('public', { recursive: true });
await page.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: 2400, height: 1260 } });
await browser.close();
console.log('og.png written');
```

- [ ] **Step 2: 실행 + 크기 검증**

Run: `node scripts/gen-og.mjs`
Expected: `public/og.png` 생성. 크기 확인:
`node -e "const s=require('fs').statSync('public/og.png');console.log(s.size>0?'OK':'FAIL')"`

- [ ] **Step 3: Commit**

```bash
git add scripts/gen-og.mjs public/og.png
git commit -m "feat: 2400x1260 OG image via puppeteer"
```

---

### Task 9: 최종 검증 (링크 전수 + 빌드 산출물)

**Files:**
- Create: `scripts/verify.mjs`

- [ ] **Step 1: 검증 스크립트 작성 — 빌드 산출물의 모든 외부링크가 제휴 URL인지**

`scripts/verify.mjs`:
```js
import fs from 'node:fs';
const html = fs.readFileSync('out/index.html', 'utf8');
const AFF = 'https://www.nfxbus.com/?uc=JVZNDGBA';
const ext = [...html.matchAll(/href="(https?:\/\/[^"]*nfxbus[^"]*)"/g)].map(m => m[1]);
const bad = ext.filter(u => u !== AFF);
const hasCoupon = html.includes('DM6R44');
const hasDisc = html.includes('공식 사이트가 아니');
console.log('nfxbus links:', ext.length, '| bad:', bad.length);
console.log('coupon present:', hasCoupon, '| disclosure present:', hasDisc);
if (bad.length || !hasCoupon || !hasDisc || ext.length < 25) {
  console.error('VERIFY FAIL', { bad, hasCoupon, hasDisc, count: ext.length });
  process.exit(1);
}
console.log('VERIFY OK');
```

- [ ] **Step 2: 빌드 후 검증 실행**

Run: `npm run build && node scripts/verify.mjs`
Expected: `VERIFY OK` (nfxbus 링크 ≥25, bad=0, 쿠폰·고지 present).

- [ ] **Step 3: 로컬 미리보기로 육안 확인(선택)**

Run: `npx serve out` (또는 `python -m http.server -d out 3000`) 후 브라우저 확인.
Expected: 라이트/다크 모두 가독성 양호, 필터·쿠폰복사·FAQ 동작.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify.mjs
git commit -m "test: add build-output link/coupon/disclosure verification"
```

---

## 자체 리뷰 결과

- **스펙 커버리지**: Hero/쿠폰/신뢰지표/그리드/이용방법/FAQ/Footer(고지) = Task 5,4,6,7 커버. 데이터·가격병기 = Task 2,3. 폰트·다크·keep-all = Task 7. OG 2400×1260 = Task 8. 제휴링크 전수 = Task 9. 누락 없음.
- **플레이스홀더 스캔**: 모든 코드 블록 실제 구현. TBD 없음.
- **타입 일관성**: `Product`/`Category`/`Sku`(Task2) → format/컴포넌트(Task3~7) 동일 사용. `AFFILIATE_URL`/`COUPON`/`EXTERNAL_LINK_PROPS`(Task3) 일관 참조.
- **미해결**: NanumSquare Neo CDN(jsdelivr) URL은 실행 시 접근 확인 필요 — 실패해도 Nanum Gothic fallback으로 렌더 정상.
