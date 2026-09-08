import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import BanModel from '@/models/Ban';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { threadId, kullaniciAdi, createIfNotFound } = body;
    await connectToDatabase();

    // Resolve client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 1. Check if IP or Thread is banned
    const banCheck = await BanModel.findOne({
      aktif: true,
      $or: [
        { ip: clientIp },
        ...(threadId ? [{ threadId }] : []),
      ],
    }).lean();

    if (banCheck) {
      return NextResponse.json(
        {
          error: 'Erişim Engellendi',
          isBanned: true,
          banTuru: banCheck.engellemeTuru,
          banSebebi: banCheck.sebep,
        },
        { status: 403 }
      );
    }

    if (threadId && mongoose.Types.ObjectId.isValid(threadId)) {
      const existing = await ChatThreadModel.findById(threadId).lean();
      if (existing) {
        if (existing.isBanned) {
          return NextResponse.json(
            {
              error: 'Erişim Engellendi',
              isBanned: true,
              banTuru: existing.banTuru,
              banSebebi: existing.banSebebi || 'Engellendiniz',
            },
            { status: 403 }
          );
        }
        const messages = await ChatMessageModel.find({ threadId: existing._id })
          .select('_id threadId gonderenTipi mesaj okundu createdAt')
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();

        return NextResponse.json({ 
          thread: JSON.parse(JSON.stringify(existing)),
          messages: JSON.parse(JSON.stringify(messages))
        });
      }
    }

    // If client is just checking or visiting without writing a message, do not create empty thread in DB
    if (!createIfNotFound && !kullaniciAdi?.startsWith('İlan Sahibi:')) {
      return NextResponse.json({ thread: null, messages: [] });
    }

    const name = kullaniciAdi || `Müşteri #${Math.floor(1000 + Math.random() * 9000)}`;
    const newThread = await ChatThreadModel.create({
      kullaniciAdi: name,
      ip: clientIp,
      sonMesajOzeti: '',
      okunmadiAdminSayisi: 0,
      isBanned: false,
    });

    return NextResponse.json({ thread: JSON.parse(JSON.stringify(newThread)), messages: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
