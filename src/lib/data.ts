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

let configCache: any = null;
let configCacheTime = 0;

export async function getHomepageConfig() {
  const now = Date.now();
  if (configCache && now - configCacheTime < 60000) {
    return configCache;
  }
  await connectToDatabase();
  let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
  if (!config) {
    const created = await HomepageConfigModel.create({ key: 'singleton' });
    config = created.toObject();
  }
  configCache = JSON.parse(JSON.stringify(config));
  configCacheTime = now;
  return configCache;
}

const listingsCache = new Map<string, { data: any; time: number }>();

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
  const cacheKey = `${ilSlug || ''}_${ilceSlug || ''}_${kategoriSlug || ''}_${limit}`;
  const cached = listingsCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.time < 30000) {
    return cached.data;
  }

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

  const cleanData = JSON.parse(JSON.stringify(listings));
  listingsCache.set(cacheKey, { data: cleanData, time: now });
  return cleanData;
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
