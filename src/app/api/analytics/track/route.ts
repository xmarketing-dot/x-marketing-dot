import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import ListingModel from '@/models/Listing';
import { checkIsBanned } from '@/lib/banCheck';

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

    // ── 2. TRAFİK KAYNAĞI TESPİTİ (Oturum Giriş Referansı Destekli) ──
    const entryReferer = (body.entryReferer || '').trim();
    const refLower = (referer || '').toLowerCase();
    const entryRefLower = entryReferer.toLowerCase();
    const pathLower = (path || '').toLowerCase();
    const utmLower = (utmSource || '').toLowerCase();
    const hostDomain = host.split(':')[0].toLowerCase();

    // Site içi sayfa geçişiyse (örn: ana sayfadan ilana tıklandıysa), kullanıcının ilk geldiği harici kaynağı baz al
    const isInternalReferer = !referer || refLower === 'direct' || (hostDomain && refLower.includes(hostDomain));
    const isEntryExternal = entryRefLower && entryRefLower !== 'direct' && !(hostDomain && entryRefLower.includes(hostDomain));
    
    const targetRef = (isInternalReferer && isEntryExternal) ? entryRefLower : refLower;
    const finalStoredReferer = (isInternalReferer && isEntryExternal) ? entryReferer : (referer || 'Direct');

    let source: 'google' | 'yandex' | 'whatsapp' | 'telegram' | 'direct' | 'x' | 'instagram' | 'facebook' | 'other' = 'direct';

    if (targetRef.includes('google.') || searchKeyword) {
      source = 'google';
    } else if (targetRef.includes('yandex')) {
      source = 'yandex';
    } else if (
      targetRef.includes('whatsapp') ||
      targetRef.includes('wa.me') ||
      pathLower.includes('ref=whatsapp') ||
      utmLower.includes('whatsapp')
    ) {
      source = 'whatsapp';
    } else if (
      targetRef.includes('telegram') ||
      targetRef.includes('t.me') ||
      pathLower.includes('ref=telegram') ||
      utmLower.includes('telegram')
    ) {
      source = 'telegram';
    } else if (
      targetRef.includes('facebook') ||
      targetRef.includes('fb.com') ||
      targetRef.includes('fb.me') ||
      targetRef.includes('meta.com') ||
      utmLower.includes('facebook') ||
      utmLower.includes('fb')
    ) {
      source = 'facebook';
    } else if (
      targetRef.includes('twitter') ||
      targetRef.includes('t.co') ||
      targetRef.includes('x.com') ||
      utmLower.includes('twitter') ||
      utmLower.includes('x')
    ) {
      source = 'x';
    } else if (targetRef.includes('instagram') || utmLower.includes('instagram')) {
      source = 'instagram';
    } else if (!targetRef || targetRef === 'direct' || (hostDomain && targetRef.includes(hostDomain))) {
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
    const incomingHost = (req.headers.get('x-forwarded-host') || host || '').split(':')[0].toLowerCase();

    const newVisitor = await AnalyticsVisitorModel.create({
      visitorId,
      sessionId: sessionId || visitorId,
      device: isMobile ? 'mobile' : 'desktop',
      browser,
      os,
      path,
      pageTitle: pageTitle || 'İlan Platformu',
      referer: finalStoredReferer,
      refererSource: source,
      searchKeyword: searchKeyword || '',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
      city: decodeURIComponent(vercelCity),
      ip: cleanIp,
      hostname: incomingHost,
      userAgent,
      isBanned: false,
      durationSeconds: 5,
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
