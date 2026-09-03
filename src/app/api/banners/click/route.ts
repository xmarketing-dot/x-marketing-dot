import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BannerAdModel from '@/models/BannerAd';
import AnalyticsEventModel from '@/models/AnalyticsEvent';

export const dynamic = 'force-dynamic';

/**
 * POST /api/banners/click
 * Banner tıklama veya BOŞ REKLAM ALANI tıklamalarını kaydeder
 */
export async function POST(req: NextRequest) {
  try {
    const { bannerId, isBoşAlan, konum } = await req.json();

    await connectToDatabase();

    // 1. Eğer gerçek sponsorlu banner'a tıklandıysa
    if (bannerId && mongoose.Types.ObjectId.isValid(bannerId)) {
      await BannerAdModel.findByIdAndUpdate(bannerId, {
        $inc: { tiklamaSayisi: 1 },
      });
      return NextResponse.json({ ok: true });
    }

    // 2. Eğer "BURAYA REKLAM VERİN (BOŞ ALAN)" butonuna tıklandıysa
    if (isBoşAlan) {
      await AnalyticsEventModel.create({
        visitorId: 'guest_banner_visitor',
        sessionId: 'session_' + Date.now(),
        eventType: 'bos_banner_reklam_tiklama',
        path: konum === 'ilan_detay' ? '/ilan/detay' : '/',
        metadata: {
          konum: konum || 'anasayfa',
          hedef: '/reklam-ver',
          timestamp: new Date(),
        },
      }).catch(() => {});

      return NextResponse.json({ ok: true, message: 'Boş alan tıklaması kaydedildi' });
    }

    return NextResponse.json({ ok: false }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
