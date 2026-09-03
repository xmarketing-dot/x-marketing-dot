import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BacklinkModel from '@/models/Backlink';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/backlinks
 * Tüm backlinkleri getirir
 */
export async function GET() {
  try {
    await connectToDatabase();
    const backlinks = await BacklinkModel.find().sort({ siraNo: 1, createdAt: -1 }).lean();
    return NextResponse.json({
      success: true,
      backlinks: JSON.parse(JSON.stringify(backlinks)),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/backlinks
 * Yeni backlink ekler
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { baslik, url, aciklama, anchorText, nofollow, konum, siraNo } = body;

    if (!baslik || !url) {
      return NextResponse.json({ error: 'Başlık ve URL zorunludur.' }, { status: 400 });
    }

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    await connectToDatabase();

    const newBacklink = await BacklinkModel.create({
      baslik: baslik.trim(),
      url: cleanUrl,
      aciklama: aciklama?.trim() || '',
      anchorText: anchorText?.trim() || baslik.trim(),
      nofollow: Boolean(nofollow),
      aktif: true,
      konum: konum || 'footer',
      siraNo: Number(siraNo) || 0,
      tiklamaSayisi: 0,
    });

    return NextResponse.json({ success: true, backlink: newBacklink });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/backlinks
 * Backlink durumunu değiştirir, günceller veya siler
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, updateData } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Geçersiz ID.' }, { status: 400 });
    }

    await connectToDatabase();

    if (action === 'delete') {
      await BacklinkModel.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Backlink silindi.' });
    }

    if (action === 'toggle') {
      const item = await BacklinkModel.findById(id);
      if (item) {
        item.aktif = !item.aktif;
        await item.save();
      }
      return NextResponse.json({ success: true, message: 'Durum güncellendi.' });
    }

    if (action === 'update' && updateData) {
      if (updateData.url) {
        let cleanUrl = updateData.url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        updateData.url = cleanUrl;
      }
      await BacklinkModel.findByIdAndUpdate(id, updateData);
      return NextResponse.json({ success: true, message: 'Backlink güncellendi.' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
