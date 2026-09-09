import { MetadataRoute } from 'next';
import { getAllLocations, getListings } from '@/lib/data';
import connectToDatabase from '@/lib/mongodb';
import { getRequestSiteUrl } from '@/lib/siteUrl';
import { resolveTargetFromHost } from '@/lib/domainHelper';
import { headers } from 'next/headers';

// Dinamik çalışma: Gelen her domain/subdomain kendi sitemap'ini üretir
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getRequestSiteUrl();
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || '';
  const targetLoc = resolveTargetFromHost(host);

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

  if (!targetLoc) {
    routes.push({
      url: `${siteUrl}/sehirler`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // ── TIER 2: Şehir ve İlçe sayfaları ──
  const megaCities = ['istanbul', 'izmir', 'ankara', 'antalya', 'bursa'];
  const hotDistricts = [
    'beylikduzu', 'kadikoy', 'sisli', 'besiktas', 'bakirkoy',
    'alsancak', 'konak', 'karsiyaka', 'bornova', 'cankaya',
    'esenyurt', 'bahcelievler', 'bagcilar', 'pendik', 'umraniye',
    'maltepe', 'kartal', 'atakum', 'muratpasa', 'kepez',
  ];

  // Hedef domain (örn: izmireskort.devs.surf veya beylikduzuescort.devs.surf) ise o bölgeyi odakla
  const relevantLocations = targetLoc 
    ? locations.filter((loc: any) => loc.ilSlug === targetLoc.ilSlug)
    : locations;

  for (const loc of relevantLocations) {
    const isMegaCity = megaCities.includes(loc.ilSlug);
    routes.push({
      url: `${siteUrl}/${loc.ilSlug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: targetLoc ? 1.0 : (isMegaCity ? 0.95 : 0.85),
    });

    for (const ilce of loc.ilceler) {
      // Eğer ilçe hedefli domain ise ve bu ilçe eşleşiyorsa en yüksek öncelik ver
      const isTargetDistrict = targetLoc?.ilceSlug === ilce.slug;
      const isHot = isMegaCity || hotDistricts.includes(ilce.slug) || isTargetDistrict;

      routes.push({
        url: `${siteUrl}/${loc.ilSlug}/${ilce.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: isTargetDistrict ? 1.0 : (isHot ? 0.9 : 0.75),
      });
    }
  }

  // ── TIER 3: İlan sayfaları ──
  // Eğer hedef domain ise sadece o il/ilçedeki ilanları ekle (Google'a %100 saf yerel otorite)
  const relevantListings = targetLoc
    ? listings.filter((l: any) => {
        const ilMatch = l.ilSlug === targetLoc.ilSlug || l.sehirSlug === targetLoc.ilSlug;
        if (targetLoc.ilceSlug) {
          const ilceMatch = l.ilceSlug === targetLoc.ilceSlug || l.semtSlug === targetLoc.ilceSlug;
          return ilMatch && ilceMatch;
        }
        return ilMatch;
      })
    : listings;

  for (const listing of relevantListings) {
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

    const listingDate = new Date(listing.updatedAt || listing.createdAt || now);
    const daysSinceUpdate = (now.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
    const listingPriority = daysSinceUpdate < 7 ? 0.9 : daysSinceUpdate < 30 ? 0.8 : 0.7;

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
