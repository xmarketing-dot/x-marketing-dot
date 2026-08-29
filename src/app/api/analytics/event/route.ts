import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      visitorId,
      sessionId,
      eventType,
      targetId,
      targetTitle,
      targetCity,
      path = '/',
      metadata = {},
    } = body;

    if (!eventType || !visitorId) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    await connectToDatabase();

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const incomingHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0].toLowerCase();

    const event = await AnalyticsEventModel.create({
      visitorId,
      sessionId: sessionId || visitorId,
      eventType,
      targetId: targetId || '',
      targetTitle: targetTitle || '',
      targetCity: targetCity || '',
      path,
      hostname: incomingHost,
      metadata,
      ip: clientIp.split(',')[0].trim(),
    });

    // If WhatsApp click or share, increment listing stats in parallel
    if (targetId && (eventType === 'whatsapp_click' || eventType === 'share_listing')) {
      const updateField = eventType === 'whatsapp_click' 
        ? { $inc: { whatsappTiklamaSayisi: 1 } }
        : { $inc: { paylasimSayisi: 1 } };

      await ListingModel.findByIdAndUpdate(targetId, updateField).catch(() => {});
    }

    return NextResponse.json({ success: true, eventId: event._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Event tracking error' }, { status: 500 });
  }
}
