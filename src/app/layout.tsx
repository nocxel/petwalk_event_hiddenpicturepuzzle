import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://event.petwalk.kr'),
  title: 'PETWALK 가을맞이 숨은그림찾기 이벤트 🍂 | 최대 15% 할인 쿠폰 증정',
  description: 'PETWALK 애견용품 매장 속 숨겨진 아이템 5가지를 찾고 매장에서 사용 가능한 최대 15% 할인 쿠폰을 받으세요!',
  keywords: ['PETWALK', '펫워크', '애견용품', '숨은그림찾기', '강아지용품', '할인쿠폰', '반려견이벤트'],
  authors: [{ name: 'PETWALK' }],
  openGraph: {
    title: 'PETWALK 가을맞이 숨은그림찾기 이벤트 🍂',
    description: '매장 속 숨은 5가지 아이템을 찾으면 최대 15% 할인 쿠폰 즉시 발급!',
    url: 'https://event.petwalk.kr',
    siteName: 'PETWALK Event',
    images: [
      {
        url: '/images/petwalk_autumn_store.jpg',
        width: 1200,
        height: 900,
        alt: 'PETWALK 가을 숨은그림찾기 이벤트',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PETWALK 가을맞이 숨은그림찾기 이벤트 🍂',
    description: '숨은 그림을 찾고 매장 최대 15% 할인 쿠폰을 받아보세요!',
    images: ['/images/petwalk_autumn_store.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-[#FFFDF9] text-[#2A1E17] antialiased">
        {children}
      </body>
    </html>
  );
}
