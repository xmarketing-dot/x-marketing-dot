import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');

    if (!visitorId) {
      return NextResponse.json({ success: true, unreadCount: 0 });
    }

    await connectToDatabase();

    const unreadCount = await SiteNotificationModel.countDocuments({
      isActive: true,
      readBy: { $ne: visitorId },
    });

    return NextResponse.json(
      { success: true, unreadCount },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, unreadCount: 0 });
  }
}
