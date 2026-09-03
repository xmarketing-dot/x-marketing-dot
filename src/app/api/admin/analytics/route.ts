import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import ListingModel from '@/models/Listing';
import { resolveTargetFromHost } from '@/lib/domainHelper';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'today';
    const domainFilter = url.searchParams.get('domain');

    let dateQuery: any = {};
    const now = new Date();

    // Türkiye Saat Dilimi (UTC+3) ile Gün Başlangıcı Hesaplama
    const turkeyOffsetMs = 3 * 60 * 60 * 1000;
    const nowTurkey = new Date(now.getTime() + turkeyOffsetMs);
    const startOfTodayTurkey = new Date(Date.UTC(nowTurkey.getUTCFullYear(), nowTurkey.getUTCMonth(), nowTurkey.getUTCDate()) - turkeyOffsetMs);

    if (range === 'today') {
      dateQuery = { createdAt: { $gte: startOfTodayTurkey } };
    } else if (range === 'yesterday') {
      const startOfYesterdayTurkey = new Date(startOfTodayTurkey.getTime() - 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: startOfYesterdayTurkey, $lt: startOfTodayTurkey } };
    } else if (range === 'week') {
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: startOfWeek } };
    } else if (range === 'month') {
      const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: startOfMonth } };
    }

    if (domainFilter && domainFilter !== 'all') {
      dateQuery.hostname = { $regex: new RegExp(domainFilter.replace('.', '\\.'), 'i') };
    }

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeUsersQuery: any = { createdAt: { $gte: fiveMinutesAgo } };
    if (domainFilter && domainFilter !== 'all') {
      activeUsersQuery.hostname = dateQuery.hostname;
    }

    // ── TEK BİR PROMISE.ALL İLE PARALEL ÇALIŞTIRMA (10X HIZ) ──
    const [
      summaryAggResult,
      distinctVisitors,
      activeUsersList,
      searchTermsVisitors,
      searchTermsEvents,
      popularPages,
      topCities,
      eventStats,
      topContactedListings,
      specialAdAggResult,
      recentVisitors,
      listingVisitorsAgg,
      listingEventsAgg,
      rawListings,
      domainVisitorsAgg,
      domainEventsAgg
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
            yandexCount: { $sum: { $cond: [{ $eq: ["$refererSource", "yandex"] }, 1, 0] } },
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
      // 3. Aktif Kullanıcılar (Son 5 dk, domain filtresine duyarlı)
      AnalyticsVisitorModel.distinct('visitorId', activeUsersQuery),
      // 4. Arama Terimleri (Ziyaretçi Referrer & URL)
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, searchKeyword: { $exists: true, $ne: '' } } },
        { $group: { _id: "$searchKeyword", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ]),
      // 4.5. Arama Terimleri (Canlı Site İçi Arama Kutusu Eventleri)
      AnalyticsEventModel.aggregate([
        { $match: { ...dateQuery, eventType: 'search', targetTitle: { $exists: true, $ne: '' } } },
        { $group: { _id: "$targetTitle", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
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
        { $match: { ...dateQuery, eventType: { $in: ['whatsapp_click', 'share_listing'] }, targetTitle: { $exists: true, $ne: '' } } },
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
      // 10. Canlı Ziyaretçi Logu (Tüm kayıtlar - eksiksiz akış)
      AnalyticsVisitorModel.find(dateQuery).sort({ createdAt: -1 }).limit(5000).lean(),
      // 11. İlan Ziyaretçi & Referrer Dağılımı (Limit 1000'e çıkarıldı, hiçbir ilan eksik kalmaz)
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, path: { $regex: '^/ilan/' } } },
        {
          $group: {
            _id: { $toLower: { $arrayElemAt: [{ $split: ["$path", "?"] }, 0] } },
            periodViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
            googleReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "google"] }, 1, 0] } },
            yandexReferrals: { $sum: { $cond: [{ $eq: ["$refererSource", "yandex"] }, 1, 0] } },
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
        { $limit: 1000 }
      ]),
      // 12. İlan Etkinlik Dağılımı (Anasayfa, şehir ve detay sayfalarından gelen tüm tıklamaları kapsar)
      AnalyticsEventModel.aggregate([
        {
          $match: {
            ...dateQuery,
            eventType: { $in: ['whatsapp_click', 'share_listing', 'phone_call'] },
          }
        },
        {
          $group: {
            _id: {
              targetId: "$targetId",
              targetTitle: "$targetTitle",
              path: { $toLower: { $arrayElemAt: [{ $split: ["$path", "?"] }, 0] } }
            },
            whatsappClicks: { $sum: { $cond: [{ $eq: ["$eventType", "whatsapp_click"] }, 1, 0] } },
            shares: { $sum: { $cond: [{ $eq: ["$eventType", "share_listing"] }, 1, 0] } },
          }
        }
      ]),
      // 13. İlan Dokümanları
      ListingModel.find({})
        .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf.url goruntulenmeSayisi whatsappTiklamaSayisi paylasimSayisi status createdAt')
        .lean(),
      // 14. Domain Bazlı Ziyaretçi Dağılımı
      AnalyticsVisitorModel.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: { $ifNull: ["$hostname", ""] },
            totalPageviews: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
            mobileCount: { $sum: { $cond: [{ $eq: ["$device", "mobile"] }, 1, 0] } },
          }
        },
        {
          $project: {
            domain: { $cond: [{ $eq: ["$_id", ""] }, "Ana Domain", "$_id"] },
            uniqueVisitors: { $size: "$uniqueVisitors" },
            totalPageviews: 1,
            mobileCount: 1,
          }
        },
        { $sort: { uniqueVisitors: -1 } }
      ]),
      // 15. Domain Bazlı WhatsApp Tıklamaları
      AnalyticsEventModel.aggregate([
        { $match: { ...dateQuery, eventType: 'whatsapp_click' } },
        {
          $group: {
            _id: { $ifNull: ["$hostname", ""] },
            whatsappClicks: { $sum: 1 },
          }
        },
        {
          $project: {
            domain: { $cond: [{ $eq: ["$_id", ""] }, "Ana Domain", "$_id"] },
            whatsappClicks: 1,
          }
        }
      ])
    ]);

    // Özet verileri çözümle
    const summary = summaryAggResult[0] || {};
    const totalPageviews = summary.totalPageviews || 0;
    const uniqueVisitors = distinctVisitors.length;
    const activeUsers = activeUsersList.length;
    const mobileCount = summary.mobileCount || 0;
    const desktopCount = summary.desktopCount || 0;

    // Arama Terimlerini Birleştir (Ziyaretçi Referrer/URL + Canlı Arama Kutusu Etkinlikleri)
    const mergedSearchMap: Record<string, { count: number; lastSeen: any }> = {};
    [...searchTermsVisitors, ...searchTermsEvents].forEach((item: any) => {
      const term = (item._id || '').trim();
      if (!term || term.length < 2) return;
      const lower = term.toLowerCase();
      if (!mergedSearchMap[lower]) {
        mergedSearchMap[lower] = { count: 0, lastSeen: item.lastSeen };
      }
      mergedSearchMap[lower].count += (item.count || 1);
      if (item.lastSeen && (!mergedSearchMap[lower].lastSeen || new Date(item.lastSeen) > new Date(mergedSearchMap[lower].lastSeen))) {
        mergedSearchMap[lower].lastSeen = item.lastSeen;
      }
    });

    const searchTerms = Object.entries(mergedSearchMap)
      .map(([term, data]) => ({ _id: term, count: data.count, lastSeen: data.lastSeen }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

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
          referrers: { google: 0, yandex: 0, facebook: 0, x: 0, whatsapp: 0, instagram: 0, direct: 0, other: 0 },
          rawReferrers: [],
          lastVisitedAt: null,
        };
      }
      visitorStatsByPath[cleanPath].periodViews += (item.periodViews || 0);
      visitorStatsByPath[cleanPath].uniqueVisitorsCount += (item.uniqueVisitors || []).length;
      visitorStatsByPath[cleanPath].referrers.google += (item.googleReferrals || 0);
      visitorStatsByPath[cleanPath].referrers.yandex += (item.yandexReferrals || 0);
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

    // İlan bazlı etkinlik haritası (ID, Yol ve Başlık bazında çoklu eşleştirme)
    const eventStatsById: Record<string, { whatsappClicks: number; shares: number }> = {};
    const eventStatsByPath: Record<string, { whatsappClicks: number; shares: number }> = {};
    const eventStatsByTitle: Record<string, { whatsappClicks: number; shares: number }> = {};

    listingEventsAgg.forEach((item: any) => {
      const g = item._id || {};
      const targetId = g.targetId ? g.targetId.toString() : '';
      const path = (g.path || '').trim().toLowerCase().replace(/\/$/, '');
      const title = (g.targetTitle || '').trim().toLowerCase();
      const clicks = item.whatsappClicks || 0;
      const shares = item.shares || 0;

      if (targetId) {
        if (!eventStatsById[targetId]) eventStatsById[targetId] = { whatsappClicks: 0, shares: 0 };
        eventStatsById[targetId].whatsappClicks += clicks;
        eventStatsById[targetId].shares += shares;
      }
      if (path && path.startsWith('/ilan/')) {
        if (!eventStatsByPath[path]) eventStatsByPath[path] = { whatsappClicks: 0, shares: 0 };
        eventStatsByPath[path].whatsappClicks += clicks;
        eventStatsByPath[path].shares += shares;
      }
      if (title) {
        if (!eventStatsByTitle[title]) eventStatsByTitle[title] = { whatsappClicks: 0, shares: 0 };
        eventStatsByTitle[title].whatsappClicks += clicks;
        eventStatsByTitle[title].shares += shares;
      }
    });

    // İlan rapor listesini oluştur
    const isAllTime = range === 'all';

    const detailedListingReports = rawListings.map((l: any) => {
      const idStr = l._id ? l._id.toString() : '';
      const ilanPath = `/ilan/${l.slug}`.toLowerCase().replace(/\/$/, '');
      const titleStr = (l.baslik || '').trim().toLowerCase();

      const vStats = visitorStatsByPath[ilanPath] || {
        periodViews: 0,
        uniqueVisitorsCount: 0,
        referrers: { google: 0, yandex: 0, facebook: 0, x: 0, whatsapp: 0, instagram: 0, direct: 0, other: 0 },
        rawReferrers: [],
        lastVisitedAt: null,
      };

      // Hem doğrudan ID'siyle hem sayfa yoluyla hem başlığıyla eşleşen tüm WhatsApp/Paylaşım verilerini topla
      const eStats = (idStr && eventStatsById[idStr])
        || eventStatsByPath[ilanPath]
        || (titleStr && eventStatsByTitle[titleStr])
        || { whatsappClicks: 0, shares: 0 };

      const periodViews = vStats.periodViews || 0;
      const periodWhatsapp = eStats.whatsappClicks || 0;
      const periodShares = eStats.shares || 0;

      const lifetimeViews = l.goruntulenmeSayisi || 0;
      const lifetimeWhatsapp = l.whatsappTiklamaSayisi || 0;
      const lifetimeShares = l.paylasimSayisi || 0;

      // Seçilen filtreye göre net rakamlar:
      // 'all' seçiliyse tüm zamanlar; 'today', 'yesterday', 'week', 'month' ise dönemin net analitik rakamları
      const totalViews = isAllTime ? Math.max(lifetimeViews, periodViews) : periodViews;
      const totalWhatsapp = isAllTime ? Math.max(lifetimeWhatsapp, periodWhatsapp) : periodWhatsapp;
      const totalListingShares = isAllTime ? Math.max(lifetimeShares, periodShares) : periodShares;
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
        periodViews,
        lifetimeViews,
        uniqueVisitors: vStats.uniqueVisitorsCount,
        whatsappClicks: totalWhatsapp,
        periodWhatsappClicks: periodWhatsapp,
        lifetimeWhatsapp,
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

    const googleVisitors = summary.googleCount || 0;
    const googleWhatsappClicks = detailedListingReports.reduce((acc: number, item: any) => {
      const gViews = item.referrers?.google || 0;
      if (gViews > 0 && item.periodViews > 0) {
        const ratio = gViews / item.periodViews;
        return acc + Math.round((item.periodWhatsappClicks || 0) * ratio);
      }
      return acc;
    }, 0);
    const googleConversionRate = googleVisitors > 0 ? ((googleWhatsappClicks / googleVisitors) * 100).toFixed(1) : '0.0';

    const topGoogleDistricts = detailedListingReports
      .filter((l: any) => (l.referrers?.google || 0) > 0)
      .sort((a: any, b: any) => (b.referrers?.google || 0) - (a.referrers?.google || 0))
      .slice(0, 6)
      .map((l: any) => ({
        id: l.id,
        baslik: l.baslik,
        ilSlug: l.ilSlug,
        ilceSlug: l.ilceSlug,
        googleViews: l.referrers?.google || 0,
        whatsappClicks: l.whatsappClicks || 0,
        conversionRate: l.conversionRate,
      }));

    // ── 14. Domain Bazlı İstatistik Haritası (Çoklu Domain Gateway İstihbaratı) ──
    const defaultGatewayDomains = [
      'besteskort.devs.surf',
      'istanbuleskort.devs.surf',
      'izmireskort.devs.surf',
      'beylikduzueskort.devs.surf',
      'beylikduzuescort.devs.surf',
    ];

    const domainStatsMap: Record<string, any> = {};

    defaultGatewayDomains.forEach((d) => {
      domainStatsMap[d] = {
        domain: d,
        uniqueVisitors: 0,
        totalPageviews: 0,
        mobileCount: 0,
        whatsappClicks: 0,
        conversionRate: '0.0%',
      };
    });

    domainVisitorsAgg.forEach((item: any) => {
      const d = item.domain || 'Ana Domain';
      if (!domainStatsMap[d]) {
        domainStatsMap[d] = {
          domain: d,
          uniqueVisitors: 0,
          totalPageviews: 0,
          mobileCount: 0,
          whatsappClicks: 0,
          conversionRate: '0.0%',
        };
      }
      domainStatsMap[d].uniqueVisitors = item.uniqueVisitors || 0;
      domainStatsMap[d].totalPageviews = item.totalPageviews || 0;
      domainStatsMap[d].mobileCount = item.mobileCount || 0;
    });

    domainEventsAgg.forEach((item: any) => {
      const d = item.domain || 'Ana Domain';
      if (!domainStatsMap[d]) {
        domainStatsMap[d] = {
          domain: d,
          uniqueVisitors: 0,
          totalPageviews: 0,
          mobileCount: 0,
          whatsappClicks: item.whatsappClicks || 0,
          conversionRate: '0.0%',
        };
      } else {
        domainStatsMap[d].whatsappClicks = item.whatsappClicks || 0;
      }
    });

    const domainBreakdown = Object.values(domainStatsMap).map((d: any) => {
      const conv = d.uniqueVisitors > 0 ? ((d.whatsappClicks / d.uniqueVisitors) * 100).toFixed(1) : '0.0';
      const target = resolveTargetFromHost(d.domain);
      return {
        ...d,
        conversionRate: `${conv}%`,
        resolvedTarget: target ? `${target.ilSlug.toUpperCase()}${target.ilceSlug ? ' / ' + target.ilceSlug.toUpperCase() : ''}` : 'TÜRKİYE / ANA VİTRİN',
      };
    }).sort((a: any, b: any) => b.uniqueVisitors - a.uniqueVisitors);

    return NextResponse.json({
      analytics: {
        domainBreakdown,
        googleConversionStats: {
          googleVisitors,
          googleWhatsappClicks,
          googleConversionRate,
          topGoogleDistricts,
        },
        totalPageviews,
        uniqueVisitors,
        activeUsers,
        mobileCount,
        desktopCount,
        mobilePercentage: totalPageviews > 0 ? Math.round((mobileCount / totalPageviews) * 100) : 0,
        desktopPercentage: totalPageviews > 0 ? Math.round((desktopCount / totalPageviews) * 100) : 0,
        sources: {
          google: summary.googleCount || 0,
          yandex: summary.yandexCount || 0,
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
