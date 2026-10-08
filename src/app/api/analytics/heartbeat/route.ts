import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnalyticsVisitorModel from '@/models/AnalyticsVisitor';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {}
    }

    const { recordId, durationSeconds } = body || {};
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
