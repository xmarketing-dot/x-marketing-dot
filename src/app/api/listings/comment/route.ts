import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function POST(req: NextRequest) {
  try {
    const { listingSlug, yazar, yorum, puan } = await req.json();

    if (!listingSlug || !yorum) {
      return NextResponse.json({ error: 'Yorum metni zorunludur' }, { status: 400 });
    }

    await connectToDatabase();

    const newComment = {
      yazar: yazar ? yazar.trim() : 'Anonim Ziyaretçi',
      yorum: yorum.trim(),
      puan: Math.min(5, Math.max(1, Number(puan) || 5)),
      onayli: true,
      createdAt: new Date(),
    };

    const updated = await ListingModel.findOneAndUpdate(
      { slug: listingSlug },
      { $push: { anonimYorumlar: newComment } },
      { new: true }
    ).select('anonimYorumlar').lean();

    if (!updated) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      comments: updated.anonimYorumlar 
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Comment error' }, { status: 500 });
  }
}
