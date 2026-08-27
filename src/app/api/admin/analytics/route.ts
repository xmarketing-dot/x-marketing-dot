import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'all';

    let dateQuery: any = {};
    const now = new Date();

    if (range === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: startOfToday } };
    } else if (range === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: startOfYesterday, $lt: endOfYesterday } };
    } else if (range === 'week') {
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: startOfWeek } };
    } else if (range === 'month') {
      const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: startOfMonth } };
    }

    // ── 1. ZİYARETÇİ VE SAYFA GÖRÜNTÜLEME METRİKLERİ ──
    const totalPageviews = await AnalyticsVisitorModel.countDocuments(dateQuery);
    
    // Tekil ziyaretçi sayısı (Aynı visitorId tek sayılır)
    const distinctVisitors = await AnalyticsVisitorModel.distinct('visitorId', dateQuery);
    const uniqueVisitors = distinctVisitors.length;

    // Aktif Kullanıcılar (Son 5 dakika)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeUsers = (await AnalyticsVisitorModel.distinct('visitorId', { createdAt: { $gte: fiveMinutesAgo } })).length;

    // ── 2. CİHAZ VE İŞLETİM SİSTEMİ DAĞILIMI ──
    const mobileCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, device: 'mobile' });
    const desktopCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, device: 'desktop' });

    // ── 3. TRAFİK KAYNAKLARI (GOOGLE, WHATSAPP, TELEGRAM, DİRECT, SOSYAL MEDYA) ──
    const googleCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'google' });
    const whatsappInboundCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'whatsapp' });
    const telegramInboundCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'telegram' });
    const directCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'direct' });
    const instagramCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'instagram' });
    const twitterCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'x' });
    const facebookCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, refererSource: 'facebook' });

    // ── 4. GOOGLE ARAMA TERİMLERİ VE SİTE İÇİ ARAMALAR ──
    const searchTerms = await AnalyticsVisitorModel.aggregate([
      { $match: { ...dateQuery, searchKeyword: { $exists: true, $ne: '' } } },
      { $group: { _id: "$searchKeyword", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    // ── 5. EN ÇOK GEZİLEN POPÜLER SAYFALAR ──
    const popularPages = await AnalyticsVisitorModel.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$path", pageTitle: { $first: "$pageTitle" }, count: { $sum: 1 }, avgDuration: { $avg: "$durationSeconds" } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    // ── 6. ŞEHİR / BÖLGE DAĞILIMI ──
    const topCities = await AnalyticsVisitorModel.aggregate([
      { $match: { ...dateQuery, city: { $exists: true, $ne: '' } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // ── 7. ETKİNLİK VE TIKLAMA ANALİZLERİ (WHATSAPP, PAYLAŞIM, BUTONLAR) ──
    const eventStats = await AnalyticsEventModel.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
    ]);

    const eventCounts: Record<string, number> = {};
    eventStats.forEach((e) => {
      eventCounts[e._id] = e.count;
    });

    // En Çok WhatsApp Tıklaması ve Paylaşımı Alan İlanlar
    const topContactedListings = await AnalyticsEventModel.aggregate([
      { $match: { ...dateQuery, eventType: { $in: ['whatsapp_click', 'share_listing'] } } },
      { 
        $group: { 
          _id: "$targetTitle", 
          targetId: { $first: "$targetId" },
          whatsappClicks: { $sum: { $cond: [{ $eq: ["$eventType", "whatsapp_click"] }, 1, 0] } },
          shares: { $sum: { $cond: [{ $eq: ["$eventType", "share_listing"] }, 1, 0] } },
          totalInteractions: { $sum: 1 }
        } 
      },
      { $sort: { totalInteractions: -1 } },
      { $limit: 15 },
    ]);

    // ── 7.5 ÖZEL SPONSORLU POPUP REKLAM PERFORMANSI ──
    const specialAdImpressions = await AnalyticsEventModel.countDocuments({ ...dateQuery, eventType: 'special_ad_impression' });
    const specialAdUniqueVisitors = (await AnalyticsEventModel.distinct('visitorId', { ...dateQuery, eventType: 'special_ad_impression' })).length;
    const specialAdClicks = await AnalyticsEventModel.countDocuments({ ...dateQuery, eventType: { $in: ['special_ad_click', 'special_ad_whatsapp_click'] } });
    const specialAdWhatsappClicks = await AnalyticsEventModel.countDocuments({ ...dateQuery, eventType: 'special_ad_whatsapp_click' });
    const specialAdCtr = specialAdImpressions > 0 ? ((specialAdClicks / specialAdImpressions) * 100).toFixed(1) : '0.0';

    // ── 8. SON 100 CANLI ZİYARETÇİ GÜNLÜĞÜ ──
    const recentVisitors = await AnalyticsVisitorModel.find(dateQuery)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // ── 9. GENEL İLAN İSTATİSTİKLERİ ──
    const listings = await ListingModel.find({}, 'goruntulenmeSayisi whatsappTiklamaSayisi paylasimSayisi').lean();
    const totalListingViews = listings.reduce((acc, l) => acc + (l.goruntulenmeSayisi || 0), 0);
    const totalWhatsappClicks = listings.reduce((acc, l) => acc + (l.whatsappTiklamaSayisi || 0), 0);
    const totalShares = listings.reduce((acc: number, l: any) => acc + (l.paylasimSayisi || 0), 0);

    return NextResponse.json({
      analytics: {
        totalPageviews,
        uniqueVisitors,
        activeUsers,
        mobileCount,
        desktopCount,
        mobilePercentage: totalPageviews > 0 ? Math.round((mobileCount / totalPageviews) * 100) : 0,
        desktopPercentage: totalPageviews > 0 ? Math.round((desktopCount / totalPageviews) * 100) : 0,
        sources: {
          google: googleCount,
          whatsapp: whatsappInboundCount,
          telegram: telegramInboundCount,
          direct: directCount,
          instagram: instagramCount,
          x: twitterCount,
          facebook: facebookCount,
        },
        searchTerms,
        popularPages,
        topCities,
        specialAdStats: {
          impressions: specialAdImpressions,
          uniqueVisitors: specialAdUniqueVisitors,
          clicks: specialAdClicks,
          whatsappClicks: specialAdWhatsappClicks,
          ctr: specialAdCtr,
        },
        eventCounts: {
          whatsappClicks: eventCounts.whatsapp_click || 0,
          shares: eventCounts.share_listing || 0,
          categoryClicks: eventCounts.category_click || 0,
          cityFilters: eventCounts.city_filter || 0,
          searches: eventCounts.search || 0,
          specialAdImpressions,
          specialAdClicks,
        },
        topContactedListings,
        totalListingViews,
        totalWhatsappClicks,
        totalShares,
        recentVisitors,
      },
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message || 'Analytics fetch error' }, { status: 500 });
  }
}
