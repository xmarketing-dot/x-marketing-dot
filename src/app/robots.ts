import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://besteskort.devs.surf').replace(/\/$/, '');

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
