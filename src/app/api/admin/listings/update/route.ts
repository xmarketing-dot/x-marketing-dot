import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, baslik, aciklama, ilSlug, ilceSlug, rozet, yayinSuresi, whatsappNumara, status, anaFotografUrl, fotograflar, paketBitisTarihi, ekleGun, action, days } = body;

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

    if (paketBitisTarihi) {
      listing.paketBitisTarihi = new Date(paketBitisTarihi);
    }

    if (action === 'set_from_start') {
      const dur = yayinSuresi || listing.yayinSuresi || 'haftalik';
      const dayCount = days ? Number(days) : (dur === 'gunluk' ? 1 : dur === 'aylik' ? 30 : 7);
      const start = listing.onaylanmaTarihi || listing.createdAt || new Date();
      listing.paketBitisTarihi = new Date(new Date(start).getTime() + dayCount * 24 * 60 * 60 * 1000);
      listing.status = 'yayinda';
    }

    if (ekleGun && typeof ekleGun === 'number') {
      const base = listing.paketBitisTarihi && listing.paketBitisTarihi > new Date()
        ? new Date(listing.paketBitisTarihi)
        : new Date();
      base.setDate(base.getDate() + ekleGun);
      listing.paketBitisTarihi = base;
      listing.status = 'yayinda';
    }

    if (status) {
      const prevStatus = listing.status;
      listing.status = status;
      if (status === 'yayinda' && (prevStatus !== 'yayinda' || !listing.paketBitisTarihi)) {
        const now = Date.now();
        const duration = listing.yayinSuresi || 'haftalik';
        let dayCount = 7;
        if (duration === 'gunluk') dayCount = 1;
        if (duration === 'aylik') dayCount = 30;

        listing.onaylanmaTarihi = new Date(now);
        listing.paketBitisTarihi = new Date(now + dayCount * 24 * 60 * 60 * 1000);
      }
    }

    await listing.save({ validateModifiedOnly: true });

    return NextResponse.json({ success: true, listing: JSON.parse(JSON.stringify(listing)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Güncelleme hatası' }, { status: 500 });
  }
}
