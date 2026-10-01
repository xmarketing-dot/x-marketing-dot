import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import { getAllLocations } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bms_admin_auth')?.value;
    return token === 'authenticated_superadmin_session_token';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Yetkisiz erisim.' }, { status: 401 });
    }

    await connectToDatabase();

    const BASE = 'https://www.besteskort.online';

    const [listings, locations] = await Promise.all([
      ListingModel.find({ status: 'yayinda' }).select('slug ilSlug ilceSlug rozet baslik').sort({ rozet: 1, updatedAt: -1 }).lean(),
      getAllLocations(),
    ]);

    const coreUrls: string[] = [
      BASE,
      `${BASE}/sehirler`,
      `${BASE}/kategori/vip`,
      `${BASE}/kategori/gold`,
      `${BASE}/kategori/silver`,
    ];

    const megaCities = ['istanbul', 'izmir', 'ankara', 'antalya', 'bursa'];
    const cityUrls: string[] = [];
    for (const loc of locations as any[]) {
      cityUrls.push(`${BASE}/${loc.ilSlug}`);
      if (megaCities.includes(loc.ilSlug)) {
        for (const ilce of (loc.ilceler || []) as any[]) {
          if (ilce.slug) cityUrls.push(`${BASE}/${loc.ilSlug}/${ilce.slug}`);
        }
      }
    }

    const listingUrls = (listings as any[]).map((l) => `${BASE}/ilan/${l.slug}`);

    const allUrls = [...coreUrls, ...cityUrls, ...listingUrls];
    const uniqueUrls = Array.from(new Set(allUrls));

    return NextResponse.json({
      success: true,
      total: uniqueUrls.length,
      listingCount: listings.length,
      cityCount: cityUrls.length,
      coreCount: coreUrls.length,
      urls: uniqueUrls,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'URL listesi alinirken hata olustu.' },
      { status: 500 }
    );
  }
}
