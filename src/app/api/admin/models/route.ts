import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import VipModel from '@/models/VipModel';
import slugify from 'slugify';

export async function GET() {
  try {
    await connectToDatabase();
    const models = await VipModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ models: JSON.parse(JSON.stringify(models)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tamAd,
      slug,
      unvan,
      platformlar,
      biyografi,
      likeSayisi,
      yas,
      boy,
      kilo,
      gogusOlcusu,
      sacRengi,
      gozRengi,
      burc,
      uyruk,
      diller,
      anaFotografUrl,
      fotograflar,
    } = body;

    if (!tamAd) {
      return NextResponse.json({ error: 'Model adı zorunludur' }, { status: 400 });
    }

    await connectToDatabase();

    const targetSlug = slug 
      ? slugify(slug, { lower: true, strict: true })
      : slugify(tamAd, { lower: true, strict: true });

    const photoList = Array.isArray(fotograflar) && fotograflar.length > 0 
      ? fotograflar 
      : (anaFotografUrl ? [anaFotografUrl] : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800']);

    const newModel = await VipModel.create({
      slug: targetSlug,
      tamAd: tamAd.trim(),
      unvan: unvan || 'Dijital Fenomen & VIP Model',
      platformlar: Array.isArray(platformlar) ? platformlar : (platformlar ? platformlar.split(',').map((s: string) => s.trim()) : ['OnlyFans', 'Twitter / X', 'Instagram']),
      biyografi: biyografi || `${tamAd} resmi ve doğrulanmış VIP fenomen profil sayfasıdır.`,
      likeSayisi: likeSayisi ? Number(likeSayisi) : 24890,
      yas: yas ? Number(yas) : 25,
      boy: boy ? Number(boy) : 171,
      kilo: kilo ? Number(kilo) : 53,
      gogusOlcusu: gogusOlcusu || '85C (Doğal)',
      sacRengi: sacRengi || 'Siyah',
      gozRengi: gozRengi || 'Koyu Kahve',
      burc: burc || 'Akrep',
      uyruk: uyruk || 'Türkiye',
      diller: Array.isArray(diller) ? diller : (diller ? diller.split(',').map((s: string) => s.trim()) : ['Türkçe', 'İngilizce']),
      anaFotografUrl: anaFotografUrl || photoList[0],
      fotograflar: photoList,
      isVerified: true,
      aktif: true,
    });

    return NextResponse.json({ success: true, model: JSON.parse(JSON.stringify(newModel)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Model ID required' }, { status: 400 });
    }

    await connectToDatabase();

    if (updates.slug) {
      updates.slug = slugify(updates.slug, { lower: true, strict: true });
    }

    if (updates.diller && typeof updates.diller === 'string') {
      updates.diller = updates.diller.split(',').map((s: string) => s.trim());
    }

    if (updates.platformlar && typeof updates.platformlar === 'string') {
      updates.platformlar = updates.platformlar.split(',').map((s: string) => s.trim());
    }

    const updated = await VipModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Model bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, model: JSON.parse(JSON.stringify(updated)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await VipModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
