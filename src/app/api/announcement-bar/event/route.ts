import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnnouncementBarModel from '@/models/AnnouncementBar';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const { eventType, campaignId, visitorId, city, device } = body;

    if (!eventType || !['view', 'click', 'dismiss'].includes(eventType)) {
      return NextResponse.json({ success: false, message: 'Geçersiz etkinlik türü' }, { status: 400 });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anon';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const identifier = visitorId || ip;

    const updateOps: any = {
      $push: {
        recentLogs: {
          $each: [
            {
              visitorId: visitorId || undefined,
              ip,
              eventType,
              city: city || 'Bilinmiyor',
              device: device || 'mobile',
              userAgent,
              createdAt: new Date(),
            },
          ],
          $slice: -250, // Keep last 250 logs
        },
      },
    };

    if (eventType === 'view') {
      updateOps.$inc = { viewsCount: 1 };
      if (identifier) {
        updateOps.$addToSet = { uniqueViewers: identifier };
      }
    } else if (eventType === 'click') {
      updateOps.$inc = { clicksCount: 1 };
      if (identifier) {
        updateOps.$addToSet = { uniqueClickers: identifier };
      }
    } else if (eventType === 'dismiss') {
      updateOps.$inc = { dismissCount: 1 };
    }

    await AnnouncementBarModel.findOneAndUpdate(
      {},
      updateOps,
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
