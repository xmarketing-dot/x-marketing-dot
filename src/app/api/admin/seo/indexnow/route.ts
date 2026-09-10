import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import { getAllLocations } from '@/lib/data';
import { getSiteUrl } from '@/lib/siteUrl';
import { submitToIndexNow } from '@/lib/indexnow';

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

export async function POST(req: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { customUrls, allPages } = body;

    const siteUrl = getSiteUrl();
    let urlsToSubmit: string[] = [];

    if (Array.isArray(customUrls) && customUrls.length > 0) {
      urlsToSubmit = customUrls;
    } else if (allPages) {
      await connectToDatabase();
      const [listings, locations] = await Promise.all([
        ListingModel.find({ status: 'yayinda' }).select('slug').lean(),
        getAllLocations(),
      ]);

      // Ana sayfalar
      urlsToSubmit.push(
        siteUrl,
        `${siteUrl}/kategori/vip`,
        `${siteUrl}/kategori/gold`,
        `${siteUrl}/kategori/silver`,
        `${siteUrl}/kategori/turbanli`,
        `${siteUrl}/kategori/amator`,
        `${siteUrl}/kategori/tango`,
        `${siteUrl}/sehirler`
      );

      // Şehirler
      locations.slice(0, 30).forEach((loc: any) => {
        urlsToSubmit.push(`${siteUrl}/${loc.ilSlug}`);
      });

      // İlanlar
      listings.forEach((l: any) => {
        if (l.slug) urlsToSubmit.push(`${siteUrl}/ilan/${l.slug}`);
      });
    } else {
      // Varsayılan: Son 50 ilan ve ana sayfalar
      await connectToDatabase();
      const listings = await ListingModel.find({ status: 'yayinda' })
        .sort({ updatedAt: -1 })
        .limit(50)
        .select('slug')
        .lean();

      urlsToSubmit.push(
        siteUrl,
        `${siteUrl}/kategori/vip`,
        `${siteUrl}/kategori/gold`,
        `${siteUrl}/kategori/silver`,
        `${siteUrl}/sehirler`
      );

      listings.forEach((l: any) => {
        if (l.slug) urlsToSubmit.push(`${siteUrl}/ilan/${l.slug}`);
      });
    }

    const result = await submitToIndexNow(urlsToSubmit);

    return NextResponse.json({
      success: result.success,
      submittedCount: result.submittedCount,
      message: result.message,
      endpoints: result.endpoints,
    });
  } catch (error: any) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json(
      { error: error.message || 'IndexNow gönderimi başarısız oldu.' },
      { status: 500 }
    );
  }
}
