import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // Find and update expired listings
    const result = await ListingModel.updateMany(
      {
        status: 'yayinda',
        paketBitisTarihi: { $lt: now },
      },
      {
        $set: { status: 'suresi_doldu' },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Expired listings check completed.',
      modifiedCount: result.modifiedCount,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Cron error' }, { status: 500 });
  }
}
