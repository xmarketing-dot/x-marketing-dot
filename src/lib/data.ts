import { cache } from 'react';
import connectToDatabase from './mongodb';
import LocationModel from '../models/Location';
import CategoryModel from '../models/Category';
import PackageModel from '../models/Package';
import ListingModel from '../models/Listing';
import HomepageConfigModel from '../models/HomepageConfig';


let locationsCache: any = null;
let locationsCacheTime = 0;

export async function getAllLocations() {
  const now = Date.now();
  if (locationsCache && now - locationsCacheTime < 60000) {
    return locationsCache;
  }
  await connectToDatabase();
  const res = await LocationModel.find({})
    .select('il ilSlug ilceler')
    .sort({ il: 1 })
    .lean();
  locationsCache = JSON.parse(JSON.stringify(res));
  locationsCacheTime = now;
  return locationsCache;
}

export async function getLocationBySlug(ilSlug: string) {
  const locations = await getAllLocations();
  const found = locations.find((l: any) => l.ilSlug === ilSlug);
  if (found) return found;
  await connectToDatabase();
  const res = await LocationModel.findOne({ ilSlug }).lean();
  if (!res) return null;
  return JSON.parse(JSON.stringify(res));
}

let categoriesCache: any = null;
let categoriesCacheTime = 0;

export async function getAllCategories() {
  const now = Date.now();
  if (categoriesCache && now - categoriesCacheTime < 60000) {
    return categoriesCache;
  }
  await connectToDatabase();
  const res = await CategoryModel.find({ aktif: true })
    .select('ad slug icon siraNo')
    .sort({ siraNo: 1 })
    .lean();
  categoriesCache = JSON.parse(JSON.stringify(res));
  categoriesCacheTime = now;
  return categoriesCache;
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getAllCategories();
  const found = categories.find((c: any) => c.slug === slug);
  if (found) return found;
  await connectToDatabase();
  const res = await CategoryModel.findOne({ slug, aktif: true }).lean();
  if (!res) return null;
  return JSON.parse(JSON.stringify(res));
}

export async function getAllPackages() {
  await connectToDatabase();
  const res = await PackageModel.find({ aktif: true }).sort({ siraOnceligi: -1 }).lean();
  return JSON.parse(JSON.stringify(res));
}

const DEFAULT_HOMEPAGE_PROMOS = [
  {
    _id: 'promo-1',
    gifUrl: 'https://media.tenor.com/vDokuclgktwAAAAd/barbara-palvin-lingerie.gif',
    topBadge: '🔥 GÜNDE 50.000+ CANLI MÜŞTERİ',
    trafficBadge: '💎 EN ÇOK KAZANDIRAN ALAN',
    title: 'Zirvede Yerini Al, Telefonun Gece Gündüz Çalsın!',
    spot: 'Türkiye\'nin en popüler eskort vitrininde dakikalar içinde öne çıkın. WhatsApp hattınıza kesintisiz elit müşteri akışı başlatın.',
    aktif: true,
  },
  {
    _id: 'promo-2',
    gifUrl: 'https://64.media.tumblr.com/8c1cf789da9ba9a6cca6ee396f6f2dc7/0ed1f7c7e2c38e0a-dc/s500x750/6924e4454a9f477b6d1eaddaf38cb52a1917c51d.gif',
    topBadge: '👑 VIP VİTRİN İLE KAZANCINI KATLA',
    trafficBadge: '⚡ ANINDA MÜŞTERİ AKIŞI',
    title: 'Günde 50.000 Canlı Ziyaretçi Doğrudan Seni Görsün!',
    spot: 'Sayfaya giren herkesin ilk gördüğü dev vitrinde yerini ayırt. Komisyonsuz, doğrudan ve anında randevularını doldur.',
    aktif: true,
  },
  {
    _id: 'promo-3',
    gifUrl: 'https://i.looksmax.org/attachments/2022/12/3217147_booty-bounce-2.gif',
    topBadge: '💎 LÜKS & SEÇKİN PRESTİJ',
    trafficBadge: '🔥 %100 GERÇEK MÜŞTERİ',
    title: 'Bu Vitrinde Parlayın, En Çok Kazanan Siz Olun!',
    spot: 'Rakiplerinin önüne geç, anasayfanın 1 numaralı vitrinine yerleş. Saatlerce müşteri aramak yerine müşteriler sana yazsın.',
    aktif: true,
  },
  {
    _id: 'promo-4',
    gifUrl: 'https://media.tenor.com/7rtlPza-UqcAAAAM/asian.gif',
    topBadge: '⚡ ANINDA RANDEVU DOLDURMA',
    trafficBadge: '🚀 GOOGLE & ARAMA LİDERİ',
    title: 'Vitrine Sabitlenin, Müşteri Mesajlarına Yetişemeyin!',
    spot: 'Best Eskort VIP vitrini ile tüm şehirden gelen elit müşterilere ilk sırada ulaşın. WhatsApp randevu trafiğinizi hemen katlayın.',
    aktif: true,
  },
  {
    _id: 'promo-5',
    gifUrl: 'https://media.tenor.com/UpyRgPYevTMAAAAM/sexy-girl.gif',
    topBadge: '👑 SINIRSIZ GÖRÜNTÜLENME & GÜÇ',
    trafficBadge: '🌟 VIP ÖZEL AYRICALIK',
    title: 'İlanınızı Vitrine Taşıyın, Zirvenin Keyfini Çıkarın!',
    spot: 'Tek tıkla vitrinde yerinizi alın, profesyonel reklam avantajıyla sınırsız kazanç ve maksimum görünürlük elde edin.',
    aktif: true,
  },
];

