import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
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

    // Collect all referenced listing IDs from single ad and array
    const rawAdIds: any[] = [];
    if (config?.ozelIlanReklam?.ilanId) rawAdIds.push(config.ozelIlanReklam.ilanId);
    if (Array.isArray(config?.ozelIlanReklamlar)) {
      config.ozelIlanReklamlar.forEach((ad: any) => {
        if (ad?.ilanId) rawAdIds.push(ad.ilanId);
      });
    }

    const validObjectIds = rawAdIds
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validObjectIds.length > 0) {
      const listings = await ListingModel.find({ _id: { $in: validObjectIds } })
        .select('baslik slug ilSlug ilceSlug anaFotograf fotograflar whatsappNumara rozet status')
        .lean();
      
      const listingMap = new Map(listings.map((l: any) => [l._id.toString(), l]));

      if (config.ozelIlanReklam?.ilanId) {
        config.ozelIlanReklam.ilan = listingMap.get(config.ozelIlanReklam.ilanId.toString()) || null;
      }

      if (Array.isArray(config.ozelIlanReklamlar)) {
        config.ozelIlanReklamlar = config.ozelIlanReklamlar.map((ad: any) => ({
          ...ad,
          ilan: ad.ilanId ? (listingMap.get(ad.ilanId.toString()) || null) : null,
        }));
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
