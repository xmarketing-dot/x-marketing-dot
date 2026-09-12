import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import KeywordRankModel, { ICompetitor } from '@/models/KeywordRank';

export const dynamic = 'force-dynamic';

async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bms_admin_auth')?.value;
    return token === 'authenticated_superadmin_session_token';
  } catch (e) {
    return false;
  }
}

/**
 * Domain'in ağımıza veya sitemize ait olup olmadığını doğrular
 */
function isOurSiteDomain(hostname: string, targetDomain: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  const cleanTarget = targetDomain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
  const cleanTargetBase = cleanTarget.split('.')[0];

  if (cleanTarget && host.includes(cleanTarget)) return true;
  if (cleanTargetBase && cleanTargetBase.length > 3 && host.includes(cleanTargetBase)) return true;

  // Tüm ağ domainlerimiz ve subdomainlerimiz
  if (
    host.includes('devs.surf') ||
    host.includes('besteskort') ||
    host.includes('istanbuleskort') ||
    host.includes('beylikduzueskort') ||
    host.includes('beylikduzuescort') ||
    host.includes('izmireskort') ||
    host.includes('bestmarketing') ||
    host.includes('localhost')
  ) {
    return true;
  }

  return false;
}

const NOISE_DOMAINS = [
  'google.', 'gstatic.', 'youtube.', 'w3.org', 'schema.org', 'yandex.', 'ya.ru', 'yastatic.', 'mds.yandex.',
  'passport.yandex', 'mail.ru', 'bing.', 'microsoft.', 'live.com', 'msn.com', 'duckduckgo.', 'apple.',
  'twitter.', 'x.com', 'facebook.', 'instagram.', 't.me', 'telegram.', 'reddit.', 'github.', 'wikipedia.',
  'cam.ac.uk', 'who.int', 'crazygames.', 'newsmax.', 'tanstack.', 'wordplays.', 'obsproject.', 'zhihu.',
  'baidu.', 'spotify.', 'safelinks.', 'outlook.', 'office.', 'cloudflare.', 'support.google', 'googleusercontent',
  'mercadolivre', 'elevenforum', 'closeddownrestaurants', 'fitsmallbusiness', 'worldscholarshipforum', 'news12'
];

function isNoiseDomain(host: string): boolean {
  if (!host || host.length < 4) return true;
  return NOISE_DOMAINS.some(n => host.includes(n));
}

/**
 * GOOGLE SERP MOTORU (CANLI GOOGLE.COM.TR)
 */
async function scrapeGoogleSerp(
  keyword: string,
  targetDomain: string
): Promise<{ position: number; competitors: ICompetitor[] }> {
  const competitors: ICompetitor[] = [];
  let foundPosition = 0;
  const seenDomains = new Set<string>();
  let rankCounter = 1;

  try {
    const googleUrl = `https://www.google.com.tr/search?q=${encodeURIComponent(keyword)}&num=30&hl=tr&gl=tr`;
    const res = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const linkRegex = /href="([^"]+)"/g;
      let m;

      while ((m = linkRegex.exec(html)) !== null) {
        let rawHref = m[1];
        if (!rawHref) continue;

        if (rawHref.startsWith('/url?q=')) {
          const extracted = rawHref.split('/url?q=')[1]?.split('&')[0];
          if (extracted) rawHref = decodeURIComponent(extracted);
        }

        if (!rawHref.startsWith('http')) continue;

        try {
          const parsed = new URL(rawHref);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

          if (isNoiseDomain(hostname) || seenDomains.has(hostname)) {
            continue;
          }

          seenDomains.add(hostname);

          const isOurSite = isOurSiteDomain(hostname, targetDomain);

          if (isOurSite) {
            if (foundPosition === 0) {
              foundPosition = rankCounter;
            }
          } else {
            if (competitors.length < 3) {
              competitors.push({
                position: rankCounter,
                domain: hostname,
                title: hostname,
              });
            }
          }

          rankCounter++;
          if (rankCounter > 30) break;
        } catch (e) { }
      }
    }
  } catch (err) {
    console.warn('Google direct scan notice:', err);
  }

  return { position: foundPosition, competitors };
}

/**
 * YANDEX SERP MOTORU (CANLI VE %100 GERÇEK TARAMA)
 */
async function scrapeYandexSerp(
  keyword: string,
  targetDomain: string
): Promise<{ position: number; competitors: ICompetitor[] }> {
  const competitors: ICompetitor[] = [];
  let foundPosition = 0;
  const seenDomains = new Set<string>();
  let rankCounter = 1;

  try {
    const yandexUrl = `https://yandex.com.tr/search/?text=${encodeURIComponent(keyword)}&lr=11508`;
    const res = await fetch(yandexUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const linkRegex = /href="([^"]+)"/g;
      let m;

      while ((m = linkRegex.exec(html)) !== null) {
        let rawHref = m[1];
        if (!rawHref.startsWith('http')) continue;

        try {
          const parsed = new URL(rawHref);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

          if (isNoiseDomain(hostname) || seenDomains.has(hostname)) {
            continue;
          }

          seenDomains.add(hostname);

          const isOurSite = isOurSiteDomain(hostname, targetDomain);

          if (isOurSite) {
            if (foundPosition === 0) {
              foundPosition = rankCounter;
            }
          } else {
            if (competitors.length < 3) {
              competitors.push({
                position: rankCounter,
                domain: hostname,
                title: hostname,
              });
            }
          }

          rankCounter++;
          if (rankCounter > 50) break;
        } catch (e) { }
      }
    }
  } catch (err) {
    console.warn('Yandex SERP scan error:', err);
  }

  return { position: foundPosition, competitors };
}

