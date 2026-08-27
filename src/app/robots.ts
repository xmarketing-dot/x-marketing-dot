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
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/bms-secure-portal/',
          '/panelim',
          '/chat',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/api/',
          '/bms-secure-portal/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
