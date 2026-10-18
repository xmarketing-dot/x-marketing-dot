import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PushSubscriptionModel from '@/models/PushSubscription';
import PushCampaignModel from '@/models/PushCampaign';
import webpush from '@/lib/webPush';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { title, body: messageBody, url, icon, image, targetPlatform } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Başlık ve mesaj içeriği zorunludur.' }, { status: 400 });
    }

    const query: any = { active: true };
    if (targetPlatform && targetPlatform !== 'all') {
      query.platform = targetPlatform;
    }

    const subscribers = await PushSubscriptionModel.find(query);

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Hedef kitlede kayıtlı aktif bildirim abonesi bulunamadı.',
        totalSent: 0,
        successCount: 0,
        failCount: 0,
      });
    }

    const payload = JSON.stringify({
      title,
      body: messageBody,
      url: url || '/',
      icon: icon || '/icon-192.png',
      image: image || undefined,
    });

    let successCount = 0;
    let failCount = 0;

    await Promise.allSettled(
      subscribers.map(async (sub) => {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };

        try {
          await webpush.sendNotification(pushConfig, payload, {
            TTL: 60 * 60 * 24, // 24 saat
            urgency: 'high',
          });
          successCount++;
          await PushSubscriptionModel.updateOne({ _id: sub._id }, { lastSuccessAt: new Date() });
        } catch (err: any) {
          failCount++;
          if (err.statusCode === 404 || err.statusCode === 410) {
            await PushSubscriptionModel.updateOne({ _id: sub._id }, { active: false, failCount: sub.failCount + 1 });
          } else {
            await PushSubscriptionModel.updateOne({ _id: sub._id }, { $inc: { failCount: 1 } });
          }
        }
      })
    );

    // Kampanya kaydını sakla
    await PushCampaignModel.create({
      title,
      body: messageBody,
      url: url || '/',
      icon: icon || '/icon-192.png',
      image: image || '',
      targetPlatform: targetPlatform || 'all',
      totalSent: subscribers.length,
      successCount,
      failCount,
    });

    // ── TÜM KULLANICILAR İÇİN SİTE İÇİ BİLDİRİM LİSTESİNE DE EKLE ──
    try {
      const { createNotification } = await import('@/lib/notificationService');
      await createNotification({
        title,
        message: messageBody,
        url: url || '/',
        imageUrl: image || icon || '',
        type: 'admin_broadcast',
        badge: 'YÖNETİCİ',
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `${successCount} cihaza bildirim başarıyla ulaştırıldı.`,
      totalSent: subscribers.length,
      successCount,
      failCount,
    });
  } catch (err: any) {
    console.error('[Admin Push Send Error]:', err);
    return NextResponse.json({ error: err.message || 'Bildirim gönderilemedi.' }, { status: 500 });
  }
}
