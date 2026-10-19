import connectToDatabase from '@/lib/mongodb';
import AnalyticsDailySummaryModel from '@/models/AnalyticsDailySummary';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import AnalyticsEventModel from '@/models/AnalyticsEvent';

/**
 * Returns YYYY-MM-DD in Europe/Istanbul time (UTC+3)
 */
export function getTurkeyDateString(date: Date = new Date()): string {
  const turkeyOffsetMs = 3 * 60 * 60 * 1000;
  const turkeyTime = new Date(date.getTime() + turkeyOffsetMs);
  return turkeyTime.toISOString().slice(0, 10);
}

/**
 * Normalizes host/domain name
 */
export function normalizeHost(host?: string): string {
  if (!host) return 'besteskort.online';
  const clean = host.split(':')[0].toLowerCase().replace(/^www\./, '');
  return clean || 'besteskort.online';
}

/**
 * Normalizes referrer source to one of the standard summary keys
 */
export function normalizeSourceKey(source?: string): string {
  const s = (source || 'direct').toLowerCase();
  if (['google', 'yandex', 'whatsapp', 'telegram', 'direct', 'instagram', 'x', 'facebook'].includes(s)) {
    return s;
  }
  return 'other';
}

/**
 * Atomically increments pageview metrics in daily summary for both the specific domain and 'all'
 */
export async function recordPageviewRollup(data: {
  dateStr?: string;
  hostname?: string;
  isMobile: boolean;
  source: string;
  isUniqueToday: boolean;
  city?: string;
  path?: string;
  pageTitle?: string;
  searchKeyword?: string;
}) {
  try {
    await connectToDatabase();
    const date = data.dateStr || getTurkeyDateString();
    const host = normalizeHost(data.hostname);
    const sourceKey = normalizeSourceKey(data.source);

    const updateFields: any = {
      $inc: {
        totalPageviews: 1,
        mobileCount: data.isMobile ? 1 : 0,
        desktopCount: data.isMobile ? 0 : 1,
        [`sources.${sourceKey}`]: 1,
        ...(data.isUniqueToday ? { uniqueVisitors: 1 } : {}),
      },
    };

    // Update both domain-specific document and overall 'all' document
    const targets = host !== 'all' ? [host, 'all'] : ['all'];

    await Promise.all(
      targets.map((targetHost) =>
        AnalyticsDailySummaryModel.updateOne(
          { date, hostname: targetHost },
          updateFields,
          { upsert: true }
        )
      )
    );
  } catch (err) {
    console.error('recordPageviewRollup error:', err);
  }
}

/**
 * Atomically increments event metrics in daily summary for both specific domain and 'all'
 */
export async function recordEventRollup(data: {
  dateStr?: string;
  hostname?: string;
  eventType: string;
  targetId?: string;
  targetTitle?: string;
  targetCity?: string;
  path?: string;
}) {
  try {
    await connectToDatabase();
    const date = data.dateStr || getTurkeyDateString();
    const host = normalizeHost(data.hostname);
    const evType = data.eventType;

    const eventKeyMap: Record<string, string> = {
      whatsapp_click: 'whatsappClicks',
      special_ad_whatsapp_click: 'whatsappClicks',
      share_listing: 'shares',
      category_click: 'categoryClicks',
      city_filter: 'cityFilters',
      search: 'searches',
      pwa_install: 'pwaInstalls',
      pwa_uninstall: 'pwaUninstalls',
      special_ad_impression: 'specialAdImpressions',
      special_ad_click: 'specialAdClicks',
    };

    const targetKey = eventKeyMap[evType];
    if (!targetKey) return;

    const updateFields: any = {
      $inc: {
        [`eventCounts.${targetKey}`]: 1,
      },
    };

    const targets = host !== 'all' ? [host, 'all'] : ['all'];

    await Promise.all(
      targets.map((targetHost) =>
        AnalyticsDailySummaryModel.updateOne(
          { date, hostname: targetHost },
          updateFields,
          { upsert: true }
        )
      )
    );
  } catch (err) {
    console.error('recordEventRollup error:', err);
  }
}

