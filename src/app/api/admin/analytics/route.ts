import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'all';

    let dateQuery: any = {};
    const now = new Date();

    if (range === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: startOfToday } };
    } else if (range === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateQuery = { createdAt: { $gte: startOfYesterday, $lt: endOfYesterday } };
    } else if (range === 'week') {
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateQuery = { createdAt: { $gte: startOfWeek } };
    }

    // 1. Total visitors count (filtered)
    const totalVisitors = await AnalyticsVisitorModel.countDocuments(dateQuery);

    // 2. Mobile vs Desktop split (filtered)
    const mobileCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, device: 'mobile' });
    const desktopCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, device: 'desktop' });

    // 3. Traffic sources breakdown (filtered)
    const googleCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, referer: 'Google Search' });
    const directCount = await AnalyticsVisitorModel.countDocuments({ ...dateQuery, referer: 'Direct' });

    // 4. Active online users (Last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeUsers = await AnalyticsVisitorModel.countDocuments({ createdAt: { $gte: fiveMinutesAgo } });

    // 5. Most popular pages (filtered)
    const popularPages = await AnalyticsVisitorModel.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 6. Recent visitors log (last 100, filtered)
    const recentVisitors = await AnalyticsVisitorModel.find(dateQuery)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // 7. Total listing views & WhatsApp clicks (Global, not date-filtered since they are on Listing model)
    const listings = await ListingModel.find({}, 'goruntulenmeSayisi whatsappTiklamaSayisi').lean();
    const totalListingViews = listings.reduce((acc, l) => acc + (l.goruntulenmeSayisi || 0), 0);
    const totalWhatsappClicks = listings.reduce((acc, l) => acc + (l.whatsappTiklamaSayisi || 0), 0);

    return NextResponse.json({
      analytics: {
        totalVisitors,
        mobileCount,
        desktopCount,
        mobilePercentage: totalVisitors > 0 ? Math.round((mobileCount / totalVisitors) * 100) : 0,
        desktopPercentage: totalVisitors > 0 ? Math.round((desktopCount / totalVisitors) * 100) : 0,
        googleCount,
        directCount,
        activeUsers,
        popularPages,
        totalListingViews,
        totalWhatsappClicks,
        recentVisitors,
      },
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message || 'Analytics fetch error' }, { status: 500 });
  }
}
