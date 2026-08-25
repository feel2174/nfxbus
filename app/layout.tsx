import './globals.css';
import type { Metadata } from 'next';
import { Nanum_Gothic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

const nanum = Nanum_Gothic({ subsets: ['latin'], weight: ['400','700','800'], display: 'swap', variable: '--font-nanum' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nfxbus.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '네픽스버스 할인코 — 프리미엄 구독 최저가 25종',
  description: '넷플릭스·ChatGPT·유튜브 등 프리미엄 공유구독 25종을 최저가로. 쿠폰 HY2QCU로 10% 추가할인.',
  openGraph: {
    title: '네픽스버스 할인코 — 프리미엄 구독 최저가',
    description: '공유구독 25종 최저가 + 10% 추가할인 쿠폰',
    images: ['/og.png'], type: 'website', locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '네픽스버스 할인코 — 프리미엄 구독 최저가',
    description: '공유구독 25종 최저가 + 10% 추가할인 쿠폰',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={nanum.variable}>
      <head>
        <meta name="naver-site-verification" content="69cefc903af328ede155201d9bdd80f1c7848b55" />
        <meta name="google-site-verification" content="af42lhPhv8s-htTu4oTIBne9w1WaCT-QEl3jOqucBnU" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquareNeo@1.0/nanumsquareneo.css" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
