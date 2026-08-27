import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomepageConfigModel from '@/models/HomepageConfig';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let config: any = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
    if (!config) {
      const created = await HomepageConfigModel.create({ key: 'singleton' });
      config = created.toObject();
    }

    // Populate ozelIlan if ilanId is present
    if (config?.ozelIlanReklam?.ilanId) {
      const listing = await ListingModel.findById(config.ozelIlanReklam.ilanId)
        .select('baslik slug ilSlug ilceSlug anaFotograf fotograflar whatsappNumara rozet')
        .lean();
      if (listing) {
        config.ozelIlanReklam.ilan = listing;
      }
    }

    return NextResponse.json(
      { config: JSON.parse(JSON.stringify(config)) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=29',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Config get error' }, { status: 500 });
  }
}
