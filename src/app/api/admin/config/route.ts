import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomepageConfigModel from '@/models/HomepageConfig';

export async function GET() {
  try {
    await connectToDatabase();
    let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
    if (!config) {
      const created = await HomepageConfigModel.create({ key: 'singleton' });
      config = created.toObject();
    }
    return NextResponse.json({ config: JSON.parse(JSON.stringify(config)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { metin, aktif } = await req.json();
    await connectToDatabase();
    const config = await HomepageConfigModel.findOneAndUpdate(
      { key: 'singleton' },
      {
        'aktifBanner.metin': metin,
        'aktifBanner.aktif': aktif,
      },
      { upsert: true, returnDocument: 'after' }
    );
    return NextResponse.json({ success: true, config: JSON.parse(JSON.stringify(config)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
