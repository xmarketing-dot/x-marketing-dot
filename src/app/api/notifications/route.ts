import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';
import { syncAnnouncementBarNotification, syncRecentListingsNotifications } from '@/lib/notificationService';
import { markVisitorUnreadZero } from './unread-count/route';

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

    // Kullanıcıya ulaştığını (deliveredTo) ve bildirimler sayfasını açtığı için OKUNDUĞUNU (readBy) kaydet!
    if (visitorId) {
      markVisitorUnreadZero(visitorId);

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

      // KULLANICI BİLDİRİMLERİ AÇTIĞI AN (+1 SİLİNDİĞİNDE) OKUNDU SAYILIR:
      const unreadIds = notifications
        .filter((n) => !(n.readBy || []).includes(visitorId))
        .map((n) => n._id);

      if (unreadIds.length > 0) {
        await SiteNotificationModel.updateMany(
          { _id: { $in: unreadIds } },
          {
            $addToSet: { readBy: visitorId },
            $inc: { readCount: 1 },
          }
        );
      }
    }

    const formatted = notifications.map((n) => {
      return {
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        url: n.url,
        imageUrl: n.imageUrl || '',
        type: n.type,
        badge: n.badge || 'BİLDİRİM',
        isRead: true, // Açıldığı an okundu
        createdAt: n.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        notifications: formatted,
        unreadCount: 0,
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
