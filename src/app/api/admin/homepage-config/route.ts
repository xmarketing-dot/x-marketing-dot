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
    const { heroBaslik, heroAltBaslik, bannerMetin, bannerLink, bannerAktif, bannerRozet, duyurular, sliderIlanIds, ozelIlanReklam, ozelIlanReklamlar } = await req.json();

    await connectToDatabase();

    const updateData: any = {
      'hero.baslik': heroBaslik,
      'hero.altBaslik': heroAltBaslik,
      'aktifBanner.metin': bannerMetin,
      'aktifBanner.link': bannerLink,
      'aktifBanner.aktif': bannerAktif,
      'aktifBanner.rozet': bannerRozet || '👑 VIP DUYURU',
    };

    if (ozelIlanReklam && typeof ozelIlanReklam === 'object') {
      updateData.ozelIlanReklam = ozelIlanReklam;
    }

    if (Array.isArray(ozelIlanReklamlar)) {
      updateData.ozelIlanReklamlar = ozelIlanReklamlar;
    }

    if (Array.isArray(duyurular)) {
      updateData.duyurular = duyurular;
    }

    if (Array.isArray(sliderIlanIds)) {
      updateData.sliderIlanIds = sliderIlanIds;
    }

    const config = await HomepageConfigModel.findOneAndUpdate(
      { key: 'singleton' },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: 'Config update error' }, { status: 500 });
  }
}
