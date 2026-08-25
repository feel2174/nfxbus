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
