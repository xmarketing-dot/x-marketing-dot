import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PushSubscriptionModel from '@/models/PushSubscription';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { subscription, visitorId, platform, browser, hostname } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Geçersiz abonelik verisi.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               req.headers.get('x-real-ip') || 
               '';

    const cleanPlatform = platform === 'ios' ? 'ios' : (platform === 'android' ? 'android' : 'desktop');

    await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        visitorId: visitorId || '',
        platform: cleanPlatform,
        browser: browser || 'Chrome',
        ip,
        hostname: hostname || req.headers.get('host') || '',
        active: true,
        failCount: 0,
        lastSuccessAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: 'Bildirim aboneliği başarıyla kaydedildi.' });
  } catch (err: any) {
    console.error('[Push Subscribe Error]:', err);
    return NextResponse.json({ error: err.message || 'Abonelik kaydedilemedi.' }, { status: 500 });
  }
}
