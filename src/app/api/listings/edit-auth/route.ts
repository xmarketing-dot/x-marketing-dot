import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

/**
 * POST /api/listings/edit-auth
 * İlan sahibinin WhatsApp Numarası + İlan Şifresi ile ilanını çekmesi ve güncellemesi
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, telefon, panelSifresi, listingId, updateData } = body;

    if (!telefon || !panelSifresi) {
      return NextResponse.json({ error: 'WhatsApp numarası ve İlan Şifresi zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanPhone = telefon.replace(/[\s\-\(\)]/g, '');
    const cleanPass = panelSifresi.toString().trim();

    // İlanı bul
    const listing = await ListingModel.findOne({
      $or: [
        { whatsappNumara: telefon },
        { whatsappNumara: cleanPhone },
        { whatsappNumara: { $regex: cleanPhone.slice(-10) } },
      ],
      panelSifresi: cleanPass,
    });

    if (!listing) {
      return NextResponse.json({ 
        error: 'Geçersiz WhatsApp Numarası veya İlan Şifresi! Lütfen bilgilerinizi kontrol ediniz.' 
      }, { status: 401 });
    }

    // 1. GİRİŞ & İLAN BİLGİLERİNİ GETİR
    if (action === 'get') {
      return NextResponse.json({
        success: true,
        listing: JSON.parse(JSON.stringify(listing)),
      });
    }

    // 2. İLAN GÜNCELLE
    if (action === 'update') {
      if (!updateData) {
        return NextResponse.json({ error: 'Güncellenecek veri bulunamadı.' }, { status: 400 });
      }

      if (updateData.baslik) listing.baslik = updateData.baslik.trim();
      if (updateData.aciklama) listing.aciklama = updateData.aciklama.trim();
      if (updateData.whatsappNumara) listing.whatsappNumara = updateData.whatsappNumara.trim();
      if (updateData.ilSlug) listing.ilSlug = updateData.ilSlug;
      if (updateData.ilceSlug) listing.ilceSlug = updateData.ilceSlug;
      if (updateData.fiyat !== undefined) listing.fiyat = Number(updateData.fiyat) || 0;

      if (updateData.fotograflar && Array.isArray(updateData.fotograflar) && updateData.fotograflar.length > 0) {
        listing.fotograflar = updateData.fotograflar;
        listing.anaFotograf = updateData.fotograflar[0];
      }

      // Detay profil alanları
      if (updateData.tamAd !== undefined) listing.tamAd = updateData.tamAd;
      if (updateData.yas !== undefined) listing.yas = Number(updateData.yas) || undefined;
      if (updateData.boy !== undefined) listing.boy = Number(updateData.boy) || undefined;
      if (updateData.kilo !== undefined) listing.kilo = Number(updateData.kilo) || undefined;

      await listing.save();

      return NextResponse.json({
        success: true,
        message: 'İlanınız başarıyla güncellendi!',
        listing: JSON.parse(JSON.stringify(listing)),
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Sunucu hatası.' }, { status: 500 });
  }
}
