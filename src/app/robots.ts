import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/bms-secure-portal/'],
      },
      {
        userAgent: 'Googlebot-Smartphone',
        allow: '/',
        disallow: ['/api/', '/bms-secure-portal/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/bms-secure-portal/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
