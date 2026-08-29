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

  try {
    // 1. Google Arama Sorgusu (tr-TR, gl=tr)
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=50&hl=tr&gl=tr`;
    const res = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const html = await res.text();
      // Google organik linklerini ayıkla
      const linkRegex = /<a\s+(?:[^>]*?\s+)?href="(\/url\?q=[^"]+|https?:\/\/[^"]+)"/gi;
      let match;
      const seenDomains = new Set<string>();
      let rankCounter = 1;

      while ((match = linkRegex.exec(html)) !== null && rankCounter <= 50) {
        let rawUrl = match[1];
        if (rawUrl.startsWith('/url?q=')) {
          rawUrl = decodeURIComponent(rawUrl.split('/url?q=')[1].split('&')[0]);
        }

        try {
          const parsed = new URL(rawUrl);
          const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

          // Google kendi servislerini ve arama sayfalarını filtrele
          if (
            hostname.includes('google.') ||
            hostname.includes('youtube.com') ||
            hostname.includes('schema.org') ||
            hostname.includes('w3.org') ||
            seenDomains.has(hostname)
          ) {
            continue;
          }

          seenDomains.add(hostname);

          // Rakipleri kaydet (İlk 3 rakip)
          if (competitors.length < 3 && !hostname.includes(cleanTargetBase)) {
            competitors.push({
              position: rankCounter,
              domain: hostname,
              title: hostname,
            });
          }

          // Kendi sitemizi bulduk mu?
          if (foundPosition === 0 && (hostname.includes(cleanTarget) || hostname.includes(cleanTargetBase))) {
            foundPosition = rankCounter;
          }

          rankCounter++;
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Google search query throttled, falling back to secondary engine...', err);
  }

  // 2. Yedek Tarayıcı (Google CAPTCHA/429 verirse Bing TR üzerinden tara)
  if (foundPosition === 0 && competitors.length === 0) {
    try {
      const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}&cc=tr&count=50`;
      const bRes = await fetch(bingUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9',
        },
      });

      if (bRes.ok) {
        const bHtml = await bRes.text();
        const bLinkRegex = /<li class="b_algo"[^>]*>[\s\S]*?<a\s+(?:[^>]*?\s+)?href="(https?:\/\/[^"]+)"/gi;
        let bMatch;
        let bRank = 1;

        while ((bMatch = bLinkRegex.exec(bHtml)) !== null && bRank <= 30) {
          try {
            const bHostname = new URL(bMatch[1]).hostname.toLowerCase().replace(/^www\./, '');
            if (!bHostname.includes('bing.com') && !bHostname.includes('microsoft.com')) {
              if (competitors.length < 3 && !bHostname.includes(cleanTargetBase)) {
                competitors.push({
                  position: bRank,
                  domain: bHostname,
                });
              }

              if (foundPosition === 0 && (bHostname.includes(cleanTarget) || bHostname.includes(cleanTargetBase))) {
                foundPosition = bRank;
              }
              bRank++;
            }
          } catch (e) {}
        }
      }
    } catch (bErr) {}
  }

  return { position: foundPosition, competitors };
}

// ── GET: Tüm Takip Edilen Kelimeleri Getir ──────────────────────
export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  let keywords = await KeywordRankModel.find({})
    .sort({ currentPosition: 1, updatedAt: -1 })
    .lean();

  // İlk kurulumda varsayılan anahtar kelimeleri ekle
  if (keywords.length === 0) {
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
        targetDomain: 'besteskort.devs.surf',
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
    const { action, id, keyword, targetDomain = 'besteskort.devs.surf' } = body;

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
    const items = await KeywordRankModel.find(query);

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
