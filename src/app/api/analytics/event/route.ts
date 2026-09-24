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

    if (!eventType) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const cleanIp = clientIp.split(',')[0].trim();
    const incomingHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0].toLowerCase();

    const effectiveVisitorId = visitorId || ('v_' + cleanIp.replace(/[^a-zA-Z0-9]/g, '_'));

    await connectToDatabase();

    // 1. Ziyaretçi İstihbaratını (Şehir, Cihaz, Referrer, Arama Kelimesi) Çek
    let visitorInfo: any = null;
    if (effectiveVisitorId) {
      visitorInfo = await AnalyticsVisitorModel.findOne({ visitorId: effectiveVisitorId }).sort({ createdAt: -1 }).lean();
    }

    // 2. İlan Detaylarını Çek (Hem ObjectId hem Slug desteği)
    let listingInfo: any = null;
    const lId = targetId || metadata?.listingId || metadata?.slug;
    if (lId) {
      if (mongoose.Types.ObjectId.isValid(lId)) {
        listingInfo = await ListingModel.findById(lId).select('baslik slug whatsappNumara ilSlug ilceSlug anaFotograf rozet status').lean();
      }
      if (!listingInfo) {
        listingInfo = await ListingModel.findOne({ slug: lId }).select('baslik slug whatsappNumara ilSlug ilceSlug anaFotograf rozet status').lean();
      }
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
      visitorId: effectiveVisitorId,
      sessionId: sessionId || effectiveVisitorId,
      eventType,
      targetId: targetId || lId || '',
      targetTitle: finalTitle,
      targetCity: listingInfo?.ilSlug || targetCity || city,
      path,
      hostname: incomingHost,
      metadata: enrichedMetadata,
      ip: cleanIp,
    });

    // 3. WhatsApp Tıklaması, Paylaşım veya Gösterim/Görüntülenme Sayısını Arttır
    const effectiveTargetId = targetId || lId || metadata?.slug;
    if (effectiveTargetId) {
      if (eventType === 'whatsapp_click' || eventType === 'special_ad_whatsapp_click') {
        if (mongoose.Types.ObjectId.isValid(effectiveTargetId)) {
          await ListingModel.findByIdAndUpdate(effectiveTargetId, { $inc: { whatsappTiklamaSayisi: 1 } }).catch(() => {});
        } else {
          await ListingModel.updateOne({ slug: effectiveTargetId }, { $inc: { whatsappTiklamaSayisi: 1 } }).catch(() => {});
        }
      } else if (eventType === 'share_listing') {
        if (mongoose.Types.ObjectId.isValid(effectiveTargetId)) {
          await ListingModel.findByIdAndUpdate(effectiveTargetId, { $inc: { paylasimSayisi: 1 } }).catch(() => {});
        } else {
          await ListingModel.updateOne({ slug: effectiveTargetId }, { $inc: { paylasimSayisi: 1 } }).catch(() => {});
        }
      } else if (
        eventType === 'special_ad_impression' ||
        eventType === 'listing_modal_view' ||
        eventType === 'listing_view' ||
        eventType === 'listing_impression' ||
        eventType === 'hero_vitrin_impression' ||
        eventType === 'popup_impression'
      ) {
        if (mongoose.Types.ObjectId.isValid(effectiveTargetId)) {
          await ListingModel.findByIdAndUpdate(effectiveTargetId, { $inc: { goruntulenmeSayisi: 1 } }).catch(() => {});
        } else {
          await ListingModel.updateOne({ slug: effectiveTargetId }, { $inc: { goruntulenmeSayisi: 1 } }).catch(() => {});
        }
      }
    }

    // 4. Yönetim Paneline Anlık Canlı Bildirim (SSE) Gönder
    if (eventType === 'whatsapp_click' || eventType === 'special_ad_whatsapp_click') {
      try {
        chatEmitter.emit('whatsapp_click', {
          eventId: event._id.toString(),
          _id: event._id.toString(),
          targetId: event.targetId,
          targetTitle: finalTitle,
          baslik: finalTitle,
          path: event.path,
          ip: cleanIp,
          city,
          targetCity: city,
          device,
          browser,
          os,
          referer,
          refererSource,
          searchKeyword,
          phone: enrichedMetadata.listingPhone,
          whatsappNumara: enrichedMetadata.listingPhone,
          slug: enrichedMetadata.listingSlug,
          listingSlug: enrichedMetadata.listingSlug,
          listingPhoto: enrichedMetadata.listingPhoto,
          fotoUrl: enrichedMetadata.listingPhoto,
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
