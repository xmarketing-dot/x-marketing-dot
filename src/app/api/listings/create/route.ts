import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

function generateSlug(ilce: string, baslik: string, tamAd?: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u'
  };

  const toClean = (str: string) =>
    str
      .split('')
      .map((char) => trMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanIlce = toClean(ilce).replace(/\s+/g, '-');
  
  // Prefer tamAd (e.g. "Ceren", "Merve Özdemir") or first 1-2 distinctive words from baslik
  let coreName = '';
  if (tamAd && tamAd.trim()) {
    coreName = toClean(tamAd);
  } else {
    // Extract distinctive words from baslik, removing ilce or repetitive keywords
    const words = toClean(baslik)
      .split(' ')
      .filter((w) => w && w !== cleanIlce && !['eskort', 'escort', 'bayan', 'vip', 'bayanlar'].includes(w));
    
    coreName = words.slice(0, 2).join(' ') || toClean(baslik).split(' ').slice(0, 2).join(' ');
  }

  const cleanCore = coreName.replace(/\s+/g, '-');
  const randomHex = Math.random().toString(36).substring(2, 7);

  const basePart = cleanCore ? `${cleanIlce}-${cleanCore}` : cleanIlce;
  return `${basePart}-${randomHex}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      baslik, 
      aciklama, 
      ilSlug, 
      ilceSlug, 
      rozet, 
      yayinSuresi, 
      fiyat, 
      whatsappNumara, 
      anaFotografUrl, 
      fotograflar,
      chatThreadId,
      kullaniciId,
      tamAd,
      visitorId,
      vitrinIstegi,
    } = body;

    if (!baslik || !aciklama || !ilSlug || !ilceSlug || !whatsappNumara) {
      return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
    }

    await connectToDatabase();

    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const slug = generateSlug(ilceSlug, baslik, tamAd);
    const imageUrl = anaFotografUrl && anaFotografUrl.trim() !== ''
      ? anaFotografUrl
      : 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800';

    const photoList = fotograflar && Array.isArray(fotograflar) && fotograflar.length > 0
      ? fotograflar
      : [{ url: imageUrl }];

    // Yayın Bitiş Tarihi Hesaplama
    const durationDays = yayinSuresi === 'gunluk' ? 1 : yayinSuresi === 'aylik' ? 30 : 7;
    const paketBitisTarihi = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // 6 Haneli Kolay Düzenleme Şifresi Üret
    const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();

    // ── KULLANICIYI / ÖNCEKİ İLANLARI OTOMATİK İLİŞKİLENDİR ──
    let resolvedUserId = kullaniciId || null;
    let resolvedPassword = generatedPassword;

    try {
      const UserModel = (await import('@/models/User')).default;
      const cleanPhone = whatsappNumara.replace(/\D/g, '');

      // 1. Önce telefon veya daha önce verilmiş aynı visitorId'ye sahip ilanı ara
      if (!resolvedUserId) {
        // Telefonla eşleşen kullanıcı var mı?
        const existingUser = await UserModel.findOne({
          $or: [
            { telefon: whatsappNumara },
            { telefon: cleanPhone },
            ...(cleanPhone.length >= 10 ? [{ telefon: { $regex: cleanPhone.slice(-10) } }] : [])
          ]
        }).lean();

        if (existingUser) {
          resolvedUserId = existingUser._id;
          if (existingUser.sifreHash) {
            resolvedPassword = existingUser.sifreHash;
          }
        } else if (visitorId) {
          // visitorId ile daha önce verilmiş bir ilan var mı?
          const prevListingWithUser = await ListingModel.findOne({
            visitorId,
            kullaniciId: { $ne: null }
          }).lean();

          if (prevListingWithUser?.kullaniciId) {
            resolvedUserId = prevListingWithUser.kullaniciId;
          }
        }
      }

      // 2. Eğer hala kullanıcı bulunamadıysa OTOMATİK YENİ KULLANICI OLUŞTUR
      if (!resolvedUserId) {
        const username = `uye_${cleanPhone ? cleanPhone.slice(-6) : Math.random().toString(36).slice(2, 8)}`;
        const newUser = await UserModel.create({
          ad: baslik,
          kullaniciAdi: username,
          telefon: whatsappNumara,
          sifreHash: generatedPassword,
        });
        resolvedUserId = newUser._id;
      }
    } catch (userErr) {
      // Non-critical, continue
    }

    const hasVitrin = vitrinIstegi === true;

    const newListing = await ListingModel.create({
      slug,
      baslik,
      aciklama,
      ilSlug,
      ilceSlug,
      anaFotograf: { url: imageUrl },
      fotograflar: photoList,
      whatsappNumara,
      fiyat: fiyat ? Number(fiyat) : 0,
      paraBirimi: 'TL',
      rozet: rozet || 'vip',
      yayinSuresi: yayinSuresi || 'haftalik',
      paketBitisTarihi,
      chatThreadId: chatThreadId || null,
      kullaniciId: resolvedUserId,
      visitorId: visitorId || null,
      creatorIp: clientIp,
      panelSifresi: resolvedPassword,
      vitrinIstegi: hasVitrin,
      status: 'onay_bekliyor',
    });

    // ── CANLI CHAT VE İLK MESAJI OTOMATİK OLUŞTUR ──
    let finalThreadId = chatThreadId;
    try {
      const ChatThreadModel = (await import('@/models/ChatThread')).default;
      const ChatMessageModel = (await import('@/models/ChatMessage')).default;
      const { chatEmitter } = await import('@/lib/chatEmitter');

      const vitrinText = hasVitrin 
        ? (body.vitrinPaketi === 'gunluk' ? ' [🔥 GÜNLÜK 2.000 TL VİTRİN DAHİL]' : ' [🔥 HAFTALIK KAMPANYALI 6.000 TL VİTRİN DAHİL]') 
        : '';
      const welcomeMsg = `Merhaba yönetici, "${baslik}" başlıklı ${rozet?.toUpperCase() || 'VIP'} ilanımı oluşturdum${vitrinText}. İlan Düzenleme Şifrem: ${resolvedPassword}. Ödeme yöntemleri ve onay için bilgi bekliyorum.`;

      if (finalThreadId) {
        await ChatThreadModel.findByIdAndUpdate(finalThreadId, {
          listingId: newListing._id.toString(),
          listingBaslik: newListing.baslik,
          listingSlug: newListing.slug,
          kullaniciAdi: `👑 ${newListing.baslik}`,
          kullaniciTelefon: whatsappNumara,
          password: resolvedPassword,
          sonMesajOzeti: welcomeMsg,
          $inc: { okunmadiAdminSayisi: 1 },
        }).catch(() => {});
      } else {
        const newThread = await ChatThreadModel.create({
          kullaniciAdi: `👑 ${newListing.baslik}`,
          kullaniciTelefon: whatsappNumara,
          ip: clientIp,
          listingId: newListing._id.toString(),
          listingBaslik: newListing.baslik,
          listingSlug: newListing.slug,
          password: resolvedPassword,
          sonMesajOzeti: welcomeMsg,
          okunmadiAdminSayisi: 1,
          okunmadiKullaniciSayisi: 0,
        });
        finalThreadId = newThread._id.toString();
        await ListingModel.findByIdAndUpdate(newListing._id, { chatThreadId: finalThreadId });
      }

      // 1. Kullanıcının ilk başvuru mesajı
      const firstMsg = await ChatMessageModel.create({
        threadId: finalThreadId,
        gonderenTipi: 'user',
        mesaj: welcomeMsg,
        okundu: false,
      });

      // 2. Otomatik Yönetici / Sistem Paket Bilgilendirme ve Ödeme Mesajı
      const { generateAutoPackageMessage } = await import('@/lib/siteConfig');
      const autoAdminReply = generateAutoPackageMessage(baslik, resolvedPassword);

      const adminMsg = await ChatMessageModel.create({
        threadId: finalThreadId,
        gonderenTipi: 'admin',
        mesaj: autoAdminReply,
        okundu: false,
      });

      await ChatThreadModel.findByIdAndUpdate(finalThreadId, {
        sonMesajOzeti: autoAdminReply,
        updatedAt: new Date(),
      }).catch(() => {});

      // SSE Canlı Bildirimlerini yayınla
      try {
        chatEmitter.emit('new_message', JSON.parse(JSON.stringify(firstMsg)));
        chatEmitter.emit('new_message', JSON.parse(JSON.stringify(adminMsg)));
      } catch (e) {}
    } catch (chatErr) {
      // Non-critical, continue
    }

    // 🔔 TELEGRAM BİLDİRİMİ: Yeni İlan Talebi
    try {
      const { sendTelegramNotification } = await import('@/lib/telegramNotify');
      const ilceText = ilceSlug.charAt(0).toUpperCase() + ilceSlug.slice(1);
      const ilText = ilSlug.charAt(0).toUpperCase() + ilSlug.slice(1);
      const notif = [
        `👑 <b>YENİ İLAN BAŞVURUSU!</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `🏷️ <b>Başlık:</b> ${baslik}`,
        `📍 <b>Bölge:</b> ${ilText} / ${ilceText}`,
        `💎 <b>Paket:</b> ${rozet?.toUpperCase() || 'VIP'} (${yayinSuresi?.toUpperCase() || 'HAFTALIK'})`,
        hasVitrin ? (body.vitrinPaketi === 'gunluk' ? `🔥 <b>ANASAYFA VİTRİN:</b> GÜNLÜK (2.000 TL)` : `🔥 <b>ANASAYFA VİTRİN:</b> HAFTALIK KAMPANYALI (6.000 TL)`) : `⚪ <b>ANASAYFA VİTRİN:</b> Yok`,
        `📱 <b>WhatsApp:</b> <code>${whatsappNumara}</code>`,
        `🔑 <b>İlan Düzenleme Şifresi:</b> <code>${generatedPassword}</code>`,
        `━━━━━━━━━━━━━━━━━━`,
        `👉 <a href="https://besteskort.devs.surf/bms-secure-portal">Yönetici Panelinden İncele & Onayla</a>`,
      ].join('\n');
      sendTelegramNotification(notif).catch(() => {});
    } catch (e) {
      // Silent
    }

    return NextResponse.json({ 
      success: true, 
      listing: newListing,
      panelSifresi: generatedPassword,
      chatThreadId: finalThreadId
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'İlan oluşturulurken hata meydana geldi.' }, { status: 500 });
  }
}
