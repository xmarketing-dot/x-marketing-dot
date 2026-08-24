import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function POST(req: NextRequest) {
  try {
    const { listingId, status } = await req.json();

    if (!listingId || !status) {
      return NextResponse.json({ error: 'listingId ve status zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    listing.status = status;

    if (status === 'yayinda') {
      const now = Date.now();
      const duration = listing.yayinSuresi || 'haftalik';
      let days = 7;
      if (duration === 'gunluk') days = 1;
      if (duration === 'aylik') days = 30;

      listing.onaylanmaTarihi = new Date(now);
      listing.paketBitisTarihi = new Date(now + days * 24 * 60 * 60 * 1000);
    }

    await listing.save();

    return NextResponse.json({ success: true, listing: JSON.parse(JSON.stringify(listing)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
