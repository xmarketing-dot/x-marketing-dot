/**
 * Telegram Bot Bildirim Yardımcısı
 * Yeni chat mesajı geldiğinde admin'e Telegram bildirimi gönderir.
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
