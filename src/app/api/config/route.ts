import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomepageConfigModel from '@/models/HomepageConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
    if (!config) {
      const created = await HomepageConfigModel.create({ key: 'singleton' });
      config = created.toObject();
    }

    return NextResponse.json(
      { config: JSON.parse(JSON.stringify(config)) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Config get error' }, { status: 500 });
  }
}
