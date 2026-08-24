import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import ListingModel from '@/models/Listing';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Total visitors count
    const totalVisitors = await AnalyticsVisitorModel.countDocuments();

    // 2. Mobile vs Desktop split
    const mobileCount = await AnalyticsVisitorModel.countDocuments({ device: 'mobile' });
    const desktopCount = await AnalyticsVisitorModel.countDocuments({ device: 'desktop' });

    // 3. Traffic sources breakdown
    const googleCount = await AnalyticsVisitorModel.countDocuments({ referer: 'Google Search' });
    const directCount = await AnalyticsVisitorModel.countDocuments({ referer: 'Direct' });

    // 4. Recent visitors log (last 20)
    const recentVisitors = await AnalyticsVisitorModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // 5. Total listing views & WhatsApp clicks
    const listings = await ListingModel.find({}, 'goruntulenmeSayisi whatsappTiklamaSayisi').lean();
    const totalListingViews = listings.reduce((acc, l) => acc + (l.goruntulenmeSayisi || 0), 0);
    const totalWhatsappClicks = listings.reduce((acc, l) => acc + (l.whatsappTiklamaSayisi || 0), 0);

    return NextResponse.json({
      analytics: {
        totalVisitors,
        mobileCount,
        desktopCount,
        mobilePercentage: totalVisitors > 0 ? Math.round((mobileCount / totalVisitors) * 100) : 75,
        desktopPercentage: totalVisitors > 0 ? Math.round((desktopCount / totalVisitors) * 100) : 25,
        googleCount,
        directCount,
        totalListingViews,
        totalWhatsappClicks,
        recentVisitors,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analytics fetch error' }, { status: 500 });
  }
}
