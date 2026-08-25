import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get last 500 visitors for detailed view
    const visitors = await AnalyticsVisitorModel.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({ visitors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
