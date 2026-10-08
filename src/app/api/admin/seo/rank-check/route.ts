import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import KeywordRankModel, { ICompetitor } from '@/models/KeywordRank';
import crypto from 'crypto';

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
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return host;
    }
  } catch (e) {}
  return 'besteskort.online';
}

const EXACT_OUR_DOMAINS = new Set([
  'besteskort.online',
  'www.besteskort.online',
  'besteskort.devs.surf',
  'www.besteskort.devs.surf',
  'istanbuleskort.devs.surf',
  'beylikduzueskort.devs.surf',
  'beylikduzuescort.devs.surf',
  'izmireskort.devs.surf',
  'bestescort.vercel.app',
  'besteskort.vercel.app',
]);

/**
 * Domain'in kesin ve net olarak bizim belirlediğimiz listedeki domainlere ait olduğunu doğrular.
 */
function isOurSiteDomain(hostname: string, targetDomain?: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '').trim();
  const rawHost = hostname.toLowerCase().trim();

  // 1. Wildcard: Tüm .devs.surf alt alan adları bize aittir
  if (host.endsWith('.devs.surf') || host === 'devs.surf' || rawHost.includes('devs.surf')) {
    return true;
  }

  // 2. Marka domainleri: besteskort / bestescort içeren tüm alan adları
  if (host.includes('besteskort') || host.includes('bestescort')) {
    return true;
  }

  // 3. Kesin olarak bizim sahip olduğumuz tam domain listesi
  if (EXACT_OUR_DOMAINS.has(rawHost) || EXACT_OUR_DOMAINS.has(host)) {
    return true;
  }

  // 4. Takip kaydında özel olarak belirtilmiş spesifik hedef domain varsa
  if (targetDomain) {
    const cleanTarget = targetDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .toLowerCase()
      .replace(/^www\./, '')
      .trim();

    if (cleanTarget && (host === cleanTarget || rawHost === cleanTarget)) {
      return true;
    }
  }

  return false;
}

const NOISE_DOMAINS = [
  'google.', 'gstatic.', 'youtube.', 'w3.org', 'schema.org', 'yandex.', 'ya.ru', 'yastatic.', 'mds.yandex.',
  'passport.yandex', 'mail.ru', 'bing.', 'microsoft.', 'live.com', 'msn.com', 'duckduckgo.', 'apple.',
  'twitter.', 'x.com', 'facebook.', 'instagram.', 't.me', 'telegram.', 'reddit.', 'github.', 'wikipedia.',
  'cam.ac.uk', 'who.int', 'crazygames.', 'newsmax.', 'tanstack.', 'wordplays.', 'obsproject.', 'zhihu.',
  'baidu.', 'spotify.', 'safelinks.', 'outlook.', 'office.', 'cloudflare.', 'support.google', 'googleusercontent',
  'mercadolivre', 'elevenforum', 'closeddownrestaurants', 'fitsmallbusiness', 'worldscholarshipforum', 'news12',
  'vk.ru', 'vk.com', 'ok.ru', 'tiktok.com'
];

function isNoiseDomain(host: string): boolean {
  if (!host || host.length < 4) return true;
  return NOISE_DOMAINS.some(n => host.includes(n));
}

/**
 * GOOGLE & ORGANİK ARAMA MOTORU (SERPER POOL + DUCKDUCKGO TR ORGANİK YEDEK)
 * 1. Serper API anahtarlarını kontrol eder (process.env veya aktif anahtar).
 * 2. Eğer Serper kredisi yetersizse veya hata verirse, ANINDA DuckDuckGo Türkiye organik indeksine geçer.
 * 3. Böylece kredi bitse bile sıralama takibi asla sıfırlanmaz, kesintisiz çalışır.
 */
