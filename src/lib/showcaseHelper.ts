import { DynamicHeroSlide } from '@/components/home/HeroSlider';

/**
 * Returns top 1-2 showcase listings for a specific subset (category, city, district, all).
 * Sort priority:
 * 1. Paid / Active showcase (`isVitrin: true` or `vitrinIstegi: true`)
 * 2. Highest views (`goruntulenmeSayisi` desc)
 * 3. VIP / Gold / Silver rozet priority
 * 4. Most recently created
 */
export function getTopShowcaseSlides(listings: any[], count: number = 2): DynamicHeroSlide[] {
  if (!Array.isArray(listings) || listings.length === 0) {
    return [];
  }

  const sorted = [...listings].sort((a: any, b: any) => {
    // 1. Vitrin flag
    const aVitrin = Boolean(a.isVitrin || a.vitrinIstegi);
    const bVitrin = Boolean(b.isVitrin || b.vitrinIstegi);
    if (aVitrin && !bVitrin) return -1;
    if (!aVitrin && bVitrin) return 1;

    // 2. Highest views
    const viewsA = Number(a.goruntulenmeSayisi || a.goruntulenme || 0);
    const viewsB = Number(b.goruntulenmeSayisi || b.goruntulenme || 0);
    if (viewsB !== viewsA) return viewsB - viewsA;

    // 3. Rozet tier score
    const tierScore = (rozet: string) => {
      if (rozet === 'vip' || rozet === 'ultravip') return 3;
      if (rozet === 'gold') return 2;
      return 1;
    };
    const scoreA = tierScore(a.rozet);
    const scoreB = tierScore(b.rozet);
    if (scoreB !== scoreA) return scoreB - scoreA;

    // 4. Creation date
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return sorted.slice(0, count).map((l: any) => ({
    _id: l._id?.toString() || l.id || '',
    slug: l.slug || '',
    baslik: l.baslik || '',
    aciklama: l.aciklama || '',
    ilSlug: l.ilSlug || 'istanbul',
    ilceSlug: l.ilceSlug || 'beylikduzu',
    anaFotograf: {
      url: l.anaFotograf?.url || (l.fotograflar && l.fotograflar[0]?.url) || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=1200',
    },
    rozet: l.rozet === 'ultravip' ? 'vip' : (l.rozet || 'vip'),
    whatsappNumara: l.whatsappNumara || '',
    fiyat: l.fiyat ? Number(l.fiyat) : undefined,
    paraBirimi: l.paraBirimi || 'TL',
    tamAd: l.tamAd || undefined,
    yas: l.yas || undefined,
  }));
}
