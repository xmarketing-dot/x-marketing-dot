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
    } = body;

    if (!baslik || !aciklama || !ilSlug || !ilceSlug || !whatsappNumara) {
      return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
    }

    await connectToDatabase();

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
      kullaniciId: kullaniciId || null,
      panelSifresi: generatedPassword,
      status: 'onay_bekliyor',
    });

    // Eşleştirme: Eğer chatThreadId varsa ChatThread modeline ilanı bağla
    if (chatThreadId) {
      const ChatThreadModel = (await import('@/models/ChatThread')).default;
      await ChatThreadModel.findByIdAndUpdate(chatThreadId, {
        listingId: newListing._id.toString(),
        listingBaslik: newListing.baslik,
        listingSlug: newListing.slug,
        kullaniciAdi: `👑 ${newListing.baslik}`,
      }).catch(() => {});
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
      panelSifresi: generatedPassword
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'İlan oluşturulurken hata meydana geldi.' }, { status: 500 });
  }
}
