/**
 * BTK (Bilgi Teknolojileri ve İletişim Kurumu), Kamu Denetim Ağları ve
 * Otomasyon/Scraping Veri Merkezleri için ASN ve IP Filtreleme Kalkanı.
 *
 * Meşru kullanıcılar (Turkcell, Vodafone, TTNET Ev/Mobil) normal erişir.
 * BTK ve kamu denetmenleri ise mobilde dahi "X-Marketing Tech Kurumsal Ajans" görür.
 */

// BTK, Kamu ve Scraper Veri Merkezi ASN Listesi
export const BLOCKED_ASNS = new Set<string>([
  // ── 1. KAMU & BTK AĞLARI ──
  '47524',  // Bilgi Teknolojileri ve İletişim Kurumu (BTK)
  '13124',  // ULAKBIM (TÜBİTAK, Kamu Kurumları Ulusal Ağı)

  // ── 2. GLOBAL & TÜRKİYE DATACENTER/SCRAPER ASN'LERİ ──
  '16509',  // Amazon AWS
  '14618',  // Amazon AWS
  '14061',  // DigitalOcean
  '24940',  // Hetzner
  '16276',  // OVH SAS
  '8075',   // Microsoft Azure
  '63949',  // Linode / Akamai
  '20473',  // Vultr / Choopa
  '51167',  // Contabo
  '12876',  // Scaleway
  '42926',  // Radore Veri Merkezi (TR)
  '49505',  // DGN Teknoloji (TR)
  '58224',  // Netinternet (TR)
  '203020', // PremierDC (TR)
]);

// Bilinen BTK ve Kamu IP Blokları (Prefix kontrolü)
export const BLOCKED_IP_PREFIXES = [
  '213.14.',      // BTK Ankara
  '195.175.254.',  // Turk Telekom Kamu Ağı
  '212.156.12.',   // Kamu Omurgası
  '193.140.',      // TÜBİTAK / ULAKBİM
  '194.27.',       // Türkiye Kamu Ağları
];

/**
 * Gelen isteğin BTK, kamu kurumu veya otomatik denetim sunucusu olup olmadığını tespit eder.
 */
export function isGovernmentOrDatacenter(asn?: string | null, ip?: string | null): boolean {
  if (asn && BLOCKED_ASNS.has(asn.trim())) {
    return true;
  }

  if (ip) {
    const cleanIp = ip.trim();
    for (const prefix of BLOCKED_IP_PREFIXES) {
      if (cleanIp.startsWith(prefix)) {
        return true;
      }
    }
  }

  return false;
}
