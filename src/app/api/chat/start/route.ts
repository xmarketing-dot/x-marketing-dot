import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import ListingModel from '@/models/Listing';
import UserModel from '@/models/User';
import BanModel from '@/models/Ban';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { threadId, kullaniciAdi, kullaniciTelefon, createIfNotFound } = body;
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

    // Telefon ve Kullanıcı kontrolü
    const rawPhone = (kullaniciTelefon || '').toString().trim();
    const cleanPhone = rawPhone.replace(/[\s\-\(\)]/g, '');

    let matchedListing: any = null;
    let matchedUser: any = null;

    if (cleanPhone) {
      matchedListing = await ListingModel.findOne({
        $or: [
          { whatsappNumara: rawPhone },
          { whatsappNumara: cleanPhone },
          { whatsappNumara: { $regex: cleanPhone.slice(-10) } },
        ],
      }).lean();

      matchedUser = await UserModel.findOne({
        $or: [
          { telefon: rawPhone },
          { telefon: cleanPhone },
        ],
      }).lean();
    }

    let finalName = kullaniciAdi || (matchedUser ? `Üye: ${matchedUser.ad}` : (matchedListing ? `İlan Sahibi: ${matchedListing.tamAd || matchedListing.baslik}` : null));
    let finalPhone = rawPhone || matchedListing?.whatsappNumara || matchedUser?.telefon || '';
    let finalListingBaslik = matchedListing ? `${matchedListing.baslik} (${matchedListing.ilSlug?.toUpperCase() || ''})` : null;
    let finalListingId = matchedListing?._id?.toString() || null;
    let finalListingSlug = matchedListing?.slug || null;

    if (threadId && mongoose.Types.ObjectId.isValid(threadId)) {
      const existing = await ChatThreadModel.findById(threadId);
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

        // Eğer kullanıcı bilgileri yeni geldiyse thread'i zenginleştir
        let hasUpdate = false;
        if (finalName && (!existing.kullaniciAdi || existing.kullaniciAdi.startsWith('Müşteri #') || existing.kullaniciAdi === 'Ziyaretçi')) {
          existing.kullaniciAdi = finalName;
          hasUpdate = true;
        }
        if (finalPhone && !existing.kullaniciTelefon) {
          existing.kullaniciTelefon = finalPhone;
          hasUpdate = true;
        }
        if (finalListingBaslik && !existing.listingBaslik) {
          existing.listingBaslik = finalListingBaslik;
          existing.listingId = finalListingId;
          existing.listingSlug = finalListingSlug;
          hasUpdate = true;
        }

        if (hasUpdate) {
          await existing.save();
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
    if (!createIfNotFound && !finalName?.startsWith('İlan Sahibi:') && !finalName?.startsWith('Üye:')) {
      return NextResponse.json({ thread: null, messages: [] });
    }

    const name = finalName || `Müşteri #${Math.floor(1000 + Math.random() * 9000)}`;
    const newThread = await ChatThreadModel.create({
      kullaniciAdi: name,
      kullaniciTelefon: finalPhone || undefined,
      listingId: finalListingId || undefined,
      listingBaslik: finalListingBaslik || undefined,
      listingSlug: finalListingSlug || undefined,
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
