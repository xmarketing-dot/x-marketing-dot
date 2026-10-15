import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PushSubscriptionModel from '@/models/PushSubscription';
import PushCampaignModel from '@/models/PushCampaign';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const [subscribers, totalActive, totalInactive, platformCounts, campaigns, pwaInstalls, pwaUninstalls, recentPwaEvents] = await Promise.all([
      PushSubscriptionModel.find().sort({ createdAt: -1 }).lean(),
      PushSubscriptionModel.countDocuments({ active: true }),
      PushSubscriptionModel.countDocuments({ active: false }),
      PushSubscriptionModel.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]),
      PushCampaignModel.find().sort({ createdAt: -1 }).limit(50).lean(),
      AnalyticsEventModel.countDocuments({ eventType: 'pwa_install' }),
      AnalyticsEventModel.countDocuments({ eventType: 'pwa_uninstall' }),
      AnalyticsEventModel.find({ eventType: { $in: ['pwa_install', 'pwa_uninstall'] } }).sort({ createdAt: -1 }).lean()
    ]);

    // 1. Ziyaretçi İstihbaratı ile Şehirleri & Kaynakları Eşleştir (Konya, İstanbul, İzmir vs.)
    const vIds = recentPwaEvents.map((e: any) => e.visitorId).concat(subscribers.map((s: any) => s.visitorId)).filter(Boolean);
    const ips = recentPwaEvents.map((e: any) => e.ip).concat(subscribers.map((s: any) => s.ip)).filter(Boolean);

    const visitors = await AnalyticsVisitorModel.find({
      $or: [
        { visitorId: { $in: vIds } },
        { ip: { $in: ips } }
      ]
    }).sort({ createdAt: -1 }).lean();

    const visitorMap = new Map<string, any>();
    visitors.forEach((v: any) => {
      if (v.visitorId && !visitorMap.has(v.visitorId)) visitorMap.set(v.visitorId, v);
      if (v.ip && !visitorMap.has(v.ip)) visitorMap.set(v.ip, v);
    });

    const enrichedPwaEvents = recentPwaEvents.map((ev: any) => {
      const matched = visitorMap.get(ev.visitorId) || visitorMap.get(ev.ip);
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

    const enrichedSubscribers = subscribers.map((sub: any) => {
      const matched = visitorMap.get(sub.visitorId) || visitorMap.get(sub.ip);
      const realCity = (matched && matched.city && matched.city !== 'Türkiye')
        ? matched.city
        : (sub.city && sub.city !== 'Türkiye' ? sub.city : 'İstanbul');

      return {
        ...sub,
        city: realCity,
        targetCity: realCity,
      };
    });

    const platformMap: Record<string, number> = { android: 0, ios: 0, desktop: 0 };
    platformCounts.forEach((p: any) => {
      if (p._id && platformMap[p._id] !== undefined) {
        platformMap[p._id] = p.count;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: totalActive,
        inactiveSubscribers: totalInactive,
        androidSubscribers: platformMap.android,
        iosSubscribers: platformMap.ios,
        desktopSubscribers: platformMap.desktop,
        pwaInstalls,
        pwaUninstalls,
        netActivePwa: Math.max(0, pwaInstalls - pwaUninstalls),
      },
      subscribers: enrichedSubscribers,
      campaigns,
      pwaEvents: enrichedPwaEvents,
    });
  } catch (err: any) {
    console.error('[Admin Push Subscribers GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Veriler alınamadı.' }, { status: 500 });
  }
}
