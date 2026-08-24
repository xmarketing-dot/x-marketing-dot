import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, baslik, aciklama, ilSlug, ilceSlug, rozet, yayinSuresi, whatsappNumara, status, anaFotografUrl, fotograflar } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await ListingModel.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    if (baslik) listing.baslik = baslik;
    if (aciklama) listing.aciklama = aciklama;
    if (ilSlug) listing.ilSlug = ilSlug;
    if (ilceSlug) listing.ilceSlug = ilceSlug;
    if (rozet) listing.rozet = rozet;
    if (whatsappNumara) listing.whatsappNumara = whatsappNumara;
    if (anaFotografUrl) listing.anaFotograf = { url: anaFotografUrl };
    if (fotograflar && Array.isArray(fotograflar)) listing.fotograflar = fotograflar;

    if (yayinSuresi) {
      listing.yayinSuresi = yayinSuresi;
    }

    if (status) {
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
    }

    await listing.save();

    return NextResponse.json({ success: true, listing: JSON.parse(JSON.stringify(listing)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Güncelleme hatası' }, { status: 500 });
  }
}
