import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { recordId, durationSeconds } = await req.json();
    if (!recordId || typeof durationSeconds !== 'number') {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await connectToDatabase();

    await AnalyticsVisitorModel.findByIdAndUpdate(recordId, {
      $set: { durationSeconds: Math.min(600, durationSeconds) },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