async function scrapeGoogleSerp(
  keyword: string,
  targetDomain: string,
  customApiKey?: string
): Promise<{ position: number; competitors: ICompetitor[]; foundUrl?: string; foundDomain?: string; engine: 'google' | 'ddg_organic' | 'none' }> {
  // 1. ADIM: Serper API Anahtar Havuzunu Dene
  const keyCandidates: string[] = [];
  if (customApiKey && customApiKey.trim()) keyCandidates.push(customApiKey.trim());
  if (process.env.SERPER_API_KEYS) {
    process.env.SERPER_API_KEYS.split(',').map(k => k.trim()).filter(Boolean).forEach(k => keyCandidates.push(k));
  }
  if (process.env.SERPER_API_KEY) {
    keyCandidates.push(process.env.SERPER_API_KEY.trim());
  }
  // Standart fallback anahtarı
  keyCandidates.push('8078961d0c92f23ce765317915a6a500b20c2889');

  const uniqueKeys = [...new Set(keyCandidates)];

  for (const apiKey of uniqueKeys) {
    try {
      const serperUrl = `https://google.serper.dev/search`;
      const pagePromises = Array.from({ length: 5 }, (_, i) => i + 1).map(page =>
        fetch(serperUrl, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: keyword,
            gl: 'tr',
            hl: 'tr',
            page
          }),
          signal: AbortSignal.timeout(6000)
        })
          .then(async r => {
            if (!r.ok) return { page, organic: [], creditError: r.status === 400 };
            const data = await r.json();
            return { page, organic: data.organic || [], creditError: false };
          })
          .catch(() => ({ page, organic: [], creditError: false }))
      );

      const pagesData = await Promise.all(pagePromises);
      const hasCreditError = pagesData.some(p => p.creditError);
      if (hasCreditError) {
        // Kredi bitti, sonraki anahtarı veya DDG'yi dene
        continue;
      }

      pagesData.sort((a, b) => a.page - b.page);

      const competitors: ICompetitor[] = [];
      let foundPosition = 0;
      let foundUrl = '';
      let foundDomain = '';
      const seenDomains = new Set<string>();

      for (const pageItem of pagesData) {
        const pageNum = pageItem.page;
        const organicResults = pageItem.organic;

        organicResults.forEach((result: any, idx: number) => {
          if (!result.link || !result.link.startsWith('http')) return;

          try {
            const parsed = new URL(result.link);
            const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

            if (isNoiseDomain(hostname) || seenDomains.has(hostname)) return;
            seenDomains.add(hostname);

            const realPos = (pageNum - 1) * 10 + (idx + 1);
            const isOurSite = isOurSiteDomain(hostname, targetDomain);

            if (isOurSite) {
              if (foundPosition === 0) {
                foundPosition = realPos;
                foundUrl = result.link;
                foundDomain = hostname;
              }
            } else {
              if (competitors.length < 3) {
                competitors.push({
                  position: realPos,
                  domain: hostname,
                  title: result.title || hostname,
                });
              }
            }
          } catch (e) {}
        });
      }

      if (seenDomains.size > 0 || foundPosition > 0) {
        return { position: foundPosition, competitors, foundUrl, foundDomain, engine: 'google' };
      }
    } catch (err) {
      // Sonraki seçeneğe geç
    }
  }

  // 2. ADIM: DuckDuckGo Türkiye Organik İndeksine Geç (0 Kredi, 0 Ücret, %100 Ücretsiz Fallback)
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}&kl=tr-tr`;
    const res = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
      },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const html = await res.text();
      const rawLinks = [...html.matchAll(/uddg=([^&"]+)/g)].map(m => decodeURIComponent(m[1]));
      const cleanUrls = [...new Set(rawLinks)].filter(u => u.startsWith('http') && !u.includes('duckduckgo.com'));

      let foundPosition = 0;
      let foundUrl = '';
      let foundDomain = '';
      const competitors: ICompetitor[] = [];
      const seenDomains = new Set<string>();
      let rankCounter = 1;

      for (const link of cleanUrls) {
        try {
          const parsed = new URL(link);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
          if (isNoiseDomain(hostname) || seenDomains.has(hostname)) continue;
          seenDomains.add(hostname);

          const isOurSite = isOurSiteDomain(hostname, targetDomain);
          if (isOurSite) {
            if (foundPosition === 0) {
              foundPosition = rankCounter;
              foundUrl = link;
              foundDomain = hostname;
            }
          } else if (competitors.length < 3) {
            competitors.push({
              position: rankCounter,
              domain: hostname,
              title: hostname,
            });
          }
          rankCounter++;
          if (rankCounter > 50) break;
        } catch (e) {}
      }

      return { position: foundPosition, competitors, foundUrl, foundDomain, engine: 'ddg_organic' };
    }
  } catch (ddgErr) {
    // Silent
  }

  return { position: 0, competitors: [], foundUrl: '', foundDomain: '', engine: 'none' };
}

/**
 * Gerçekçi iPhone / Mobil Parmak İzi Oluşturucu (Yandex Captcha Engelleyici)
 */
function generateRealisticYandexHeaders() {
  const ts = Math.floor(Date.now() / 1000);
  const uid = Math.floor(Math.random() * 900000000 + 100000000);
  const fuid = crypto.randomBytes(16).toString('hex');
  const yandexuid = `${uid}${ts}`;
  const yp = `${ts + 31536000}.ygu.1#${ts + 31536000}.sp.1`;
  const ys = `udn.cDrFn21haWwucnU%3D#wprid.${ts}${Math.floor(Math.random()*900000+100000)}-${Math.floor(Math.random()*900000000+100000000)}-touch-TURKEY`;
  const cookie = `yandexuid=${yandexuid}; fuid01=${fuid}; yp=${yp}; ys=${ys}; mda=0; i=${crypto.randomBytes(12).toString('base64')}; my=YycCAQA=; is_gdpr=0; is_gdpr_b=CP+dEBCc3wE=; font_loaded=ys-4-text-regular`;

  return {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Cookie': cookie,
    'Referer': 'https://yandex.com.tr/',
  };
}

