import connectToDatabase from './mongodb';
import ListingModel from '@/models/Listing';

// Türkiye 81 İl Komşuluk (Coğrafi Yakınlık) Haritası
export const TURKEY_NEIGHBORS_MAP: Record<string, string[]> = {
  adana: ['mersin', 'osmaniye', 'hatay', 'kahramanmaras', 'gaziantep', 'nigde', 'kayseri'],
  adiyaman: ['sanliurfa', 'gaziantep', 'malatya', 'kahramanmaras', 'diyarbakir'],
  afyon: ['kutahya', 'usak', 'denizli', 'burdur', 'isparta', 'konya', 'eskisehir'],
  afyonkarahisar: ['kutahya', 'usak', 'denizli', 'burdur', 'isparta', 'konya', 'eskisehir'],
  agri: ['igdir', 'kars', 'erzurum', 'mus', 'bitlis', 'van'],
  amasya: ['samsun', 'tokat', 'corum', 'yozgat'],
  ankara: ['kirikkale', 'cankiri', 'bolu', 'eskisehir', 'konya', 'aksaray', 'kirsehir'],
  antalya: ['mugla', 'burdur', 'isparta', 'konya', 'karaman', 'mersin'],
  artvin: ['rize', 'erzurum', 'ardahan'],
  aydin: ['izmir', 'manisa', 'denizli', 'mugla'],
  balikesir: ['canakkale', 'bursa', 'manisa', 'izmir', 'kutahya'],
  bilecik: ['sakarya', 'bolu', 'eskisehir', 'kutahya', 'bursa'],
  bingol: ['mus', 'erzurum', 'erzincan', 'tunceli', 'elazig', 'diyarbakir'],
  bitlis: ['van', 'agri', 'mus', 'batman', 'siirt'],
  bolu: ['duzce', 'zonguldak', 'karabuk', 'cankiri', 'ankara', 'eskisehir', 'bilecik', 'sakarya'],
  burdur: ['antalya', 'mugla', 'denizli', 'afyonkarahisar', 'isparta'],
  bursa: ['yalova', 'kocaeli', 'sakarya', 'bilecik', 'kutahya', 'balikesir', 'istanbul'],
  canakkale: ['balikesir', 'tekirdag', 'edirne'],
  cankiri: ['ankara', 'kirikkale', 'corum', 'kastamonu', 'karabuk', 'bolu'],
  corum: ['amasya', 'samsun', 'sinop', 'kastamonu', 'cankiri', 'kirikkale', 'yozgat'],
  denizli: ['aydin', 'manisa', 'usak', 'afyonkarahisar', 'burdur', 'mugla'],
  diyarbakir: ['sanliurfa', 'adiyaman', 'malatya', 'elazig', 'bingol', 'mus', 'batman', 'mardin'],
  edirne: ['kirklareli', 'tekirdag', 'canakkale', 'istanbul'],
  elazig: ['malatya', 'tunceli', 'bingol', 'diyarbakir'],
  erzincan: ['erzurum', 'bayburt', 'gumushane', 'giresun', 'sivas', 'tunceli', 'bingol'],
  erzurum: ['kars', 'agri', 'mus', 'bingol', 'erzincan', 'bayburt', 'rize', 'artvin', 'ardahan'],
  eskisehir: ['ankara', 'bolu', 'bilecik', 'kutahya', 'afyonkarahisar', 'konya'],
  gaziantep: ['kilis', 'sanliurfa', 'adiyaman', 'kahramanmaras', 'osmaniye', 'hatay'],
  giresun: ['trabzon', 'gumushane', 'erzincan', 'sivas', 'ordu'],
  gumushane: ['trabzon', 'bayburt', 'erzincan', 'giresun'],
  hakkari: ['van', 'sirnak'],
  hatay: ['adana', 'osmaniye', 'gaziantep'],
  isparta: ['antalya', 'burdur', 'afyonkarahisar', 'konya'],
  mersin: ['antalya', 'karaman', 'konya', 'nigde', 'adana'],
  icel: ['antalya', 'karaman', 'konya', 'nigde', 'adana'],
  istanbul: ['kocaeli', 'tekirdag', 'yalova', 'bursa', 'kirklareli', 'edirne', 'sakarya'],
  izmir: ['manisa', 'aydin', 'balikesir', 'mugla'],
  kars: ['ardahan', 'erzurum', 'agri', 'igdir'],
  kastamonu: ['sinop', 'corum', 'cankiri', 'karabuk', 'bartin', 'samsun', 'tokat'],
  kayseri: ['sivas', 'yozgat', 'nevsehir', 'nigde', 'adana', 'kahramanmaras'],
  kirklareli: ['edirne', 'tekirdag', 'istanbul'],
  kirsehir: ['ankara', 'kirikkale', 'yozgat', 'nevsehir', 'aksaray'],
  kocaeli: ['istanbul', 'sakarya', 'yalova', 'bursa'],
  konya: ['ankara', 'aksaray', 'nigde', 'mersin', 'karaman', 'antalya', 'isparta', 'afyonkarahisar', 'eskisehir'],
  kutahya: ['balikesir', 'bursa', 'bilecik', 'eskisehir', 'afyonkarahisar', 'usak', 'manisa'],
  malatya: ['elazig', 'diyarbakir', 'adiyaman', 'kahramanmaras', 'sivas', 'erzincan'],
  manisa: ['izmir', 'balikesir', 'kutahya', 'usak', 'denizli', 'aydin'],
  kahramanmaras: ['gaziantep', 'osmaniye', 'adana', 'kayseri', 'sivas', 'malatya', 'adiyaman'],
  mardin: ['sanliurfa', 'diyarbakir', 'batman', 'siirt', 'sirnak'],
  mugla: ['aydin', 'denizli', 'burdur', 'antalya', 'izmir'],
  mus: ['agri', 'bitlis', 'batman', 'diyarbakir', 'bingol', 'erzurum'],
  nevsehir: ['kirsehir', 'yozgat', 'kayseri', 'nigde', 'aksaray'],
  nigde: ['nevsehir', 'kayseri', 'adana', 'mersin', 'konya', 'aksaray'],
  ordu: ['samsun', 'tokat', 'sivas', 'giresun'],
  rize: ['artvin', 'erzurum', 'bayburt', 'trabzon'],
  sakarya: ['kocaeli', 'duzce', 'bolu', 'bilecik', 'bursa'],
  samsun: ['sinop', 'corum', 'amasya', 'tokat', 'ordu', 'kastamonu'],
  siirt: ['batman', 'bitlis', 'van', 'sirnak', 'mardin'],
  sinop: ['kastamonu', 'corum', 'samsun'],
  sivas: ['ordu', 'giresun', 'erzincan', 'malatya', 'kahramanmaras', 'kayseri', 'yozgat', 'tokat'],
  tekirdag: ['istanbul', 'edirne', 'kirklareli', 'canakkale'],
  tokat: ['samsun', 'ordu', 'sivas', 'yozgat', 'amasya', 'corum', 'kastamonu'],
  trabzon: ['rize', 'bayburt', 'gumushane', 'giresun'],
  tunceli: ['erzincan', 'bingol', 'elazig'],
  sanliurfa: ['gaziantep', 'adiyaman', 'diyarbakir', 'mardin'],
  usak: ['manisa', 'kutahya', 'afyonkarahisar', 'denizli'],
  van: ['agri', 'igdir', 'hakkari', 'sirnak', 'siirt', 'bitlis'],
  yozgat: ['corum', 'amasya', 'tokat', 'sivas', 'kayseri', 'nevsehir', 'kirsehir', 'kirikkale'],
  zonguldak: ['bartin', 'karabuk', 'bolu', 'duzce'],
  aksaray: ['ankara', 'kirsehir', 'nevsehir', 'nigde', 'konya'],
  bayburt: ['trabzon', 'rize', 'erzurum', 'erzincan', 'gumushane'],
  karaman: ['konya', 'mersin', 'antalya'],
  kirikkale: ['ankara', 'cankiri', 'corum', 'yozgat', 'kirsehir'],
  batman: ['diyarbakir', 'mus', 'bitlis', 'siirt', 'mardin'],
  sirnak: ['siirt', 'van', 'hakkari', 'mardin'],
  bartin: ['zonguldak', 'karabuk', 'kastamonu'],
  ardahan: ['artvin', 'erzurum', 'kars'],
  igdir: ['kars', 'agri', 'van'],
  yalova: ['kocaeli', 'bursa', 'istanbul'],
  karabuk: ['bartin', 'kastamonu', 'cankiri', 'bolu', 'zonguldak'],
  kilis: ['gaziantep', 'hatay'],
  osmaniye: ['adana', 'hatay', 'gaziantep', 'kahramanmaras'],
  duzce: ['sakarya', 'bolu', 'zonguldak'],
};

