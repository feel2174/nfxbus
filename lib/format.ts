import { USD_TO_KRW } from '@/data/products';

export function usdToKrw(usd: number): number {
  return Math.round((usd * USD_TO_KRW) / 10) * 10;
}
export function formatPrice(usd: number): string {
  const krw = usdToKrw(usd).toLocaleString('ko-KR');
  return `$${usd.toFixed(2)} (약 ${krw}원)`;
}
