import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || 'besteskort.devs.surf';
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const siteUrl = `${protocol}://${host}`;

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
