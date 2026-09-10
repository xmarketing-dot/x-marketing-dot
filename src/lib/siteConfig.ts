/**
 * BEST ESKORT — Official Administration & Contact Configuration
 */

export const ADMIN_WHATSAPP_RAW = '905551747432';
export const ADMIN_WHATSAPP_FORMATTED = '+90 555 174 74 32';
export const ADMIN_WHATSAPP_DISPLAY = '0555 174 74 32';

/**
 * Returns clean sanitized digits of admin WhatsApp number
 */
export function getAdminWhatsAppNumber(): string {
  const envNum = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || process.env.ADMIN_WHATSAPP;
  if (envNum && envNum.trim()) {
    return envNum.replace(/\D/g, '');
  }
  return ADMIN_WHATSAPP_RAW;
}

/**
 * Returns full WhatsApp direct link with optional custom text
 */
export function getAdminWhatsAppUrl(customMessage?: string): string {
  const num = getAdminWhatsAppNumber();
  if (customMessage && customMessage.trim()) {
    return `https://wa.me/${num}?text=${encodeURIComponent(customMessage.trim())}`;
  }
  return `https://wa.me/${num}`;
}

/**
 * Professional Auto-Greeting & Package Presentation Message
 * Sent automatically when a listing is created or user enters chat.
 */
export function generateAutoPackageMessage(listingBaslik?: string, password?: string): string {
  const phone = ADMIN_WHATSAPP_FORMATTED;
  const num = getAdminWhatsAppNumber();
  const waLink = `https://wa.me/${num}`;

  return `🔥 BEST ESKORT – ÖNE ÇIKMA & VİTRİN PAKETLERİ 🔥

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

📩 Detaylı bilgi, paket seçimi ve anında aktivasyon için bizimle iletişime geçebilirsiniz:
📱 WhatsApp Destek Hattı: ${phone}
🌐 Doğrudan WhatsApp: ${waLink}

BEST ESKORT
✨ Daha fazla görünürlük, daha fazla erişim.`;
}
