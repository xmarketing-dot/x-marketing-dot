import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';
import ListingModel from '@/models/Listing';

export async function GET() {
  try {
    await connectToDatabase();
    const rawThreads = await ChatThreadModel.find({}).sort({ updatedAt: -1 }).lean();

    // Tüm ilanları çekip threadId veya listingId ile eşleştirelim
    const allListings = await ListingModel.find({})
      .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara panelSifresi chatThreadId anaFotograf kullaniciAdi')
      .lean();

    const listingByThreadId: Record<string, any> = {};
    const listingById: Record<string, any> = {};

    allListings.forEach((l) => {
      if (l.chatThreadId) listingByThreadId[l.chatThreadId.toString()] = l;
      listingById[l._id.toString()] = l;
    });

    const enrichedThreads = rawThreads.map((t) => {
      const threadIdStr = t._id.toString();
      const matchedListing = (t.listingId && listingById[t.listingId]) || listingByThreadId[threadIdStr] || null;

      const panelUser = matchedListing 
        ? ((matchedListing as any).kullaniciAdi || matchedListing.slug || matchedListing.whatsappNumara)
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

    return NextResponse.json({ threads: JSON.parse(JSON.stringify(enrichedThreads)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
