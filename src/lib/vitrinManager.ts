import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import HomepageConfigModel from '@/models/HomepageConfig';
import ChatThreadModel from '@/models/ChatThread';
import ChatMessageModel from '@/models/ChatMessage';
import mongoose from 'mongoose';

/**
 * Süresi dolmuş vitrin ilanlarını tespit eder,
 * anasayfa vitrininden otomatik çıkarır,
 * Listing durumunu günceller ve kullanıcıya otomatik bildirim / mesaj gönderir.
 */
export async function checkAndExpireShowcases(): Promise<{
  expiredCount: number;
  expiredListings: string[];
}> {
  try {
    await connectToDatabase();
    const now = new Date();

    // 1. Vitrin süresi bitmiş aktif vitrin ilanlarını bul (Sadece isVitrin: true olanlar)
    const expiredListings = await ListingModel.find({
      isVitrin: true,
      vitrinBitisTarihi: { $exists: true, $lte: now }
    });

    if (expiredListings.length === 0) {
      return { expiredCount: 0, expiredListings: [] };
    }

    const expiredIds = expiredListings.map(l => l._id.toString());
    const expiredObjectIds = expiredListings.map(l => l._id);

    // 2. HomepageConfig'den süresi biten ilanların ID'lerini temizle
    await HomepageConfigModel.updateOne(
      { key: 'singleton' },
      {
        $pull: {
          sliderIlanIds: { $in: expiredObjectIds }
        }
      }
    );

    // 3. İlanları güncelle ve kullanıcılara bildirim mesajı gönder
    for (const listing of expiredListings) {
      // Sadece daha önce bildirim gitmediyse mesaj oluştur
      if (!listing.vitrinSuresiDolduBildirildi) {
        try {
          await sendVitrinExpiredMessage(listing);
        } catch (msgErr) {
          console.error(`Vitrin süre doldu mesajı gönderilemedi (İlan: ${listing._id}):`, msgErr);
        }
      }

      await ListingModel.findByIdAndUpdate(listing._id, {
        $set: {
          isVitrin: false,
          vitrinIstegi: false,
          vitrinSuresiDolduBildirildi: true,
        }
      });
    }

    return {
      expiredCount: expiredListings.length,
      expiredListings: expiredIds
    };
  } catch (error) {
    console.error('Vitrin süre kontrolü hatası:', error);
    return { expiredCount: 0, expiredListings: [] };
  }
}

/**
 * Kullanıcıya vitrin süresinin bittiğini bildiren özel chat mesajı gönderir.
 */
async function sendVitrinExpiredMessage(listing: any) {
  let threadId: string | null = listing.chatThreadId ? listing.chatThreadId.toString() : null;

  // Thread bulunamazsa telefon veya ilan id'sine göre eşleşen thread'i bul
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

  // Eğer hiçbir thread yoksa bu kullanıcı adına yeni bir thread oluştur
  if (!threadId) {
    const createdThread = await ChatThreadModel.create({
      kullaniciAdi: listing.baslik || 'İlan Sahibi',
      kullaniciTelefon: listing.whatsappNumara || '',
      listingId: listing._id.toString(),
      listingBaslik: listing.baslik,
      listingSlug: listing.slug,
      sonMesajOzeti: '⚠️ Vitrin süreniz sona erdi.',
      okunmadiKullaniciSayisi: 1,
    });
    threadId = (createdThread as any)._id.toString();
    await ListingModel.findByIdAndUpdate(listing._id, { chatThreadId: threadId });
  }

  if (threadId) {
    const bitisTarihiStr = listing.vitrinBitisTarihi
      ? new Date(listing.vitrinBitisTarihi).toLocaleString('tr-TR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Bugün';

    const expireMsg = 
      `⚠️ <b>VİTRİN SÜRENİZ SONA ERDİ!</b>\n\n` +
      `Sayın kullanıcımız, <b>"${listing.baslik}"</b> başlıklı ilanınızın 5'li VIP Anasayfa Vitrin yayın süresi tamamlanmış (${bitisTarihiStr}) ve vitrinden kaldırılmıştır.\n\n` +
      `👑 Zirvede yer almaya devam etmek ve WhatsApp müşteri trafiğinizi kesintisiz katlamak için <b>Panelim</b> üzerinden dilediğiniz zaman yeniden vitrin paketi talep edebilirsiniz.`;

    await ChatMessageModel.create({
      threadId: new mongoose.Types.ObjectId(threadId),
      gonderenTipi: 'admin',
      mesaj: expireMsg,
      okundu: false,
    });

    await ChatThreadModel.findByIdAndUpdate(threadId, {
      $set: {
        sonMesajOzeti: '⚠️ Vitrin süreniz sona erdi ve vitrinden kaldırıldı.',
      },
      $inc: {
        okunmadiKullaniciSayisi: 1,
      }
    });
  }
}

/**
 * Kullanıcıya vitrine onaylandığını bildiren özel chat mesajı gönderir.
 */
async function sendVitrinApprovedMessage(listing: any, bitisTarihi: Date, days: number) {
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
      sonMesajOzeti: `👑 İlanınız VIP Vitrine Eklendi (${days} Günlük)`,
      okunmadiKullaniciSayisi: 1,
    });
    threadId = (createdThread as any)._id.toString();
    await ListingModel.findByIdAndUpdate(listing._id, { chatThreadId: threadId });
  }

  if (threadId) {
    const bitisTarihiStr = bitisTarihi.toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const sureText = days === 1 ? '1 Günlük (24 Saat)' : days === 7 ? '1 Haftalık (7 Gün)' : `${days} Günlük`;

    const approvedMsg = 
      `👑 <b>TEBRİKLER! İLANINIZ VIP VİTRİNE EKLENDİ!</b>\n\n` +
      `<b>"${listing.baslik}"</b> başlıklı ilanınız 5'li Anasayfa VIP Vitrinine başarıyla yerleştirildi.\n\n` +
      `⏱️ <b>Yayın Süresi:</b> ${sureText}\n` +
      `📅 <b>Vitrin Bitiş Tarihi:</b> ${bitisTarihiStr}\n\n` +
      `🔥 <i>İlanınız sitenin en üstünde günde 50.000+ ziyaretçiye öncelikli olarak gösterilmektedir.</i>`;

    await ChatMessageModel.create({
      threadId: new mongoose.Types.ObjectId(threadId),
      gonderenTipi: 'admin',
      mesaj: approvedMsg,
      okundu: false,
    });

    await ChatThreadModel.findByIdAndUpdate(threadId, {
      $set: {
        sonMesajOzeti: `👑 İlanınız VIP Vitrine Eklendi (${sureText})`,
      },
      $inc: {
        okunmadiKullaniciSayisi: 1,
      }
    });
  }
}

