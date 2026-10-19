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

import {
  getPrimaryDomain,
  scrapeGoogleSerp,
  scrapeYandexSerp,
} from '@/lib/serpEngine';

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

      // Google değişim hesabı & Blokaj Koruması
      const prevG = item.currentPosition || 0;
      let currG = googleResult.position || 0;
      let changeG = 0;

      if (currG === 0 && prevG > 0) {
        // Blokaj / Captcha / Hata durumunda mevcut Google sıralamasını koru, sıfırlama!
        currG = prevG;
        changeG = 0;
      } else {
        if (prevG > 0 && currG > 0) changeG = prevG - currG;
        else if (prevG === 0 && currG > 0) changeG = currG;
        else if (prevG > 0 && currG === 0) changeG = -prevG;
      }

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
      if (googleResult.competitors && googleResult.competitors.length > 0) {
        item.topCompetitors = googleResult.competitors;
      }
      if (googleResult.foundUrl) item.googleFoundUrl = googleResult.foundUrl;
      if (googleResult.foundDomain) item.googleFoundDomain = googleResult.foundDomain;
      if (googleResult.engine && googleResult.engine !== 'none') item.googleFoundEngine = googleResult.engine;
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
