import type { Metadata, Viewport } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';
import { Inter } from 'next/font/google';
import './globals.css';
import MobileShell from '@/components/layout/MobileShell';
import AnalyticsTracker from '@/components/common/AnalyticsTracker';
import { Analytics } from '@vercel/analytics/next';
import React, { Suspense } from 'react';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0d1117',
  interactiveWidget: 'resizes-content',
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu',
    template: '%s | Best Eskort',
  },
  description: 'Türkiye genelinde 81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları. İstanbul, Ankara, İzmir ve tüm şehirlerde bağımsız eskortlar, VIP bayanlar ve WhatsApp iletişim hatları.',
  keywords: [
    'eskort',
    'escort',
    'eskort ilanları',
    'escort ilanları',
    'eskort bayan',
    'escort bayan',
    'bağımsız eskort',
    'vip eskort',
    'vip escort',
    'türkiye eskort',
    'türkiye escort',
    'istanbul eskort',
    'istanbul escort',
    'ankara eskort',
    'ankara escort',
    'izmir eskort',
    'izmir escort',
    'antalya eskort',
    'bursa eskort',
    'whatsapp eskort',
    'eskort numaraları',
  ],
  authors: [{ name: 'Best Eskort' }],
  creator: 'Best Eskort',
  publisher: 'Best Eskort',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Best Eskort',
    title: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu',
    description: 'Türkiye genelinde 81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları. WhatsApp ile tek tıkla iletişim.',
    images: [
      {
        url: `${siteUrl}/api/og/site`,
        width: 1200,
        height: 630,
        alt: 'Best Eskort Logo & Vitrin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu',
    description: 'Türkiye genelinde 81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları.',
    images: [`${siteUrl}/api/og/site`],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
  other: {
    'geo.region': 'TR',
    'geo.placename': 'Turkey',
    'geo.position': '39.9334;32.8597',
    'ICBM': '39.9334, 32.8597',
    'yandex': 'all',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Best Eskort',
      description: 'Türkiye\'nin En Güvenilir Eskort İlan Platformu',
      inLanguage: 'tr-TR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/ara?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Best Eskort',
      url: siteUrl,
      logo: `${siteUrl}/api/og/site`,
    },
  ],
};

import { headers, cookies } from 'next/headers';
import { checkIsBanned } from '@/lib/banCheck';
import BannedTrollScreen from '@/components/common/BannedTrollScreen';
import RouteTransitionLoader from '@/components/common/RouteTransitionLoader';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isBannedVisitor = false;
  let detectedIp = '';

  try {
    const [headerList, cookieStore] = await Promise.all([headers(), cookies()]);
    const currentPath = headerList.get('x-current-path') || '';
    const isAdmin = 
      headerList.get('x-is-admin') === 'true' || 
      currentPath.includes('/bms-secure-portal');

    if (!isAdmin) {
      const rawIp = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || '';
      const banResult = await checkIsBanned(rawIp, cookieStore);
      if (banResult.isBanned) {
        isBannedVisitor = true;
        detectedIp = banResult.cleanIp;
      }
    }
  } catch (err) {
    // Fail-open for layout reliability
    console.error('RootLayout ban check error:', err);
  }

  return (
    <html lang="tr" className={`${inter.className} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Yandex Metrika Counter - Search Analytics & Heatmap Tracking */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrica/tag.js", "ym");

              ym(112120217, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true,
                  webvisor:true,
                  ecommerce: "dataLayer"
              });
            `
          }}
        />
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/112120217" style={{position: 'absolute', left: '-9999px'}} alt="" />
          </div>
        </noscript>
      </head>
      <body className="bg-[#0d1117] text-[#f0f6fc] min-h-full">
        {isBannedVisitor ? (
          <BannedTrollScreen />
        ) : (
          <>
            <Suspense fallback={null}>
              <AnalyticsTracker />
              <RouteTransitionLoader />
            </Suspense>
            <MobileShell>{children}</MobileShell>
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