/**
 * İlanı vitrine ekler, süresini belirler ve kullanıcıya tebrik mesajı gönderir.
 */
export async function assignListingToShowcase(
  listingId: string,
  durationDays: number = 1,
  paketi: 'gunluk' | 'haftalik' = 'gunluk'
) {
  await connectToDatabase();

  const listing = await ListingModel.findById(listingId);
  if (!listing) {
    throw new Error('İlan bulunamadı.');
  }

  const now = new Date();
  const vitrinBitisTarihi = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // 1. İlanı güncelle
  const updatedListing = await ListingModel.findByIdAndUpdate(
    listingId,
    {
      $set: {
        isVitrin: true,
        vitrinIstegi: true,
        vitrinPaketi: paketi,
        vitrinBaslangicTarihi: now,
        vitrinBitisTarihi: vitrinBitisTarihi,
        vitrinSuresiDolduBildirildi: false,
      }
    },
    { new: true }
  );

  // 2. HomepageConfig sliderIlanIds içine ekle (Maksimum 5 slot)
  const config = await HomepageConfigModel.findOne({ key: 'singleton' });
  const currentIds = (config?.sliderIlanIds || []).map((id: any) => id.toString());
  
  if (!currentIds.includes(listingId)) {
    const nextIds = [listingId, ...currentIds.filter((id: string) => id !== listingId)].slice(0, 5);
    await HomepageConfigModel.findOneAndUpdate(
      { key: 'singleton' },
      { $set: { sliderIlanIds: nextIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      { upsert: true }
    );
  }

  // 3. Kullanıcıya bildirim mesajı gönder
  try {
    await sendVitrinApprovedMessage(listing, vitrinBitisTarihi, durationDays);
  } catch (err) {
    console.error('Vitrin onay mesajı hatası:', err);
  }

  return updatedListing;
}

/**
 * Vitrindeki ilanın süresini uzatır.
 */
export async function extendListingVitrinDuration(
  listingId: string,
  extraDays: number = 1
) {
  await connectToDatabase();
  const listing = await ListingModel.findById(listingId);
  if (!listing) throw new Error('İlan bulunamadı.');

  const now = new Date();
  const baseDate = listing.vitrinBitisTarihi && new Date(listing.vitrinBitisTarihi) > now
    ? new Date(listing.vitrinBitisTarihi)
    : now;

  const newBitisTarihi = new Date(baseDate.getTime() + extraDays * 24 * 60 * 60 * 1000);

  const updated = await ListingModel.findByIdAndUpdate(
    listingId,
    {
      $set: {
        isVitrin: true,
        vitrinBitisTarihi: newBitisTarihi,
        vitrinSuresiDolduBildirildi: false,
      }
    },
    { new: true }
  );

  // Ensure it is in HomepageConfig
  const config = await HomepageConfigModel.findOne({ key: 'singleton' });
  const currentIds = (config?.sliderIlanIds || []).map((id: any) => id.toString());
  if (!currentIds.includes(listingId)) {
    const nextIds = [listingId, ...currentIds].slice(0, 5);
    await HomepageConfigModel.findOneAndUpdate(
      { key: 'singleton' },
      { $set: { sliderIlanIds: nextIds.map((id: string) => new mongoose.Types.ObjectId(id)) } },
      { upsert: true }
    );
  }

  return updated;
}
