/**
 * Telegram Bot Bildirim Yardımcısı
 * 1. Yeni chat mesajı geldiğinde admin'e Telegram bildirimi gönderir.
 * 2. Yeni veya onaylanan ilanları otomatik olarak @besteskortagency Telegram kanalında paylaşır.
 */

const TELEGRAM_API = 'https://api.telegram.org';

export async function sendTelegramNotification(text: string): Promise<any> {
  const botToken = process.env.TELEGRAM_BOT_KEY;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    return null;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      // Fallback: Strip HTML tags and send as plain text so notification NEVER drops
      const plainText = text.replace(/<[^>]*>/g, '');
      const retryRes = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainText,
          disable_web_page_preview: true,
        }),
      });
      const retryData = await retryRes.json();
      return retryData.ok ? retryData.result : null;
    }
    return data.ok ? data.result : null;
  } catch (err) {
    console.error('Telegram notification failed (non-critical):', err);
    return null;
  }
}

/**
 * Yeni ilan onaylandığında veya yayına alındığında @besteskortagency kanalına otomatik post atar.
 */
export async function postListingToTelegramChannel(listing: any): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_KEY;
  const channelChatId = process.env.TELEGRAM_CHANNEL_ID || '@besteskortagency';

  if (!botToken) {
    console.warn('[Telegram Channel] TELEGRAM_BOT_KEY bulunamadı, post atılmadı.');
    return false;
  }

  try {
    const siteUrl = 'https://www.besteskort.online';
    const ilanUrl = `${siteUrl}/ilan/${listing.slug}`;
    const cleanPhone = listing.whatsappNumara ? String(listing.whatsappNumara).replace(/\D/g, '') : '';
    const wpUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

    const cityStr = (listing.ilSlug || 'TÜRKİYE').toUpperCase();
    const distStr = (listing.ilceSlug || 'GENEL').toUpperCase();
    const tierStr = (listing.rozet || 'VIP').toUpperCase();

    const caption =
      `👑 <b>YENİ VİP İLAN YAYINLANDI!</b> 👑\n\n` +
      `🌟 <b>Model:</b> ${listing.baslik || 'VIP Model'}\n` +
      `📍 <b>Konum:</b> ${cityStr} / ${distStr}\n` +
      `💎 <b>Kategori:</b> ${tierStr}\n\n` +
      `📸 <i>Doğrulanmış WhatsApp iletişim numarası ve diğer tüm fotoğraflar için ilanı inceleyin:</i>\n\n` +
      `🔗 <b>İlan Linki:</b>\n${ilanUrl}\n\n` +
      `💋 @besteskortagency`;

    const inlineKeyboard: any[][] = [
      [
        { text: '💋 Profili & Numarayı Gör', url: ilanUrl },
      ],
      [
        { text: '🌐 www.besteskort.online', url: siteUrl },
      ],
    ];

    // Ana fotoğraf URL tespiti
    let photoUrl = '';
    if (listing.anaFotograf?.url) {
      photoUrl = listing.anaFotograf.url;
    } else if (Array.isArray(listing.fotograflar) && listing.fotograflar.length > 0) {
      const first = listing.fotograflar[0];
      photoUrl = typeof first === 'string' ? first : first?.url || '';
    }

    if (photoUrl && !photoUrl.startsWith('http')) {
      photoUrl = `${siteUrl}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
    }

    // 1. Fotoğraflı Post Gönderimi
    if (photoUrl && photoUrl.startsWith('http')) {
      const photoRes = await fetch(`${TELEGRAM_API}/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelChatId,
          photo: photoUrl,
          caption,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        }),
      });

      const photoData = await photoRes.json();
      if (photoData.ok) {
        console.log('[Telegram Channel] Fotoğraflı ilan postu başarıyla paylaşıldı:', listing.baslik);
        return true;
      }
      console.warn('[Telegram Channel] Fotoğraflı post gönderilemedi, metin olarak deneniyor:', photoData.description);
    }

    // 2. Fotoğrafsız Metin Postu Fallback
    const msgRes = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelChatId,
        text: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }),
    });

    const msgData = await msgRes.json();
    if (msgData.ok) {
      console.log('[Telegram Channel] İlan metin postu başarıyla paylaşıldı:', listing.baslik);
      return true;
    }

    console.error('[Telegram Channel] Mesaj postu başarısız:', msgData);
    return false;
  } catch (err) {
    console.error('[Telegram Channel] Otomatik post hatası:', err);
    return false;
  }
}
