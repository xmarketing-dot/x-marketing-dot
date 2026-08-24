import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function POST(req: NextRequest) {
  try {
    const { listingId, action } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'listingId required' }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Determine current base likes
    let currentLikes = typeof listing.likeSayisi === 'number' && listing.likeSayisi > 0
      ? listing.likeSayisi
      : (listing.rozet === 'ultravip' ? 112 : listing.rozet === 'vip' ? 74 : listing.rozet === 'gold' ? 48 : 28);

    currentLikes = Math.max(0, currentLikes + (action === 'unlike' ? -1 : 1));
    listing.likeSayisi = currentLikes;
    await listing.save();

    return NextResponse.json({ 
      success: true, 
      likeSayisi: currentLikes 
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Like error' }, { status: 500 });
  }
}
