import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for all-time deep aggregations

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'all';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const botFilter = url.searchParams.get('botFilter') || 'all'; // all, human, bot

    const now = new Date();
    const turkeyOffsetMs = 3 * 60 * 60 * 1000;
    const nowTurkey = new Date(now.getTime() + turkeyOffsetMs);
    const startOfTodayTurkey = new Date(
      Date.UTC(nowTurkey.getUTCFullYear(), nowTurkey.getUTCMonth(), nowTurkey.getUTCDate()) - turkeyOffsetMs
    );

    let dateQuery: any = {};

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
    } else if (range === 'custom' && startDateParam) {
      const start = new Date(startDateParam);
      let end = endDateParam ? new Date(endDateParam) : new Date();
      // Make end date cover the full end day (23:59:59.999)
      end.setHours(23, 59, 59, 999);
      dateQuery = { createdAt: { $gte: start, $lte: end } };
    } else {
      // 'all' -> no date filter
      dateQuery = {};
    }

    // Parallel fetch
    const [visitors, events, listings] = await Promise.all([
      AnalyticsVisitorModel.find(dateQuery, {
        visitorId: 1,
        sessionId: 1,
        ip: 1,
        city: 1,
        device: 1,
        os: 1,
        browser: 1,
        path: 1,
        referer: 1,
        refererSource: 1,
        searchKeyword: 1,
        duration: 1,
        userAgent: 1,
        createdAt: 1,
      }).lean(),
      AnalyticsEventModel.find(dateQuery, {
        eventType: 1,
        visitorId: 1,
        sessionId: 1,
        listingId: 1,
        city: 1,
        district: 1,
        meta: 1,
        createdAt: 1,
      }).lean(),
      ListingModel.find({}, {
        _id: 1,
        baslik: 1,
        slug: 1,
        ilSlug: 1,
        ilceSlug: 1,
        kategori: 1,
        goruntulenmeSayisi: 1,
        whatsappTiklamaSayisi: 1,
        telefonTiklamaSayisi: 1,
      }).lean(),
    ]);

    const listingMap = new Map();
    listings.forEach((l: any) => {
      listingMap.set(String(l._id), l);
    });

    // Bot detection helper
    function detectBot(v: any) {
      const ua = (v.userAgent || '').toLowerCase();
      const ip = v.ip || '';
      const path = (v.path || '').toLowerCase();

      const isSearchEngine =
        ua.includes('googlebot') ||
        ua.includes('yandex') ||
        ua.includes('bingbot') ||
        ua.includes('applebot') ||
        ua.includes('duckduckbot') ||
        ua.includes('whatsapp') ||
        ua.includes('telegrambot') ||
        ua.includes('facebookexternalhit');

      if (isSearchEngine) {
        return { isBot: true, type: 'search_engine', label: 'Arama Motoru (Google/Yandex/Bing)' };
      }

      const isAutomation =
        ua.includes('headless') ||
        ua.includes('puppeteer') ||
        ua.includes('playwright') ||
        ua.includes('python') ||
        ua.includes('scrapy') ||
        ua.includes('curl') ||
        ua.includes('postman') ||
        ua.includes('semrush') ||
        ua.includes('ahrefs') ||
        ua.includes('dotbot') ||
        ua.includes('bytespider');

      if (isAutomation) {
        return { isBot: true, type: 'automation_scraper', label: 'Otomasyon / Scraper Botu' };
      }

      const isAttack =
        path.includes('.env') ||
        path.includes('wp-admin') ||
        path.includes('phpmyadmin') ||
        path.includes('eval') ||
        path.includes('cmd=') ||
        path.includes('<script');

      if (isAttack) {
        return { isBot: true, type: 'scanner_attack', label: 'Zafiyet Tarayıcı / Saldırı Botu' };
      }

      const isDatacenter =
        ip.startsWith('95.108.') ||
        ip.startsWith('5.255.') ||
        ip.startsWith('213.180.') ||
        ip.startsWith('87.250.') ||
        ip.startsWith('54.183.') ||
        ip.startsWith('13.57.') ||
        ip.startsWith('193.108.') ||
        ip.startsWith('57.141.');

      if (isDatacenter) {
        return { isBot: true, type: 'datacenter_bot', label: 'Veri Merkezi / Sunucu IP Botu' };
      }

      return { isBot: false, type: 'human', label: 'Gerçek Kullanıcı' };
    }

    const allVisitorIds = new Set();
    const allSessions = new Set();
    const humanVisitorIds = new Set();
    const humanSessions = new Set();

    const humanVisitors: any[] = [];
    const botVisitors: any[] = [];
    const botTypeCounts: Record<string, number> = {
      search_engine: 0,
      automation_scraper: 0,
      scanner_attack: 0,
      datacenter_bot: 0,
    };

    const userMap = new Map();
    const humanSources: Record<string, number> = {};
    const humanDevices: Record<string, number> = { mobile: 0, desktop: 0 };
    const humanCities: Record<string, number> = {};
    const topHumanPaths: Record<string, number> = {};
    const humanKeywords: Record<string, number> = {};

    visitors.forEach((v: any) => {
      const vId = v.visitorId || v.ip || 'anon';
      const sId = v.sessionId || vId;

      allVisitorIds.add(vId);
      allSessions.add(sId);

      const botCheck = detectBot(v);

      if (botCheck.isBot) {
        botVisitors.push(v);
        botTypeCounts[botCheck.type] = (botTypeCounts[botCheck.type] || 0) + 1;
      } else {
        humanVisitors.push(v);
        humanVisitorIds.add(vId);
        humanSessions.add(sId);

        // Sources
        const src = (v.refererSource || 'direct').toLowerCase();
        humanSources[src] = (humanSources[src] || 0) + 1;

        // Devices
        const dev = (v.device || 'mobile').toLowerCase();
        if (dev.includes('desk') || dev.includes('mac') || dev.includes('win')) {
          humanDevices.desktop++;
        } else {
          humanDevices.mobile++;
        }

        // Cities
        const city = v.city || 'Belirsiz';
        humanCities[city] = (humanCities[city] || 0) + 1;

        // Paths
        const path = v.path || '/';
        topHumanPaths[path] = (topHumanPaths[path] || 0) + 1;

        // Keywords
        if (v.searchKeyword && v.searchKeyword.trim()) {
          const kw = v.searchKeyword.trim().toLowerCase();
          humanKeywords[kw] = (humanKeywords[kw] || 0) + 1;
        }

        // User Loyalty Tracking
        if (!userMap.has(vId)) {
          userMap.set(vId, {
            visitorId: vId,
            ip: v.ip,
            city: v.city || 'Belirsiz',
            device: v.device || 'mobile',
            os: v.os || 'Unknown',
            browser: v.browser || 'Unknown',
            pageviews: 0,
            sessions: new Set(),
            visitedPaths: new Set(),
            totalDuration: 0,
            firstSeen: v.createdAt,
            lastSeen: v.createdAt,
            keywords: new Set(),
          });
        }

        const u = userMap.get(vId);
        u.pageviews++;
        u.sessions.add(sId);
        u.visitedPaths.add(path);
        u.totalDuration += v.duration || 0;
        if (new Date(v.createdAt) < new Date(u.firstSeen)) u.firstSeen = v.createdAt;
        if (new Date(v.createdAt) > new Date(u.lastSeen)) u.lastSeen = v.createdAt;
        if (v.searchKeyword) u.keywords.add(v.searchKeyword);
      }
    });

    // Loyalty Buckets
    let singleVisitCount = 0;
    let repeat2to3 = 0;
    let repeat4to10 = 0;
    let repeat11to50 = 0;
    let superLoyal50Plus = 0;
    let multiSessionCount = 0;
    let singleSessionCount = 0;

    const allLoyalUsers = Array.from(userMap.values());
    allLoyalUsers.forEach((u) => {
      if (u.pageviews === 1) singleVisitCount++;
      else if (u.pageviews <= 3) repeat2to3++;
      else if (u.pageviews <= 10) repeat4to10++;
      else if (u.pageviews <= 50) repeat11to50++;
      else superLoyal50Plus++;

      if (u.sessions.size > 1) multiSessionCount++;
      else singleSessionCount++;
    });

    // Top 30 Most Active Repeat Visitors
    const topActiveUsers = [...allLoyalUsers]
      .sort((a, b) => b.pageviews - a.pageviews || b.sessions.size - a.sessions.size)
      .slice(0, 30)
      .map((u) => ({
        visitorId: String(u.visitorId || 'anon'),
        ip: u.ip,
        city: u.city,
        device: u.device,
        os: u.os,
        browser: u.browser,
        pageviews: u.pageviews,
        sessionsCount: u.sessions.size,
        distinctPathsCount: u.visitedPaths.size,
        totalDurationSeconds: u.totalDuration,
        totalDurationMinutes: Math.round(u.totalDuration / 60),
        firstSeen: u.firstSeen,
        lastSeen: u.lastSeen,
        keywords: Array.from(u.keywords),
      }));

    // Events breakdown
    const eventTypeCounts: Record<string, number> = {};
    const whatsappListings: Record<string, number> = {};
    const whatsappCities: Record<string, number> = {};
    let totalWhatsappClicks = 0;

    events.forEach((ev: any) => {
      const type = ev.eventType || 'other';
      eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;

      if (type === 'whatsapp_click' || type === 'special_ad_whatsapp_click') {
        totalWhatsappClicks++;

        let listingTitle = 'Belirtilmemiş İlan';
        if (ev.listingId && listingMap.has(String(ev.listingId))) {
          const l = listingMap.get(String(ev.listingId));
          listingTitle = l.baslik || l.slug || String(ev.listingId);
        } else if (ev.meta?.title) {
          listingTitle = ev.meta.title;
        }

        whatsappListings[listingTitle] = (whatsappListings[listingTitle] || 0) + 1;

        const loc = [ev.city, ev.district].filter(Boolean).join('/') || 'Belirsiz';
        whatsappCities[loc] = (whatsappCities[loc] || 0) + 1;
      }
    });

    const topListingsByViews = [...listings]
      .sort((a: any, b: any) => (b.goruntulenmeSayisi || 0) - (a.goruntulenmeSayisi || 0))
      .slice(0, 15)
      .map((l: any) => ({
        id: String(l._id),
        slug: l.slug,
        title: l.baslik,
        city: l.ilSlug,
        district: l.ilceSlug,
        views: l.goruntulenmeSayisi || 0,
        whatsappClicks: l.whatsappTiklamaSayisi || 0,
        phoneClicks: l.telefonTiklamaSayisi || 0,
        category: l.kategori || 'STANDART',
      }));

    const responsePayload = {
      success: true,
      timeframe: {
        range,
        startDate: startDateParam || null,
        endDate: endDateParam || null,
        calculatedAt: new Date().toISOString(),
      },
      overview: {
        rawTotalPageviews: visitors.length,
        rawUniqueVisitors: allVisitorIds.size,
        rawTotalSessions: allSessions.size,
        rawTotalEvents: events.length,

        humanPageviews: humanVisitors.length,
        humanUniqueVisitors: humanVisitorIds.size,
        humanTotalSessions: humanSessions.size,
        humanPercentOfTotal: Math.round((humanVisitors.length / (visitors.length || 1)) * 100),

        botTotalPageviews: botVisitors.length,
        botPercentOfTotal: Math.round((botVisitors.length / (visitors.length || 1)) * 100),
        botBreakdown: botTypeCounts,
      },
      userLoyalty: {
        totalUniqueHumans: humanVisitorIds.size,
        singleVisitUsers: singleVisitCount,
        repeat2to3Users: repeat2to3,
        repeat4to10Users: repeat4to10,
        repeat11to50Users: repeat11to50,
        superLoyal50PlusUsers: superLoyal50Plus,
        multiSessionUsers: multiSessionCount,
        singleSessionUsers: singleSessionCount,
        repeatRatePercent: Math.round(
          ((humanVisitorIds.size - singleVisitCount) / (humanVisitorIds.size || 1)) * 100
        ),
        multiSessionRatePercent: Math.round((multiSessionCount / (humanVisitorIds.size || 1)) * 100),
        topActiveUsers,
      },
      breakdowns: {
        sources: humanSources,
        devices: humanDevices,
        topCities: Object.entries(humanCities).sort((a, b) => b[1] - a[1]).slice(0, 15),
        topPaths: Object.entries(topHumanPaths).sort((a, b) => b[1] - a[1]).slice(0, 20),
        topKeywords: Object.entries(humanKeywords).sort((a, b) => b[1] - a[1]).slice(0, 15),
        events: eventTypeCounts,
      },
      conversions: {
        totalWhatsappClicks,
        overallConversionRatePercent: (
          (totalWhatsappClicks / (humanVisitors.length || 1)) * 100
        ).toFixed(2),
        topWhatsappListings: Object.entries(whatsappListings).sort((a, b) => b[1] - a[1]).slice(0, 15),
        topWhatsappCities: Object.entries(whatsappCities).sort((a, b) => b[1] - a[1]).slice(0, 15),
      },
      topListingsByViews,
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Deep analytics API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
