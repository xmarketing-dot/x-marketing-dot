import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import BannerAdModel from '@/models/BannerAd';
import AnalyticsEventModel from '@/models/AnalyticsEvent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const now = new Date();

    // 1. Süresi dolan aktif promosyonları otomatik olarak süresi_doldu işaretle
    await Promise.all([
      ListingModel.updateMany(
        {
          isPromo: true,
          status: 'yayinda',
          paketBitisTarihi: { $lt: now }
        },
        { $set: { status: 'suresi_doldu' } }
      ).catch(() => {}),
      BannerAdModel.updateMany(
        {
          isPromo: true,
          durum: 'yayinda',
          bitisTarihi: { $lt: now }
        },
        { $set: { durum: 'suresi_doldu' } }
      ).catch(() => {})
    ]);

    // 2. Tüm Ücretsiz Promosyon İlanlarını Çek
    const rawListings = await ListingModel.find({
      $or: [
        { isPromo: true },
        { promoType: { $exists: true, $ne: null } }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Tüm Ücretsiz Promosyon Banner Reklamlarını Çek
    const rawBanners = await BannerAdModel.find({
      $or: [
        { isPromo: true },
        { promoType: { $exists: true, $ne: null } },
        { odemeYontemi: 'promosyon' },
        { fiyatTL: 0 }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    // 4. İlanların Analytics Etkinliklerini (Görüntülenme & WhatsApp Tıklamaları) Hesapla
    const listingSlugs = rawListings.map((l: any) => l.slug).filter(Boolean);
    const listingAgg = await AnalyticsEventModel.aggregate([
      { $match: { listingSlug: { $in: listingSlugs } } },
      {
        $group: {
          _id: { slug: '$listingSlug', type: '$eventType' },
          count: { $sum: 1 }
        }
      }
    ]).catch(() => []);

    const eventMap: Record<string, { views: number; whatsappClicks: number }> = {};
    listingAgg.forEach((item: any) => {
      const slug = item._id?.slug;
      const type = item._id?.type;
      if (!slug) return;
      if (!eventMap[slug]) eventMap[slug] = { views: 0, whatsappClicks: 0 };

      if (type === 'listing_view') {
        eventMap[slug].views += item.count;
      } else if (type === 'whatsapp_click') {
        eventMap[slug].whatsappClicks += item.count;
      }
    });

    const enrichedListings = rawListings.map((l: any) => ({
      ...l,
      id: l._id.toString(),
      totalViews: eventMap[l.slug]?.views || l.goruntulenmeSayisi || 0,
      whatsappClicks: eventMap[l.slug]?.whatsappClicks || l.whatsappTiklamaSayisi || 0,
    }));

    const enrichedBanners = rawBanners.map((b: any) => ({
      ...b,
      id: b._id.toString(),
    }));

    // 5. İstatistik Metrikleri
    const pendingListings = enrichedListings.filter((l: any) => l.status === 'onay_bekliyor').length;
    const activeListings = enrichedListings.filter((l: any) => l.status === 'yayinda').length;
    const expiredListings = enrichedListings.filter((l: any) => l.status === 'suresi_doldu' || l.status === 'pasif').length;

    const pendingBanners = enrichedBanners.filter((b: any) => b.durum === 'onay_bekliyor' || b.durum === 'beklemede').length;
    const activeBanners = enrichedBanners.filter((b: any) => b.durum === 'yayinda').length;
    const expiredBanners = enrichedBanners.filter((b: any) => b.durum === 'suresi_doldu' || b.durum === 'pasif').length;

    return NextResponse.json({
      success: true,
      data: {
        listings: enrichedListings,
        banners: enrichedBanners,
        metrics: {
          totalListings: enrichedListings.length,
          totalBanners: enrichedBanners.length,
          grandTotal: enrichedListings.length + enrichedBanners.length,
          totalPending: pendingListings + pendingBanners,
          totalActive: activeListings + activeBanners,
          totalExpired: expiredListings + expiredBanners,
          pendingListings,
          activeListings,
          expiredListings,
          pendingBanners,
          activeBanners,
          expiredBanners,
        }
      }
    });
  } catch (error: any) {
    console.error('Promos fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
