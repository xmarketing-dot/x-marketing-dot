import connectToDatabase from './mongodb';
import LocationModel from '../models/Location';
import CategoryModel from '../models/Category';
import PackageModel from '../models/Package';
import ListingModel from '../models/Listing';
import HomepageConfigModel from '../models/HomepageConfig';

export async function getAllLocations() {
  await connectToDatabase();
  const res = await LocationModel.find({}).sort({ il: 1 }).lean();
  return JSON.parse(JSON.stringify(res));
}

export async function getLocationBySlug(ilSlug: string) {
  await connectToDatabase();
  const res = await LocationModel.findOne({ ilSlug }).lean();
  if (!res) return null;
  return JSON.parse(JSON.stringify(res));
}

export async function getAllCategories() {
  await connectToDatabase();
  const res = await CategoryModel.find({ aktif: true }).sort({ siraNo: 1 }).lean();
  return JSON.parse(JSON.stringify(res));
}

export async function getCategoryBySlug(slug: string) {
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

export async function getHomepageConfig() {
  await connectToDatabase();
  let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
  if (!config) {
    const created = await HomepageConfigModel.create({ key: 'singleton' });
    config = created.toObject();
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

  // Auto-expire listings whose publication duration has ended
  const now = new Date();
  await ListingModel.updateMany(
    { status: 'yayinda', paketBitisTarihi: { $exists: true, $lte: now } },
    { $set: { status: 'suresi_doldu' } }
  );

  const query: any = { status: 'yayinda' };

  if (ilSlug) query.ilSlug = ilSlug;
  if (ilceSlug) query.ilceSlug = ilceSlug;

  if (kategoriSlug) {
    const category = await CategoryModel.findOne({ slug: kategoriSlug, aktif: true }).lean();
    if (category) {
      query.kategoriId = category._id;
    }
  }

  const listings = await ListingModel.find(query)
    .populate('kategoriId')
    .sort({ rozet: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(listings));
}

export async function getListingBySlug(slug: string) {
  await connectToDatabase();

  // Auto-expire check
  const now = new Date();
  await ListingModel.updateMany(
    { status: 'yayinda', paketBitisTarihi: { $exists: true, $lte: now } },
    { $set: { status: 'suresi_doldu' } }
  );

  const listing = await ListingModel.findOne({ slug, status: 'yayinda' })
    .populate('kategoriId')
    .lean();
  if (!listing) return null;
  return JSON.parse(JSON.stringify(listing));
}
