import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomepageConfigModel from '@/models/HomepageConfig';
import ListingModel from '@/models/Listing';

export async function GET() {
  try {
    await connectToDatabase();
    let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
    if (!config) {
      const created = await HomepageConfigModel.create({ key: 'singleton' });
      config = created.toObject();
    }

    // Also get all active listings for easy selection
    const allListings = await ListingModel.find({ status: 'yayinda' })
      .select('_id baslik slug ilSlug ilceSlug rozet anaFotograf fotograflar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      config: JSON.parse(JSON.stringify(config)),
      allListings: JSON.parse(JSON.stringify(allListings))
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Config get error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      heroBaslik, 
      heroAltBaslik, 
      bannerMetin, 
      bannerLink, 
      bannerAktif, 
      bannerRozet, 
      duyurular, 
      sliderIlanIds, 
      ozelIlanReklam, 
      ozelIlanReklamlar 
    } = body;

    const mongoose = await connectToDatabase();

    const updateData: any = {};

    if (heroBaslik !== undefined) updateData['hero.baslik'] = heroBaslik;
    if (heroAltBaslik !== undefined) updateData['hero.altBaslik'] = heroAltBaslik;
    if (bannerMetin !== undefined) updateData['aktifBanner.metin'] = bannerMetin;
    if (bannerLink !== undefined) updateData['aktifBanner.link'] = bannerLink;
    if (bannerAktif !== undefined) updateData['aktifBanner.aktif'] = Boolean(bannerAktif);
    if (bannerRozet !== undefined) updateData['aktifBanner.rozet'] = bannerRozet || '👑 VIP DUYURU';

    if (ozelIlanReklam && typeof ozelIlanReklam === 'object') {
      const validIlanId = ozelIlanReklam.ilanId && mongoose.Types.ObjectId.isValid(ozelIlanReklam.ilanId)
        ? new mongoose.Types.ObjectId(ozelIlanReklam.ilanId)
        : null;

      updateData.ozelIlanReklam = {
        _id: String(ozelIlanReklam._id || 'ad_single'),
        aktif: Boolean(ozelIlanReklam.aktif),
        ilanId: validIlanId,
        hedefIlSlug: ozelIlanReklam.hedefIlSlug || 'tum_turkiye',
        gecikmeSaniye: Number(ozelIlanReklam.gecikmeSaniye) || 4,
        baslik: ozelIlanReklam.baslik || '👑 GÜNÜN ÖZEL VIP İLANI',
        spotMetin: ozelIlanReklam.spotMetin || 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı',
        rozet: ozelIlanReklam.rozet || '🔥 SPONSORLU ÖZEL İLAN',
      };
    }

    if (Array.isArray(ozelIlanReklamlar)) {
      updateData.ozelIlanReklamlar = ozelIlanReklamlar.map((ad: any, idx: number) => {
        const validIlanId = ad.ilanId && mongoose.Types.ObjectId.isValid(ad.ilanId)
          ? new mongoose.Types.ObjectId(ad.ilanId)
          : null;

        return {
          _id: String(ad._id || `ad_${Date.now()}_${idx}`),
          aktif: Boolean(ad.aktif),
          ilanId: validIlanId,
          hedefIlSlug: ad.hedefIlSlug || 'tum_turkiye',
          gecikmeSaniye: Number(ad.gecikmeSaniye) || 4,
          baslik: ad.baslik || '👑 GÜNÜN ÖZEL VIP İLANI',
          spotMetin: ad.spotMetin || 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı',
          rozet: ad.rozet || '🔥 SPONSORLU ÖZEL İLAN',
        };
      });
    }

    if (Array.isArray(duyurular)) {
      updateData.duyurular = duyurular;
    }

    if (Array.isArray(sliderIlanIds)) {
      updateData.sliderIlanIds = sliderIlanIds
        .filter((id: any) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id: any) => new mongoose.Types.ObjectId(id));
    }

    const config = await HomepageConfigModel.findOneAndUpdate(
      { key: 'singleton' },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Config update error:', error);
    return NextResponse.json({ error: error.message || 'Config update error' }, { status: 500 });
  }
}
