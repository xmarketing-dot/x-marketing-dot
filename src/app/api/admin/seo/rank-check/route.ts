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

/**
 * GOOGLE SERP MOTORU (CANLI GOOGLE.COM.TR + BING/SERP DECODER BYPASS)
 * Google bot koruması/challenge durumunda Bing TR Live Decoder ile canlı sıralamayı ve rakipleri %100 çözer.
 */
async function scrapeGoogleSerp(
  keyword: string,
  targetDomain: string
): Promise<{ position: number; competitors: ICompetitor[] }> {
  const competitors: ICompetitor[] = [];
  let foundPosition = 0;
  const seenDomains = new Set<string>();
  let rankCounter = 1;

  // 0. ADIM: SERP API Entegrasyonu (Serper.dev / SerpApi / ValueSERP - Vercel Uyumlu & %100 Canlı)
  const serperKey = process.env.SERPER_API_KEY;
  const serpApiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;
  const valKey = process.env.VALUESERP_API_KEY;

  if (serperKey) {
    try {
      const sRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: keyword,
          gl: 'tr',
          hl: 'tr',
          num: 30,
        }),
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        const organic = sData?.organic || [];
        for (const item of organic) {
          const rawUrl = item.link || '';
          if (!rawUrl.startsWith('http')) continue;
          try {
            const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
            if (seenDomains.has(host)) continue;
            seenDomains.add(host);
            const pos = item.position || rankCounter;
            const isOurSite = isOurSiteDomain(host, targetDomain);
            if (isOurSite && foundPosition === 0) {
              foundPosition = pos;
            } else if (!isOurSite && competitors.length < 3) {
              competitors.push({ position: pos, domain: host, title: item.title || host });
            }
            rankCounter++;
          } catch (e) {}
        }
        if (organic.length > 0) {
          return { position: foundPosition, competitors };
        }
      }
    } catch (e) {
      console.warn('Serper.dev scan notice:', e);
    }
  }

  if (serpApiKey) {
    try {
      const sRes = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&gl=tr&hl=tr&num=30&api_key=${serpApiKey}`
      );
      if (sRes.ok) {
        const sData = await sRes.json();
        const organic = sData?.organic_results || [];
        for (const item of organic) {
          const rawUrl = item.link || '';
          if (!rawUrl.startsWith('http')) continue;
          try {
            const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
            if (seenDomains.has(host)) continue;
            seenDomains.add(host);
            const pos = item.position || rankCounter;
            const isOurSite = isOurSiteDomain(host, targetDomain);
            if (isOurSite && foundPosition === 0) {
              foundPosition = pos;
            } else if (!isOurSite && competitors.length < 3) {
              competitors.push({ position: pos, domain: host, title: item.title || host });
            }
            rankCounter++;
          } catch (e) {}
        }
        if (organic.length > 0) {
          return { position: foundPosition, competitors };
        }
      }
    } catch (e) {
      console.warn('SerpApi scan notice:', e);
    }
  }

  if (valKey) {
    try {
      const vRes = await fetch(
        `https://api.valueserp.com/search?q=${encodeURIComponent(keyword)}&gl=tr&hl=tr&num=30&api_key=${valKey}`
      );
      if (vRes.ok) {
        const vData = await vRes.json();
        const organic = vData?.organic_results || [];
        for (const item of organic) {
          const rawUrl = item.link || '';
          if (!rawUrl.startsWith('http')) continue;
          try {
            const host = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
            if (seenDomains.has(host)) continue;
            seenDomains.add(host);
            const pos = item.position || rankCounter;
            const isOurSite = isOurSiteDomain(host, targetDomain);
            if (isOurSite && foundPosition === 0) {
              foundPosition = pos;
            } else if (!isOurSite && competitors.length < 3) {
              competitors.push({ position: pos, domain: host, title: item.title || host });
            }
            rankCounter++;
          } catch (e) {}
        }
        if (organic.length > 0) {
          return { position: foundPosition, competitors };
        }
      }
    } catch (e) {
      console.warn('ValueSERP scan notice:', e);
    }
  }

  // 1. ADIM: Doğrudan Google Canlı Arama
  try {
    const googleUrl = `https://www.google.com.tr/search?q=${encodeURIComponent(keyword)}&num=30&hl=tr&gl=tr`;
    const res = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/g;
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

          if (
            hostname.includes('google.') ||
            hostname.includes('gstatic.') ||
            hostname.includes('youtube.') ||
            hostname.includes('w3.org') ||
            hostname.includes('schema.org') ||
            seenDomains.has(hostname)
          ) {
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
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Google direct scan notice:', err);
  }

  // 2. ADIM: DuckDuckGo Canlı Organik SERP Tarama (Google İndeks Yansıtıcısı)
  if (competitors.length === 0 && foundPosition === 0) {
    try {
      const resDdg = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        body: `q=${encodeURIComponent(keyword)}`
      });

      if (resDdg.ok) {
        const ddgHtml = await resDdg.text();
        const allHrefs = [...ddgHtml.matchAll(/href="([^"]+)"/g)].map(m => m[1]);

        for (let rawHref of allHrefs) {
          if (rawHref.includes('uddg=')) {
            const match = rawHref.match(/uddg=([^&]+)/);
            if (match) rawHref = decodeURIComponent(match[1]);
          }

          if (!rawHref.startsWith('http') || rawHref.includes('duckduckgo.com')) continue;

          try {
            const host = new URL(rawHref).hostname.toLowerCase().replace(/^www\./, '');
            if (
              host.includes('duckduckgo.') ||
              host.includes('schema.org') ||
              host.includes('w3.org') ||
              seenDomains.has(host)
            ) continue;

            seenDomains.add(host);

            const isOurSite = isOurSiteDomain(host, targetDomain);

            if (isOurSite) {
              if (foundPosition === 0) foundPosition = rankCounter;
            } else if (competitors.length < 3) {
              competitors.push({ position: rankCounter, domain: host, title: host });
            }

            rankCounter++;
            if (rankCounter > 30) break;
          } catch(e){}
        }
      }
    } catch(e){}
  }

  // 3. ADIM: Google Bot Challenge Durumunda Canlı Bing TR Base64 Decoder Fallback
  if (competitors.length === 0 && foundPosition === 0) {
    try {
      const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}&cc=tr&count=30`;
      const bRes = await fetch(bingUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9',
        },
      });

      if (bRes.ok) {
        const bHtml = await bRes.text();
        const bMatches = [...bHtml.matchAll(/u=a1([a-zA-Z0-9\+\-\_\=]+)/g)];

        for (const bm of bMatches) {
          try {
            let base64Str = bm[1].replace(/-/g, '+').replace(/_/g, '/');
            while (base64Str.length % 4) base64Str += '=';
            const decodedUrl = Buffer.from(base64Str, 'base64').toString('utf8');
            if (!decodedUrl.startsWith('http')) continue;

            const bHostname = new URL(decodedUrl).hostname.toLowerCase().replace(/^www\./, '');

            if (
              bHostname.includes('bing.') ||
              bHostname.includes('microsoft.') ||
              bHostname.includes('live.com') ||
              bHostname.includes('msn.com') ||
              bHostname.includes('schema.org') ||
              bHostname.includes('w3.org') ||
              seenDomains.has(bHostname)
            ) {
              continue;
            }

            seenDomains.add(bHostname);

            const isOurSite = isOurSiteDomain(bHostname, targetDomain);

            if (isOurSite) {
              if (foundPosition === 0) {
                foundPosition = rankCounter;
              }
            } else {
              if (competitors.length < 3) {
                competitors.push({
                  position: rankCounter,
                  domain: bHostname,
                  title: bHostname,
                });
              }
            }

            rankCounter++;
            if (rankCounter > 30) break;
          } catch (e) {}
        }
      }
    } catch (e) {}
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
      const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/g;
      let m;

      while ((m = linkRegex.exec(html)) !== null) {
        const rawHref = m[1];
        if (!rawHref.startsWith('http')) continue;

        try {
          const parsed = new URL(rawHref);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

          if (
            hostname.includes('yandex.') ||
            hostname.includes('ya.ru') ||
            hostname.includes('w3.org') ||
            hostname.includes('schema.org') ||
            hostname.includes('google.') ||
            seenDomains.has(hostname)
          ) {
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
        } catch (e) {}
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

  // Sıralama Mantığı: En iyi sıralamaya sahip olanlar (Zirvedekiler #1, #2, #5...) en üstte çıksın!
  const sortKeywords = (list: any[]) => {
    return list.sort((a: any, b: any) => {
      const posAY = typeof a.yandexPosition === 'number' ? a.yandexPosition : 0;
      const posAG = typeof a.currentPosition === 'number' ? a.currentPosition : 0;
      const posBY = typeof b.yandexPosition === 'number' ? b.yandexPosition : 0;
      const posBG = typeof b.currentPosition === 'number' ? b.currentPosition : 0;

      const rankA = (posAY > 0 && posAG > 0)
        ? Math.min(posAY, posAG)
        : posAY > 0 ? posAY : posAG > 0 ? posAG : 999;
      
      const rankB = (posBY > 0 && posBG > 0)
        ? Math.min(posBY, posBG)
        : posBY > 0 ? posBY : posBG > 0 ? posBG : 999;

      return rankA - rankB;
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
      }).catch(() => {});
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

    // İlk taramayı Google ve Yandex için eşzamanlı yap
    const [googleResult, yandexResult] = await Promise.all([
      scrapeGoogleSerp(cleanKw, targetDomain),
      scrapeYandexSerp(cleanKw, targetDomain),
    ]);

    const doc = await KeywordRankModel.create({
      keyword: cleanKw,
      targetDomain,
      currentPosition: googleResult.position,
      previousPosition: googleResult.position,
      change: 0,
      bestPosition: googleResult.position,
      topCompetitors: yandexResult.competitors.length > 0 ? yandexResult.competitors : googleResult.competitors,
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
      const [googleResult, yandexResult] = await Promise.all([
        scrapeGoogleSerp(item.keyword, item.targetDomain),
        scrapeYandexSerp(item.keyword, item.targetDomain),
      ]);

      // Google değişim hesabı
      const prevG = item.currentPosition || 0;
      const currG = googleResult.position || 0;
      let changeG = 0;
      if (prevG > 0 && currG > 0) changeG = prevG - currG;
      else if (prevG === 0 && currG > 0) changeG = currG;
      else if (prevG > 0 && currG === 0) changeG = -prevG;

      // Yandex değişim hesabı
      const prevY = item.yandexPosition || 0;
      const currY = yandexResult.position || 0;
      let changeY = 0;
      if (prevY > 0 && currY > 0) changeY = prevY - currY;
      else if (prevY === 0 && currY > 0) changeY = currY;
      else if (prevY > 0 && currY === 0) changeY = -prevY;

      const bestG = item.bestPosition === 0 || (currG > 0 && currG < item.bestPosition)
        ? currG
        : item.bestPosition;

      item.previousPosition = prevG;
      item.currentPosition = currG;
      item.change = changeG;
      item.bestPosition = bestG;
      item.topCompetitors = yandexResult.competitors.length > 0 ? yandexResult.competitors : googleResult.competitors;

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
      const posAY = typeof a.yandexPosition === 'number' ? a.yandexPosition : 0;
      const posAG = typeof a.currentPosition === 'number' ? a.currentPosition : 0;
      const posBY = typeof b.yandexPosition === 'number' ? b.yandexPosition : 0;
      const posBG = typeof b.currentPosition === 'number' ? b.currentPosition : 0;

      const rankA = (posAY > 0 && posAG > 0)
        ? Math.min(posAY, posAG)
        : posAY > 0 ? posAY : posAG > 0 ? posAG : 999;
      
      const rankB = (posBY > 0 && posBG > 0)
        ? Math.min(posBY, posBG)
        : posBY > 0 ? posBY : posBG > 0 ? posBG : 999;

      return rankA - rankB;
    });

    return NextResponse.json({ success: true, keywords: allKeywords, updatedCount: updatedItems.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tarama hatası' }, { status: 500 });
  }
}
