import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import BacklinkModel from '@/models/Backlink';

export const dynamic = 'force-dynamic';

/**
 * GET /api/backlinks
 * Sitede gösterilecek aktif backlinkleri döner (footer/header)
 */
export async function GET() {
  try {
    await connectToDatabase();
    const backlinks = await BacklinkModel.find({ aktif: true })
      .sort({ siraNo: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      backlinks: JSON.parse(JSON.stringify(backlinks)),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/backlinks/click
 * Backlink tıklama sayacını +1 artırır
 */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await connectToDatabase();
    await BacklinkModel.findByIdAndUpdate(id, {
      $inc: { tiklamaSayisi: 1 },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
