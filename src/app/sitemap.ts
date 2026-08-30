import { MetadataRoute } from 'next';
import { getAllLocations, getListings } from '@/lib/data';
import connectToDatabase from '@/lib/mongodb';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';
export const revalidate = 43200; // 12 saat önbellek (Sitemap ISR tasarrufu)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  await connectToDatabase();

  const [locations, listings] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 5000 }),
  ]);

  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/sehirler`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/kategori/vip`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/kategori/gold`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/kategori/silver`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ilan-ver`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // City pages (81 il) — high priority
  for (const loc of locations) {
    routes.push({
      url: `${siteUrl}/${loc.ilSlug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // District pages (~970 ilçe)
    for (const ilce of loc.ilceler) {
      routes.push({
        url: `${siteUrl}/${loc.ilSlug}/${ilce.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.85,
      });
    }
  }

  // Individual listing pages with Google Image Sitemap metadata
  for (const listing of listings) {
    const images: string[] = [];
    if (listing.anaFotograf?.url) {
      images.push(
        listing.anaFotograf.url.startsWith('http')
          ? listing.anaFotograf.url
          : `${siteUrl}${listing.anaFotograf.url}`
      );
    }
    if (Array.isArray(listing.fotograflar)) {
      listing.fotograflar.forEach((f: any) => {
        const u = typeof f === 'string' ? f : f?.url;
        if (u) {
          const fullU = u.startsWith('http') ? u : `${siteUrl}${u}`;
          if (!images.includes(fullU)) images.push(fullU);
        }
      });
    }

    routes.push({
      url: `${siteUrl}/ilan/${listing.slug}`,
      lastModified: new Date(listing.updatedAt || listing.createdAt || now),
      changeFrequency: 'daily',
      priority: 0.8,
      images: images.slice(0, 5),
    });
  }

  return routes;
}
