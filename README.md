# 네픽스버스 할인코

네픽스버스(nfxbus.com) 프리미엄 공유구독 **25종**을 한눈에 비교·추천하는 단일 랜딩 페이지입니다.
Next.js 정적 사이트로, 모든 CTA는 제휴 링크로 연결되고 **10% 추가할인 쿠폰 `DM6R44`**를 안내합니다.

> ⚠️ 본 사이트는 네픽스버스 **공식 사이트가 아니며**, 제휴(어필리에이트) 링크를 포함합니다.
> 가격·배송·환불·정책은 전적으로 네픽스버스 기준을 따릅니다.

## 주요 사항

- **어필리에이트 링크**: 모든 버튼 → `https://www.nfxbus.com/?uc=JVZNDGBA` (`rel="sponsored nofollow noopener"`)
- **쿠폰**: `DM6R44` (10% 추가할인)
- **가격 표기**: USD + 원화 병기 (1 USD ≈ 1,350원, 참고용)
- **폰트**: 네이버 나눔 (Nanum Gothic + NanumSquare Neo), 한글 `word-break: keep-all`
- **테마**: 라이트 + 다크 자동 대응

## 개발

```bash
npm install
npm run dev        # 개발 서버
npm test           # Vitest (11 tests)
npm run build      # 정적 export → out/
npm run verify     # 빌드 산출물 검증(제휴 링크/쿠폰/고지) — node scripts/verify.mjs
```

- `npm run gen` : `data/nfxbus-goods.raw.json` → `data/products.ts` 재생성(상품/가격 갱신 시)
- `npm run og`  : `public/og.png` (2400×1260) 재생성

## 배포 (Vercel)

정적 export(`output: 'export'`)이므로 Vercel/Netlify/GitHub Pages 등 어디든 배포 가능합니다.

**중요** — 소셜 미리보기(카카오톡/트위터/페이스북)가 정상 동작하려면 실제 도메인을 지정하세요:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

미설정 시 기본값 `https://nfxbus.vercel.app`이 OG 이미지 URL에 사용됩니다.

## 데이터 출처

상품/가격/아이콘은 네픽스버스 공개 API(`/api/goodsspu/all`)에서 추출해 `data/products.ts`로
고정했습니다. 런타임에 외부 API를 호출하지 않습니다(빠르고 안정적). 각 서비스 로고는 식별
목적으로만 사용됩니다.

## 구조

```
app/            layout(폰트·메타·OG) + page(원페이지 조립) + globals.css
components/     Hero, CouponBar, TrustStrip, ProductCard/Grid, HowTo, FAQ, Footer, DisclosureBar
data/           products.ts(고정 25종) + types.ts + *.raw.json(원본)
lib/            format.ts(USD+KRW) + constants.ts(제휴 링크·쿠폰)
scripts/        gen-products.mjs, gen-og.mjs, verify.mjs
public/icons/   서비스 아이콘 25종
```
