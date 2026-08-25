# 네픽스버스 할인코 — 어필리에이트 랜딩 설계 문서

작성일: 2026-08-25
상태: 설계 확정(구현 계획 착수 전 사용자 리뷰 대기)

## 1. 목적 / 개요

네픽스버스(nfxbus.com)에서 판매하는 프리미엄 공유구독 25종을, 시인성·가독성을
최우선으로 재구성한 **어필리에이트 단일 랜딩 페이지**. 모든 CTA는 사용자 제휴
링크로 연결되고, 추가 10% 할인 쿠폰을 전면에 노출한다.

- **어필리에이트 링크**: `https://www.nfxbus.com/?uc=JVZNDGBA` (모든 버튼/카드)
- **추가 할인 쿠폰**: `DM6R44` (10% 추가 할인)
- **브랜드명**: `네픽스버스 할인코`
- **성격**: 네픽스버스 공식 사이트가 아닌 **독립 제휴 할인 안내 페이지**
  (오인 방지 고지 + 제휴 고지 필수)

## 2. 확정된 결정사항

| 항목 | 결정 |
|------|------|
| 사이트 구조 | 단일 랜딩(원페이지) |
| 기술 스택 | Next.js 정적(App Router, `output: 'export'`), TypeScript |
| 가격 표기 | USD + 원화 병기 |
| 환율 | 1 USD ≈ **1,350원** 고정(참고용 표기, 실결제는 nfxbus 기준) |
| 브랜딩 | 자체 브랜드 "네픽스버스 할인코" + 제휴/비공식 고지 |
| 폰트 | 네이버 나눔(NanumSquare Neo 제목 / Nanum Gothic 본문) |
| 배포 | GitHub → Vercel (기존 니치 사이트 패턴 동일) |
| 위치 | `C:\Users\devzu\Documents\nfxbus-hub` |

## 3. 데이터 (네픽스버스 API에서 추출 완료)

원본: `GET https://www.nfxbus.com/api/goodsspu/all` (실시간, 인증 불필요).
25개 상품 전량 추출. 각 상품: 이름 / 시작가(USD) / 기간별 SKU 요금 / 최대
공유인원 / 한국어 기능설명 / 공식 아이콘(25개 로컬 다운로드 완료).

빌드 시 런타임 API 호출을 하지 않고, 추출본을 `data/products.ts`로 **고정**한다
(속도·안정성·nfxbus 장애 무관). 아이콘은 `public/icons/{id}.{ext}`로 동봉.

### 카테고리 분류(표시용, 4개)
- **AI 도구**: ChatGPT Plus, Gemini, Grok, Perplexity, Gamma, vidIQ, Grammarly
- **스트리밍·음악**: Netflix, Disney+, YouTube Premium, Spotify, Tidal, Deezer, Crunchyroll
- **크리에이터·생산성**: CapCut, Canva, Adobe, Office 365, Notion, UPDF, Pixiv, Duolingo
- **기타·보안**: AVG, Strava, YouTube 충전

### 상품 데이터 모델
```ts
type Product = {
  id: number;
  name: string;        // 한글화 표기명 (예: "넷플릭스")
  brand: string;       // 원 서비스명 (예: "Netflix")
  category: 'ai' | 'streaming' | 'creator' | 'etc';
  fromUsd: number;     // 시작가
  skus: { label: string; months: number | null; usd: number }[];
  maxShare: number;    // 최대 공유 인원
  features: string[];  // 한국어 기능 3~4줄
  icon: string;        // /icons/1.webp
};
const USD_TO_KRW = 1350;
```

## 4. 페이지 구조 (원페이지, 위 → 아래)

1. **상단 고지 바** — "네픽스버스 공식이 아닌 제휴 할인 안내 페이지" (작게, 상시)
2. **Hero** — 헤드라인("프리미엄 구독, 최대 90% 저렴하게") + 서브카피 +
   쿠폰 `DM6R44` 10% 추가할인 배지 + 메인 CTA(제휴 링크)
3. **쿠폰 바** — 쿠폰 코드 + **복사 버튼**(클립보드 복사, 복사됨 피드백)
4. **신뢰 지표 스트립** — 자동배송 / 24시간 지원 / 환불보증 / 25종 라인업
5. **카테고리 필터 + 상품 그리드** — 4개 필터 탭, 25개 카드
6. **인기 TOP 픽** — Netflix·ChatGPT·YouTube·Spotify 하이라이트(선택)
7. **이용 방법 3스텝** — ①상품 선택 ②쿠폰 `DM6R44` 입력 ③즉시 수령
8. **FAQ** — 공유구독 안전성/결제/환불/수령 (아코디언)
9. **Footer** — 제휴 고지 + 비공식 고지 + 쿠폰 재노출 + CTA

