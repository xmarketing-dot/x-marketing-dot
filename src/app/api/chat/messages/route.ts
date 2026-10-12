import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import BanModel from '@/models/Ban';
import HomepageConfigModel from '@/models/HomepageConfig';
import { getSiteUrl } from '@/lib/siteUrl';
import { getAdminWhatsAppDisplay, getAdminWhatsAppUrl } from '@/lib/siteConfig';
import { chatEmitter } from '@/lib/chatEmitter';
import { sendTelegramNotification } from '@/lib/telegramNotify';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json({ error: 'threadId required' }, { status: 400 });
    }

    await connectToDatabase();

    const targetThreadId = mongoose.Types.ObjectId.isValid(threadId)
      ? new mongoose.Types.ObjectId(threadId)
      : threadId;

    const messages = await ChatMessageModel.find({ threadId: targetThreadId })
      .select('_id threadId gonderenTipi mesaj okundu createdAt')
      .sort({ createdAt: 1 })
      .limit(150)
      .lean();

    return NextResponse.json(
      { messages: JSON.parse(JSON.stringify(messages)) },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, gonderenTipi, mesaj, kullaniciAdi, kullaniciTelefon } = body;

    if (!threadId || !mesaj) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    const sender = gonderenTipi || 'user';

    // 1. If sender is user, check if banned
    if (sender === 'user') {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

      const ban = await BanModel.findOne({
        aktif: true,
        $or: [
          { ip: clientIp },
          { threadId },
        ],
      }).lean();

      if (ban) {
        return NextResponse.json(
          {
            error: 'Mesaj gönderilemedi: Erişiminiz engellenmiştir.',
            isBanned: true,
            banSebebi: ban.sebep,
          },
          { status: 403 }
        );
      }
    }

    const newMsg = await ChatMessageModel.create({
      threadId,
      gonderenTipi: sender,
      mesaj,
      okundu: false,
    });

    const updateField = sender === 'user' ? { $inc: { okunmadiAdminSayisi: 1 } } : { $inc: { okunmadiKullaniciSayisi: 1 } };

    const rawUserPhone = (kullaniciTelefon || body.kullaniciTelefon || '').toString().trim();
    const rawUserName = (kullaniciAdi || body.kullaniciAdi || '').toString().trim();

    const threadUpdate: any = {
      sonMesajOzeti: mesaj,
      updatedAt: new Date(),
      ...updateField,
    };

    if (rawUserName) threadUpdate.kullaniciAdi = rawUserName;
    if (rawUserPhone) threadUpdate.kullaniciTelefon = rawUserPhone;

    const updatedThread = await ChatThreadModel.findByIdAndUpdate(
      threadId,
      threadUpdate,
      { returnDocument: 'after' }
    ).lean();

    const serializedMsg = JSON.parse(JSON.stringify(newMsg));
    const serializedThread = JSON.parse(JSON.stringify(updatedThread));

    // Instantly emit events to open SSE streams (0ms latency, ZERO polling)
    chatEmitter.emit('new_message', serializedMsg);
    chatEmitter.emit('thread_update', serializedThread);

    // Telegram bildirimi — sadece kullanıcı mesajında (admin mesajlarında değil)
    if (sender === 'user') {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (updatedThread?.ip || '');
      const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      const userName = updatedThread?.kullaniciAdi || 'Ziyaretçi';
      const userPhone = updatedThread?.kullaniciTelefon || '';
      const listingTitle = updatedThread?.listingBaslik || '';

      // HTML kaçış (özel karakterler Telegram mesajını bozmasın)
      const cleanMsg = String(mesaj)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const notifText = [
        `💬 <b>MÜŞTERİ MESAJI</b> (${nowStr})`,
        `👤 <b>Gönderen:</b> <b>${userName}</b>${userPhone ? ` (<code>${userPhone}</code>)` : ''}`,
        listingTitle ? `👑 <b>İlanı:</b> <code>${listingTitle}</code>` : '',
        clientIp ? `📍 IP: <code>${clientIp}</code>` : '',
        `🆔 <b>Sohbet Kodu:</b> <code>#THR_${threadId}</code>`,
        ``,
        `<blockquote>${cleanMsg}</blockquote>`,
        ``,
        `👉 <i>Bu müşteriye cevap vermek için bu mesaja <b>Yanıtla (Reply)</b> yaparak yazınız.</i>`,
      ].filter(Boolean).join('\n');

      sendTelegramNotification(notifText).then((tgRes) => {
        if (tgRes && tgRes.message_id) {
          ChatMessageModel.findByIdAndUpdate(newMsg._id, {
            telegramMessageId: tgRes.message_id,
          }).catch(() => { });
        }
      }).catch(() => { });
    }

    // ── OTOMATİK BOT / CANLI DESTEK HAZIR YANITI (İLAN VE PAKET TALEPLERİ) ──
    let serializedBotMsg: any = null;
    if (sender === 'user') {
      const lower = mesaj.toLowerCase().trim();
      const isListingInquiry =
        lower.includes('ilan') ||
        lower.includes('fiyat') ||
        lower.includes('ücret') ||
        lower.includes('ucret') ||
        lower.includes('paket') ||
        lower.includes('detay') ||
        lower.includes('reklam');

      if (isListingInquiry) {
        // Cooldown: Son 2 dakika içinde zaten aynı otomatik mesaj atılmış mı kontrol et
        const recentBot = await ChatMessageModel.findOne({
          threadId,
          gonderenTipi: 'admin',
          mesaj: { $regex: /ÖNE ÇIKMA PAKETLERİ/i },
          createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
        }).lean();

        if (!recentBot) {
          // 1. Kullanıcının bu mesajını anında okundu yap (sistem gördü ve cevapladı)
          await ChatMessageModel.findByIdAndUpdate(newMsg._id, { okundu: true });
          serializedMsg.okundu = true;
          chatEmitter.emit('messages_read', { threadId, reader: 'admin' });

          // 2. Dinamik WhatsApp numarasını ve site URL'sini al
          const cfg = await HomepageConfigModel.findOne().select('adminWhatsApp').lean();
          const activePhone = cfg?.adminWhatsApp || '';
          const phoneText = getAdminWhatsAppDisplay(activePhone);
          const whatsappUrl = getAdminWhatsAppUrl(undefined, activePhone);
          const siteUrl = getSiteUrl();

          const autoReplyText = `Merhaba, Best Eskort VIP Canlı Destek Merkezine hoş geldiniz! 👑\n\nİlanınızı 2 farklı şekilde oluşturabilirsiniz:\n1️⃣ Dilerseniz WhatsApp destek hattımızdan (${phoneText}) bilgilerinizi ve fotoğraflarınızı gönderin, ilanı doğrudan biz açalım:\n👉 WhatsApp Hızlı İletişim: ${whatsappUrl}\n\n2️⃣ İsterseniz web sitemiz üzerinden formu doldurarak kendiniz ilan oluşturabilir ve ödeme aşamasında bize ulaşabilirsiniz:\n👉 İlan Oluşturma Formu: ${siteUrl}/ilan-ver\n\n────────────────────────────\n🔥 BEST ESKORT – ÖNE ÇIKMA PAKETLERİ 🔥\n\nProfilinizin daha fazla kullanıcıya ulaşması ve listelerde daha görünür olması için farklı tanıtım seçenekleri:\n\n👑 VIP PAKET — 7.000 TL\n• En üst sıralarda görünürlük\n• VIP alanında özel konumlandırma\n• Maksimum görünürlük\n+EN ÜST VİTRİN 1 GÜNLÜK(BÜYÜK ANASAYFA RESİM ALANİ) BEDAVA SONRASİ 1 GÜN 2000 TL\n\n💎 GOLD PAKET — 4.000 TL\n• Üst sıralarda görünürlük\n• Gold vitrin alanında gösterim\n• Yüksek görünürlük\n\n🥈 SILVER PAKET — 2.500 TL\n• Silver vitrin alanında gösterim\n• Standart profile göre daha yüksek görünürlük\n\n📌 Paketler sınırlı kontenjanla sunulmaktadır.\n\n📩 Detaylı bilgi ve paket seçimi için bizimle iletişime geçebilirsiniz.\n\nBEST ESKORT\n✨ Daha fazla görünürlük, daha fazla erişim.`;

          const botMsg = await ChatMessageModel.create({
            threadId,
            gonderenTipi: 'admin',
            mesaj: autoReplyText,
            okundu: false,
          });

          await ChatThreadModel.findByIdAndUpdate(threadId, {
            sonMesajOzeti: '👑 VIP İlan Verme & Paket Rehberi İletildi',
            updatedAt: new Date(),
            $inc: { okunmadiKullaniciSayisi: 1 },
          });

          serializedBotMsg = JSON.parse(JSON.stringify(botMsg));
          chatEmitter.emit('new_message', serializedBotMsg);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: serializedMsg,
      autoReply: serializedBotMsg || undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