export async function getHomepageConfig() {
  await connectToDatabase();
  let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
  if (!config) {
    const created = await HomepageConfigModel.create({ 
      key: 'singleton',
      bosVitrinSliderlar: DEFAULT_HOMEPAGE_PROMOS
    });
    config = created.toObject();
  } else if (!config.bosVitrinSliderlar) {
    config.bosVitrinSliderlar = DEFAULT_HOMEPAGE_PROMOS;
  }
  return JSON.parse(JSON.stringify(config));
}

export async function getListings({
  ilSlug,
  ilceSlug,
  kategoriSlug,
  limit = 20,
}: {
  ilSlug?: string;
  ilceSlug?: string;
  kategoriSlug?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const nowDate = new Date();
  const query: any = {
    status: 'yayinda',
    $or: [
      { paketBitisTarihi: { $exists: false } },
      { paketBitisTarihi: null },
      { paketBitisTarihi: { $gt: nowDate } }
    ]
  };

  if (ilSlug) query.ilSlug = ilSlug;
  if (ilceSlug) query.ilceSlug = ilceSlug;

  if (kategoriSlug) {
    const category = await CategoryModel.findOne({ slug: kategoriSlug, aktif: true })
      .select('_id')
      .lean();
    if (category) {
      query.kategoriId = category._id;
    }
  }

  // Include fotograflar so compact card auto-slider works
  const listings = await ListingModel.find(query)
    .select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara anaFotograf fotograflar createdAt status')
    .sort({ rozet: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(listings));
}

export const getListingBySlug = cache(async (slug: string) => {
  await connectToDatabase();

  const now = new Date();
  const listing = await ListingModel.findOne({
    slug,
    status: 'yayinda',
    $or: [
      { paketBitisTarihi: { $exists: false } },
      { paketBitisTarihi: null },
      { paketBitisTarihi: { $gt: now } }
    ]
  })
    .populate('kategoriId')
    .lean();

  if (!listing) return null;
  return JSON.parse(JSON.stringify(listing));
});

import BannerAdModel from '../models/BannerAd';

export const getActiveBanner = cache(async (konum: 'anasayfa' | 'ilan_detay' | string = 'anasayfa') => {
  try {
    await connectToDatabase();
    const now = new Date();
    const targetKonum = konum === 'ilan_detay' ? 'ilan_detay' : 'anasayfa';

    // Süresi dolan yayındaki banner'ları anında otomatik pasife al
    BannerAdModel.updateMany(
      { durum: 'yayinda', bitisTarihi: { $lt: now } },
      { $set: { durum: 'suresi_doldu' } }
    ).catch(() => {});

    const banner = await BannerAdModel.findOne({
      durum: 'yayinda',
      konum: { $in: [targetKonum, 'her_ikisi'] },
      $or: [
        { bitisTarihi: { $exists: false } },
        { bitisTarihi: null },
        { bitisTarihi: { $gte: now } },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!banner) return null;
    return JSON.parse(JSON.stringify(banner));
  } catch (e) {
    return null;
  }
});
