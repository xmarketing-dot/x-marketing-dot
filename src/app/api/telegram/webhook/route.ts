import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import { chatEmitter } from '@/lib/chatEmitter';

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

    const replyText = message.text.trim();
    if (!replyText) return NextResponse.json({ ok: true });

    await connectToDatabase();

    let targetThreadId: string | null = null;

    // 1. Reply yaptıysan: Telegram'ın orijinal message_id'sinden tam olarak hangi müşterinin mesajı olduğunu nokta atışı bul
    if (message.reply_to_message && message.reply_to_message.message_id) {
      const repliedMsgId = message.reply_to_message.message_id;
      const originalChatMessage = await ChatMessageModel.findOne({
        telegramMessageId: repliedMsgId,
      }).lean();

      if (originalChatMessage && originalChatMessage.threadId) {
        targetThreadId = originalChatMessage.threadId.toString();
      }
    }

    // 2. Reply yapılmadıysa veya eski bir mesaja reply yapıldıysa: En son mesaj atmış aktif müşteriyi bul
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

    // İletildi mesajı kaldırıldı! (Sessizce çalışır)
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ ok: true });
  }
}
