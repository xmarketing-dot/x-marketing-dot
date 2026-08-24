import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const listing = await ListingModel.findById(id);
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    if (body.baslik) listing.baslik = body.baslik;
    if (body.aciklama) listing.aciklama = body.aciklama;
    if (body.whatsappNumara) listing.whatsappNumara = body.whatsappNumara;
    if (body.ilSlug) listing.ilSlug = body.ilSlug;
    if (body.ilceSlug) listing.ilceSlug = body.ilceSlug;

    // Özel VIP Model Profil ve Biyografi Alanları
    if (body.tamAd !== undefined) listing.tamAd = body.tamAd;
    if (body.yas !== undefined) listing.yas = Number(body.yas) || undefined;
    if (body.boy !== undefined) listing.boy = Number(body.boy) || undefined;
    if (body.kilo !== undefined) listing.kilo = Number(body.kilo) || undefined;
    if (body.gogusOlcusu !== undefined) listing.gogusOlcusu = body.gogusOlcusu;
    if (body.sacRengi !== undefined) listing.sacRengi = body.sacRengi;
    if (body.gozRengi !== undefined) listing.gozRengi = body.gozRengi;
    if (body.hakkindaBiyografi !== undefined) listing.hakkindaBiyografi = body.hakkindaBiyografi;
    if (body.isVerifiedProfile !== undefined) listing.isVerifiedProfile = Boolean(body.isVerifiedProfile);

    if (body.diller) {
      listing.diller = Array.isArray(body.diller) 
        ? body.diller 
        : body.diller.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    if (body.hizmetMekanlari) {
      listing.hizmetMekanlari = Array.isArray(body.hizmetMekanlari)
        ? body.hizmetMekanlari
        : body.hizmetMekanlari.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    if (body.fotograflar && Array.isArray(body.fotograflar)) {
      listing.fotograflar = body.fotograflar;
    }
    if (body.anaFotografUrl) {
      listing.anaFotograf = { url: body.anaFotografUrl };
    }

    await listing.save();

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    return NextResponse.json({ error: 'Güncelleme hatası.' }, { status: 500 });
  }
}
