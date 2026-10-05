/**
 * Official Administration & Contact Configuration
 * 
 * ============================================================================
 * %100 DİNAMİK ADMİN WHATSAPP İLETİŞİM HATTI (PANEL & VERİTABANI ODAKLI)
 * ============================================================================
 * 
 * Admin panelinden (BMS Secure Portal) girilen numara MongoDB'ye kaydedilir.
 * Kod içinde hiçbir sabit/yedek telefon numarası tutulmaz; numara doğrudan
 * veritabanından çekilip tüm sitede anında canlıya alınır.
 */

export const ADMIN_PHONE_NUMBER = '';

export interface FormattedPhoneDetails {
  raw: string;          // wa.me ve API için yalın rakamlar: "905551234567"
  formatted: string;    // Uluslararası format: "+90 555 123 45 67"
  display: string;      // Arayüz gösterimi: "0555 123 45 67"
  waLink: string;       // "https://wa.me/905551234567"
}

// Tarayıcı tarafında dinamik DB numarasını tutan bellek önbelleği
let _clientDynamicPhone: string | null = null;

/**
 * İstemci tarafında çalışan sayfalar için dinamik numarayı günceller ve localStorage'a kaydeder.
 */
export function setClientAdminWhatsApp(phone: string) {
  if (phone === undefined || phone === null) return;
  const trimmed = phone.trim();
  const changed = _clientDynamicPhone !== trimmed;
  _clientDynamicPhone = trimmed;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bms_admin_whatsapp', _clientDynamicPhone);
      if (changed) {
        window.dispatchEvent(new CustomEvent('bms_admin_phone_updated', { detail: _clientDynamicPhone }));
      }
    } catch (e) {}
  }
}

/**
 * Aktif admin telefonunu tespit eder (Sırasıyla: override -> hafıza -> localStorage -> DB/API)
 */
export function getActiveAdminPhone(override?: string): string {
  if (override && override.trim()) {
    return override.trim();
  }
  if (_clientDynamicPhone !== null && _clientDynamicPhone !== undefined) {
    return _clientDynamicPhone;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('bms_admin_whatsapp');
      if (stored !== null && stored !== undefined) {
        _clientDynamicPhone = stored.trim();
        return _clientDynamicPhone;
      }
    } catch (e) {}
  }
  return '';
}

/**
 * Verilen telefon numarasını uluslararası ve yerel kurallara göre dinamik parse & format eder.
 * Endonezya (+62), Türkiye (+90) veya genel uluslararası numaraları otomatik tanır.
 */
export function parsePhoneNumber(input?: string): FormattedPhoneDetails {
  const source = (input !== undefined && input !== null ? input : getActiveAdminPhone()).trim();
  let clean = source.replace(/\D/g, '');

  if (!clean) {
    return {
      raw: '',
      formatted: '',
      display: '',
      waLink: '#',
    };
  }

  // Türkiye cep normalizasyonu: 05xx -> 905xx, 5xx -> 905xx
  if (clean.startsWith('0') && clean.length === 11 && clean.startsWith('05')) {
    clean = '90' + clean.slice(1);
  } else if (clean.length === 10 && clean.startsWith('5')) {
    clean = '90' + clean;
  }

  let formatted = '';
  let display = '';

  if (clean.startsWith('90') && clean.length === 12) {
    // Türkiye (+90 5xx xxx xx xx)
    const local = clean.slice(2);
    formatted = `+90 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
    display = `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
  } else if (clean.startsWith('62')) {
    // Endonezya (+62)
    const local = clean.slice(2);
    if (local.length >= 9) {
      const p1 = local.slice(0, 3);
      const p2 = local.slice(3, 7);
      const p3 = local.slice(7);
      formatted = `+62 ${p1} ${p2} ${p3}`.trim();
      display = formatted;
    } else {
      formatted = `+62 ${local}`;
      display = formatted;
    }
  } else {
    // Diğer uluslararası numaralar (+1, +44, +49 vs.)
    formatted = `+${clean}`;
    display = formatted;
  }

  return {
    raw: clean,
    formatted,
    display,
    waLink: `https://wa.me/${clean}`,
  };
}

