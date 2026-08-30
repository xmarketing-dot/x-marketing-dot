import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
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
        allow: '/',
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
        allow: '/',
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
        allow: '/',
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
        allow: '/',
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
