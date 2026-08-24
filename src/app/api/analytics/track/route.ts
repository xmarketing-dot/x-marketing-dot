import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get('host') || '';
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // DO NOT COUNT LOCALHOST OR 127.0.0.1 TRAFFIC
    if (
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp.includes('127.0.0.1')
    ) {
      return NextResponse.json({ success: true, ignored: 'localhost' });
    }

    const { path, referer, isMobile, city } = await req.json();

    await connectToDatabase();

    const userAgent = req.headers.get('user-agent') || '';

    // Determine traffic source
    let source = 'Direct';
    if (referer) {
      if (referer.includes('google.')) source = 'Google Search';
      else if (referer.includes('twitter.') || referer.includes('t.co') || referer.includes('x.com')) source = 'X (Twitter)';
      else if (referer.includes('instagram.')) source = 'Instagram';
      else if (referer.includes('facebook.')) source = 'Facebook';
      else source = referer;
    }

    const newVisitor = await AnalyticsVisitorModel.create({
      device: isMobile ? 'mobile' : 'desktop',
      path: path || '/',
      referer: source,
      city: city || 'İstanbul',
      ip: clientIp.split(',')[0],
      userAgent: userAgent.slice(0, 150),
    });

    return NextResponse.json({ success: true, visitorId: newVisitor._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tracking error' }, { status: 500 });
  }
}