/**
 * Dinamik olarak tek merkezden türetilen sabitler
 */
export const ADMIN_PHONE_DETAILS = parsePhoneNumber('');
export const ADMIN_WHATSAPP_RAW = ADMIN_PHONE_DETAILS.raw;
export const ADMIN_WHATSAPP_FORMATTED = ADMIN_PHONE_DETAILS.formatted;
export const ADMIN_WHATSAPP_DISPLAY = ADMIN_PHONE_DETAILS.display;

/**
 * Returns clean sanitized digits of admin WhatsApp number
 */
export function getAdminWhatsAppNumber(overridePhone?: string): string {
  const active = getActiveAdminPhone(overridePhone);
  return parsePhoneNumber(active).raw;
}

/**
 * Returns user-friendly formatted admin WhatsApp number
 */
export function getAdminWhatsAppFormatted(overridePhone?: string): string {
  const active = getActiveAdminPhone(overridePhone);
  return parsePhoneNumber(active).formatted;
}

/**
 * Returns display representation
 */
export function getAdminWhatsAppDisplay(overridePhone?: string): string {
  const active = getActiveAdminPhone(overridePhone);
  return parsePhoneNumber(active).display;
}

/**
 * Returns full WhatsApp direct link with optional custom text
 */
export function getAdminWhatsAppUrl(customMessage?: string, overridePhone?: string): string {
  const active = getActiveAdminPhone(overridePhone);
  const { raw } = parsePhoneNumber(active);
  if (!raw) return '#';
  if (customMessage && customMessage.trim()) {
    return `https://wa.me/${raw}?text=${encodeURIComponent(customMessage.trim())}`;
  }
  return `https://wa.me/${raw}`;
}

/**
 * Professional Auto-Greeting & Package Presentation Message
 */
export function generateAutoPackageMessage(listingBaslik?: string, password?: string, overridePhone?: string): string {
  const active = getActiveAdminPhone(overridePhone);
  const { formatted, waLink } = parsePhoneNumber(active);

  return `🔥 ÖNE ÇIKMA & VİTRİN PAKETLERİ 🔥

${listingBaslik ? `✅ "${listingBaslik}" ilanınız sisteme başarıyla kaydedildi.` : '✅ İlan başvurunuz başarıyla alındı.'}
${password ? `🔑 İlan Düzenleme / Panel Şifreniz: ${password}\n` : ''}
Profilinizin daha fazla müşteriye ulaşması ve listelerde en üstte yer alması için özel tanıtım ve vitrin seçenekleri:

👑 VIP PAKET (VIP VİTRİN) — 7.000 TL
• En üst sıralarda 1. öncelikli görünürlük
• VIP Vitrin alanında özel manşet konumlandırma
• Maksimum tekil müşteri erişimi ve doğrudan WhatsApp trafiği

💎 GOLD PAKET (GOLD VİTRİN) — 4.000 TL
• Üst sıralarda öncelikli görünürlük
• Gold Vitrin alanında sabit gösterim
• Yüksek dönüşüm ve elit müşteri akışı

🥈 SILVER PAKET (SILVER VİTRİN) — 2.500 TL
• Silver Vitrin alanında gösterim
• Standart profillere göre daha yüksek görünürlük

📌 Paketler sınırlı kontenjanla sunulmaktadır.
💳 IBAN / Havale veya Kripto (USDT TRC-20) ile anında onaylı ödeme.

📩 Detaylı bilgi, paket seçimi ve anında aktivasyon için bizimle iletişime geçebilirsiniz:` +
(formatted ? `\n📱 WhatsApp Destek Hattı: ${formatted}\n🌐 Doğrudan WhatsApp: ${waLink}` : '');
}

export { useAdminWhatsApp } from './useAdminWhatsApp';
