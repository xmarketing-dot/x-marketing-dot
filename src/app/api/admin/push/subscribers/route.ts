import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PushSubscriptionModel from '@/models/PushSubscription';
import PushCampaignModel from '@/models/PushCampaign';
import AnalyticsEventModel from '@/models/AnalyticsEvent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const [subscribers, totalActive, totalInactive, platformCounts, campaigns, pwaInstalls, pwaUninstalls, recentPwaEvents] = await Promise.all([
      PushSubscriptionModel.find().sort({ createdAt: -1 }),
      PushSubscriptionModel.countDocuments({ active: true }),
      PushSubscriptionModel.countDocuments({ active: false }),
      PushSubscriptionModel.aggregate([
        { $match: { active: true } },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]),
      PushCampaignModel.find().sort({ createdAt: -1 }).limit(50),
      AnalyticsEventModel.countDocuments({ eventType: 'pwa_install' }),
      AnalyticsEventModel.countDocuments({ eventType: 'pwa_uninstall' }),
      AnalyticsEventModel.find({ eventType: { $in: ['pwa_install', 'pwa_uninstall'] } }).sort({ createdAt: -1 })
    ]);

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
      subscribers,
      campaigns,
      pwaEvents: recentPwaEvents,
    });
  } catch (err: any) {
    console.error('[Admin Push Subscribers GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Veriler alınamadı.' }, { status: 500 });
  }
}
