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
 * Canlı SERP Tarayıcısı: Google Türkiye ve Bing üzerinden hedef domainin pozisyonunu
 * ve ilk 3'teki rakipleri tespit eder.
 */
async function scrapeSerpPosition(
  keyword: string,
  targetDomain: string
): Promise<{ position: number; competitors: ICompetitor[] }> {
  const cleanTarget = targetDomain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
  const cleanTargetBase = cleanTarget.split('.')[0]; // örn: "besteskort"

  const competitors: ICompetitor[] = [];
  let foundPosition = 0;
  const seenDomains = new Set<string>();
  let rankCounter = 1;

  // 1. PRIMARY: Yandex Search Engine (Türkiye eskort aramalarında %100 güncel ve filtresiz)
  try {
    const yandexUrl = `https://yandex.com.tr/search/?text=${encodeURIComponent(keyword)}&lr=11508`;
    const res = await fetch(yandexUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
    });

    if (res.ok) {
      const html = await res.text();
      const urls = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);

      for (const rawUrl of urls) {
        try {
          const parsed = new URL(rawUrl);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

          if (
            hostname.includes('yandex.') ||
            hostname.includes('ya.ru') ||
            hostname.includes('w3.org') ||
            hostname.includes('schema.org') ||
            hostname.includes('twitter.com') ||
            hostname.includes('x.com') ||
            hostname.includes('instagram.com') ||
            hostname.includes('facebook.com') ||
            hostname.includes('t.me') ||
            hostname.includes('google.') ||
            seenDomains.has(hostname)
          ) {
            continue;
          }

          seenDomains.add(hostname);

          if (competitors.length < 3 && !hostname.includes(cleanTargetBase)) {
            competitors.push({
              position: rankCounter,
              domain: hostname,
              title: hostname,
            });
          }

          if (foundPosition === 0 && (hostname.includes(cleanTarget) || hostname.includes(cleanTargetBase))) {
            foundPosition = rankCounter;
          }

          rankCounter++;
          if (rankCounter > 30) break;
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Yandex SERP scan error:', err);
  }

  // 2. SECONDARY: Bing Organic Engine (u=a1 base64 formatında gerçek hedef URL'ler)
  if (competitors.length === 0) {
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

        for (const m of bMatches) {
          try {
            let base64Str = m[1].replace(/-/g, '+').replace(/_/g, '/');
            while (base64Str.length % 4) base64Str += '=';
            const decodedUrl = Buffer.from(base64Str, 'base64').toString('utf8');
            const bHostname = new URL(decodedUrl).hostname.toLowerCase().replace(/^www\./, '');

            if (
              bHostname.includes('bing.') ||
              bHostname.includes('microsoft.') ||
              seenDomains.has(bHostname)
            ) {
              continue;
            }

            seenDomains.add(bHostname);

            if (competitors.length < 3 && !bHostname.includes(cleanTargetBase)) {
              competitors.push({
                position: rankCounter,
                domain: bHostname,
                title: bHostname,
              });
            }

            if (foundPosition === 0 && (bHostname.includes(cleanTarget) || bHostname.includes(cleanTargetBase))) {
              foundPosition = rankCounter;
            }

            rankCounter++;
          } catch (e) {}
        }
      }
    } catch (bErr) {
      console.warn('Bing SERP scan error:', bErr);
    }
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

  let keywords = await KeywordRankModel.find({})
    .sort({ currentPosition: 1, updatedAt: -1 })
    .lean();

  // İlk kurulumda varsayılan anahtar kelimeleri ekle
  if (keywords.length === 0) {
    const defaultDomain = getReqDomain(req);
    const defaults = [
      'kadıköy eskort',
      'beylikdüzü eskort',
      'istanbul eskort ilanları',
      'izmir eskort bayan',
      'ankara vip escort',
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
      }).catch(() => {});
    }

    keywords = await KeywordRankModel.find({})
      .sort({ currentPosition: 1, updatedAt: -1 })
      .lean();
  }

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

    // İlk taramayı canlı yap
    const { position, competitors } = await scrapeSerpPosition(cleanKw, targetDomain);

    const doc = await KeywordRankModel.create({
      keyword: cleanKw,
      targetDomain,
      currentPosition: position,
      previousPosition: position,
      change: 0,
      bestPosition: position,
      topCompetitors: competitors,
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

    if (items.length === 0 && !id) {
      const defaults = [
        'beylikdüzü eskort',
        'kadıköy eskort',
        'istanbul eskort ilanları',
        'izmir eskort bayan',
        'ankara vip escort',
      ];
      for (const kw of defaults) {
        await KeywordRankModel.create({
          keyword: kw,
          targetDomain: getReqDomain(req),
          currentPosition: 0,
          previousPosition: 0,
          change: 0,
          bestPosition: 0,
          topCompetitors: [],
        }).catch(() => {});
      }
      items = await KeywordRankModel.find({});
    }

    const updatedItems = [];

    for (const item of items) {
      const { position, competitors } = await scrapeSerpPosition(item.keyword, item.targetDomain);

      const prev = item.currentPosition;
      const curr = position;
      
      // Değişim hesabı: Eski sıra 8, yeni sıra 5 ise +3 sıra yükselmiştir.
      let change = 0;
      if (prev > 0 && curr > 0) {
        change = prev - curr; // 8 - 5 = +3 (Yeşil)
      } else if (prev === 0 && curr > 0) {
        change = curr; // İlk kez sıralamaya girdi
      } else if (prev > 0 && curr === 0) {
        change = -prev; // Sıralamadan düştü
      }

      const best = item.bestPosition === 0 || (curr > 0 && curr < item.bestPosition)
        ? curr
        : item.bestPosition;

      item.previousPosition = prev;
      item.currentPosition = curr;
      item.change = change;
      item.bestPosition = best;
      item.topCompetitors = competitors;
      item.lastCheckedAt = new Date();

      await item.save();
      updatedItems.push(item);
    }

    const allKeywords = await KeywordRankModel.find({})
      .sort({ currentPosition: 1, updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, keywords: allKeywords, updatedCount: updatedItems.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Tarama hatası' }, { status: 500 });
  }
}
