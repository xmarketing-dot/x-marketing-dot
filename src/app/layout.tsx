import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MobileShell from '@/components/layout/MobileShell';
import AnalyticsTracker from '@/components/common/AnalyticsTracker';
import AdminGlobalLiveNotification from '@/components/admin/AdminGlobalLiveNotification';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0d1117',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
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
    'türkiye eskort',
    'türkiye escort',
    'istanbul eskort',
    'istanbul escort',
    'ankara eskort',
    'ankara escort',
    'izmir eskort',
    'izmir escort',
    'antalya eskort',
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
        url: '/icon',
        width: 512,
        height: 512,
        alt: 'Best Eskort Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Eskort — Türkiye\'nin En Güvenilir Eskort İlan Platformu',
    description: 'Türkiye genelinde 81 il ve tüm ilçelerde doğrulanmış güncel eskort ilanları.',
    images: ['/icon'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.className} h-full antialiased`}>
      <body className="bg-[#0d1117] text-[#f0f6fc] min-h-full">
        <AnalyticsTracker />
        <MobileShell>{children}</MobileShell>
        <AdminGlobalLiveNotification />
      </body>
    </html>
  );
}
