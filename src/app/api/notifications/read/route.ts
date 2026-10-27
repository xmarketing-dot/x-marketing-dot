import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';
import { markVisitorUnreadZero } from '../unread-count/route';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, markAll, visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId zorunludur' }, { status: 400 });
    }

    markVisitorUnreadZero(visitorId);
    await connectToDatabase();

    if (markAll) {
      // Tüm aktif bildirimleri okundu yap
      const unreadList = await SiteNotificationModel.find({
        isActive: true,
        readBy: { $ne: visitorId },
      });

      for (const item of unreadList) {
        if (!item.readBy.includes(visitorId)) {
          item.readBy.push(visitorId);
          item.readCount = (item.readCount || 0) + 1;
          await item.save();
        }
      }

      return NextResponse.json({ success: true, unreadCount: 0 });
    }

    if (notificationId) {
      const item = await SiteNotificationModel.findById(notificationId);
      if (item && !item.readBy.includes(visitorId)) {
        item.readBy.push(visitorId);
        item.readCount = item.readBy.length;
        await item.save();
      }

      const remainingUnread = await SiteNotificationModel.countDocuments({
        isActive: true,
        readBy: { $ne: visitorId },
      });

      return NextResponse.json({ success: true, unreadCount: remainingUnread });
    }

    return NextResponse.json({ error: 'Geçersiz parametreler' }, { status: 400 });
  } catch (err: any) {
    console.error('API Notifications Read Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
