import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import BanModel from '@/models/Ban';
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
    const { threadId, gonderenTipi, mesaj } = await req.json();

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

    const updatedThread = await ChatThreadModel.findByIdAndUpdate(
      threadId,
      {
        sonMesajOzeti: mesaj,
        updatedAt: new Date(),
        ...updateField,
      },
      { returnDocument: 'after' }
    ).lean();

    const serializedMsg = JSON.parse(JSON.stringify(newMsg));
    const serializedThread = JSON.parse(JSON.stringify(updatedThread));

    // Instantly emit events to open SSE streams (0ms latency, ZERO polling)
    chatEmitter.emit('new_message', serializedMsg);
    chatEmitter.emit('thread_update', serializedThread);

    // Telegram bildirimi — sadece kullanıcı mesajında (admin mesajlarında değil)
    if (sender === 'user') {
      const preview = mesaj.length > 120 ? mesaj.slice(0, 120) + '...' : mesaj;
      const notifText = [
        '💬 <b>Yeni Chat Mesajı!</b>',
        '',
        `📝 <b>Mesaj:</b> ${preview}`,
        `🔗 <a href="https://besteskort.devs.surf/bms-secure-portal">Panele Git &amp; Yanıtla</a>`,
      ].join('\n');
      sendTelegramNotification(notifText); // fire-and-forget, siteyi bloklamaz
    }

    return NextResponse.json({ success: true, message: serializedMsg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
