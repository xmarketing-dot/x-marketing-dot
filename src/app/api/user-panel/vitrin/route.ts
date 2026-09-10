import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import ChatMessageModel from '@/models/ChatMessage';
import ChatThreadModel from '@/models/ChatThread';
import { chatEmitter } from '@/lib/chatEmitter';
import { sendTelegramNotification } from '@/lib/telegramNotify';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, vitrinPaketi, telefon } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'İlan ID gereklidir.' }, { status: 400 });
    }

    await connectToDatabase();

    const updatePayload = {
      vitrinIstegi: true,
      vitrinPaketi: vitrinPaketi === 'haftalik' ? 'haftalik' : 'gunluk',
      vitrinSuresiDolduBildirildi: false,
      updatedAt: new Date(),
    };

    let query: any = { slug: listingId };
    if (mongoose.Types.ObjectId.isValid(listingId)) {
      query = { $or: [{ _id: new mongoose.Types.ObjectId(listingId) }, { slug: listingId }] };
    }

    // Direct MongoDB collection update to guarantee 100% persistence
    await ListingModel.collection.updateOne(query, { $set: updatePayload });

    let listing: any = await ListingModel.findOne(query).lean();
    if (!listing) {
      listing = await ListingModel.collection.findOne(query);
    }

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    const paketText = vitrinPaketi === 'gunluk' ? 'GÜNLÜK (2.000 ₺)' : 'HAFTALIK KAMPANYALI (6.000 ₺)';
    const telText = telefon || listing.whatsappNumara || 'Belirtilmedi';

    // 1. Send Telegram notification to admin
    try {
      const tgMsg = `👑 <b>YENİ VİTRİN SATIN ALMA TALEBİ!</b>\n\n` +
        `📝 <b>İlan:</b> ${listing.baslik}\n` +
        `📍 <b>Konum:</b> ${(listing.ilSlug || '').toUpperCase()} / ${(listing.ilceSlug || '').toUpperCase()}\n` +
        `💎 <b>Paket:</b> ${paketText}\n` +
        `📱 <b>WhatsApp:</b> ${telText}\n` +
        `🔗 <b>İlan Linki:</b> /ilan/${listing.slug}\n\n` +
        `⚡ <i>Admin panelinden "Vitrin Talepleri & Onay Masası" bölümünden tek tıkla onaylayabilirsiniz.</i>`;
      await sendTelegramNotification(tgMsg);
    } catch (e) {
      // Non-critical
    }

    // 2. Send automated chat message to the user's thread
    try {
      let threadId: string | null = listing.chatThreadId ? listing.chatThreadId.toString() : null;

      if (!threadId && listing.whatsappNumara) {
        const cleanPhone = listing.whatsappNumara.replace(/\D/g, '');
        const matchedThread = await ChatThreadModel.findOne({
          $or: [
            { kullaniciTelefon: listing.whatsappNumara },
            { kullaniciTelefon: cleanPhone },
            { listingId: listing._id.toString() },
          ]
        }).sort({ updatedAt: -1 });

        if (matchedThread) {
          threadId = matchedThread._id.toString();
        }
      }

      if (!threadId) {
        const createdThread = await ChatThreadModel.create({
          kullaniciAdi: listing.baslik || 'İlan Sahibi',
          kullaniciTelefon: listing.whatsappNumara || '',
          listingId: listing._id.toString(),
          listingBaslik: listing.baslik,
          listingSlug: listing.slug,
          password: listing.panelSifresi || undefined,
          sonMesajOzeti: `👑 Vitrin talebiniz alındı (${paketText})`,
          okunmadiKullaniciSayisi: 1,
        });
        threadId = (createdThread as any)._id.toString();
        await ListingModel.collection.updateOne({ _id: listing._id }, { $set: { chatThreadId: threadId } });
      }

      if (threadId) {
        const chatNotice = 
          `👑 <b>VİTRİN SATIN ALMA TALEBİNİZ ALINDI!</b>\n\n` +
          `🌟 <b>İlanınız:</b> ${listing.baslik}\n` +
          `💎 <b>Seçilen Paket:</b> ${paketText}\n` +
          `📱 <b>İletişim Hattınız:</b> ${telText}\n\n` +
          `⚡ <i>Talebiniz yönetici onay masasına iletildi. Onaylandığı an anasayfanın en üstündeki 5'li VIP vitrininde günde 50.000+ müşteriye gösterilmeye başlayacaktır!</i>`;

        const newMsg = await ChatMessageModel.create({
          threadId: new mongoose.Types.ObjectId(threadId),
          gonderenTipi: 'admin',
          mesaj: chatNotice,
          okundu: false,
        });

        await ChatThreadModel.findByIdAndUpdate(threadId, {
          $set: {
            sonMesajOzeti: `👑 Vitrin talebiniz alındı (${paketText})`,
            updatedAt: new Date(),
          },
          $inc: {
            okunmadiKullaniciSayisi: 1,
          }
        });

        chatEmitter.emit('newMessage', {
          threadId: threadId,
          message: newMsg,
        });
      }
    } catch (chatErr) {
      console.error('Vitrin chat mesajı hatası:', chatErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Vitrin talebiniz başarıyla alındı ve onaya iletildi.',
      listing,
    });
  } catch (error: any) {
    console.error('Vitrin request error:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}
