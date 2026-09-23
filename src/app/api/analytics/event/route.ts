import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsEventModel from '@/models/AnalyticsEvent';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import ListingModel from '@/models/Listing';
import { chatEmitter } from '@/lib/chatEmitter';

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
    const cleanIp = clientIp.split(',')[0].trim();
    const incomingHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0].toLowerCase();

    // 1. Ziyaretçi İstihbaratını (Şehir, Cihaz, Referrer, Arama Kelimesi) Çek
    let visitorInfo: any = null;
    if (visitorId) {
      visitorInfo = await AnalyticsVisitorModel.findOne({ visitorId }).sort({ createdAt: -1 }).lean();
    }

    // 2. İlan Detaylarını Çek
    let listingInfo: any = null;
    const lId = targetId || metadata?.listingId;
    if (lId && mongoose.Types.ObjectId.isValid(lId)) {
      listingInfo = await ListingModel.findById(lId).select('baslik slug whatsappNumara ilSlug ilceSlug anaFotograf rozet status').lean();
    }

    const city = visitorInfo?.city || req.headers.get('x-vercel-ip-city') || targetCity || 'İstanbul';
    const device = visitorInfo?.device || (cleanIp && (req.headers.get('user-agent') || '').includes('Mobi') ? 'mobile' : 'desktop');
    const browser = visitorInfo?.browser || 'Chrome';
    const os = visitorInfo?.os || 'Mobile';
    const referer = visitorInfo?.referer || body.entryReferer || 'Direct';
    const refererSource = visitorInfo?.refererSource || 'direct';
    const searchKeyword = visitorInfo?.searchKeyword || '';

    const enrichedMetadata = {
      ...metadata,
      city,
      device,
      browser,
      os,
      referer,
      refererSource,
      searchKeyword,
      listingPhone: listingInfo?.whatsappNumara || metadata?.phone || '',
      listingSlug: listingInfo?.slug || metadata?.slug || '',
      listingPhoto: listingInfo?.anaFotograf?.url || '',
      listingLocation: listingInfo ? `${listingInfo.ilSlug}/${listingInfo.ilceSlug}` : (targetCity || ''),
      listingRozet: listingInfo?.rozet || '',
    };

    const finalTitle = listingInfo?.baslik || targetTitle || (metadata?.title || 'İlan');

    const event = await AnalyticsEventModel.create({
      visitorId,
      sessionId: sessionId || visitorId,
      eventType,
      targetId: targetId || lId || '',
      targetTitle: finalTitle,
      targetCity: listingInfo?.ilSlug || targetCity || city,
      path,
      hostname: incomingHost,
      metadata: enrichedMetadata,
      ip: cleanIp,
    });

    // 3. WhatsApp Tıklaması veya Paylaşım Sayısını Arttır
    if (targetId && (eventType === 'whatsapp_click' || eventType === 'special_ad_whatsapp_click' || eventType === 'share_listing')) {
      const isWaClick = eventType === 'whatsapp_click' || eventType === 'special_ad_whatsapp_click';
      const updateField = isWaClick
        ? { $inc: { whatsappTiklamaSayisi: 1 } }
        : { $inc: { paylasimSayisi: 1 } };

      await ListingModel.findByIdAndUpdate(targetId, updateField).catch(() => {});
    }

    // 4. Yönetim Paneline Anlık Canlı Bildirim (SSE) Gönder
    if (eventType === 'whatsapp_click' || eventType === 'special_ad_whatsapp_click') {
      try {
        chatEmitter.emit('whatsapp_click', {
          eventId: event._id.toString(),
          targetId: event.targetId,
          targetTitle: finalTitle,
          path: event.path,
          ip: cleanIp,
          city,
          device,
          browser,
          os,
          referer,
          refererSource,
          searchKeyword,
          phone: enrichedMetadata.listingPhone,
          listingSlug: enrichedMetadata.listingSlug,
          listingPhoto: enrichedMetadata.listingPhoto,
          listingLocation: enrichedMetadata.listingLocation,
          createdAt: event.createdAt,
        });
      } catch (err) {
        // Silent
      }
    }

    return NextResponse.json({ success: true, eventId: event._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Event tracking error' }, { status: 500 });
  }
}