/**
 * Yandex Touch HTML & JSON Payload İçinden Tüm Organik Linkleri Çıkarıcı
 */
function extractUrlsFromYandexHtml(html: string): string[] {
  const unescaped = html
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\u002F/g, '/')
    .replace(/\\u0022/g, '"')
    .replace(/\\"/g, '"');

  const regexes = [
    /href="([^"]+)"/g,
    /"url"\s*:\s*"([^"]+)"/g,
    /"greenUrl"\s*:\s*\{"url"\s*:\s*"([^"]+)"/g,
    /"link"\s*:\s*"([^"]+)"/g,
    /"path"\s*:\s*"([^"]+)"/g,
    /"rawUrl"\s*:\s*"([^"]+)"/g,
    /data-url="([^"]+)"/g,
  ];

  const found: string[] = [];
  for (const rx of regexes) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(unescaped)) !== null) {
      const val = m[1];
      if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
        found.push(val);
      }
    }
  }

  return found;
}

/**
 * YANDEX SERP MOTORU (MULTI-MIRROR FAILOVER + GERÇEKÇİ PARMAK İZİ)
 */
async function scrapeYandexSerp(
  keyword: string,
  targetDomain: string
): Promise<{ position: number; competitors: ICompetitor[]; foundUrl?: string; foundDomain?: string; isBlocked: boolean }> {
  const competitors: ICompetitor[] = [];
  let foundPosition = 0;
  let foundUrl = '';
  let foundDomain = '';
  const seenDomains = new Set<string>();
  let rankCounter = 1;
  let scannedAnyValidPage = false;

  const mirrors = [
    (p: number) => `https://yandex.com.tr/search/touch/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
    (p: number) => `https://ya.ru/search/touch/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
    (p: number) => `https://yandex.com/search/touch/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
    (p: number) => `https://yandex.com.tr/search/?text=${encodeURIComponent(keyword)}&lr=11508${p > 0 ? `&p=${p}` : ''}`,
  ];

  const pages = [0, 1, 2, 3]; // İlk 4 sayfa (~40-50 sonuç)

  for (const pageIdx of pages) {
    if (foundPosition > 0) break;

    let pageSuccess = false;

    for (const makeUrl of mirrors) {
      if (pageSuccess) break;

      try {
        const url = makeUrl(pageIdx);
        const headers = generateRealisticYandexHeaders();
        const res = await fetch(url, { headers });

        if (res.ok) {
          const html = await res.text();
          const isBlockedHtml = html.includes('SmartCaptcha') || html.includes('Verification') || html.length < 4000;

          if (isBlockedHtml) {
            continue;
          }

          const extractedUrls = extractUrlsFromYandexHtml(html);
          if (extractedUrls.length === 0) continue;

          scannedAnyValidPage = true;
          pageSuccess = true;

          for (const rawHref of extractedUrls) {
            try {
              const parsed = new URL(rawHref);
              const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

              if (isNoiseDomain(hostname) || seenDomains.has(hostname)) {
                continue;
              }

              seenDomains.add(hostname);

              const isOurSite =
                rawHref.includes('besteskort') ||
                rawHref.includes('bestescort') ||
                rawHref.includes('devs.surf') ||
                isOurSiteDomain(hostname, targetDomain);

              if (isOurSite) {
                if (foundPosition === 0) {
                  foundPosition = rankCounter;
                  foundUrl = rawHref;
                  foundDomain = hostname;
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
              if (rankCounter > 60) break;
            } catch (e) {}
          }
        }
      } catch (err) {
        // Devam et
      }
    }

    if (pageIdx < 3 && foundPosition === 0) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  const isBlocked = !scannedAnyValidPage && foundPosition === 0;
  return { position: foundPosition, competitors, foundUrl, foundDomain, isBlocked };
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
      'tekirdağ eskort',
      'yalova escort',
      'beylikdüzü eskort',
      'kadıköy eskort',
      'ümraniye escort',
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
    const { action, id, keyword, targetDomain, serperApiKey } = body;
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

    // Canlı Taramalar
    const yandexResult = await scrapeYandexSerp(cleanKw, cleanTargetDomain);
    const googleResult = await scrapeGoogleSerp(cleanKw, cleanTargetDomain, serperApiKey);

    const doc = await KeywordRankModel.create({
      keyword: cleanKw,
      targetDomain: cleanTargetDomain,
      currentPosition: googleResult.position,
      previousPosition: googleResult.position,
      change: 0,
      bestPosition: googleResult.position,
      topCompetitors: googleResult.competitors,
      googleFoundUrl: googleResult.foundUrl || '',
      googleFoundDomain: googleResult.foundDomain || '',
      googleFoundEngine: googleResult.engine || 'none',
      yandexPosition: yandexResult.position,
      previousYandexPosition: yandexResult.position,
      yandexChange: 0,
      yandexCompetitors: yandexResult.competitors,
      yandexFoundUrl: yandexResult.foundUrl || '',
      yandexFoundDomain: yandexResult.foundDomain || '',
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
    const { id, serperApiKey } = body;

    await connectToDatabase();

    const query = id ? { _id: id } : {};
    const items = await KeywordRankModel.find(query);

    const updatedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const cleanTarget = !item.targetDomain || item.targetDomain.includes('localhost')
        ? getPrimaryDomain()
        : item.targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();
      item.targetDomain = cleanTarget;

      const yandexResult = await scrapeYandexSerp(item.keyword, cleanTarget);
      const googleResult = await scrapeGoogleSerp(item.keyword, cleanTarget, serperApiKey);

      // Yandex değişim hesabı & Blokaj Koruması
      const prevY = item.yandexPosition || 0;
      let currY = yandexResult.position || 0;
      let changeY = 0;

      if (yandexResult.isBlocked && currY === 0 && prevY > 0) {
        // Blokaj / Captcha durumunda önceki başarılı sıralamayı koru, sıfırlama!
        currY = prevY;
        changeY = 0;
      } else {
        if (prevY > 0 && currY > 0) changeY = prevY - currY;
        else if (prevY === 0 && currY > 0) changeY = currY;
        else if (prevY > 0 && currY === 0) changeY = -prevY;
      }

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
      if (yandexResult.competitors && yandexResult.competitors.length > 0) {
        item.yandexCompetitors = yandexResult.competitors;
      }
      if (yandexResult.foundUrl) item.yandexFoundUrl = yandexResult.foundUrl;
      if (yandexResult.foundDomain) item.yandexFoundDomain = yandexResult.foundDomain;

      item.previousPosition = prevG;
      item.currentPosition = currG;
      item.change = changeG;
      item.topCompetitors = googleResult.competitors;
      item.googleFoundUrl = googleResult.foundUrl || '';
      item.googleFoundDomain = googleResult.foundDomain || '';
      item.googleFoundEngine = googleResult.engine || 'none';
      if (currG > 0 && (item.bestPosition === 0 || currG < item.bestPosition)) {
        item.bestPosition = currG;
      }

      item.lastCheckedAt = new Date();

      await item.save();
      updatedItems.push(item);

      if (items.length > 1 && i < items.length - 1) {
        await new Promise(res => setTimeout(res, 500));
      }
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
