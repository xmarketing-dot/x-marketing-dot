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
    const { boostLikes = true, triggerPing = true, customSiteUrl: reqSiteUrl, customDomain: reqDomain } = body;

    await connectToDatabase();

    let updatedLikesCount = 0;

    // 1. BEĞENİLERİ GÜÇLENDİR (Binler Seviyesine Çıkar - Sadece Yayındaki Aktif İlanlar)
    if (boostLikes) {
      const activeListings = await ListingModel.find({ status: 'yayinda' }).select('_id rozet likeSayisi');
      for (const listing of activeListings) {
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
          await ListingModel.updateOne({ _id: listing._id }, { $set: { likeSayisi: randomLikes } });
          updatedLikesCount++;
        }
      }
    }

    // 2. TÜM DİNAMİK URL'LERİ TOPLA VE INDEXNOW / PING ATEŞLE
    let pingResult = null;
    if (triggerPing) {
      const rawHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
      const proto = req.headers.get('x-forwarded-proto') || 'https';
      const isLocal = !rawHost || rawHost.includes('localhost') || rawHost.includes('127.0.0.1');
      
      const defaultSiteUrl = getSiteUrl();
      let defaultHost = 'escturkiye.space';
      try {
        defaultHost = new URL(defaultSiteUrl).hostname;
      } catch {}

      let currentSiteUrl = reqSiteUrl || (isLocal ? defaultSiteUrl : `${proto}://${rawHost}`.replace(/\/+$/, ''));
      if (currentSiteUrl && !currentSiteUrl.startsWith('http://') && !currentSiteUrl.startsWith('https://')) {
        currentSiteUrl = `https://${currentSiteUrl}`;
      }
      currentSiteUrl = currentSiteUrl.replace(/\/+$/, '');

      let host = reqDomain;
      if (!host) {
        try {
          host = new URL(currentSiteUrl).hostname;
        } catch {
          host = isLocal ? defaultHost : rawHost.split(':')[0];
        }
      }
      const requestDomain = host.toLowerCase();

      const [listings, locations] = await Promise.all([
        ListingModel.find({ status: 'yayinda' }).select('slug').lean(),
        getAllLocations(),
      ]);

      // Sadece panelin şu an açık olduğu aktif domaini hedefle (başka sitelerin URL'leri karışmasın)
      const targetBaseUrls = [currentSiteUrl];
      const urlsToSubmit: string[] = [];

      for (const baseUrl of targetBaseUrls) {
        urlsToSubmit.push(
          baseUrl,
          `${baseUrl}/kategori/vip`,
          `${baseUrl}/kategori/gold`,
          `${baseUrl}/kategori/silver`,
          `${baseUrl}/kategori/turbanli`,
          `${baseUrl}/kategori/amator`,
          `${baseUrl}/kategori/tango`,
          `${baseUrl}/sehirler`,
          `${baseUrl}/istanbul/beylikduzu`,
          `${baseUrl}/istanbul/kadikoy`,
          `${baseUrl}/istanbul/avcilar`,
          `${baseUrl}/istanbul/esenyurt`,
          `${baseUrl}/istanbul/sisli`,
          `${baseUrl}/istanbul/besiktas`,
          `${baseUrl}/istanbul/buyukcekmece`,
          `${baseUrl}/ankara/cankaya`,
          `${baseUrl}/izmir/konak`
        );

        locations.forEach((loc: any) => {
          urlsToSubmit.push(`${baseUrl}/${loc.ilSlug}`);
          if (Array.isArray(loc.ilceler)) {
            loc.ilceler.forEach((ilce: any) => {
              if (ilce.slug) urlsToSubmit.push(`${baseUrl}/${loc.ilSlug}/${ilce.slug}`);
            });
          }
        });

        listings.forEach((l: any) => {
          if (l.slug) urlsToSubmit.push(`${baseUrl}/ilan/${l.slug}`);
        });
      }

      const uniqueUrls = Array.from(new Set(urlsToSubmit));

      // A. IndexNow (Yandex, Bing) & Sitemap Ping
      pingResult = await submitToIndexNow(uniqueUrls, requestDomain);

      // B. Google Official Indexing API (Anlık Googlebot Taraması)
      let googleIndexingResult = null;
      try {
        const { batchPublishUrlsToGoogle } = await import('@/lib/googleIndexing');
        googleIndexingResult = await batchPublishUrlsToGoogle(uniqueUrls.slice(0, 200));
      } catch (gErr: any) {
        console.error('Google Indexing API error in boost-and-ping:', gErr);
      }

      const firstGoogleError = googleIndexingResult?.results?.find((r: any) => !r.success)?.message;

      return NextResponse.json({
        success: true,
        updatedLikesCount,
        pingResult,
        googleIndexingResult: googleIndexingResult ? {
          total: googleIndexingResult.total,
          successCount: googleIndexingResult.successCount,
          failCount: googleIndexingResult.failCount,
          firstError: firstGoogleError,
        } : null,
        timestamp: new Date().toISOString(),
        message: `Süper Admin SEO Güçlendirici: ${uniqueUrls.length} URL IndexNow (Yandex/Bing) ve Resmi Google Indexing API'ye anında iletildi!`,
      });
    }

    return NextResponse.json({
      success: true,
      updatedLikesCount,
      pingResult: null,
      timestamp: new Date().toISOString(),
      message: 'Beğeniler başarıyla güçlendirildi.',
    });
  } catch (error: any) {
    console.error('Boost and ping admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'SEO motoru çalıştırılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
