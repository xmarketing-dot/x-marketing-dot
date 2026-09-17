import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BannerAdModel from '@/models/BannerAd';
import { sendTelegramNotification } from '@/lib/telegramNotify';
import { getSiteUrl } from '@/lib/siteUrl';

export const dynamic = 'force-dynamic';

/**
 * GET /api/banners?konum=anasayfa|ilan_detay
 * Aktif (yayında olan) banner reklamı döner.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const konum = searchParams.get('konum') || 'anasayfa';

    await connectToDatabase();

    const now = new Date();

    // Süresi dolan yayındaki banner'ları anında pasife al
    BannerAdModel.updateMany(
      { durum: 'yayinda', bitisTarihi: { $lt: now } },
      { $set: { durum: 'suresi_doldu' } }
    ).catch(() => {});

    const targetKonum = (konum === 'ilan_detay' ? 'ilan_detay' : 'anasayfa') as 'anasayfa' | 'ilan_detay';

    const banner = await BannerAdModel.findOne({
      durum: 'yayinda',
      konum: { $in: [targetKonum, 'her_ikisi'] },
      $or: [
        { bitisTarihi: { $exists: false } },
        { bitisTarihi: null },
        { bitisTarihi: { $gte: now } },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Görüntülenme sayısını sessizce +1 artır (Fire & Forget)
    if (banner) {
      BannerAdModel.findByIdAndUpdate(banner._id, {
        $inc: { goruntulenmeSayisi: 1 },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      banner: banner ? JSON.parse(JSON.stringify(banner)) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/banners
 * Müşterinin yeni banner reklam başvurusu yapması
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { konum, baslik, gorselUrl, hedefUrl, sureGun, musteriIletisim, odemeYontemi } = body;

    if (!baslik || !gorselUrl || !hedefUrl || !musteriIletisim) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları (Başlık, Görsel, Yönlendirme Linki ve İletişim) doldurunuz.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const isPromo = body.isPromo === true || body.promoType === '1gunluk_ucretsiz' || body.promoType === '3gunluk_ucretsiz';
    const gun = isPromo ? 1 : Math.max(1, Number(sureGun) || 7);

    // ── KÖTÜYE KULLANIM ENGELİ: Aynı kişi / telefon 1'den fazla ücretsiz banner veremez ──
    if (isPromo) {
      const cleanPhoneDigits = musteriIletisim.replace(/\D/g, '');
      const last10Digits = cleanPhoneDigits.length >= 10 ? cleanPhoneDigits.slice(-10) : cleanPhoneDigits;

      const existingPromoBanner = await BannerAdModel.findOne({
        isPromo: true,
        $or: [
          ...(last10Digits ? [{ musteriIletisim: { $regex: last10Digits + '$' } }] : []),
        ]
      }).lean();

      if (existingPromoBanner) {
        return NextResponse.json({
          error: 'Bu telefon numarası ile daha önce 24 saatlik ücretsiz banner reklam hakkı kullanılmıştır. Yeni reklamınız için avantajlı paketlerimizi tercih edebilirsiniz.'
        }, { status: 400 });
      }
    }
    
    // Dinamik ve Avantajlı Fiyatlandırma:
    // 1 Gün: 750 TL (750 TL/gün), 7 Gün: 3.850 TL (550 TL/gün), 15 Gün: 7.000 TL (466 TL/gün), 30 Gün: 12.000 TL (400 TL/gün)
    let fiyat = isPromo ? 0 : gun * 600;
    if (!isPromo) {
      if (gun === 1) fiyat = 750;
      else if (gun === 7) fiyat = 3850;
      else if (gun === 15) fiyat = 7000;
      else if (gun === 30) fiyat = 12000;
      else if (gun > 30) fiyat = Math.round(gun * 400);
      else if (gun >= 15) fiyat = Math.round(gun * 466);
      else if (gun >= 7) fiyat = Math.round(gun * 500);
    }

    // 6 Haneli Giriş ve Düzenleme Şifresi Üret (Müşteri Panelim için)
    const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();
    let resolvedPassword = generatedPassword;

    try {
      const ListingModel = (await import('@/models/Listing')).default;
      const cleanPhone = musteriIletisim.replace(/\D/g, '');
      const existingListing = await ListingModel.findOne({
        $or: [
          { whatsappNumara: musteriIletisim.trim() },
          { whatsappNumara: cleanPhone },
          ...(cleanPhone.length >= 10 ? [{ whatsappNumara: { $regex: cleanPhone.slice(-10) + '$' } }] : [])
        ],
        panelSifresi: { $exists: true, $ne: null }
      }).lean();

      if (existingListing && (existingListing as any).panelSifresi) {
        resolvedPassword = (existingListing as any).panelSifresi;
      }
    } catch (e) {}

    const newBanner = await BannerAdModel.create({
      konum: konum || 'her_ikisi',
      baslik: baslik.trim(),
      gorselUrl: gorselUrl.trim(),
      hedefUrl: hedefUrl.trim(),
      sureGun: gun,
      fiyatTL: fiyat,
      musteriIletisim: musteriIletisim.trim(),
      odemeYontemi: isPromo ? 'promosyon' : (odemeYontemi || 'kripto'),
      durum: 'onay_bekliyor',
      goruntulenmeSayisi: 0,
      tiklamaSayisi: 0,
      isPromo: Boolean(isPromo),
      promoType: isPromo ? '1gunluk_ucretsiz' : undefined,
      fitMode: body.fitMode === 'contain' ? 'contain' : 'cover',
      panelSifresi: resolvedPassword,
    });

    // 🔔 TELEGRAM BİLDİRİMİ: Admin'in cebine anında alarm
    const konumText =
      konum === 'anasayfa' ? 'Anasayfa' : konum === 'ilan_detay' ? 'İlan Detay' : 'Tüm Sayfalar (Anasayfa + Detay)';

    const notifText = [
      isPromo ? `🎁 <b>24 SAATLİK (1 GÜN) ÜCRETSİZ PROMOSYON BANNER REKLAM TALEBİ!</b>` : `📣 <b>YENİ BANNER REKLAM TALEBİ!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🏷️ <b>Başlık:</b> ${baslik.trim()}`,
      `📍 <b>Alan:</b> ${konumText}`,
      `⏱️ <b>Süre:</b> ${gun} Gün (${isPromo ? '🎁 0 TL - 24 SAAT ÜCRETSİZ DENEME' : `${fiyat.toLocaleString('tr-TR')} ₺`})`,
      `📱 <b>İletişim:</b> <code>${musteriIletisim.trim()}</code>`,
      `🔑 <b>Panel Şifresi:</b> <code>${resolvedPassword}</code>`,
      `🔗 <b>Hedef Link:</b> ${hedefUrl.trim()}`,
      `━━━━━━━━━━━━━━━━━━`,
      `👑 <a href="${getSiteUrl()}/bms-secure-portal${isPromo ? '/ucretsizler' : ''}">Yönetici Panelinden Onayla</a>`,
    ].join('\n');

    sendTelegramNotification(notifText).catch(() => {});

    return NextResponse.json({
      success: true,
      bannerId: ((newBanner as any)?._id || (newBanner as any)?.id)?.toString(),
      fiyatTL: fiyat,
      panelSifresi: resolvedPassword,
      identifier: musteriIletisim.trim(),
    });
  } catch (error: any) {
    console.error('Banner create error:', error);
    return NextResponse.json({ error: error.message || 'Reklam talebi oluşturulamadı.' }, { status: 500 });
  }
}
