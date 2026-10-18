import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';
import { syncAnnouncementBarNotification, syncRecentListingsNotifications } from '@/lib/notificationService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId') || '';

    // İlk kurulumda eğer hiç bildirim yoksa anons barı ve son ilanları senkronize et
    await syncAnnouncementBarNotification();
    await syncRecentListingsNotifications();

    const notifications = await SiteNotificationModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    // Kullanıcıya ulaştığını (deliveredTo) topluca kaydet
    if (visitorId) {
      const undeliveredIds = notifications
        .filter((n) => !n.deliveredTo?.includes(visitorId))
        .map((n) => n._id);

      if (undeliveredIds.length > 0) {
        await SiteNotificationModel.updateMany(
          { _id: { $in: undeliveredIds } },
          {
            $addToSet: { deliveredTo: visitorId },
            $inc: { deliveredCount: 1 },
          }
        );
      }
    }

    let unreadCount = 0;
    const formatted = notifications.map((n) => {
      const isRead = visitorId ? (n.readBy || []).includes(visitorId) : false;
      if (!isRead) unreadCount++;

      return {
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        url: n.url,
        imageUrl: n.imageUrl || '',
        type: n.type,
        badge: n.badge || 'BİLDİRİM',
        isRead,
        createdAt: n.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        notifications: formatted,
        unreadCount,
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('API Notifications Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
