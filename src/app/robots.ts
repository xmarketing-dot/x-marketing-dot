import { MetadataRoute } from 'next';
import { getRequestSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getRequestSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/img/'],
        disallow: [
          '/api/',
          '/bms-secure-portal/',
          '/bms-secure-portal',
          '/panelim',
          '/chat',
        ],
      },
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'PetalBot',
          'Bytespider',
          'MegaIndex',
          'BLEXBot',
          'DataForSeoBot',
          'CCBot',
          'GPTBot',
          'ClaudeBot'
        ],
        disallow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/img/'],
        disallow: [
          '/api/',
          '/bms-secure-portal/',
          '/bms-secure-portal',
          '/panelim',
          '/chat',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/api/img/'],
        disallow: [
          '/api/',
          '/bms-secure-portal/',
          '/bms-secure-portal',
          '/panelim',
          '/chat',
        ],
      },
      {
        userAgent: 'Yandex',
        allow: ['/', '/api/img/'],
        disallow: [
          '/api/',
          '/bms-secure-portal/',
          '/bms-secure-portal',
          '/panelim',
          '/chat',
        ],
      },
      {
        userAgent: 'YandexBot',
        allow: ['/', '/api/img/'],
        disallow: [
          '/api/',
          '/bms-secure-portal/',
          '/bms-secure-portal',
          '/panelim',
          '/chat',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
