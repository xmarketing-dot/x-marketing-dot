import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncementLog {
  visitorId?: string;
  ip?: string;
  eventType: 'view' | 'click' | 'dismiss';
  city?: string;
  device?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IAnnouncementBar extends Document {
  isActive: boolean;
  campaignId: string;
  title: string;
  description?: string;
  badgeText: string;
  buttonText: string;
  targetUrl: string;
  openInNewTab: boolean;
  stylePreset: 'fire' | 'emerald' | 'fuchsia' | 'cyber';
  viewsCount: number;
  clicksCount: number;
  dismissCount: number;
  uniqueViewers: string[];
  uniqueClickers: string[];
  recentLogs: IAnnouncementLog[];
  updatedAt: Date;
  createdAt: Date;
}

const AnnouncementBarSchema = new Schema<IAnnouncementBar>(
  {
    isActive: { type: Boolean, default: false },
    campaignId: { type: String, default: 'camp_v1' },
    title: { type: String, default: "Türkiyenin en büyük eskort sitesi açıldı !" },
    description: { type: String, default: "escturkiye.devs.surf yayında! Tüm illerdeki doğrulanmış VIP ilanları hemen keşfedin." },
    badgeText: { type: String, default: "🚀 YENİ AĞ" },
    buttonText: { type: String, default: "Hemen İncele →" },
    targetUrl: { type: String, default: "https://escturkiye.devs.surf" },
    openInNewTab: { type: Boolean, default: true },
    stylePreset: { type: String, enum: ['fire', 'emerald', 'fuchsia', 'cyber'], default: 'fire' },
    viewsCount: { type: Number, default: 0 },
    clicksCount: { type: Number, default: 0 },
    dismissCount: { type: Number, default: 0 },
    uniqueViewers: { type: [String], default: [] },
    uniqueClickers: { type: [String], default: [] },
    recentLogs: [
      {
        visitorId: { type: String },
        ip: { type: String },
        eventType: { type: String, enum: ['view', 'click', 'dismiss'] },
        city: { type: String },
        device: { type: String },
        userAgent: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, autoIndex: false }
);

const AnnouncementBarModel: Model<IAnnouncementBar> =
  mongoose.models.AnnouncementBar || mongoose.model<IAnnouncementBar>('AnnouncementBar', AnnouncementBarSchema);

export default AnnouncementBarModel;
