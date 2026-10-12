import { NextRequest, NextResponse } from 'next/server';
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

    // 1. Thread üzerindeki okunmadı kullanıcı sayısını sıfırla
    await ChatThreadModel.findByIdAndUpdate(threadId, {
      okunmadiKullaniciSayisi: 0,
    });

    // 2. Bu sohbetteki adminin gönderdiği mesajları okundu olarak işaretle
    await ChatMessageModel.updateMany(
      { threadId, gonderenTipi: 'admin', okundu: false },
      { $set: { okundu: true } }
    );

    // 3. Admin ekranına SSE ile bildir (adminin mesajı anında çift mavi tike dönsün)
    chatEmitter.emit('messages_read', { threadId, reader: 'user' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
