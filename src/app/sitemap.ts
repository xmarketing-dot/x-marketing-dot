import { MetadataRoute } from 'next';
import { getAllLocations, getListings, getAllCategories } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const [locations, listings, categories] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 5000 }),
    getAllCategories(),
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

      // City + District + Category triplets
      for (const cat of categories) {
        routes.push({
          url: `${siteUrl}/${loc.ilSlug}/${ilce.slug}/${cat.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  }

  // Individual listing pages
  for (const item of listings) {
    routes.push({
      url: `${siteUrl}/ilan/${item.slug}`,
      lastModified: new Date(item.updatedAt || now),
      changeFrequency: 'weekly',
      priority: 0.75,
    });
  }

  return routes;
}
