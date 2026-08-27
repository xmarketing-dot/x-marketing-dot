import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalyticsVisitor extends Document {
  visitorId: string;
  sessionId: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  path: string;
  pageTitle?: string;
  referer: string;
  refererSource: 'google' | 'whatsapp' | 'telegram' | 'direct' | 'x' | 'instagram' | 'facebook' | 'other';
  searchKeyword?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  city: string;
  ip: string;
  userAgent: string;
  durationSeconds: number;
  isUniqueToday: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsVisitorSchema = new Schema<IAnalyticsVisitor>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    device: { type: String, enum: ['mobile', 'desktop', 'tablet'], required: true },
    browser: { type: String, default: 'Chrome' },
    os: { type: String, default: 'Mobile' },
    path: { type: String, required: true, index: true },
    pageTitle: { type: String },
    referer: { type: String, default: 'Direct' },
    refererSource: { 
      type: String, 
      enum: ['google', 'whatsapp', 'telegram', 'direct', 'x', 'instagram', 'facebook', 'other'], 
      default: 'direct',
      index: true 
    },
    searchKeyword: { type: String, default: '' },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    city: { type: String, default: 'İstanbul' },
    ip: { type: String, index: true },
    userAgent: { type: String },
    durationSeconds: { type: Number, default: 0 },
    isUniqueToday: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes for fast admin analytics queries
AnalyticsVisitorSchema.index({ createdAt: -1 });
AnalyticsVisitorSchema.index({ path: 1, createdAt: -1 });
AnalyticsVisitorSchema.index({ visitorId: 1, path: 1, createdAt: -1 });
AnalyticsVisitorSchema.index({ refererSource: 1, createdAt: -1 });

const AnalyticsVisitorModel: Model<IAnalyticsVisitor> =
  mongoose.models.AnalyticsVisitor || mongoose.model<IAnalyticsVisitor>('AnalyticsVisitor', AnalyticsVisitorSchema);

export default AnalyticsVisitorModel;
