import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BannerAdModel from '@/models/BannerAd';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/banners
 * Admin için tüm banner reklamları listeler (istatistikleriyle birlikte)
 */
export async function GET() {
  try {
    await connectToDatabase();
    const [banners, emptyClicks] = await Promise.all([
      BannerAdModel.find().sort({ createdAt: -1 }).lean(),
      (await import('@/models/AnalyticsEvent')).default.countDocuments({ eventType: 'bos_banner_reklam_tiklama' }),
    ]);

    return NextResponse.json({
      success: true,
      banners: JSON.parse(JSON.stringify(banners)),
      emptyClicksCount: emptyClicks || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/banners
 * Admin'in reklamı Onaylaması (Yayına alması), Reddetmesi veya Silmesi
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, redNedeni } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Geçersiz banner ID' }, { status: 400 });
    }

    await connectToDatabase();

    if (action === 'delete') {
      await BannerAdModel.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Reklam silindi.' });
    }

    if (action === 'onayla') {
      const banner = await BannerAdModel.findById(id);
      if (!banner) return NextResponse.json({ error: 'Banner bulunamadı' }, { status: 404 });

      const now = new Date();
      const gun = Number(body.sureGun) || banner.sureGun || 7;
      const bitis = new Date(now.getTime() + gun * 24 * 60 * 60 * 1000);

      banner.durum = 'yayinda';
      banner.sureGun = gun;
      banner.baslangicTarihi = now;
      banner.bitisTarihi = bitis;
      await banner.save();

      return NextResponse.json({ success: true, message: 'Reklam onaylandı ve yayına alındı!' });
    }

    if (action === 'guncelle_tarih') {
      const { baslangicTarihi, bitisTarihi, sureGun } = body;
      await BannerAdModel.findByIdAndUpdate(id, {
        ...(baslangicTarihi ? { baslangicTarihi: new Date(baslangicTarihi) } : {}),
        ...(bitisTarihi ? { bitisTarihi: new Date(bitisTarihi) } : {}),
        ...(sureGun ? { sureGun: Number(sureGun) } : {}),
      });
      return NextResponse.json({ success: true, message: 'Tarihler güncellendi.' });
    }

    if (action === 'reddet') {
      await BannerAdModel.findByIdAndUpdate(id, {
        durum: 'reddedildi',
        redNedeni: redNedeni || 'Uygunsuz görsel veya geçersiz ödeme.',
      });
      return NextResponse.json({ success: true, message: 'Reklam reddedildi.' });
    }

    if (action === 'durdur') {
      await BannerAdModel.findByIdAndUpdate(id, { durum: 'suresi_doldu' });
      return NextResponse.json({ success: true, message: 'Reklam yayından kaldırıldı.' });
    }

    return NextResponse.json({ error: 'Geçersiz aksiyon' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
