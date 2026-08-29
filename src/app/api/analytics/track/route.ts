import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get('host') || '';
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // Ignore localhost development pings
    if (
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp.includes('127.0.0.1')
    ) {
      return NextResponse.json({ success: true, ignored: 'localhost' });
    }

    const body = await req.json();
    const {
      visitorId,
      sessionId,
      path = '/',
      pageTitle,
      referer = 'Direct',
      searchKeyword = '',
      utmSource = '',
      utmMedium = '',
      utmCampaign = '',
      isMobile = true,
      browser = 'Chrome',
      os = 'Mobile',
    } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanIp = clientIp.split(',')[0].trim();
    const vercelCity = req.headers.get('x-vercel-ip-city') || req.headers.get('x-vercel-ip-country-region') || 'İstanbul';
    const userAgent = req.headers.get('user-agent') || '';

    // ── 1. DEDUPLICATION (Aynı kişinin 10 dakika içindeki aynı sayfa isteklerini mükerrer saymama) ──
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingRecentVisit = await AnalyticsVisitorModel.findOne({
      visitorId,
      path,
      createdAt: { $gte: tenMinutesAgo },
    });

    if (existingRecentVisit) {
      // Update duration / updatedAt without inflating unique visitor count
      return NextResponse.json({
        success: true,
        visitorId: existingRecentVisit._id,
        deduplicated: true,
      });
    }

    // ── 2. TRAFİK KAYNAĞI TESPİTİ (Google, WhatsApp, Telegram, Sosyal Medya, Direct) ──
    let source: 'google' | 'whatsapp' | 'telegram' | 'direct' | 'x' | 'instagram' | 'facebook' | 'other' = 'direct';
    const refLower = (referer || '').toLowerCase();
    const pathLower = (path || '').toLowerCase();
    const utmLower = (utmSource || '').toLowerCase();

    if (refLower.includes('google.') || searchKeyword) {
      source = 'google';
    } else if (
      refLower.includes('whatsapp') ||
      refLower.includes('wa.me') ||
      pathLower.includes('ref=whatsapp') ||
      utmLower.includes('whatsapp')
    ) {
      source = 'whatsapp';
    } else if (
      refLower.includes('telegram') ||
      refLower.includes('t.me') ||
      pathLower.includes('ref=telegram') ||
      utmLower.includes('telegram')
    ) {
      source = 'telegram';
    } else if (
      refLower.includes('facebook') ||
      refLower.includes('fb.com') ||
      refLower.includes('fb.me') ||
      refLower.includes('meta.com') ||
      utmLower.includes('facebook') ||
      utmLower.includes('fb')
    ) {
      source = 'facebook';
    } else if (
      refLower.includes('twitter') ||
      refLower.includes('t.co') ||
      refLower.includes('x.com') ||
      utmLower.includes('twitter') ||
      utmLower.includes('x')
    ) {
      source = 'x';
    } else if (refLower.includes('instagram') || utmLower.includes('instagram')) {
      source = 'instagram';
    } else if (!referer || refLower === 'direct' || refLower.includes('besteskort')) {
      source = 'direct';
    } else {
      source = 'other';
    }

    // Check if visitor is unique for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const visitedToday = await AnalyticsVisitorModel.exists({
      visitorId,
      createdAt: { $gte: startOfToday },
    });

    const isUniqueToday = !visitedToday;

    const newVisitor = await AnalyticsVisitorModel.create({
      visitorId,
      sessionId: sessionId || visitorId,
      device: isMobile ? 'mobile' : 'desktop',
      browser,
      os,
      path,
      pageTitle: pageTitle || 'Best Eskort',
      referer: referer || 'Direct',
      refererSource: source,
      searchKeyword: searchKeyword || '',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
      city: decodeURIComponent(vercelCity),
      ip: cleanIp,
      userAgent: userAgent.slice(0, 200),
      durationSeconds: 0,
      isUniqueToday,
    });

    // If viewing a listing, increment listing view count
    if (path && path.startsWith('/ilan/')) {
      const slug = path.replace('/ilan/', '').split('?')[0].split('/')[0].trim();
      if (slug) {
        ListingModel.updateOne({ slug }, { $inc: { goruntulenmeSayisi: 1 } }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, visitorId: newVisitor._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tracking error' }, { status: 500 });
  }
}
