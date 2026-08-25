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