## 5. 상품 카드 컴포넌트

구성: 공식 아이콘 · 상품명(한글) · `월 $X (~₩Y)` 시작가 · 기간별 요금 요약 ·
최대 공유인원 배지 · 한국어 기능 3줄 · `[최저가로 보기 →]` 버튼.

- 가격: `$4.50 (약 6,080원)` 형식. ₩ = round(usd × 1350) → 10원 단위 반올림.
- **모든 링크** → `https://www.nfxbus.com/?uc=JVZNDGBA`
  - 속성: `target="_blank" rel="sponsored nofollow noopener"`
- 카드 전체 클릭 가능 + 버튼 명시(접근성: 버튼에 aria-label).

## 6. 비주얼 시스템 (시인성·가독성 최우선)

- **폰트**: 제목 `NanumSquare Neo`(굵고 시원), 본문 `Nanum Gothic`, 가격 숫자 강조.
  - 한글 전체 `word-break: keep-all` (줄바꿈 자연화 — 메모리 원칙 반영).
  - ch 단위 폭 지정 지양(한글 폭 왜곡 방지).
- **테마**: 라이트 기본 + 다크 대응. WCAG AA 이상 대비. 큰 터치타깃(44px+).
- **색**: 네픽스버스 톤(레드/다크) 참고하되 자체 팔레트. 가격·쿠폰·CTA에 강조색.
- **스킬 활용(빌드 단계)**: `ui-ux-pro-max`(색/타이포/컴포넌트), `cro`(전환
  배치), `copywriting`(한국어 카피).

## 7. 기술 / 파일 구조

```
nfxbus-hub/
  app/
    layout.tsx        # 폰트, 메타, OG
    page.tsx          # 원페이지 조립
    globals.css
  components/
    Hero, CouponBar, TrustStrip, CategoryFilter,
    ProductCard, ProductGrid, HowTo, FAQ, Footer, DisclosureBar
  data/products.ts    # 25종 고정 데이터 + USD_TO_KRW
  lib/format.ts       # 가격 포맷(USD+KRW)
  public/icons/       # 25개 아이콘 (다운로드 완료)
  public/og.png       # 2400×1260 OG
  next.config.js      # output: 'export'
  package.json / tsconfig.json
```

- 폰트: 나눔 웹폰트(로컬 `public/fonts` 또는 CDN). 정적 export 호환.
- 클라이언트 상호작용(필터·복사·FAQ)은 `'use client'` 컴포넌트로 최소화.

## 8. 제휴 / 법적 고지 (필수)

- 상단 바 + Footer에 명시: "본 페이지는 네픽스버스 **공식 사이트가 아니며**,
  제휴(어필리에이트) 링크를 포함합니다. 구매 시 운영자가 수수료를 받을 수 있고,
  가격·정책·배송·환불은 전적으로 네픽스버스 기준입니다."
- 원 서비스 로고/아이콘은 **식별 목적**으로만 사용(상표권 유의). 공식 제휴/보증
  주장 금지.

## 9. 검증 / 테스트

- 모든 CTA가 정확한 제휴 URL(`?uc=JVZNDGBA`)로 연결되는지 전수 검사.
- 쿠폰 복사 동작 확인.
- 반응형(모바일/데스크톱), 다크모드 대비.
- Lighthouse 접근성·성능 점검(목표 90+).
- 가격 병기(USD/KRW) 계산 정확성.

## 10. 비범위 (YAGNI)

- 실제 결제/장바구니/체크아웃 재현 없음(전부 nfxbus로 이관).
- 런타임 nfxbus API 호출 없음(데이터 고정).
- 개별 상품 상세페이지 없음(단일 랜딩 확정).
- 다국어 없음(한국어 전용).

## 11. 오픈 이슈

- 네이버 나눔 웹폰트 제공 방식: 로컬 임베드 vs CDN — 구현 시 정적 export 호환
  우선으로 결정.
- 도메인: `nfxbus.zucca100.com` 여부는 배포 단계에서 확정.
