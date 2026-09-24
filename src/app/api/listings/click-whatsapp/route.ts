import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json();
    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    // whatsappTiklamaSayisi artık merkezi olarak /api/analytics/event üzerinden
    // tekil ve tutarlı şekilde artırılmaktadır. Çift sayımı (double-count) önlemek için
    // bu legacy endpoint güvenli bir şekilde başarı döndürür.
    return NextResponse.json({ success: true, handledByAnalytics: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
