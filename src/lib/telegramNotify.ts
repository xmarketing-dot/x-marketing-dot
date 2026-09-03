/**
 * Telegram Bot Bildirim Yardımcısı
 * Yeni chat mesajı geldiğinde admin'e Telegram bildirimi gönderir.
 */

const TELEGRAM_API = 'https://api.telegram.org';

export async function sendTelegramNotification(text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_KEY;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    // Env ayarlanmamışsa sessizce geç
    return;
  }

  try {
    await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    // Telegram hatası sitenin çalışmasını etkilemesin
    console.error('Telegram notification failed (non-critical):', err);
  }
}