// 7 Coğrafi Bölge Grubu (Komşularda da ilan yoksa bölge genelinden çekmek için)
export const REGIONAL_GROUPS: Record<string, string[]> = {
  marmara: ['istanbul', 'edirne', 'kirklareli', 'tekirdag', 'canakkale', 'kocaeli', 'yalova', 'sakarya', 'bilecik', 'bursa', 'balikesir'],
  ege: ['izmir', 'manisa', 'aydin', 'denizli', 'mugla', 'afyonkarahisar', 'kutahya', 'usak'],
  akdeniz: ['antalya', 'isparta', 'burdur', 'mersin', 'adana', 'hatay', 'osmaniye', 'kahramanmaras'],
  icanadolu: ['ankara', 'konya', 'eskisehir', 'kayseri', 'aksaray', 'nigde', 'nevsehir', 'kirsehir', 'kirikkale', 'yozgat', 'cankiri', 'karaman', 'sivas'],
  karadeniz: ['samsun', 'trabzon', 'ordu', 'giresun', 'rize', 'artvin', 'sinop', 'kastamonu', 'amasya', 'tokat', 'corum', 'zonguldak', 'karabuk', 'bartin', 'bolu', 'duzce', 'bayburt', 'gumushane'],
  doguanadolu: ['erzurum', 'van', 'agri', 'malatya', 'elazig', 'kars', 'mus', 'bingol', 'bitlis', 'hakkari', 'tunceli', 'ardahan', 'igdir', 'erzincan'],
  guneydogu: ['gaziantep', 'sanliurfa', 'diyarbakir', 'mardin', 'batman', 'sirnak', 'siirt', 'adiyaman', 'kilis'],
};

