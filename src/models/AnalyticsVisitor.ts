import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalyticsVisitor extends Document {
  device: 'mobile' | 'desktop';
  path: string;
  referer: string;
  city: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const AnalyticsVisitorSchema = new Schema<IAnalyticsVisitor>(
  {
    device: { type: String, enum: ['mobile', 'desktop'], required: true },
    path: { type: String, required: true },
    referer: { type: String, default: 'Direct' },
    city: { type: String, default: 'İstanbul' },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const AnalyticsVisitorModel: Model<IAnalyticsVisitor> =
  mongoose.models.AnalyticsVisitor || mongoose.model<IAnalyticsVisitor>('AnalyticsVisitor', AnalyticsVisitorSchema);

export default AnalyticsVisitorModel;
