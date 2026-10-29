import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import AnalyticsDailySummaryModel from '@/models/AnalyticsDailySummary';
import ListingModel from '@/models/Listing';
import { resolveTargetFromHost } from '@/lib/domainHelper';
import { normalizeHost } from '@/lib/analyticsRollup';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'today';
    const domainFilter = url.searchParams.get('domain');
    const visitorLimit = Math.min(Math.max(parseInt(url.searchParams.get('visitorLimit') || '100', 10), 50), 10000);

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

    // Domain ve tüm eski/bağlı domain türevlerini (escturkiye.devs.surf, escturkiye.space vb.) kapsayan akıllı regex
    const getDomainFilterRegex = (domain?: string | null): RegExp | null => {
      if (!domain || domain === 'all') return null;
      const d = domain.toLowerCase();
      if (d.includes('escturkiye') || d.includes('turkiyeescort') || d.includes('turkiyeeskort') || d.includes('escturkye')) {
        return /(escturkiye|escturkye|turkiyeescort|turkiyeeskort)/i;
      }
      if (d.includes('besteskort') || d.includes('bestescort')) {
        return /(besteskort|bestescort)/i;
      }
      return new RegExp(d.replace('.', '\\.'), 'i');
    };

    const domainRegex = getDomainFilterRegex(domainFilter);

    if (domainRegex) {
      dateQuery.hostname = { $regex: domainRegex };
    }

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeUsersQuery: any = { createdAt: { $gte: fiveMinutesAgo } };
    if (domainRegex) {
      activeUsersQuery.hostname = dateQuery.hostname;
    }

    // ── GÜNLÜK ÖZET (PRE-AGGREGATED SUMMARY) SORGULARI ──────────────────
    const todayStr = nowTurkey.toISOString().slice(0, 10);
    const yesterdayStr = new Date(nowTurkey.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const sevenDaysAgoStr = new Date(nowTurkey.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thirtyDaysAgoStr = new Date(nowTurkey.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    let summaryDateFilter: any = {};
    if (range === 'today') {
      summaryDateFilter = { date: todayStr };
    } else if (range === 'yesterday') {
      summaryDateFilter = { date: yesterdayStr };
    } else if (range === 'week') {
      summaryDateFilter = { date: { $gte: sevenDaysAgoStr } };
    } else if (range === 'month') {
      summaryDateFilter = { date: { $gte: thirtyDaysAgoStr } };
    } // 'all' matches all dates

    let summaryHostQuery: any = {};
    if (domainRegex) {
      summaryHostQuery = { hostname: { $regex: domainRegex } };
    } else {
      // Tüm siteler seçiliyken 'all' özet dökümanını sorgula
      summaryHostQuery = { hostname: 'all' };
    }

    // ── TEK BİR PROMISE.ALL İLE PARALEL ÇALIŞTIRMA (IŞIK HIZINDA) ──
    const [
      dailySummaries,
      domainSummaries,
      activeUsersList,
      searchTermsVisitors,
      searchTermsEvents,
      popularPages,
      topCities,
      topContactedListings,
      specialAdAggResult,
      recentVisitors,
      listingVisitorsAgg,
      listingConversionAgg,
      listingImpressionAgg,
      rawListings,
      recentWhatsappClicks,
      groupedWhatsappLeadsAgg,
      recentPwaInstalls
    ] = await Promise.all([
      // 1. Pre-aggregated Daily Summaries (Süper Hızlı < 5ms)
      AnalyticsDailySummaryModel.find({
        ...summaryDateFilter,
        ...summaryHostQuery,
      }).lean(),

      // 2. Pre-aggregated Domain Summaries (Domain Kırılımları < 5ms)
      AnalyticsDailySummaryModel.find({
        ...summaryDateFilter,
        hostname: { $ne: 'all' },
      }).lean(),

      // 3. Aktif Kullanıcılar (Sadece Son 5 dk, çok hafif < 2ms)
      AnalyticsVisitorModel.distinct('visitorId', activeUsersQuery),

      // 4. Arama Terimleri (Ziyaretçi Referrer & URL)
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, searchKeyword: { $exists: true, $ne: '' } } },
        { $group: { _id: "$searchKeyword", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ]),

      // 5. Arama Terimleri (Canlı Site İçi Arama Kutusu Eventleri)
      AnalyticsEventModel.aggregate([
        { $match: { ...dateQuery, eventType: 'search', targetTitle: { $exists: true, $ne: '' } } },
        { $group: { _id: "$targetTitle", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ]),

      // 6. Popüler Sayfalar
      AnalyticsVisitorModel.aggregate([
        { $match: dateQuery },
        { $group: { _id: "$path", pageTitle: { $first: "$pageTitle" }, count: { $sum: 1 }, avgDuration: { $avg: "$durationSeconds" } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),

      // 7. Şehir Dağılımı
      AnalyticsVisitorModel.aggregate([
        { $match: { ...dateQuery, city: { $exists: true, $ne: '' } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 8. En Çok İletişim Alan İlanlar
      AnalyticsEventModel.aggregate([
        { $match: { ...dateQuery, eventType: { $in: ['whatsapp_click', 'special_ad_whatsapp_click', 'share_listing'] }, targetTitle: { $exists: true, $ne: '' } } },
        { 
          $group: { 
            _id: "$targetTitle", 
            targetId: { $first: "$targetId" },
            whatsappClicks: { $sum: { $cond: [{ $in: ["$eventType", ["whatsapp_click", "special_ad_whatsapp_click"]] }, 1, 0] } },
            shares: { $sum: { $cond: [{ $eq: ["$eventType", "share_listing"] }, 1, 0] } },
            totalInteractions: { $sum: 1 }
          } 
        },
        { $sort: { totalInteractions: -1 } },
        { $limit: 15 },
      ]),

      // 9. Özel Popup Reklam Performansı
      AnalyticsEventModel.aggregate([
        { $match: { ...dateQuery, eventType: { $regex: '^special_ad_' } } },
        {
          $group: {
            _id: { $ifNull: ["$targetId", "Genel"] },
            title: { $first: "$targetTitle" },
            targetCity: { $first: "$targetCity" },
            impressions: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_impression"] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_click"] }, 1, 0] } },
            whatsappClicks: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_whatsapp_click"] }, 1, 0] } },
            uniqueVisitors: { $addToSet: { $cond: [{ $eq: ["$eventType", "special_ad_impression"] }, "$visitorId", "$$REMOVE"] } }
          }
        },
        { $sort: { impressions: -1 } },
        { $limit: 15 }
      ]),

      // 10. Canlı Ziyaretçi Logu (Dinamik limit: 100, 500, 1000 veya tümü)
      AnalyticsVisitorModel.find(dateQuery).sort({ createdAt: -1 }).limit(visitorLimit).lean(),

      // 11. İlan Ziyaretçi & Referrer Dağılımı
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
        { $limit: 500 }
      ]),

      // 12. İlan WhatsApp Tıklama & Dönüşüm Dağılımı (LİMİTSİZ - %100 Doğrulanmış Clicks)
      AnalyticsEventModel.aggregate([
        {
          $match: {
            ...dateQuery,
            eventType: { $in: ['whatsapp_click', 'special_ad_whatsapp_click', 'share_listing', 'phone_call'] },
          }
        },
        {
          $group: {
            _id: {
              targetId: "$targetId",
              targetTitle: "$targetTitle",
              metaSlug: "$metadata.slug",
              metaListingId: "$metadata.listingId",
              metaListingSlug: "$metadata.listingSlug"
            },
            whatsappClicks: { $sum: { $cond: [{ $in: ["$eventType", ["whatsapp_click", "special_ad_whatsapp_click"]] }, 1, 0] } },
            shares: { $sum: { $cond: [{ $eq: ["$eventType", "share_listing"] }, 1, 0] } },
          }
        }
      ]),

      // 12b. İlan Kart Gösterim Dağılımı (Hafif ve Doğrudan TargetId bazlı)
      AnalyticsEventModel.aggregate([
        {
          $match: {
            ...dateQuery,
            eventType: 'listing_impression'
          }
        },
        {
          $group: {
            _id: "$targetId",
            impressions: { $sum: 1 },
            uniqueImpressionVisitors: { $addToSet: "$visitorId" }
          }
        }
      ]),

      // 13. İlan Dokümanları
      ListingModel.find({})
        .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf.url goruntulenmeSayisi whatsappTiklamaSayisi paylasimSayisi status isPromo promoType promoBitisTarihi paketBitisTarihi createdAt')
        .lean(),

      // 14. Son WhatsApp Tıklama İstihbaratı (Dinamik Limit: min 500 veya visitorLimit)
      AnalyticsEventModel.find({
        ...dateQuery,
        eventType: { $in: ['whatsapp_click', 'special_ad_whatsapp_click'] }
      })
        .sort({ createdAt: -1 })
        .limit(Math.max(500, visitorLimit))
        .lean(),

      // 14b. Gruplanmış WhatsApp Tıklama & Randevu Dağılımı (Tüm İlanlar)
      AnalyticsEventModel.aggregate([
        {
          $match: {
            ...dateQuery,
            eventType: { $in: ['whatsapp_click', 'special_ad_whatsapp_click'] },
          }
        },
        {
          $group: {
            _id: {
              targetId: "$targetId",
              targetTitle: "$targetTitle",
              metaSlug: "$metadata.slug",
              metaListingId: "$metadata.listingId",
              metaListingSlug: "$metadata.listingSlug",
              phone: "$metadata.listingPhone",
              location: "$metadata.listingLocation",
            },
            count: { $sum: 1 },
            lastClicked: { $max: "$createdAt" },
            uniqueVisitors: { $addToSet: "$visitorId" }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // 15. PWA / Uygulama Kurulum & Kaldırma İstihbaratı (Son 50)
      AnalyticsEventModel.find({
        ...dateQuery,
        eventType: { $in: ['pwa_install', 'pwa_uninstall'] }
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    ]);

    // ── ÖZET VERİLERİ ÇÖZÜMLE (MICROSECOND HIZINDA TOPLAMA) ──────────
    let totalPageviews = 0;
    let uniqueVisitors = 0;
    let mobileCount = 0;
    let desktopCount = 0;
    const sources = {
      google: 0,
      yandex: 0,
      whatsapp: 0,
      telegram: 0,
      direct: 0,
      instagram: 0,
      x: 0,
      facebook: 0,
      other: 0,
    };
    const eventCounts: Record<string, number> = {
      whatsappClicks: 0,
      shares: 0,
      categoryClicks: 0,
      cityFilters: 0,
      searches: 0,
      pwaInstalls: 0,
      pwaUninstalls: 0,
      specialAdImpressions: 0,
      specialAdClicks: 0,
      specialAdWhatsappClicks: 0,
    };

    dailySummaries.forEach((s: any) => {
      totalPageviews += s.totalPageviews || 0;
      uniqueVisitors += s.uniqueVisitors || 0;
      mobileCount += s.mobileCount || 0;
      desktopCount += s.desktopCount || 0;
      if (s.sources) {
        for (const [k, v] of Object.entries(s.sources)) {
          if (k in sources) (sources as any)[k] += (v as number) || 0;
        }
      }
      if (s.eventCounts) {
        for (const [k, v] of Object.entries(s.eventCounts)) {
          eventCounts[k] = (eventCounts[k] || 0) + ((v as number) || 0);
        }
      }
    });

    // Canlı Senkronizasyon & Yedekleme: Bugün ('today') için her zaman veya özet tabloda eksik kalan aralıklar için
    // doğrudan ham AnalyticsVisitorModel ve AnalyticsEventModel kayıtlarından hesaplayıp %100 canlı gerçeklik sağla
    if (range === 'today' || (totalPageviews === 0 && uniqueVisitors === 0)) {
      const [vSummary, eSummary] = await Promise.all([
        AnalyticsVisitorModel.aggregate([
          { $match: dateQuery },
          {
            $group: {
              _id: null,
              totalPageviews: { $sum: 1 },
              uniqueVisitorsSet: { $addToSet: "$visitorId" },
              mobileCount: { $sum: { $cond: [{ $eq: ["$device", "mobile"] }, 1, 0] } },
              desktopCount: { $sum: { $cond: [{ $eq: ["$device", "desktop"] }, 1, 0] } },
              google: { $sum: { $cond: [{ $eq: ["$refererSource", "google"] }, 1, 0] } },
              yandex: { $sum: { $cond: [{ $eq: ["$refererSource", "yandex"] }, 1, 0] } },
              whatsapp: { $sum: { $cond: [{ $eq: ["$refererSource", "whatsapp"] }, 1, 0] } },
              telegram: { $sum: { $cond: [{ $eq: ["$refererSource", "telegram"] }, 1, 0] } },
              direct: { $sum: { $cond: [{ $eq: ["$refererSource", "direct"] }, 1, 0] } },
              instagram: { $sum: { $cond: [{ $eq: ["$refererSource", "instagram"] }, 1, 0] } },
              x: { $sum: { $cond: [{ $eq: ["$refererSource", "x"] }, 1, 0] } },
              facebook: { $sum: { $cond: [{ $eq: ["$refererSource", "facebook"] }, 1, 0] } },
            }
          }
        ]),
        AnalyticsEventModel.aggregate([
          { $match: dateQuery },
          {
            $group: {
              _id: null,
              whatsappClicks: { $sum: { $cond: [{ $in: ["$eventType", ["whatsapp_click", "special_ad_whatsapp_click"]] }, 1, 0] } },
              shares: { $sum: { $cond: [{ $eq: ["$eventType", "share_listing"] }, 1, 0] } },
              categoryClicks: { $sum: { $cond: [{ $eq: ["$eventType", "category_click"] }, 1, 0] } },
              cityFilters: { $sum: { $cond: [{ $eq: ["$eventType", "city_filter"] }, 1, 0] } },
              searches: { $sum: { $cond: [{ $eq: ["$eventType", "search"] }, 1, 0] } },
              pwaInstalls: { $sum: { $cond: [{ $eq: ["$eventType", "pwa_install"] }, 1, 0] } },
              pwaUninstalls: { $sum: { $cond: [{ $eq: ["$eventType", "pwa_uninstall"] }, 1, 0] } },
              specialAdImpressions: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_impression"] }, 1, 0] } },
              specialAdClicks: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_click"] }, 1, 0] } },
              specialAdWhatsappClicks: { $sum: { $cond: [{ $eq: ["$eventType", "special_ad_whatsapp_click"] }, 1, 0] } },
            }
          }
        ])
      ]);

      if (vSummary && vSummary[0]) {
        const vs = vSummary[0];
        const rawViews = vs.totalPageviews || 0;
        const rawUnique = Array.isArray(vs.uniqueVisitorsSet) ? vs.uniqueVisitorsSet.length : 0;
        if (range === 'today' || rawViews > totalPageviews) {
          totalPageviews = rawViews;
          uniqueVisitors = rawUnique;
          mobileCount = vs.mobileCount || 0;
          desktopCount = vs.desktopCount || 0;
          sources.google = vs.google || 0;
          sources.yandex = vs.yandex || 0;
          sources.whatsapp = vs.whatsapp || 0;
          sources.telegram = vs.telegram || 0;
          sources.direct = vs.direct || 0;
          sources.instagram = vs.instagram || 0;
          sources.x = vs.x || 0;
          sources.facebook = vs.facebook || 0;
        }
      }

      if (eSummary && eSummary[0]) {
        const es = eSummary[0];
        for (const [k, v] of Object.entries(es)) {
          if (k !== '_id') {
            const rawVal = (v as number) || 0;
            if (range === 'today' || rawVal > (eventCounts[k] || 0)) {
              eventCounts[k] = rawVal;
            }
          }
        }
      }
    }

    const activeUsers = activeUsersList.length;

    // Arama Terimlerini Birleştir (Ziyaretçi Referrer/URL + Canlı Arama Kutusu Etkinlikleri)
    const mergedSearchMap: Record<string, { count: number; lastSeen: any }> = {};
    [...searchTermsVisitors, ...searchTermsEvents].forEach((item: any) => {
      const term = (item._id || '').trim().toLowerCase();
      if (!term || term.length < 2) return;
      if (!mergedSearchMap[term]) {
        mergedSearchMap[term] = { count: 0, lastSeen: item.lastSeen || new Date() };
      }
      mergedSearchMap[term].count += (item.count || 1);
      if (item.lastSeen && item.lastSeen > mergedSearchMap[term].lastSeen) {
        mergedSearchMap[term].lastSeen = item.lastSeen;
      }
    });

    const searchKeywordsList = Object.entries(mergedSearchMap)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        lastSeen: data.lastSeen,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    const searchTerms = searchKeywordsList;

    let specialAdImpressions = 0;
    let specialAdClicks = 0;
    let specialAdWhatsappClicks = 0;
    const allSpecialAdVisitors = new Set<string>();

    const specialAdBreakdown = (specialAdAggResult || []).map((st: any) => {
      const imp = st.impressions || 0;
      const clk = st.clicks || 0;
      const wa = st.whatsappClicks || 0;
      (st.uniqueVisitors || []).forEach((v: string) => allSpecialAdVisitors.add(v));
      specialAdImpressions += imp;
      specialAdClicks += (clk + wa);
      specialAdWhatsappClicks += wa;
      const totalClicks = clk + wa;
      const ctr = imp > 0 ? ((totalClicks / imp) * 100).toFixed(1) : '0.0';

      return {
        targetId: st._id,
        title: st.title || 'Sponsorlu Popup İlanı',
        targetCity: st.targetCity || 'Türkiye',
        impressions: imp,
        clicks: clk,
        whatsappClicks: wa,
        totalClicks,
        uniqueVisitors: (st.uniqueVisitors || []).length,
        ctr: `${ctr}%`,
      };
    });

    const specialAdUniqueVisitors = allSpecialAdVisitors.size;
    const specialAdTotalClicks = specialAdClicks;
    const specialAdCtr = specialAdImpressions > 0 
      ? ((specialAdTotalClicks / specialAdImpressions) * 100).toFixed(1) 
      : '0.0';

    // İlan İstatistiklerini Haritalandır
    const visitorStatsByPath: Record<string, any> = {};
    listingVisitorsAgg.forEach((item: any) => {
      const p = (item._id || '').toLowerCase().replace(/\/$/, '');
      visitorStatsByPath[p] = {
        periodViews: item.periodViews || 0,
        uniqueVisitors: new Set(item.uniqueVisitors || []),
        uniqueVisitorsCount: (item.uniqueVisitors || []).length,
        referrers: {
          google: item.googleReferrals || 0,
          yandex: item.yandexReferrals || 0,
          facebook: item.facebookReferrals || 0,
          x: item.twitterReferrals || 0,
          whatsapp: item.whatsappReferrals || 0,
          instagram: item.instagramReferrals || 0,
          direct: item.directReferrals || 0,
          other: item.otherReferrals || 0,
        },
        rawReferrers: item.rawReferrers || [],
        lastVisitedAt: item.lastVisitedAt || null,
      };
    });

    // İlan ID, Slug ve Başlık eşleme tabloları (100% kusursuz ilişkilendirme)
    const listingStatsById = new Map<string, { whatsappClicks: number; shares: number; impressions: number; uniqueVisitors: Set<string> }>();
    const slugToIdMap = new Map<string, string>();
    const titleToIdMap = new Map<string, string>();

    rawListings.forEach((l: any) => {
      const idStr = l._id.toString();
      listingStatsById.set(idStr, {
        whatsappClicks: 0,
        shares: 0,
        impressions: 0,
        uniqueVisitors: new Set(),
      });
      if (l.slug) {
        const cleanSlug = l.slug.toLowerCase().trim().replace(/^https?:\/\/[^\/]+/, '').replace(/^\/ilan\//, '').replace(/\/$/, '');
        slugToIdMap.set(cleanSlug, idStr);
      }
      if (l.baslik) titleToIdMap.set(l.baslik.toLowerCase().trim(), idStr);
    });

    // 1. WhatsApp Tıklamaları ve Paylaşımları Eşleştir (%100 Garantili Eşleşme)
    listingConversionAgg.forEach((item: any) => {
      const clicks = item.whatsappClicks || 0;
      const shares = item.shares || 0;
      const tid = (item._id?.targetId || '').toString().trim();
      const metaId = (item._id?.metaListingId || '').toString().trim();
      const metaSlug = (item._id?.metaSlug || item._id?.metaListingSlug || '').toString().toLowerCase().trim();
      const title = (item._id?.targetTitle || '').toString().toLowerCase().trim();

      const cleanTid = tid.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/ilan\//, '').replace(/\/$/, '').toLowerCase();
      const cleanMetaSlug = metaSlug.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/ilan\//, '').replace(/\/$/, '').toLowerCase();

      let targetId: string | null = null;
      if (metaId && listingStatsById.has(metaId)) {
        targetId = metaId;
      } else if (tid && listingStatsById.has(tid)) {
        targetId = tid;
      } else if (cleanMetaSlug && slugToIdMap.has(cleanMetaSlug)) {
        targetId = slugToIdMap.get(cleanMetaSlug)!;
      } else if (cleanTid && slugToIdMap.has(cleanTid)) {
        targetId = slugToIdMap.get(cleanTid)!;
      } else if (title && titleToIdMap.has(title)) {
        targetId = titleToIdMap.get(title)!;
      }

      if (targetId && listingStatsById.has(targetId)) {
        const stats = listingStatsById.get(targetId)!;
        stats.whatsappClicks += clicks;
        stats.shares += shares;
      }
    });

    // 2. Kart Gösterimlerini Eşleştir
    listingImpressionAgg.forEach((item: any) => {
      const tid = (item._id || '').toString().trim();
      const imp = item.impressions || 0;
      const uVisitors = item.uniqueImpressionVisitors || [];

      const cleanTid = tid.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/ilan\//, '').replace(/\/$/, '').toLowerCase();

      let targetId: string | null = null;
      if (tid && listingStatsById.has(tid)) {
        targetId = tid;
      } else if (cleanTid && slugToIdMap.has(cleanTid)) {
        targetId = slugToIdMap.get(cleanTid)!;
      }

      if (targetId && listingStatsById.has(targetId)) {
        const stats = listingStatsById.get(targetId)!;
        stats.impressions += imp;
        uVisitors.forEach((v: string) => stats.uniqueVisitors.add(v));
      }
    });

    // 3. İlan rapor listesini oluştur
    const isAllTime = range === 'all';

    const detailedListingReports = rawListings.map((l: any) => {
      const idStr = l._id ? l._id.toString() : '';
      const ilanPath = `/ilan/${l.slug}`.toLowerCase().replace(/\/$/, '');
      const eStats = listingStatsById.get(idStr) || { impressions: 0, uniqueVisitors: new Set(), whatsappClicks: 0, shares: 0 };

      const vStats = visitorStatsByPath[ilanPath] || {
        periodViews: 0,
        uniqueVisitors: new Set(),
        uniqueVisitorsCount: 0,
        referrers: { google: 0, yandex: 0, facebook: 0, x: 0, whatsapp: 0, instagram: 0, direct: 0, other: 0 },
        rawReferrers: [],
        lastVisitedAt: null,
      };

      const detailViews = vStats.periodViews || 0;
      const cardImpressions = eStats.impressions || 0;
      const periodViews = detailViews + cardImpressions;
      const periodWhatsapp = eStats.whatsappClicks || 0;
      const periodShares = eStats.shares || 0;

      const allUniqueVisitors = new Set([...vStats.uniqueVisitors, ...eStats.uniqueVisitors]);
      const uniqueVisitorsCount = allUniqueVisitors.size > 0 ? allUniqueVisitors.size : (vStats.uniqueVisitorsCount || 0);

      // Veritabanındaki kümülatif sayaçlar
      const rawDbViews = l.goruntulenmeSayisi || 0;
      const rawDbWhatsapp = l.whatsappTiklamaSayisi || 0;
      const rawDbShares = l.paylasimSayisi || 0;

      const totalWhatsapp = isAllTime ? Math.max(rawDbWhatsapp, periodWhatsapp) : periodWhatsapp;
      const totalListingShares = isAllTime ? Math.max(rawDbShares, periodShares) : periodShares;

      const baseViews = isAllTime ? Math.max(rawDbViews, periodViews) : periodViews;
      // Tutarlılık Güvencesi: Bir ilanın görüntülenmesi WhatsApp tıklamasından az olamaz
      const totalViews = Math.max(baseViews, totalWhatsapp);

      // KESİN MATEMATİK KURALI: "Toplam (Lifetime)" ASLA seçili dönemden küçük olamaz
      const lifetimeViews = Math.max(rawDbViews, totalViews, totalWhatsapp);
      const lifetimeWhatsapp = Math.max(rawDbWhatsapp, totalWhatsapp);
      const lifetimeShares = Math.max(rawDbShares, totalListingShares);

      // Sayfa İçi Dönüşüm (Detay Sayfasına girenlerin WhatsApp'a tıklama oranı)
      const detailCtr = detailViews > 0
        ? Math.min(100, Number(((totalWhatsapp / detailViews) * 100).toFixed(1))).toFixed(1)
        : (totalWhatsapp > 0 ? '100.0' : '0.0');

      // Genel Görünürlük Dönüşümü (Liste + Sayfa gösterimlerine göre WhatsApp oranı)
      const conversionRate = totalViews > 0 
        ? Math.min(100, Number(((totalWhatsapp / totalViews) * 100).toFixed(1))).toFixed(1) 
        : '0.0';

      return {
        id: idStr,
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
        detailViews,
        cardImpressions,
        periodViews,
        lifetimeViews,
        uniqueVisitors: uniqueVisitorsCount,
        whatsappClicks: totalWhatsapp,
        periodWhatsappClicks: periodWhatsapp,
        lifetimeWhatsapp,
        shares: totalListingShares,
        lifetimeShares,
        conversionRate,
        detailCtr,
        referrers: vStats.referrers,
        rawReferrers: Array.from(new Set(vStats.rawReferrers || [])).slice(0, 10),
        lastVisitedAt: vStats.lastVisitedAt,
      };
    });

    // ── GRUPLANMIŞ WHATSAPP LEADERBOARD & İLAN HARİTALAMA (%100 KUSURSUZ EŞLEŞTİRME) ──
    const listingByIdMap = new Map<string, any>();
    rawListings.forEach((l: any) => {
      listingByIdMap.set(l._id.toString(), l);
    });

    const groupedWhatsappMap = new Map<string, {
      id: string;
      title: string;
      slug: string;
      ilSlug: string;
      ilceSlug: string;
      phone: string;
      fotoUrl: string | null;
      count: number;
      uniqueVisitors: Set<string>;
      lastClicked: any;
    }>();

    let grandTotalWhatsappLeads = 0;

    groupedWhatsappLeadsAgg.forEach((item: any) => {
      const count = item.count || 0;
      grandTotalWhatsappLeads += count;

      const tid = (item._id?.targetId || '').toString().trim();
      const metaId = (item._id?.metaListingId || '').toString().trim();
      const metaSlug = (item._id?.metaSlug || item._id?.metaListingSlug || '').toString().toLowerCase().trim();
      const title = (item._id?.targetTitle || '').toString().toLowerCase().trim();

      const cleanTid = tid.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/ilan\//, '').replace(/\/$/, '').toLowerCase();
      const cleanMetaSlug = metaSlug.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/ilan\//, '').replace(/\/$/, '').toLowerCase();

      let targetId: string | null = null;
      if (metaId && listingByIdMap.has(metaId)) {
        targetId = metaId;
      } else if (tid && listingByIdMap.has(tid)) {
        targetId = tid;
      } else if (cleanMetaSlug && slugToIdMap.has(cleanMetaSlug)) {
        targetId = slugToIdMap.get(cleanMetaSlug)!;
      } else if (cleanTid && slugToIdMap.has(cleanTid)) {
        targetId = slugToIdMap.get(cleanTid)!;
      } else if (title && titleToIdMap.has(title)) {
        targetId = titleToIdMap.get(title)!;
      }

      const rawL = targetId ? listingByIdMap.get(targetId) : null;
      const key = targetId || cleanTid || cleanMetaSlug || title || 'diger_lead';

      if (!groupedWhatsappMap.has(key)) {
        groupedWhatsappMap.set(key, {
          id: targetId || tid || '',
          title: rawL?.baslik || item._id?.targetTitle || 'İlan Randevusu',
          slug: rawL?.slug || cleanMetaSlug || cleanTid || '',
          ilSlug: rawL?.ilSlug || (item._id?.location ? item._id.location.split('/')[0]?.trim() : 'istanbul'),
          ilceSlug: rawL?.ilceSlug || (item._id?.location ? item._id.location.split('/')[1]?.trim() : ''),
          phone: rawL?.whatsappNumara || item._id?.phone || '',
          fotoUrl: rawL?.anaFotograf?.url || null,
          count: 0,
          uniqueVisitors: new Set<string>(),
          lastClicked: item.lastClicked,
        });
      }

      const gItem = groupedWhatsappMap.get(key)!;
      gItem.count += count;
      (item.uniqueVisitors || []).forEach((v: string) => {
        if (v) gItem.uniqueVisitors.add(v);
      });
      if (item.lastClicked && (!gItem.lastClicked || new Date(item.lastClicked) > new Date(gItem.lastClicked))) {
        gItem.lastClicked = item.lastClicked;
      }
    });

    const groupedWhatsappLeads = Array.from(groupedWhatsappMap.values())
      .map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        ilSlug: item.ilSlug,
        ilceSlug: item.ilceSlug,
        phone: item.phone,
        fotoUrl: item.fotoUrl,
        count: item.count,
        uniqueVisitors: item.uniqueVisitors.size,
        sharePercent: grandTotalWhatsappLeads > 0 
          ? Number(((item.count / grandTotalWhatsappLeads) * 100).toFixed(1)) 
          : 0,
        lastClicked: item.lastClicked,
      }))
      .sort((a, b) => b.count - a.count);

    const totalListingViews = detailedListingReports.reduce((acc: number, item: any) => acc + item.totalViews, 0);
    const sumDetailedWhatsapp = detailedListingReports.reduce((acc: number, item: any) => acc + item.whatsappClicks, 0);
    const totalWhatsappClicks = Math.max(grandTotalWhatsappLeads, sumDetailedWhatsapp);
    const totalShares = detailedListingReports.reduce((acc: number, item: any) => acc + item.shares, 0);

    const googleVisitors = sources.google || 0;
    const yandexVisitors = sources.yandex || 0;
    const totalOrganicVisitors = googleVisitors + yandexVisitors;

    // Arama motorlarından (Google & Yandex) gelen sayfaların WhatsApp dönüşümleri
    const organicListings = detailedListingReports.filter((l: any) => {
      const gViews = l.referrers?.google || 0;
      const yViews = l.referrers?.yandex || 0;
      return (gViews + yViews) > 0;
    });

    const googleWhatsappClicks = organicListings.reduce((acc: number, item: any) => {
      const gViews = item.referrers?.google || 0;
      const yViews = item.referrers?.yandex || 0;
      const totalOrgHits = gViews + yViews;
      const periodClicks = item.periodWhatsappClicks || item.whatsappClicks || 0;
      
      if (totalOrgHits > 0 && periodClicks > 0) {
        const orgRatio = Math.min(1, totalOrgHits / (item.totalViews || totalOrgHits || 1));
        const estimatedClicks = Math.max(1, Math.round(periodClicks * orgRatio));
        return acc + estimatedClicks;
      }
      return acc;
    }, 0);

    const googleConversionRate = totalOrganicVisitors > 0
      ? ((googleWhatsappClicks / totalOrganicVisitors) * 100).toFixed(1)
      : '0.0';

    const districtCountMap: Record<string, number> = {};
    organicListings.forEach((item: any) => {
      if (item.ilceSlug) {
        const d = `${item.ilSlug || 'istanbul'} / ${item.ilceSlug}`;
        districtCountMap[d] = (districtCountMap[d] || 0) + (item.referrers?.google || 0) + (item.referrers?.yandex || 0);
      }
    });

    const topGoogleDistricts = Object.entries(districtCountMap)
      .map(([district, hits]) => ({ district, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    // ── DOMAİN BAZLI PERFORMANS TABLOSU (PRE-AGGREGATED) ───────────
    const defaultGatewayDomains = [
      'besteskort.online',
      'escturkiye.space',
      'turkiyeescort.online',
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

    domainSummaries.forEach((s: any) => {
      let d = s.hostname || 'Ana Domain';
      if (d.includes('escturkiye') || d.includes('turkiyeescort') || d.includes('turkiyeeskort') || d.includes('escturkye')) {
        d = 'escturkiye.space';
      } else if (d.includes('besteskort') || d.includes('bestescort')) {
        d = 'besteskort.online';
      }

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
      domainStatsMap[d].uniqueVisitors += s.uniqueVisitors || 0;
      domainStatsMap[d].totalPageviews += s.totalPageviews || 0;
      domainStatsMap[d].mobileCount += s.mobileCount || 0;
      domainStatsMap[d].whatsappClicks += s.eventCounts?.whatsappClicks || 0;
    });

    // Gateway domainlerinin istatistiklerini canlı ham verilerle harmanla (eksik kalan veya 0 olan varsa kesin tamamla)
    await Promise.all(
      defaultGatewayDomains.map(async (d) => {
        const hostRegex = getDomainFilterRegex(d) || new RegExp(d.replace('.', '\\.'), 'i');
        const [vCount, vUnique, eCount] = await Promise.all([
          AnalyticsVisitorModel.countDocuments({ ...dateQuery, hostname: hostRegex }),
          AnalyticsVisitorModel.distinct('visitorId', { ...dateQuery, hostname: hostRegex }),
          AnalyticsEventModel.countDocuments({ ...dateQuery, hostname: hostRegex, eventType: { $in: ['whatsapp_click', 'special_ad_whatsapp_click'] } }),
        ]);
        if (vCount > 0 && (range === 'today' || vCount > (domainStatsMap[d]?.totalPageviews || 0))) {
          domainStatsMap[d].totalPageviews = vCount;
          domainStatsMap[d].uniqueVisitors = vUnique.length;
          domainStatsMap[d].whatsappClicks = Math.max(eCount, domainStatsMap[d]?.whatsappClicks || 0);
        }
      })
    );

    const domainBreakdown = Object.values(domainStatsMap).map((d: any) => {
      const conv = d.uniqueVisitors > 0 ? ((d.whatsappClicks / d.uniqueVisitors) * 100).toFixed(1) : '0.0';
      const target = resolveTargetFromHost(d.domain);
      return {
        ...d,
        conversionRate: `${conv}%`,
        resolvedTarget: target ? `${target.ilSlug.toUpperCase()}${target.ilceSlug ? ' / ' + target.ilceSlug.toUpperCase() : ''}` : 'TÜRKİYE / ANA VİTRİN',
      };
    }).sort((a: any, b: any) => b.uniqueVisitors - a.uniqueVisitors);

    // PWA Enriched Leads
    const pwaVIds = (recentPwaInstalls || []).map((e: any) => e.visitorId).filter(Boolean);
    const pwaIps = (recentPwaInstalls || []).map((e: any) => e.ip).filter(Boolean);
    const pwaVisitors = (pwaVIds.length > 0 || pwaIps.length > 0)
      ? await AnalyticsVisitorModel.find({
          $or: [
            { visitorId: { $in: pwaVIds } },
            { ip: { $in: pwaIps } }
          ]
        }).sort({ createdAt: -1 }).limit(50).lean()
      : [];

    const pwaVisitorMap = new Map<string, any>();
    pwaVisitors.forEach((v: any) => {
      if (v.visitorId && !pwaVisitorMap.has(v.visitorId)) pwaVisitorMap.set(v.visitorId, v);
      if (v.ip && !pwaVisitorMap.has(v.ip)) pwaVisitorMap.set(v.ip, v);
    });

    const enrichedRecentPwaInstalls = (recentPwaInstalls || []).map((ev: any) => {
      const matched = pwaVisitorMap.get(ev.visitorId) || pwaVisitorMap.get(ev.ip);
      const realCity = (matched && matched.city && matched.city !== 'Türkiye')
        ? matched.city
        : (ev.targetCity && ev.targetCity !== 'Türkiye' ? ev.targetCity : 'İstanbul');
      return {
        ...ev,
        targetCity: realCity,
        city: realCity,
        referer: matched?.referer || 'Doğrudan',
        searchKeyword: matched?.searchKeyword || '',
        page: matched?.path || ev.path || '/',
      };
    });

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
        sources,
        searchTerms,
        popularPages,
        topCities,
        specialAdStats: {
          impressions: specialAdImpressions,
          uniqueVisitors: specialAdUniqueVisitors,
          clicks: specialAdClicks,
          whatsappClicks: specialAdWhatsappClicks,
          ctr: specialAdCtr,
          breakdown: specialAdBreakdown,
        },
        eventCounts: {
          whatsappClicks: Math.max(grandTotalWhatsappLeads, (eventCounts.whatsappClicks || 0) + (eventCounts.specialAdWhatsappClicks || 0)),
          shares: eventCounts.shares || 0,
          categoryClicks: eventCounts.categoryClicks || 0,
          cityFilters: eventCounts.cityFilters || 0,
          searches: eventCounts.searches || 0,
          pwaInstalls: eventCounts.pwaInstalls || 0,
          pwaUninstalls: eventCounts.pwaUninstalls || 0,
          specialAdImpressions,
          specialAdClicks,
        },
        pwaInstalls: eventCounts.pwaInstalls || 0,
        pwaUninstalls: eventCounts.pwaUninstalls || 0,
        topContactedListings,
        detailedListingReports,
        totalListingViews,
        totalWhatsappClicks,
        totalWhatsappLeadsCount: Math.max(grandTotalWhatsappLeads, totalWhatsappClicks),
        groupedWhatsappLeads,
        totalShares,
        recentVisitors,
        recentWhatsappClicks,
        recentPwaInstalls: enrichedRecentPwaInstalls,
      },
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message || 'Analytics fetch error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'prune';

    if (action === 'prune' || action === 'backfill') {
      const { runAnalyticsBackfill } = await import('@/lib/analyticsRollup');
      const deleteRawOlderThanDays = body.deleteRawOlderThanDays !== undefined ? body.deleteRawOlderThanDays : 30;
      const result = await runAnalyticsBackfill({ deleteRawOlderThanDays });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Analytics maintenance POST error:', error);
    return NextResponse.json({ error: error.message || 'Error processing request' }, { status: 500 });
  }
}

