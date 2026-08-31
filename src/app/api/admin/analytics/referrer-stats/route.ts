import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const timeframe = req.nextUrl.searchParams.get('timeframe') || 'today';
    
    await connectToDatabase();

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (timeframe === 'yesterday') {
      startDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      startDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      startDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Tüm referrer source'ları say
    const stats = await AnalyticsVisitorModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isBanned: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$refererSource',
          count: { $sum: 1 },
          uniqueVisitors: { $sum: { $cond: ['$isUniqueToday', 1, 0] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Yandex'e özel breakdown
    const yandexStats = await AnalyticsVisitorModel.aggregate([
      {
        $match: {
          refererSource: 'yandex',
          createdAt: { $gte: startDate },
          isBanned: { $ne: true }
        }
      },
      {
        $group: {
          _id: '$path',
          count: { $sum: 1 },
          browsers: { $push: '$browser' },
          devices: { $push: '$device' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return NextResponse.json({
      timeframe,
      startDate,
      sources: stats,
      yandexDetails: yandexStats,
      yandexTotal: stats.find((s) => s._id === 'yandex') || { _id: 'yandex', count: 0, uniqueVisitors: 0 }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
