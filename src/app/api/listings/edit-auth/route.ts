import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

/**
 * POST /api/listings/edit-auth
 * İlan sahibinin WhatsApp Numarası + İlan Şifresi veya Panel Oturumu ile ilanını çekmesi ve güncellemesi
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, telefon, identifier, panelSifresi, password, listingId, updateData } = body;

    const rawPass = panelSifresi || password || '';
    const rawIdent = telefon || identifier || '';

    if (!rawIdent && !listingId) {
      return NextResponse.json({ error: 'WhatsApp numarası ve İlan Şifresi zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanPhone = rawIdent.toString().replace(/[\s\-\(\)]/g, '');
    const cleanPass = rawPass.toString().trim();

    let listing: any = null;

    // 1. Eğer doğrudan listingId verilmişse
    if (listingId) {
      listing = await ListingModel.findById(listingId);
    }

    // 2. Eğer listingId ile bulunamadıysa veya verilmediyse telefon + şifre ile bul
    if (!listing && cleanPhone) {
      listing = await ListingModel.findOne({
        $or: [
          { whatsappNumara: rawIdent },
          { whatsappNumara: cleanPhone },
          { whatsappNumara: { $regex: cleanPhone.slice(-10) } },
        ],
        ...(cleanPass ? { panelSifresi: cleanPass } : {}),
      });
    }

    if (!listing) {
      return NextResponse.json({ 
        error: 'İlan bulunamadı! Lütfen bilgilerinizi kontrol ediniz.' 
      }, { status: 404 });
    }

    // Şifre Doğrulama (Eğer şifre gönderilmişse kontrol et)
    if (cleanPass && listing.panelSifresi && listing.panelSifresi !== cleanPass) {
      // UserModel şifresiyle de kontrol et
      const user = await UserModel.findOne({
        $or: [
          { telefon: rawIdent },
          { telefon: cleanPhone },
          { email: rawIdent.toLowerCase() },
          { kullaniciAdi: rawIdent.toLowerCase() },
        ],
      });

      if (!user || user.sifreHash !== cleanPass) {
        return NextResponse.json({ 
          error: 'Geçersiz İlan Şifresi! Lütfen bilgilerinizi kontrol ediniz.' 
        }, { status: 401 });
      }
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
        listing.anaFotograf = updateData.anaFotograf || updateData.fotograflar[0];
      }

      // Detay profil alanları
      if (updateData.tamAd !== undefined) listing.tamAd = updateData.tamAd;
      if (updateData.yas !== undefined) listing.yas = Number(updateData.yas) || undefined;
      if (updateData.boy !== undefined) listing.boy = Number(updateData.boy) || undefined;
      if (updateData.kilo !== undefined) listing.kilo = Number(updateData.kilo) || undefined;
      if (updateData.gogusOlcusu !== undefined) listing.gogusOlcusu = updateData.gogusOlcusu;
      if (updateData.sacRengi !== undefined) listing.sacRengi = updateData.sacRengi;
      if (updateData.gozRengi !== undefined) listing.gozRengi = updateData.gozRengi;
      if (updateData.hakkindaBiyografi !== undefined) listing.hakkindaBiyografi = updateData.hakkindaBiyografi;

      if (updateData.diller !== undefined) {
        listing.diller = Array.isArray(updateData.diller) 
          ? updateData.diller 
          : updateData.diller.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (updateData.hizmetMekanlari !== undefined) {
        listing.hizmetMekanlari = Array.isArray(updateData.hizmetMekanlari) 
          ? updateData.hizmetMekanlari 
          : updateData.hizmetMekanlari.split(',').map((s: string) => s.trim()).filter(Boolean);
      }

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
