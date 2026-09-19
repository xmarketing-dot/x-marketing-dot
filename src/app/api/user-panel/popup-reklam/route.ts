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
    const { listingId, popupPaketi, hedefSehir, telefon } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'İlan ID gereklidir.' }, { status: 400 });
    }

    await connectToDatabase();

    let query: any = { slug: listingId };
    if (mongoose.Types.ObjectId.isValid(listingId)) {
      query = { $or: [{ _id: new mongoose.Types.ObjectId(listingId) }, { slug: listingId }] };
    }

    let listing: any = await ListingModel.findOne(query).lean();
    if (!listing) {
      listing = await ListingModel.collection.findOne(query);
    }

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    const days = Number(body.gun) || (popupPaketi === '3gun' ? 3 : popupPaketi === '2gun' ? 2 : popupPaketi === '7gun' ? 7 : 1);
    const totalPrice = days * 1000;
    const paketText = `${days} GÜN MODAL POPUP REKLAMI (${totalPrice.toLocaleString('tr-TR')} ₺)`;

    const sehirText = hedefSehir ? hedefSehir.toUpperCase() : (listing.ilSlug ? listing.ilSlug.toUpperCase() : 'TÜM TÜRKİYE (GENEL)');
    const telText = telefon || listing.whatsappNumara || 'Belirtilmedi';

    // Listing'i popup talep edildi olarak işaretle
    await ListingModel.collection.updateOne(query, {
      $set: {
        popupTalepEdildi: true,
        popupGun: days,
        popupHedefSehir: hedefSehir || 'tum_turkiye',
        popupSuresiDolduBildirildi: false,
        updatedAt: new Date(),
      }
    });

    // 1. Send Telegram notification to admin
    try {
      const tgMsg = `⚡ <b>YENİ ÖZEL MODAL POPUP REKLAM TALEBİ!</b>\n\n` +
        `📝 <b>İlan:</b> ${listing.baslik}\n` +
        `📍 <b>Hedef Şehir:</b> ${sehirText}\n` +
        `💎 <b>Paket:</b> ${paketText}\n` +
        `📱 <b>WhatsApp:</b> ${telText}\n` +
        `🔗 <b>İlan Linki:</b> /ilan/${listing.slug}\n\n` +
        `🚀 <i>Admin panelinden "Özel Modal Popup Reklam Yönetimi" bölümünden tek tıkla ilanı popup olarak yayınlayabilirsiniz.</i>`;
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
          sonMesajOzeti: `⚡ Modal Popup reklam talebiniz alındı (${paketText})`,
          okunmadiKullaniciSayisi: 1,
        });
        threadId = (createdThread as any)._id.toString();
        await ListingModel.collection.updateOne({ _id: listing._id }, { $set: { chatThreadId: threadId } });
      }

      if (threadId) {
        const chatNotice = 
          `⚡ <b>ÖZEL MODAL POPUP REKLAM TALEBİNİZ ALINDI!</b>\n\n` +
          `🌟 <b>İlanınız:</b> ${listing.baslik}\n` +
          `📍 <b>Hedef Bölge:</b> ${sehirText}\n` +
          `💎 <b>Seçilen Paket:</b> ${paketText}\n` +
          `📱 <b>İletişim Hattınız:</b> ${telText}\n\n` +
          `🚀 <i>Talebiniz yönetici onay masasına iletildi. Onaylandığı andan itibaren mobil kullanıcılar siteye girdiği anda tam ekran doğrudan sizin ilanınız ile karşılaşacak (+%570 WhatsApp dönüşüm gücü).</i>`;

        const newMsg = await ChatMessageModel.create({
          threadId: new mongoose.Types.ObjectId(threadId),
          gonderenTipi: 'admin',
          mesaj: chatNotice,
          okundu: false,
        });

        await ChatThreadModel.findByIdAndUpdate(threadId, {
          $set: {
            sonMesajOzeti: `⚡ Modal Popup reklam talebi (${paketText})`,
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
      console.error('Popup chat mesajı hatası:', chatErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Modal Popup reklam talebiniz başarıyla alındı ve yöneticiye iletildi.',
      listing,
    });
  } catch (error: any) {
    console.error('Popup reklam request error:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}
