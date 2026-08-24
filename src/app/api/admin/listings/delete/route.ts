import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await ListingModel.findByIdAndDelete(listingId);
    if (!deleted) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Silme hatası' }, { status: 500 });
  }
}
