import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import AnalyticsEventModel from '@/models/AnalyticsEvent';

export const dynamic = 'force-dynamic';

interface ImpressionItem {
  listingId: string;
  slug?: string;
  title?: string;
  city?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      visitorId,
      sessionId,
      path = '/',
      impressions = [],
    } = body;

    if (!visitorId || !Array.isArray(impressions) || impressions.length === 0) {
      return NextResponse.json({ success: true, counted: 0 });
    }

    await connectToDatabase();

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const incomingHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0].toLowerCase();
    const cleanIp = clientIp.split(',')[0].trim();

    // Filtrele: Geçerli ObjectId olan veya ID'si bulunan kayıtları al (max 150)
    const validItems: ImpressionItem[] = [];
    const validIds: mongoose.Types.ObjectId[] = [];
    const seenIds = new Set<string>();

    for (const item of impressions.slice(0, 150)) {
      if (!item || !item.listingId) continue;
      const idStr = item.listingId.toString().trim();
      if (seenIds.has(idStr)) continue;
      seenIds.add(idStr);

      if (mongoose.Types.ObjectId.isValid(idStr)) {
        validIds.push(new mongoose.Types.ObjectId(idStr));
      }
      validItems.push({
        listingId: idStr,
        slug: item.slug || '',
        title: item.title || '',
        city: item.city || '',
      });
    }

    if (validItems.length === 0) {
      return NextResponse.json({ success: true, counted: 0 });
    }

    // 1. İlanların goruntulenmeSayisi değerini anında +1 artır
    if (validIds.length > 0) {
      await ListingModel.updateMany(
        { _id: { $in: validIds } },
        { $inc: { goruntulenmeSayisi: 1 } }
      ).catch(() => {});
    }

    // 2. Analitik etkinliklerini kaydet (Dönemsel raporlar ve tekil ziyaretçi hesaplaması için)
    const eventDocs = validItems.map((item) => ({
      visitorId,
      sessionId: sessionId || visitorId,
      eventType: 'listing_impression' as const,
      targetId: item.listingId,
      targetTitle: item.title || '',
      targetCity: item.city || '',
      path,
      hostname: incomingHost,
      ip: cleanIp,
      metadata: { slug: item.slug },
    }));

    await AnalyticsEventModel.insertMany(eventDocs, { ordered: false }).catch(() => {});

    return NextResponse.json({
      success: true,
      counted: validItems.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Impression tracking error' },
      { status: 500 }
    );
  }
}
