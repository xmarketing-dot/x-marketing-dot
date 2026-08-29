import { ALL_LOCATIONS_MAP } from './domainLocations';

export interface LocationTarget {
  ilSlug: string;
  ilceSlug?: string;
}

// Anahtar uzunluklarına göre büyükten küçüğe sıralanmış girişler (örn: 'yuksekova' ve 'hakkari', 'sur' veya 'bor'dan önce eşleşir)
const SORTED_ENTRIES = Object.entries(ALL_LOCATIONS_MAP).sort((a, b) => b[0].length - a[0].length);

/**
 * Gelen host header'ından (örn: hakkariescort.devs.surf, yuksekovaescort.devs.surf, bodrumescort.com...)
 * Türkiye'nin tüm 81 ili ve 380+ ilçesi arasından hedef bölgeyi hatasız ve %100 dinamik çözer.
 * 
 * - Hakkari eklenirse -> Hakkari il vitrini açılır.
 * - Yüksekova eklenirse -> Hakkari / Yüksekova ilçe vitrini açılır.
 * - Bodrum eklenirse -> Muğla / Bodrum ilçe vitrini açılır.
 * - Tanınmayan bir domain gelirse -> ASLA patlamaz, null döner ve site ana platform olarak kusursuz çalışır.
 */
export function resolveTargetFromHost(hostname: string): LocationTarget | null {
  if (!hostname) return null;

  // 1. Port ve TLD uzantılarını temizle (.devs.surf, .com.tr, .com, .net, vb.)
  let cleanHost = hostname.toLowerCase().split(':')[0];
  cleanHost = cleanHost.replace(
    /\.(devs\.surf|com\.tr|org\.tr|net\.tr|gen\.tr|com|net|org|site|club|xyz|online|vip|top|live|info|biz)$/i,
    ''
  );

  // 2. Önce ilçeleri kontrol et (daha spesifik olduğu için: örn. yuksekova, beylikduzu, bodrum, alanya, cankaya)
  for (const [key, loc] of SORTED_ENTRIES) {
    if (loc.ilceSlug && cleanHost.includes(key)) {
      return loc;
    }
  }

  // 3. Sonra 81 ili kontrol et (örn: hakkari, ardahan, bayburt, kars, istanbul, izmir, ankara vb.)
  for (const [key, loc] of SORTED_ENTRIES) {
    if (!loc.ilceSlug && cleanHost.includes(key)) {
      return loc;
    }
  }

  return null;
}
