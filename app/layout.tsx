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