/**
 * Belirli bir ilin doğrudan sınır komşularını döner.
 */
export function getNeighboringCitySlugs(ilSlug: string): string[] {
  const clean = (ilSlug || '').toLowerCase().trim();
  return TURKEY_NEIGHBORS_MAP[clean] || [];
}

/**
 * Belirli bir ilin bulunduğu bölgedeki tüm illeri döner.
 */
export function getRegionCities(ilSlug: string): string[] {
  const clean = (ilSlug || '').toLowerCase().trim();
  for (const group of Object.values(REGIONAL_GROUPS)) {
    if (group.includes(clean)) {
      return group.filter((c) => c !== clean);
    }
  }
  return [];
}

/**
 * Eğer bir şehirde ilan yoksa (veya azsa), coğrafi olarak en yakın komşu illerden aktif ilanları çeker.
 */
export async function getNearbyCityListings({
  targetIlSlug,
  limit = 12,
  excludeListingId,
}: {
  targetIlSlug: string;
  limit?: number;
  excludeListingId?: string;
}) {
  await connectToDatabase();
  const cleanSlug = (targetIlSlug || '').toLowerCase().trim();
  const nowDate = new Date();

  const neighbors = getNeighboringCitySlugs(cleanSlug);
  const regionCities = getRegionCities(cleanSlug);

  // Komşular + Bölge İlleri birleşimi (Tekil)
  const candidateCities = Array.from(new Set([...neighbors, ...regionCities]));

  const baseQuery: any = {
    status: 'yayinda',
    $or: [
      { paketBitisTarihi: { $exists: false } },
      { paketBitisTarihi: null },
      { paketBitisTarihi: { $gt: nowDate } },
    ],
  };

  if (excludeListingId) {
    baseQuery._id = { $ne: excludeListingId };
  }

  // 1. Aşama: Doğrudan komşu illerdeki ilanları ara
  if (candidateCities.length > 0) {
    const nearbyQuery = {
      ...baseQuery,
      ilSlug: { $in: candidateCities },
    };

    const nearbyListings = await ListingModel.find(nearbyQuery)
      .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf fotograflar createdAt status siraNo isPromo goruntulenmeSayisi')
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean();

    if (nearbyListings && nearbyListings.length > 0) {
      // Komşuluk önceliğine göre sırala: İlk sırada en yakın komşular, sonra görüntülenmesi az olanlar
      const sorted = (nearbyListings as any[]).sort((a: any, b: any) => {
        const aIsDirectNeighbor = neighbors.includes(a.ilSlug) ? 0 : 1;
        const bIsDirectNeighbor = neighbors.includes(b.ilSlug) ? 0 : 1;
        if (aIsDirectNeighbor !== bIsDirectNeighbor) return aIsDirectNeighbor - bIsDirectNeighbor;

        // Eşitlik durumunda görüntülenmesi az olanı öne çıkar
        const viewsA = a.goruntulenmeSayisi || 0;
        const viewsB = b.goruntulenmeSayisi || 0;
        return viewsA - viewsB;
      });

      return JSON.parse(JSON.stringify(sorted.slice(0, limit)));
    }
  }

  // 2. Aşama: Komşularda da hiç ilan yoksa Türkiye geneli en popüler/aktif ilanlardan fallback getir
  const fallbackQuery = {
    ...baseQuery,
    ilSlug: { $ne: cleanSlug },
  };

  const fallbackListings = await ListingModel.find(fallbackQuery)
    .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf fotograflar createdAt status siraNo isPromo goruntulenmeSayisi')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(fallbackListings));
}

