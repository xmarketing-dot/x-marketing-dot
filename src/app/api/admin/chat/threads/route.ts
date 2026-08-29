import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // 1. Fetch latest 60 active threads with index
    const rawThreads = await ChatThreadModel.find({})
      .sort({ updatedAt: -1 })
      .limit(60)
      .lean();

    if (rawThreads.length === 0) {
      return NextResponse.json({ threads: [] });
    }

    // 2. Only fetch listings that are actually linked to these 60 threads (targeted $in query)
    const threadIds = rawThreads.map((t) => t._id.toString());
    const listingIdStrings = rawThreads
      .map((t) => t.listingId)
      .filter((id): id is string => Boolean(id && mongoose.Types.ObjectId.isValid(id)));

    const listingObjectIds = listingIdStrings.map((id) => new mongoose.Types.ObjectId(id));

    const matchedListings = await ListingModel.find({
      $or: [
        { _id: { $in: listingObjectIds } },
        { chatThreadId: { $in: threadIds } },
      ],
    })
      .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara panelSifresi chatThreadId anaFotograf.url kullaniciAdi')
      .lean();

    const listingByThreadId: Record<string, any> = {};
    const listingById: Record<string, any> = {};

    matchedListings.forEach((l: any) => {
      if (l.chatThreadId) listingByThreadId[l.chatThreadId.toString()] = l;
      listingById[l._id.toString()] = l;
    });

    const enrichedThreads = rawThreads.map((t: any) => {
      const threadIdStr = t._id.toString();
      const matchedListing = (t.listingId && listingById[t.listingId]) || listingByThreadId[threadIdStr] || null;

      const panelUser = matchedListing 
        ? (matchedListing.kullaniciAdi || matchedListing.slug || matchedListing.whatsappNumara)
        : t.username || null;

      return {
        ...t,
        listingId: matchedListing ? matchedListing._id.toString() : t.listingId || null,
        listingBaslik: matchedListing ? matchedListing.baslik : t.listingBaslik || null,
        listingSlug: matchedListing ? matchedListing.slug : t.listingSlug || null,
        listingRozet: matchedListing ? matchedListing.rozet : null,
        listingKonum: matchedListing ? `${matchedListing.ilSlug}/${matchedListing.ilceSlug}` : null,
        listingFoto: matchedListing?.anaFotograf?.url || null,
        whatsappNumara: matchedListing?.whatsappNumara || t.kullaniciTelefon || null,
        username: panelUser,
        password: matchedListing?.panelSifresi || t.password || null,
        kullaniciAdi: matchedListing ? `👑 ${matchedListing.baslik}` : t.kullaniciAdi,
      };
    });

    return NextResponse.json(
      { threads: JSON.parse(JSON.stringify(enrichedThreads)) },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
