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
      return NextResponse.json({ error: 'Yetkisiz erişim. Superadmin oturumu gereklidir.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { boostLikes = true, triggerPing = true } = body;

    await connectToDatabase();

    let updatedLikesCount = 0;

    // 1. BEĞENİLERİ GÜÇLENDİR (Binler Seviyesine Çıkar)
    if (boostLikes) {
      const allListings = await ListingModel.find({});
      for (const listing of allListings) {
        let baseMin = 1200;
        let baseMax = 1950;

        if (listing.rozet === 'ultravip') {
          baseMin = 3400;
          baseMax = 5800;
        } else if (listing.rozet === 'vip') {
          baseMin = 2200;
          baseMax = 3700;
        } else if (listing.rozet === 'gold') {
          baseMin = 1500;
          baseMax = 2700;
        }

        // Eğer mevcut beğeni 1000'den küçükse veya rastgele yenilenmesi isteniyorsa
        if (!listing.likeSayisi || listing.likeSayisi < 1000) {
          const randomLikes = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
          listing.likeSayisi = randomLikes;
          await listing.save();
          updatedLikesCount++;
        }
      }
    }

    // 2. TÜM DİNAMİK URL'LERİ TOPLA VE INDEXNOW / PING ATEŞLE
    let pingResult = null;
    if (triggerPing) {
      const siteUrl = getSiteUrl();
      const [listings, locations] = await Promise.all([
        ListingModel.find({ status: 'yayinda' }).select('slug').lean(),
        getAllLocations(),
      ]);

      const urlsToSubmit: string[] = [
        siteUrl,
        `${siteUrl}/kategori/vip`,
        `${siteUrl}/kategori/gold`,
        `${siteUrl}/kategori/silver`,
        `${siteUrl}/kategori/turbanli`,
        `${siteUrl}/kategori/amator`,
        `${siteUrl}/kategori/tango`,
        `${siteUrl}/sehirler`,
        `${siteUrl}/istanbul/beylikduzu`,
        `${siteUrl}/istanbul/kadikoy`,
        `${siteUrl}/istanbul/avcilar`,
        `${siteUrl}/istanbul/esenyurt`,
        `${siteUrl}/istanbul/sisli`,
        `${siteUrl}/istanbul/besiktas`,
        `${siteUrl}/istanbul/buyukcekmece`,
        `${siteUrl}/ankara/cankaya`,
        `${siteUrl}/izmir/konak`,
      ];

      locations.forEach((loc: any) => {
        urlsToSubmit.push(`${siteUrl}/${loc.ilSlug}`);
        if (Array.isArray(loc.ilceler)) {
          loc.ilceler.forEach((ilce: any) => {
            if (ilce.slug) urlsToSubmit.push(`${siteUrl}/${loc.ilSlug}/${ilce.slug}`);
          });
        }
      });

      listings.forEach((l: any) => {
        if (l.slug) urlsToSubmit.push(`${siteUrl}/ilan/${l.slug}`);
      });

      const uniqueUrls = Array.from(new Set(urlsToSubmit));
      pingResult = await submitToIndexNow(uniqueUrls);
    }

    return NextResponse.json({
      success: true,
      updatedLikesCount,
      pingResult,
      timestamp: new Date().toISOString(),
      message: 'Süper Admin SEO Güçlendirici ve IndexNow motoru başarıyla çalıştırıldı.',
    });
  } catch (error: any) {
    console.error('Boost and ping admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'SEO motoru çalıştırılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
