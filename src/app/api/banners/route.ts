import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BannerAdModel from '@/models/BannerAd';
import { sendTelegramNotification } from '@/lib/telegramNotify';

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

    const gun = Number(sureGun) || 7;
    // Fiyatlandırma: 7 Gün: 5.000 TL, 15 Gün: 9.000 TL, 30 Gün: 15.000 TL
    let fiyat = 5000;
    if (gun === 15) fiyat = 9000;
    if (gun === 30) fiyat = 15000;

    const newBanner = await BannerAdModel.create({
      konum: konum || 'her_ikisi',
      baslik: baslik.trim(),
      gorselUrl: gorselUrl.trim(),
      hedefUrl: hedefUrl.trim(),
      sureGun: gun,
      fiyatTL: fiyat,
      musteriIletisim: musteriIletisim.trim(),
      odemeYontemi: odemeYontemi || 'kripto',
      durum: 'onay_bekliyor',
      goruntulenmeSayisi: 0,
      tiklamaSayisi: 0,
    });

    // 🔔 TELEGRAM BİLDİRİMİ: Admin'in cebine anında alarm
    const konumText =
      konum === 'anasayfa' ? 'Anasayfa' : konum === 'ilan_detay' ? 'İlan Detay' : 'Tüm Sayfalar (Anasayfa + Detay)';

    const notifText = [
      `📣 <b>YENİ BANNER REKLAM TALEBİ!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🏷️ <b>Başlık:</b> ${baslik.trim()}`,
      `📍 <b>Alan:</b> ${konumText}`,
      `⏱️ <b>Süre:</b> ${gun} Gün (${fiyat.toLocaleString('tr-TR')} ₺)`,
      `📱 <b>İletişim:</b> <code>${musteriIletisim.trim()}</code>`,
      `🔗 <b>Hedef Link:</b> ${hedefUrl.trim()}`,
      `━━━━━━━━━━━━━━━━━━`,
      `👑 <a href="https://besteskort.devs.surf/bms-secure-portal">Yönetici Panelinden Onayla</a>`,
    ].join('\n');

    sendTelegramNotification(notifText).catch(() => {});

    return NextResponse.json({
      success: true,
      bannerId: newBanner._id.toString(),
      fiyatTL: fiyat,
    });
  } catch (error: any) {
    console.error('Banner create error:', error);
    return NextResponse.json({ error: error.message || 'Reklam talebi oluşturulamadı.' }, { status: 500 });
  }
}
