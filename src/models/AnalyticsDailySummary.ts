import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalyticsDailySummary extends Document {
  date: string; // YYYY-MM-DD format (Europe/Istanbul UTC+3)
  hostname: string; // domain or 'all'
  totalPageviews: number;
  uniqueVisitors: number;
  mobileCount: number;
  desktopCount: number;
  sources: {
    google: number;
    yandex: number;
    whatsapp: number;
    telegram: number;
    direct: number;
    instagram: number;
    x: number;
    facebook: number;
    other: number;
  };
  eventCounts: {
    whatsappClicks: number;
    shares: number;
    categoryClicks: number;
    cityFilters: number;
    searches: number;
    pwaInstalls: number;
    pwaUninstalls: number;
    specialAdImpressions: number;
    specialAdClicks: number;
    specialAdWhatsappClicks: number;
  };
  topCities: Array<{ city: string; count: number }>;
  topPages: Array<{ path: string; count: number }>;
  searchTerms: Array<{ keyword: string; count: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsDailySummarySchema = new Schema<IAnalyticsDailySummary>(
  {
    date: { type: String, required: true, index: true },
    hostname: { type: String, default: 'all', index: true },
    totalPageviews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    mobileCount: { type: Number, default: 0 },
    desktopCount: { type: Number, default: 0 },
    sources: {
      google: { type: Number, default: 0 },
      yandex: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      telegram: { type: Number, default: 0 },
      direct: { type: Number, default: 0 },
      instagram: { type: Number, default: 0 },
      x: { type: Number, default: 0 },
      facebook: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    eventCounts: {
      whatsappClicks: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      categoryClicks: { type: Number, default: 0 },
      cityFilters: { type: Number, default: 0 },
      searches: { type: Number, default: 0 },
      pwaInstalls: { type: Number, default: 0 },
      pwaUninstalls: { type: Number, default: 0 },
      specialAdImpressions: { type: Number, default: 0 },
      specialAdClicks: { type: Number, default: 0 },
      specialAdWhatsappClicks: { type: Number, default: 0 },
    },
    topCities: [
      {
        city: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
    topPages: [
      {
        path: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
    searchTerms: [
      {
        keyword: { type: String },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index for fast lookups per date & host
AnalyticsDailySummarySchema.index({ date: 1, hostname: 1 }, { unique: true });
AnalyticsDailySummarySchema.index({ date: -1 });

const AnalyticsDailySummaryModel: Model<IAnalyticsDailySummary> =
  mongoose.models.AnalyticsDailySummary ||
  mongoose.model<IAnalyticsDailySummary>('AnalyticsDailySummary', AnalyticsDailySummarySchema);

export default AnalyticsDailySummaryModel;
