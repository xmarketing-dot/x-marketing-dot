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

    // 1. Thread üzerindeki okunmadı admin sayısını sıfırla
    await ChatThreadModel.findByIdAndUpdate(threadId, {
      okunmadiAdminSayisi: 0,
    });

    // 2. Bu sohbetteki kullanıcının gönderdiği okunmamış mesajları okundu yap
    await ChatMessageModel.updateMany(
      { threadId, gonderenTipi: 'user', okundu: false },
      { $set: { okundu: true } }
    );

    // 3. SSE ile anlık canlı bildirim gönder (kullanıcı ekranındaki tek tik çift mavi tike dönsün)
    chatEmitter.emit('messages_read', { threadId, reader: 'admin' });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
