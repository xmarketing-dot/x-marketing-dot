import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushSubscriptionDoc extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  visitorId?: string;
  platform?: 'android' | 'ios' | 'desktop';
  browser?: string;
  ip?: string;
  hostname?: string;
  active: boolean;
  failCount: number;
  lastSuccessAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscriptionDoc>(
  {
    endpoint: { type: String, required: true, unique: true, index: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    visitorId: { type: String, index: true },
    platform: { type: String, enum: ['android', 'ios', 'desktop'], default: 'android' },
    browser: { type: String, default: 'Chrome' },
    ip: { type: String },
    hostname: { type: String, default: '', index: true },
    active: { type: Boolean, default: true, index: true },
    failCount: { type: Number, default: 0 },
    lastSuccessAt: { type: Date },
  },
  { timestamps: true }
);

PushSubscriptionSchema.index({ active: 1, createdAt: -1 });

const PushSubscriptionModel: Model<IPushSubscriptionDoc> =
  mongoose.models.PushSubscription || mongoose.model<IPushSubscriptionDoc>('PushSubscription', PushSubscriptionSchema);

export default PushSubscriptionModel;