function getReqDomain(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || '';
  return host.split(':')[0];
}

// ── GET: Tüm Takip Edilen Kelimeleri Getir ──────────────────────
export async function GET(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  let rawKeywords = await KeywordRankModel.find({}).lean();

  // Sıralama Mantığı: En iyi Yandex sıralamasına sahip olanlar (#1, #6, #9...) en üstte çıksın!
  const sortKeywords = (list: any[]) => {
    return list.sort((a: any, b: any) => {
      const posAY = typeof a.yandexPosition === 'number' && a.yandexPosition > 0 ? a.yandexPosition : 999;
      const posBY = typeof b.yandexPosition === 'number' && b.yandexPosition > 0 ? b.yandexPosition : 999;
      return posAY - posBY;
    });
  };

  if (rawKeywords.length === 0) {
    const defaultDomain = getReqDomain(req);
    const defaults = [
      'adıyaman eskort',
      'adıyaman escort',
      'beylikdüzü eskort',
      'kadıköy eskort',
      'istanbul eskort ilanları',
      'izmir eskort bayan',
      'ankara vip escort',
      'türbanlı eskort',
      'antalya eskort',
      'bursa eskort',
      'türk ifşa',
      'türk porno',
      'türkçe porno',
      'amatör türk porno',
      'konulu porno',
      'türbanlı porno',
      'hd porno izle',
      'türkçe altyazılı porno',
      'rus porno',
      'vip eskort',
    ];

    for (const kw of defaults) {
      await KeywordRankModel.create({
        keyword: kw,
        targetDomain: defaultDomain,
        currentPosition: 0,
        previousPosition: 0,
        change: 0,
        bestPosition: 0,
        topCompetitors: [],
        yandexPosition: 0,
        previousYandexPosition: 0,
        yandexChange: 0,
        yandexCompetitors: [],
      }).catch(() => { });
    }

    rawKeywords = await KeywordRankModel.find({}).lean();
  }

  const keywords = sortKeywords(rawKeywords);
  return NextResponse.json({ success: true, keywords });
}

// ── POST: Yeni Kelime Ekle veya Sil ────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const defaultDomain = getReqDomain(req);
    const { action, id, keyword, targetDomain = defaultDomain } = body;

    await connectToDatabase();

    // Silme işlemi
    if (action === 'delete' && id) {
      await KeywordRankModel.findByIdAndDelete(id);
      return NextResponse.json({ success: true, deleted: id });
    }

    // Yeni kelime ekleme
    if (!keyword || !keyword.trim()) {
      return NextResponse.json({ error: 'Anahtar kelime gereklidir' }, { status: 400 });
    }

    const cleanKw = keyword.trim().toLowerCase();

    const existing = await KeywordRankModel.findOne({ keyword: cleanKw });
    if (existing) {
      return NextResponse.json({ error: 'Bu anahtar kelime zaten takip ediliyor' }, { status: 400 });
    }

    // Yandex Canlı Tarama
    const yandexResult = await scrapeYandexSerp(cleanKw, targetDomain);

    const doc = await KeywordRankModel.create({
      keyword: cleanKw,
      targetDomain,
      currentPosition: 0,
      previousPosition: 0,
      change: 0,
      bestPosition: 0,
      topCompetitors: [],
      yandexPosition: yandexResult.position,
      previousYandexPosition: yandexResult.position,
      yandexChange: 0,
      yandexCompetitors: yandexResult.competitors,
      lastCheckedAt: new Date(),
    });

    return NextResponse.json({ success: true, keyword: doc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Hata oluştu' }, { status: 500 });
  }
}

// ── PUT: Canlı Sıralamaları Şimdi Tara ──────────────────────────
export async function PUT(req: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;

    await connectToDatabase();

    const query = id ? { _id: id } : {};
    let items = await KeywordRankModel.find(query);

    const updatedItems = [];

    for (const item of items) {
      const yandexResult = await scrapeYandexSerp(item.keyword, item.targetDomain);

      // Yandex değişim hesabı
      const prevY = item.yandexPosition || 0;
      const currY = yandexResult.position || 0;
      let changeY = 0;
      if (prevY > 0 && currY > 0) changeY = prevY - currY;
      else if (prevY === 0 && currY > 0) changeY = currY;
      else if (prevY > 0 && currY === 0) changeY = -prevY;

      item.previousYandexPosition = prevY;
      item.yandexPosition = currY;
      item.yandexChange = changeY;
      item.yandexCompetitors = yandexResult.competitors;
      item.lastCheckedAt = new Date();

      await item.save();
      updatedItems.push(item);
    }

    const rawKeywords = await KeywordRankModel.find({}).lean();

    const allKeywords = rawKeywords.sort((a: any, b: any) => {
      const posAY = typeof a.yandexPosition === 'number' && a.yandexPosition > 0 ? a.yandexPosition : 999;
      const posBY = typeof b.yandexPosition === 'number' && b.yandexPosition > 0 ? b.yandexPosition : 999;
      return posAY - posBY;
    });

    return NextResponse.json({ success: true, keywords: allKeywords, updatedCount: updatedItems.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tarama hatası' }, { status: 500 });
  }
}
