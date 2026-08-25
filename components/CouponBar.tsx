'use client';
import { useState } from 'react';
import { COUPON } from '@/lib/constants';

export function CouponBar() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(COUPON);
      } else {
        const ta = document.createElement('textarea');
        ta.value = COUPON; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch {}
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
