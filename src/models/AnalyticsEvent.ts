import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  visitorId: string;
  sessionId: string;
  eventType: 
    | 'whatsapp_click' 
    | 'share_listing' 
    | 'category_click' 
    | 'city_filter' 
    | 'search' 
    | 'slider_click' 
    | 'phone_call'
    | 'special_ad_impression'
    | 'special_ad_click'
    | 'special_ad_whatsapp_click'
    | 'bos_banner_reklam_tiklama';
  targetId?: string;
  targetTitle?: string;
  targetCity?: string;
  path: string;
  hostname?: string;
  metadata?: Record<string, any>;
  ip?: string;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      enum: [
        'whatsapp_click', 
        'share_listing', 
        'category_click', 
        'city_filter', 
        'search', 
        'slider_click', 
        'phone_call',
        'special_ad_impression',
        'special_ad_click',
        'special_ad_whatsapp_click',
        'bos_banner_reklam_tiklama'
      ],
      required: true,
      index: true,
    },
    targetId: { type: String, index: true },
    targetTitle: { type: String },
    targetCity: { type: String },
    path: { type: String, required: true },
    hostname: { type: String, default: '', index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });
AnalyticsEventSchema.index({ targetId: 1, eventType: 1 });
AnalyticsEventSchema.index({ createdAt: -1 });

const AnalyticsEventModel: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);

export default AnalyticsEventModel;
