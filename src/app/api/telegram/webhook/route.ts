import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import { chatEmitter } from '@/lib/chatEmitter';
import { sendTelegramNotification } from '@/lib/telegramNotify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || '1526627697');
    const senderChatId = String(message.chat?.id || '');

    // Sadece senin Telegram hesabından gelen yanıtları kabul et
    if (senderChatId !== adminChatId) {
      return NextResponse.json({ ok: true });
    }

    let replyText = message.text.trim();
    if (!replyText) return NextResponse.json({ ok: true });

    await connectToDatabase();

    let targetThreadId: string | null = null;

    // 1. Reply yaptıysan:
    if (message.reply_to_message) {
      // 1.a) Orijinal Telegram mesajının içindeki #THR_ sohbet kodundan nokta atışı bul (En Güvenli)
      const repliedText = message.reply_to_message.text || '';
      const threadMatch = repliedText.match(/#THR_([a-f0-9]{24})/i);
      if (threadMatch && threadMatch[1]) {
        targetThreadId = threadMatch[1];
      }

      // 1.b) Eğer metinde bulamazsa DB'deki telegramMessageId üzerinden eşleştir
      if (!targetThreadId && message.reply_to_message.message_id) {
        const repliedMsgId = message.reply_to_message.message_id;
        const originalChatMessage = await ChatMessageModel.findOne({
          telegramMessageId: repliedMsgId,
        }).lean();

        if (originalChatMessage && originalChatMessage.threadId) {
          targetThreadId = originalChatMessage.threadId.toString();
        }
      }
    }

    // 2. Mesajın başına manuel ID yazıldıysa (örn: #6a8c... Selam veya /c_6a8c... Selam)
    if (!targetThreadId) {
      const manualMatch = replyText.match(/^(?:#THR_|#|\/c_)([a-f0-9]{24})\s+([\s\S]+)$/i);
      if (manualMatch) {
        targetThreadId = manualMatch[1];
        replyText = manualMatch[2].trim();
      }
    }

    // 3. Hiçbiri yoksa: En son mesaj atmış aktif müşteriyi bul (Fallback)
    if (!targetThreadId) {
      const latestThread = await ChatThreadModel.findOne().sort({ updatedAt: -1 }).lean();
      if (latestThread) {
        targetThreadId = (latestThread._id as any).toString();
      }
    }

    if (!targetThreadId) {
      return NextResponse.json({ ok: true });
    }

    // Mesajı Admin olarak DB'ye yaz
    const newMsg = await ChatMessageModel.create({
      threadId: targetThreadId,
      gonderenTipi: 'admin',
      mesaj: replyText,
      okundu: false,
    });

    const updatedThread = await ChatThreadModel.findByIdAndUpdate(
      targetThreadId,
      {
        sonMesajOzeti: `Admin: ${replyText}`,
        updatedAt: new Date(),
        $inc: { okunmadiKullaniciSayisi: 1 },
      },
      { returnDocument: 'after' }
    ).lean();

    const serializedMsg = JSON.parse(JSON.stringify(newMsg));
    const serializedThread = JSON.parse(JSON.stringify(updatedThread));

    // Canlı SSE ve WebSocket yayını (0ms)
    chatEmitter.emit('new_message', serializedMsg);
    chatEmitter.emit('thread_update', serializedThread);

    // Telegram'a tek satırlık iletildi onay bildirimi gönder
    const customerName = updatedThread?.kullaniciAdi || 'Müşteri';
    const previewText = replyText.length > 40 ? replyText.substring(0, 40) + '...' : replyText;
    
    sendTelegramNotification(
      `✅ <b>${customerName}</b> adlı müşteriye iletildi:\n<i>"${previewText}"</i>`
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ ok: true });
  }
}
