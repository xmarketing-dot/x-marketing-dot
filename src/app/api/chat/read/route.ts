import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import { chatEmitter } from '@/lib/chatEmitter';

export async function POST(req: NextRequest) {
  try {
    const { threadId } = await req.json();
    if (!threadId) {
      return NextResponse.json({ error: 'threadId required' }, { status: 400 });
    }
    await connectToDatabase();

    const targetThreadId = mongoose.Types.ObjectId.isValid(threadId)
      ? new mongoose.Types.ObjectId(threadId)
      : threadId;

    // 1. Thread üzerindeki okunmadı kullanıcı sayısını sıfırla
    await ChatThreadModel.findByIdAndUpdate(targetThreadId, {
      okunmadiKullaniciSayisi: 0,
    });

    // 2. Bu sohbetteki adminin gönderdiği mesajları okundu olarak işaretle
    await ChatMessageModel.updateMany(
      {
        $or: [
          { threadId: targetThreadId },
          { threadId: String(threadId) },
        ],
        gonderenTipi: 'admin',
        okundu: false,
      },
      { $set: { okundu: true } }
    );

    // 3. Admin ekranına SSE ile bildir (adminin mesajı anında çift mavi tike dönsün)
    chatEmitter.emit('messages_read', { threadId: String(threadId), reader: 'user' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
