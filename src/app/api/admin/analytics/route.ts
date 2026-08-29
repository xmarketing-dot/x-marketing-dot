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
    const range = url.searchParams.get('range') || 'today';

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

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // ── TEK BİR PROMISE.ALL İLE PARALEL ÇALIŞTIRMA (10X HIZ) ──
    const [
      summaryAggResult,
      distinctVisitors,
      activeUsersList,
      searchTerms,
      popularPages,
      topCities,
      eventStats,
      topContactedListings,
      specialAdAggResult,
      recentVisitors,
      listingVisitorsAgg,
      listingEventsAgg,
      rawListings
    ] = await Promise.all([
      // 1. Ziyaretçi ve Cihaz/Referrer Dağılımı (Tek gruplamada)
      AnalyticsVisitorModel.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: null,
            totalPageviews: { $sum: 1 },
            mobileCount: { $sum: { $cond: [{ $eq: ["$device", "mobile"] }, 1, 0] } },
            desktopCount: { $sum: { $cond: [{ $eq: ["$device", "desktop"] }, 1, 0] } },
            googleCount: { $sum: { $cond: [{ $eq: ["$refererSource", "google"] }, 1, 0] } },
            whatsappCount: { $sum: { $cond: [{ $eq: ["$refererSource", "whatsapp"] }, 1, 0] } },
            telegramCount: { $sum: { $cond: [{ $eq: ["$refererSource", "telegram"] }, 1, 0] } },
            directCount: { $sum: { $cond: [{ $eq: ["$refererSource", "direct"] }, 1, 0] } },
            instagramCount: { $sum: { $cond: [{ $eq: ["$refererSource", "instagram"] }, 1, 0] } },
            twitterCount: { $sum: { $cond: [{ $eq: ["$refererSource", "x"] }, 1, 0] } },
            facebookCount: { $sum: { $cond: [{ $eq: ["$refererSource", "facebook"] }, 1, 0] } },
          }
        }
      ]),
      // 2. Tekil Ziyaretçiler
      AnalyticsVisitorModel.distinct('visitorId', dateQuery),
      // 3. Aktif Kullanıcılar (Son 5 dk)
      AnalyticsVisitorModel.distinct('visitorId', { createdAt: { $gte: fiveMinutesAgo } }),
      // 4. Arama Terimleri
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, searchKeyword: { $exists: true, $ne: '' } } },
        { $group: { _id: "$searchKeyword", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      // 5. Popüler Sayfalar
      AnalyticsVisitorModel.aggregate([
        { $match: dateQuery },
        { $group: { _id: "$path", pageTitle: { $first: "$pageTitle" }, count: { $sum: 1 }, avgDuration: { $avg: "$durationSeconds" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      // 6. Şehir Dağılımı
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, city: { $exists: true, $ne: '' } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // 7. Etkinlik İstatistikleri
      AnalyticsEventModel.aggregate([
        { $match: dateQuery },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
      // 8. En Çok İletişim Alan İlanlar
      AnalyticsEventModel.aggregate([
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
      ]),
      // 9. Özel Popup Reklam Performansı (Tek aggregation)
      AnalyticsEventModel.aggregate([
        { $match: { ...dateQuery, eventType: { $regex: '^special_ad_' } } },
        {
          $group: {
            _id: null,
            impressions: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_impression"] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $in: ["$eventType", ["special_ad_click", "special_ad_whatsapp_click"]] }, 1, 0] } },
            whatsappClicks: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_whatsapp_click"] }, 1, 0] } },
            uniqueVisitors: { $addToSet: { $cond: [{ $eq: ["$eventType", "special_ad_impression"] }, "$visitorId", "$$REMOVE"] } }
          }
        }
      ]),
      // 10. Canlı Ziyaretçi Logu (Son 50)
      AnalyticsVisitorModel.find(dateQuery).sort({ createdAt: -1 }).limit(50).lean(),
      // 11. İlan Ziyaretçi & Referrer Dağılımı
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, path: { $regex: '^/ilan/' } } },
        {
          $group: {
            _id: { $toLower: { $arrayElemAt: [{ $split: ["$path", "?"] }, 0] } },
            periodViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
            googleReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "google"] }, 1, 0] } },
            facebookReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "facebook"] }, 1, 0] } },
            twitterReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "x"] }, 1, 0] } },
            whatsappReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "whatsapp"] }, 1, 0] } },
            instagramReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "instagram"] }, 1, 0] } },
            directReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "direct"] }, 1, 0] } },
            otherReferrals: { $sum: { $cond: [{ $in: ["$refererSource", ["telegram", "other"]] }, 1, 0] } },
            rawReferrers: { $addToSet: "$referer" },
            lastVisitedAt: { $max: "$createdAt" },
          }
        },
        { $sort: { periodViews: -1 } },
        { $limit: 100 }
      ]),
      // 12. İlan Etkinlik Dağılımı
      AnalyticsEventModel.aggregate([
        {
          $match: {
            ...dateQuery,
            eventType: { $in: ['whatsapp_click', 'share_listing', 'phone_call'] },
            path: { $regex: '^/ilan/' }
          }
        },
        {
          $group: {
            _id: { $toLower: { $arrayElemAt: [{ $split: ["$path", "?"] }, 0] } },
            whatsappClicks: { $sum: { $cond: [{ $eq: ["$eventType", "whatsapp_click"] }, 1, 0] } },
            shares: { $sum: { $cond: [{ $eq: ["$eventType", "share_listing"] }, 1, 0] } },
          }
        }
      ]),
      // 13. İlan Dokümanları
      ListingModel.find({})
        .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf.url goruntulenmeSayisi whatsappTiklamaSayisi paylasimSayisi status createdAt')
        .lean()
    ]);

    // Özet verileri çözümle
    const summary = summaryAggResult[0] || {};
    const totalPageviews = summary.totalPageviews || 0;
    const uniqueVisitors = distinctVisitors.length;
    const activeUsers = activeUsersList.length;
    const mobileCount = summary.mobileCount || 0;
    const desktopCount = summary.desktopCount || 0;

    const eventCounts: Record<string, number> = {};
    eventStats.forEach((e: any) => {
      eventCounts[e._id] = e.count;
    });

    const specialAd = specialAdAggResult[0] || {};
    const specialAdImpressions = specialAd.impressions || 0;
    const specialAdClicks = specialAd.clicks || 0;
    const specialAdWhatsappClicks = specialAd.whatsappClicks || 0;
    const specialAdUniqueVisitors = (specialAd.uniqueVisitors || []).length;
    const specialAdCtr = specialAdImpressions > 0 ? ((specialAdClicks / specialAdImpressions) * 100).toFixed(1) : '0.0';

    // İlan bazlı ziyaretçi haritası
    const visitorStatsByPath: Record<string, any> = {};
    listingVisitorsAgg.forEach((item: any) => {
      const cleanPath = (item._id || '').trim().toLowerCase().replace(/\/$/, '');
      if (!visitorStatsByPath[cleanPath]) {
        visitorStatsByPath[cleanPath] = {
          periodViews: 0,
          uniqueVisitorsCount: 0,
          referrers: { google: 0, facebook: 0, x: 0, whatsapp: 0, instagram: 0, direct: 0, other: 0 },
          rawReferrers: [],
          lastVisitedAt: null,
        };
      }
      visitorStatsByPath[cleanPath].periodViews += (item.periodViews || 0);
      visitorStatsByPath[cleanPath].uniqueVisitorsCount += (item.uniqueVisitors || []).length;
      visitorStatsByPath[cleanPath].referrers.google += (item.googleReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.facebook += (item.facebookReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.x += (item.twitterReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.whatsapp += (item.whatsappReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.instagram += (item.instagramReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.direct += (item.directReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.other += (item.otherReferrals || 0);

      const filteredRaw = (item.rawReferrers || [])
        .filter((r: string) => {
          if (!r || r === 'Direct' || r === 'Google Search') return false;
          const rLow = r.toLowerCase();
          return !rLow.includes('besteskort') && !rLow.includes('bestescort') && !rLow.includes('localhost');
        });
      visitorStatsByPath[cleanPath].rawReferrers.push(...filteredRaw);

      if (item.lastVisitedAt && (!visitorStatsByPath[cleanPath].lastVisitedAt || item.lastVisitedAt > visitorStatsByPath[cleanPath].lastVisitedAt)) {
        visitorStatsByPath[cleanPath].lastVisitedAt = item.lastVisitedAt;
      }
    });

    // İlan bazlı etkinlik haritası
    const eventStatsByPath: Record<string, any> = {};
    listingEventsAgg.forEach((item: any) => {
      const cleanPath = (item._id || '').trim().toLowerCase().replace(/\/$/, '');
      if (!eventStatsByPath[cleanPath]) {
        eventStatsByPath[cleanPath] = { whatsappClicks: 0, shares: 0 };
      }
      eventStatsByPath[cleanPath].whatsappClicks += (item.whatsappClicks || 0);
      eventStatsByPath[cleanPath].shares += (item.shares || 0);
    });

    // İlan rapor listesini oluştur
    const detailedListingReports = rawListings.map((l: any) => {
      const ilanPath = `/ilan/${l.slug}`.toLowerCase();
      const vStats = visitorStatsByPath[ilanPath] || {
        periodViews: 0,
        uniqueVisitorsCount: 0,
        referrers: { google: 0, facebook: 0, x: 0, whatsapp: 0, instagram: 0, direct: 0, other: 0 },
        rawReferrers: [],
        lastVisitedAt: null,
      };
      const eStats = eventStatsByPath[ilanPath] || {
        whatsappClicks: 0,
        shares: 0,
      };

      const totalViews = Math.max(l.goruntulenmeSayisi || 0, vStats.periodViews);
      const totalWhatsapp = Math.max(l.whatsappTiklamaSayisi || 0, eStats.whatsappClicks);
      const totalListingShares = Math.max(l.paylasimSayisi || 0, eStats.shares);
      const conversionRate = totalViews > 0 ? ((totalWhatsapp / totalViews) * 100).toFixed(1) : '0.0';

      return {
        id: l._id.toString(),
        baslik: l.baslik,
        slug: l.slug,
        ilSlug: l.ilSlug,
        ilceSlug: l.ilceSlug,
        rozet: l.rozet,
        whatsappNumara: l.whatsappNumara,
        fotoUrl: l.anaFotograf?.url || null,
        status: l.status,
        createdAt: l.createdAt,
        totalViews,
        periodViews: vStats.periodViews,
        uniqueVisitors: vStats.uniqueVisitorsCount,
        whatsappClicks: totalWhatsapp,
        periodWhatsappClicks: eStats.whatsappClicks,
        shares: totalListingShares,
        conversionRate,
        referrers: vStats.referrers,
        rawReferrers: Array.from(new Set(vStats.rawReferrers || [])).slice(0, 10),
        lastVisitedAt: vStats.lastVisitedAt,
      };
    });

    const totalListingViews = detailedListingReports.reduce((acc: number, item: any) => acc + item.totalViews, 0);
    const totalWhatsappClicks = detailedListingReports.reduce((acc: number, item: any) => acc + item.whatsappClicks, 0);
    const totalShares = detailedListingReports.reduce((acc: number, item: any) => acc + item.shares, 0);

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
          google: summary.googleCount || 0,
          whatsapp: summary.whatsappCount || 0,
          telegram: summary.telegramCount || 0,
          direct: summary.directCount || 0,
          instagram: summary.instagramCount || 0,
          x: summary.twitterCount || 0,
          facebook: summary.facebookCount || 0,
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
        detailedListingReports,
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
