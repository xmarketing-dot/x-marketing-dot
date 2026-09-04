import { MetadataRoute } from 'next';
import { getAllLocations, getListings } from '@/lib/data';
import connectToDatabase from '@/lib/mongodb';
import { getSiteUrl } from '@/lib/siteUrl';

// ISR: 6 saatte bir yenile — çok sık yenileme Google'ın güvenini zedeler
export const dynamic = 'force-dynamic';
export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  await connectToDatabase();

  const [locations, listings] = await Promise.all([
    getAllLocations(),
    getListings({ limit: 5000 }),
  ]);

  const now = new Date();

  // ── TIER 1: Ana sayfalar — en yüksek öncelik ──
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
      url: `${siteUrl}/kategori/turbanli`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/kategori/amator`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/kategori/tango`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/ilan-ver`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // ── TIER 2: Şehir sayfaları (81 il) ──
  // NOT: 'hourly' changeFrequency yeni siteler için zararlı — Google bunu görmezden gelir
  // ve spam sinyali olarak algılayabilir. 'daily' en güvenli değer.
  const megaCities = ['istanbul', 'izmir', 'ankara', 'antalya', 'bursa'];

  for (const loc of locations) {
    const isMegaCity = megaCities.includes(loc.ilSlug);
    routes.push({
      url: `${siteUrl}/${loc.ilSlug}`,
      lastModified: now,
      changeFrequency: 'daily',          // hourly → daily (Google için daha güvenilir)
      priority: isMegaCity ? 0.95 : 0.85,
    });
  }

  // ── TIER 3: İlçe sayfaları (~970 ilçe) ──
  const hotDistricts = [
    'beylikduzu', 'kadikoy', 'sisli', 'besiktas', 'bakirkoy',
    'alsancak', 'konak', 'karsiyaka', 'bornova', 'cankaya',
    'esenyurt', 'bahcelievler', 'bagcilar', 'pendik', 'umraniye',
    'maltepe', 'kartal', 'atakum', 'muratpasa', 'kepez',
  ];

  for (const loc of locations) {
    const isMegaCity = megaCities.includes(loc.ilSlug);
    for (const ilce of loc.ilceler) {
      const isHot = isMegaCity || hotDistricts.includes(ilce.slug);
      routes.push({
        url: `${siteUrl}/${loc.ilSlug}/${ilce.slug}`,
        lastModified: now,
        changeFrequency: 'daily',        // hourly → daily
        priority: isHot ? 0.9 : 0.75,
      });
    }
  }

  // ── TIER 4: İlan sayfaları — gerçek lastModified tarihi kullan ──
  for (const listing of listings) {
    const images: string[] = [];

    const addImage = (u: string | undefined | null) => {
      if (!u) return;
      if (u.startsWith('data:') || u.includes(';base64,')) return;
      const fullU = u.startsWith('http') ? u : `${siteUrl}${u}`;
      if (!images.includes(fullU)) images.push(fullU);
    };

    addImage(listing.anaFotograf?.url);
    if (Array.isArray(listing.fotograflar)) {
      listing.fotograflar.forEach((f: any) => addImage(typeof f === 'string' ? f : f?.url));
    }

    // Sadece güncel ilanları yüksek öncelikle ekle
    const listingDate = new Date(listing.updatedAt || listing.createdAt || now);
    const daysSinceUpdate = (now.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
    const listingPriority = daysSinceUpdate < 7 ? 0.85 : daysSinceUpdate < 30 ? 0.75 : 0.65;

    routes.push({
      url: `${siteUrl}/ilan/${listing.slug}`,
      lastModified: listingDate,
      changeFrequency: 'weekly',
      priority: listingPriority,
      ...(images.length > 0 ? { images: images.slice(0, 5) } : {}),
    });
  }

  return routes;
}
