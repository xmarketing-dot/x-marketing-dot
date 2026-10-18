import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SiteNotificationModel from '@/models/SiteNotification';
import PushSubscriptionModel from '@/models/PushSubscription';
import PushCampaignModel from '@/models/PushCampaign';
import webpush from '@/lib/webPush';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const notifications = await SiteNotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formatted = notifications.map((n) => {
      const delivered = n.deliveredCount || (n.deliveredTo ? n.deliveredTo.length : 0);
      const read = n.readCount || (n.readBy ? n.readBy.length : 0);
      const unreadScore = Math.max(0, delivered - read);

      return {
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        url: n.url,
        imageUrl: n.imageUrl || '',
        type: n.type,
        badge: n.badge || 'BİLDİRİM',
        deliveredCount: delivered,
        readCount: read,
        unreadScore,
        readRate: delivered > 0 ? Math.round((read / delivered) * 100) : 0,
        isActive: n.isActive,
        createdAt: n.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      notifications: formatted,
    });
  } catch (err: any) {
    console.error('Admin GET Notifications Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, url, imageUrl, badge, sendWebPush } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Başlık ve mesaj içeriği zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Site İçi Bildirim Oluştur
    const newNotif = await SiteNotificationModel.create({
      title,
      message,
      url: url || '/',
      imageUrl: imageUrl || '',
      type: 'admin_broadcast',
      badge: badge || 'YÖNETİCİ',
      isActive: true,
    });

    // 2. İsteğe bağlı Web Push Bildirimi Gönder
    let pushSentCount = 0;
    if (sendWebPush) {
      try {
        const subscribers = await PushSubscriptionModel.find({ active: true });
        if (subscribers.length > 0) {
          const payload = JSON.stringify({
            title,
            body: message,
            url: url || '/',
            icon: '/icon-192.png',
            image: imageUrl || undefined,
          });

          await Promise.allSettled(
            subscribers.map(async (sub) => {
              try {
                await webpush.sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
                  },
                  payload,
                  { TTL: 86400, urgency: 'high' }
                );
                pushSentCount++;
              } catch (_) {}
            })
          );

          await PushCampaignModel.create({
            title,
            body: message,
            url: url || '/',
            icon: '/icon-192.png',
            image: imageUrl || '',
            totalSent: subscribers.length,
            successCount: pushSentCount,
            failCount: Math.max(0, subscribers.length - pushSentCount),
          });
        }
      } catch (pushErr) {
        console.warn('Web push delivery skipped:', pushErr);
      }
    }

    return NextResponse.json({
      success: true,
      notification: newNotif,
      pushSentCount,
    });
  } catch (err: any) {
    console.error('Admin POST Notification Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id zorunludur' }, { status: 400 });
    }

    await connectToDatabase();
    await SiteNotificationModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
