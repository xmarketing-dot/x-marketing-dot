import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import KeywordRankModel, { ICompetitor } from '@/models/KeywordRank';

import { getSiteUrl } from '@/lib/siteUrl';

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
 * Sistemde o an aktif olan birincil alan adını (.env veya siteUrl yardımcısından) dinamik olarak alır.
 */
function getPrimaryDomain(): string {
  try {
    const raw = getSiteUrl();
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch (e) {
    return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'besteskort.online')
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
}

/**
 * Domain'in dinamik olarak sitemize ait olup olmadığını doğrular
 */
function isOurSiteDomain(hostname: string, targetDomain?: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '').trim();
  const primary = getPrimaryDomain();

  if (targetDomain) {
    const cleanTarget = targetDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .replace(/^www\./, '')
      .trim();

    if (cleanTarget && (host === cleanTarget || host.endsWith('.' + cleanTarget))) {
      return true;
    }
  }

  if (primary && (host === primary || host.endsWith('.' + primary))) {
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
    const serperUrl = `https://google.serper.dev/search`;
    const res = await fetch(serperUrl, {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY || '8078961d0c92f23ce765317915a6a500b20c2889',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: keyword,
        gl: 'tr',
        hl: 'tr',
        num: 30
      })
    });

    if (res.ok) {
      const data = await res.json();
      const organicResults = data.organic || [];

      for (const result of organicResults) {
        if (!result.link || !result.link.startsWith('http')) continue;

        try {
          const parsed = new URL(result.link);
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
    // Silent
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
    // Silent
  }

  return { position: foundPosition, competitors };
}

function getReqDomain(req: NextRequest): string {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0].toLowerCase();
  if (!host || host.includes('localhost') || host.includes('127.0.0.1')) {
    return getPrimaryDomain();
  }
  return host;
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
      'kayseri eskort',
      'kayseri escort',
      'diyarbakır eskort',
      'diyarbakır escort',
      'adıyaman eskort',
      'adıyaman escort',
      'sinop eskort',
      'sinop escort',
      'hakkari eskort',
      'hakkari escort',
      'kars eskort',
      'bitlis eskort',
      'aydın eskort',
      'beylikdüzü eskort',
      'kadıköy eskort',
      'istanbul eskort ilanları',
      'izmir eskort bayan',
      'ankara vip escort',
      'türbanlı eskort',
      'antalya eskort',
      'bursa eskort',
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
    const { action, id, keyword, targetDomain } = body;
    const rawTarget = targetDomain || defaultDomain;
    const cleanTargetDomain = !rawTarget || rawTarget.includes('localhost')
      ? getPrimaryDomain()
      : rawTarget.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();

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
    const yandexResult = await scrapeYandexSerp(cleanKw, cleanTargetDomain);
    // Google Serper Canlı Tarama
    const googleResult = await scrapeGoogleSerp(cleanKw, cleanTargetDomain);

    const doc = await KeywordRankModel.create({
      keyword: cleanKw,
      targetDomain: cleanTargetDomain,
      currentPosition: googleResult.position,
      previousPosition: googleResult.position,
      change: 0,
      bestPosition: googleResult.position,
      topCompetitors: googleResult.competitors,
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
      const cleanTarget = !item.targetDomain || item.targetDomain.includes('localhost')
        ? getPrimaryDomain()
        : item.targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
      item.targetDomain = cleanTarget;

      const yandexResult = await scrapeYandexSerp(item.keyword, cleanTarget);
      const googleResult = await scrapeGoogleSerp(item.keyword, cleanTarget);

      // Yandex değişim hesabı
      const prevY = item.yandexPosition || 0;
      const currY = yandexResult.position || 0;
      let changeY = 0;
      if (prevY > 0 && currY > 0) changeY = prevY - currY;
      else if (prevY === 0 && currY > 0) changeY = currY;
      else if (prevY > 0 && currY === 0) changeY = -prevY;

      // Google değişim hesabı
      const prevG = item.currentPosition || 0;
      const currG = googleResult.position || 0;
      let changeG = 0;
      if (prevG > 0 && currG > 0) changeG = prevG - currG;
      else if (prevG === 0 && currG > 0) changeG = currG;
      else if (prevG > 0 && currG === 0) changeG = -prevG;

      item.previousYandexPosition = prevY;
      item.yandexPosition = currY;
      item.yandexChange = changeY;
      item.yandexCompetitors = yandexResult.competitors;

      item.previousPosition = prevG;
      item.currentPosition = currG;
      item.change = changeG;
      item.topCompetitors = googleResult.competitors;
      if (currG > 0 && (item.bestPosition === 0 || currG < item.bestPosition)) {
        item.bestPosition = currG;
      }

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
