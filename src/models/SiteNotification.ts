import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteNotificationDoc extends Document {
  title: string;
  message: string;
  url: string;
  imageUrl?: string;
  type: 'admin_broadcast' | 'announcement_bar' | 'new_listing' | 'pwa_prompt' | 'system';
  badge: string;
  sourceId?: string;
  readBy: string[]; // List of visitorIds who read this
  deliveredTo: string[]; // List of visitorIds who fetched/received this
  readCount: number;
  deliveredCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteNotificationSchema = new Schema<ISiteNotificationDoc>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    url: { type: String, default: '/' },
    imageUrl: { type: String, default: '' },
    type: {
      type: String,
      enum: ['admin_broadcast', 'announcement_bar', 'new_listing', 'pwa_prompt', 'system'],
      default: 'system',
    },
    badge: { type: String, default: 'BİLDİRİM' },
    sourceId: { type: String, index: true },
    readBy: { type: [String], default: [] },
    deliveredTo: { type: [String], default: [] },
    readCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SiteNotificationSchema.index({ createdAt: -1 });
SiteNotificationSchema.index({ isActive: 1, createdAt: -1 });
SiteNotificationSchema.index({ sourceId: 1 });

const SiteNotificationModel: Model<ISiteNotificationDoc> =
  mongoose.models.SiteNotification ||
  mongoose.model<ISiteNotificationDoc>('SiteNotification', SiteNotificationSchema);

export default SiteNotificationModel;