/**
 * Historical Backfill / Rollup Engine
 * Aggregates all past AnalyticsVisitor and AnalyticsEvent logs into AnalyticsDailySummary
 * and optionally deletes raw logs older than the retention period (e.g. 30 days).
 */
export async function runAnalyticsBackfill(options?: { deleteRawOlderThanDays?: number }) {
  await connectToDatabase();
  const startTime = Date.now();

  // 1. Group past visitors by Turkey day and hostname
  // Turkey timezone is UTC+3 -> "+03:00"
  const visitorAgg = await AnalyticsVisitorModel.aggregate([
    {
      $project: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: '+03:00',
          },
        },
        hostname: {
          $toLower: {
            $ifNull: ['$hostname', 'besteskort.online'],
          },
        },
        visitorId: 1,
        device: 1,
        refererSource: 1,
        isUniqueToday: 1,
      },
    },
    {
      $group: {
        _id: { date: '$date', hostname: '$hostname' },
        totalPageviews: { $sum: 1 },
        uniqueVisitors: {
          $addToSet: '$visitorId',
        },
        mobileCount: {
          $sum: { $cond: [{ $eq: ['$device', 'mobile'] }, 1, 0] },
        },
        desktopCount: {
          $sum: { $cond: [{ $eq: ['$device', 'desktop'] }, 1, 0] },
        },
        google: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'google'] }, 1, 0] },
        },
        yandex: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'yandex'] }, 1, 0] },
        },
        whatsapp: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'whatsapp'] }, 1, 0] },
        },
        telegram: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'telegram'] }, 1, 0] },
        },
        direct: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'direct'] }, 1, 0] },
        },
        instagram: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'instagram'] }, 1, 0] },
        },
        x: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'x'] }, 1, 0] },
        },
        facebook: {
          $sum: { $cond: [{ $eq: ['$refererSource', 'facebook'] }, 1, 0] },
        },
      },
    },
  ]);

  // 2. Group past events by Turkey day and hostname
  const eventAgg = await AnalyticsEventModel.aggregate([
    {
      $project: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
            timezone: '+03:00',
          },
        },
        hostname: {
          $toLower: {
            $ifNull: ['$hostname', 'besteskort.online'],
          },
        },
        eventType: 1,
      },
    },
    {
      $group: {
        _id: { date: '$date', hostname: '$hostname' },
        whatsappClicks: {
          $sum: {
            $cond: [
              { $in: ['$eventType', ['whatsapp_click', 'special_ad_whatsapp_click']] },
              1,
              0,
            ],
          },
        },
        shares: {
          $sum: { $cond: [{ $eq: ['$eventType', 'share_listing'] }, 1, 0] },
        },
        categoryClicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'category_click'] }, 1, 0] },
        },
        cityFilters: {
          $sum: { $cond: [{ $eq: ['$eventType', 'city_filter'] }, 1, 0] },
        },
        searches: {
          $sum: { $cond: [{ $eq: ['$eventType', 'search'] }, 1, 0] },
        },
        pwaInstalls: {
          $sum: { $cond: [{ $eq: ['$eventType', 'pwa_install'] }, 1, 0] },
        },
        pwaUninstalls: {
          $sum: { $cond: [{ $eq: ['$eventType', 'pwa_uninstall'] }, 1, 0] },
        },
        specialAdImpressions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'special_ad_impression'] }, 1, 0] },
        },
        specialAdClicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'special_ad_click'] }, 1, 0] },
        },
      },
    },
  ]);

  // Merge events into a map key: "YYYY-MM-DD::hostname"
  const eventMap = new Map<string, any>();
  for (const item of eventAgg) {
    const key = `${item._id.date}::${normalizeHost(item._id.hostname)}`;
    eventMap.set(key, item);
  }

  // Pre-calculate per-host summaries
  const allMap = new Map<string, any>(); // key: date

  for (const row of visitorAgg) {
    if (!row._id?.date) continue;
    const date = row._id.date;
    const host = normalizeHost(row._id.hostname);
    const key = `${date}::${host}`;
    const evData = eventMap.get(key) || {};

    const uniqueCount = Array.isArray(row.uniqueVisitors) ? row.uniqueVisitors.length : 0;

    const doc = {
      date,
      hostname: host,
      totalPageviews: row.totalPageviews || 0,
      uniqueVisitors: uniqueCount,
      mobileCount: row.mobileCount || 0,
      desktopCount: row.desktopCount || 0,
      sources: {
        google: row.google || 0,
        yandex: row.yandex || 0,
        whatsapp: row.whatsapp || 0,
        telegram: row.telegram || 0,
        direct: row.direct || 0,
        instagram: row.instagram || 0,
        x: row.x || 0,
        facebook: row.facebook || 0,
        other: 0,
      },
      eventCounts: {
        whatsappClicks: evData.whatsappClicks || 0,
        shares: evData.shares || 0,
        categoryClicks: evData.categoryClicks || 0,
        cityFilters: evData.cityFilters || 0,
        searches: evData.searches || 0,
        pwaInstalls: evData.pwaInstalls || 0,
        pwaUninstalls: evData.pwaUninstalls || 0,
        specialAdImpressions: evData.specialAdImpressions || 0,
        specialAdClicks: evData.specialAdClicks || 0,
        specialAdWhatsappClicks: 0,
      },
    };

    await AnalyticsDailySummaryModel.updateOne(
      { date, hostname: host },
      { $set: doc },
      { upsert: true }
    );

    // Accumulate for 'all' hostname
    if (!allMap.has(date)) {
      allMap.set(date, {
        date,
        hostname: 'all',
        totalPageviews: 0,
        uniqueVisitors: new Set(),
        mobileCount: 0,
        desktopCount: 0,
        sources: { google: 0, yandex: 0, whatsapp: 0, telegram: 0, direct: 0, instagram: 0, x: 0, facebook: 0, other: 0 },
        eventCounts: {
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
        },
      });
    }

    const cur = allMap.get(date);
    cur.totalPageviews += doc.totalPageviews;
    cur.mobileCount += doc.mobileCount;
    cur.desktopCount += doc.desktopCount;
    (row.uniqueVisitors || []).forEach((id: string) => cur.uniqueVisitors.add(id));
    for (const [sKey, val] of Object.entries(doc.sources)) {
      cur.sources[sKey] = (cur.sources[sKey] || 0) + (val as number);
    }
    for (const [eKey, val] of Object.entries(doc.eventCounts)) {
      cur.eventCounts[eKey] = (cur.eventCounts[eKey] || 0) + (val as number);
    }
  }

  // Save the 'all' summaries
  for (const [date, item] of allMap.entries()) {
    const doc = {
      date,
      hostname: 'all',
      totalPageviews: item.totalPageviews,
      uniqueVisitors: item.uniqueVisitors.size,
      mobileCount: item.mobileCount,
      desktopCount: item.desktopCount,
      sources: item.sources,
      eventCounts: item.eventCounts,
    };
    await AnalyticsDailySummaryModel.updateOne(
      { date, hostname: 'all' },
      { $set: doc },
      { upsert: true }
    );
  }

  let deletedVisitorsCount = 0;
  let deletedEventsCount = 0;

  // 3. Optional: Delete raw logs older than retention period (e.g. 30 days)
  if (options?.deleteRawOlderThanDays && options.deleteRawOlderThanDays > 0) {
    const cutoffDate = new Date(Date.now() - options.deleteRawOlderThanDays * 24 * 60 * 60 * 1000);
    const vRes = await AnalyticsVisitorModel.deleteMany({ createdAt: { $lt: cutoffDate } });
    const eRes = await AnalyticsEventModel.deleteMany({ createdAt: { $lt: cutoffDate } });
    deletedVisitorsCount = vRes.deletedCount || 0;
    deletedEventsCount = eRes.deletedCount || 0;
  }

  return {
    success: true,
    durationMs: Date.now() - startTime,
    processedDays: allMap.size,
    deletedRawOlderThanDays: options?.deleteRawOlderThanDays || 0,
    deletedVisitorsCount,
    deletedEventsCount,
  };
}
