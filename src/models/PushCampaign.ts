import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushCampaignDoc extends Document {
  title: string;
  body: string;
  url: string;
  icon?: string;
  image?: string;
  targetPlatform?: string;
  totalSent: number;
  successCount: number;
  failCount: number;
  createdAt: Date;
}

const PushCampaignSchema = new Schema<IPushCampaignDoc>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: { type: String, default: '/' },
    icon: { type: String, default: '/icon-192.png' },
    image: { type: String },
    targetPlatform: { type: String, default: 'all' },
    totalSent: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PushCampaignSchema.index({ createdAt: -1 });

const PushCampaignModel: Model<IPushCampaignDoc> =
  mongoose.models.PushCampaign || mongoose.model<IPushCampaignDoc>('PushCampaign', PushCampaignSchema);

export default PushCampaignModel;
