import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kullaniciId = searchParams.get('kullaniciId');
    const telefon = searchParams.get('telefon');
    const chatThreadId = searchParams.get('chatThreadId');

    if (!kullaniciId && !telefon && !chatThreadId) {
      return NextResponse.json({ error: 'Arama kriteri belirtilmedi.' }, { status: 400 });
    }

    await connectToDatabase();

    const query: any = { $or: [] };
    if (kullaniciId) query.$or.push({ kullaniciId });
    if (telefon) {
      const cleanPhone = telefon.replace(/\s+/g, '');
      query.$or.push({ whatsappNumara: telefon });
      query.$or.push({ whatsappNumara: cleanPhone });
    }
    if (chatThreadId) query.$or.push({ chatThreadId });

    const listings = await ListingModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json({ error: 'İlanlar getirilemedi.' }, { status: 500 });
  }
}
