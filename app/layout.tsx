import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '네픽스버스 할인코', description: '프리미엄 구독 최저가' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ko"><body>{children}</body></html>);
}