/**
 * İlan Detay Sayfası İçin Akıllı Öneri Algoritması:
 * 1. Aynı ilçedeki ilanlar
 * 2. Aynı ildeki diğer ilçelerdeki ilanlar
 * 3. Komşu illerdeki ilanlar
 * 4. Düşük görüntülenme (Fair-exposure: her modele eşit trafik) + Rozet ağırlığı ile sıralama
 */
export async function getSmartRecommendedListings({
  currentListingId,
  currentSlug,
  ilSlug,
  ilceSlug,
  limit = 6,
}: {
  currentListingId?: string;
  currentSlug?: string;
  ilSlug: string;
  ilceSlug?: string;
  limit?: number;
}) {
  await connectToDatabase();
  const nowDate = new Date();
  const cleanIl = (ilSlug || '').toLowerCase().trim();
  const cleanIlce = (ilceSlug || '').toLowerCase().trim();

  const baseQuery: any = {
    status: 'yayinda',
    $or: [
      { paketBitisTarihi: { $exists: false } },
      { paketBitisTarihi: null },
      { paketBitisTarihi: { $gt: nowDate } },
    ],
  };

  if (currentListingId) {
    baseQuery._id = { $ne: currentListingId };
  }
  if (currentSlug) {
    baseQuery.slug = { $ne: currentSlug };
  }

  const neighbors = getNeighboringCitySlugs(cleanIl);

  // Havuz: Aynı il + komşu illerden toplam 30 aday çek
  const candidateQuery = {
    ...baseQuery,
    ilSlug: { $in: [cleanIl, ...neighbors] },
  };

  const candidates = await ListingModel.find(candidateQuery)
    .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf fotograflar createdAt status siraNo isPromo goruntulenmeSayisi likeSayisi')
    .limit(30)
    .lean();

  let candidateList = (candidates || []) as any[];

  // Eğer komşular dahil aday sayısı limitin altındaysa Türkiye genelinden takviye et
  if (candidateList.length < limit) {
    const additional = await ListingModel.find(baseQuery)
      .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf fotograflar createdAt status siraNo isPromo goruntulenmeSayisi likeSayisi')
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean();

    const existingIds = new Set(candidateList.map((c: any) => c._id.toString()));
    for (const add of additional) {
      if (!existingIds.has(add._id.toString())) {
        candidateList.push(add);
      }
    }
  }

  // Akıllı Puanlama Algoritması:
  // - Aynı ilçe: +100 puan
  // - Aynı il: +60 puan
  // - Doğrudan Komşu İl: +30 puan
  // - Düşük Görüntülenme: Görüntülenme sayısı ne kadar azsa o kadar yüksek öncelik (+1 ila +20 puan)
  // - VIP/Rozet Desteği: VIP (+15), Gold (+10), Silver (+5)
  const scoredListings = candidateList.map((item: any) => {
    let score = 0;
    const itemIl = (item.ilSlug || '').toLowerCase();
    const itemIlce = (item.ilceSlug || '').toLowerCase();

    if (cleanIlce && cleanIlce !== 'genel' && itemIlce === cleanIlce && itemIl === cleanIl) {
      score += 100;
    } else if (itemIl === cleanIl) {
      score += 60;
    } else if (neighbors.includes(itemIl)) {
      score += 30;
    } else {
      score += 10;
    }

    // Görüntülenmesi az olana öncelik (Fair Traffic Balance)
    const views = item.goruntulenmeSayisi || 0;
    if (views < 50) score += 20;
    else if (views < 200) score += 15;
    else if (views < 500) score += 10;
    else score += 5;

    // Rozet Önceliği
    if (item.rozet === 'ultravip' || item.rozet === 'vip') score += 15;
    else if (item.rozet === 'gold') score += 10;
    else score += 5;

    return { item, score };
  });

  // Puana göre yüksekten düşüğe sırala
  scoredListings.sort((a, b) => b.score - a.score);

  const finalResults = scoredListings.slice(0, limit).map((s) => s.item);
  return JSON.parse(JSON.stringify(finalResults));
}
