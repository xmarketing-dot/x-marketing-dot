import { MetadataRoute } from 'next';
import { getAllLocations, getListings, getAllCategories } from '@/lib/data';
import connectToDatabase from '@/lib/mongodb';
import VipModel from '@/models/VipModel';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://besteskort.devs.surf').replace(/\/$/, '');

  await connectToDatabase();

  const [locations, listings, categories, vipModels] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 5000 }),
    getAllCategories(),
    VipModel.find({ aktif: true }).lean(),
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
      url: `${siteUrl}/ilan-ver`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // VIP Influencer & Model pages (/gizem-bagdacicek, /merve-ozdemir)
  for (const m of vipModels) {
    routes.push({
      url: `${siteUrl}/${m.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    });
  }

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
  for (const listing of listings) {
    routes.push({
      url: `${siteUrl}/ilan/${listing.slug}`,
      lastModified: new Date(listing.updatedAt || listing.createdAt || now),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  return routes;
}
