import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';

export const dynamic = 'force-dynamic';

interface CacheEntry {
  count: number;
  expires: number;
}
const unreadCache = new Map<string, CacheEntry>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return NextResponse.json({ success: true, unreadCount: 0 });
    }

    const now = Date.now();
    const cached = unreadCache.get(visitorId);
    if (cached && cached.expires > now) {
      return NextResponse.json(
        { success: true, unreadCount: cached.count },
        { headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=30' } }
      );
    }

    await connectToDatabase();

    const unreadCount = await SiteNotificationModel.countDocuments({
      isActive: true,
      readBy: { $ne: visitorId },
    }).maxTimeMS(2000);

    // Keep cache clean (max 500 visitors)
    if (unreadCache.size > 500) {
      unreadCache.clear();
    }
    unreadCache.set(visitorId, { count: unreadCount, expires: now + 15000 });

    return NextResponse.json(
      { success: true, unreadCount },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, unreadCount: 0 });
  }
}
