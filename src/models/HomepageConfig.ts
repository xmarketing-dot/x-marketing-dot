import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITickerItem {
  badge: string;
  text: string;
  link: string;
}

export interface IOzelIlanReklam {
  aktif: boolean;
  ilanId?: mongoose.Types.ObjectId | null;
  gecikmeSaniye: number;
  baslik?: string;
  spotMetin?: string;
  rozet?: string;
}

export interface IHomepageConfig extends Document {
  key: string;
  hero: {
    baslik: string;
    altBaslik: string;
    gorselUrl?: string;
  };
  aktifBanner: {
    aktif: boolean;
    metin: string;
    link?: string;
    rozet?: string;
  };
  ozelIlanReklam: IOzelIlanReklam;
  duyurular: ITickerItem[];
  sliderIlanIds: mongoose.Types.ObjectId[];
  oneCikanKategoriler: mongoose.Types.ObjectId[];
}

const TickerItemSchema = new Schema<ITickerItem>(
  {
    badge: { type: String, default: '👑 VIP VİTRİN' },
    text: { type: String, required: true },
    link: { type: String, default: '/ilan-ver' },
  },
  { _id: false }
);

const OzelIlanReklamSchema = new Schema<IOzelIlanReklam>(
  {
    aktif: { type: Boolean, default: false },
    ilanId: { type: Schema.Types.ObjectId, ref: 'Listing', default: null },
    gecikmeSaniye: { type: Number, default: 4 },
    baslik: { type: String, default: '👑 GÜNÜN ÖZEL VIP İLANI' },
    spotMetin: { type: String, default: 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı' },
    rozet: { type: String, default: '🔥 SPONSORLU ÖZEL İLAN' },
  },
  { _id: false }
);

const HomepageConfigSchema = new Schema<IHomepageConfig>(
  {
    key: { type: String, required: true, unique: true, default: 'singleton' },
    hero: {
      baslik: { type: String, default: 'Türkiye\'nin En Güvenilir VIP Eskort İlan Platformu' },
      altBaslik: { type: String, default: '81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.' },
      gorselUrl: { type: String },
    },
    aktifBanner: {
      aktif: { type: Boolean, default: true },
      metin: { type: String, default: '🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!' },
      link: { type: String, default: '/ilan-ver' },
      rozet: { type: String, default: '👑 VIP DUYURU' },
    },
    ozelIlanReklam: {
      type: OzelIlanReklamSchema,
      default: () => ({
        aktif: false,
        ilanId: null,
        gecikmeSaniye: 4,
        baslik: '👑 GÜNÜN ÖZEL VIP İLANI',
        spotMetin: 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı',
        rozet: '🔥 SPONSORLU ÖZEL İLAN',
      }),
    },
    duyurular: {
      type: [TickerItemSchema],
      default: [
        {
          badge: '👑 LİDER REHBER',
          text: '81 İl ve İlçede Türkiye\'nin En Büyük İlan Platformu',
          link: '/ilan-ver',
        },
        {
          badge: '🔥 ANINDA MÜŞTERİ',
          text: 'İlan Verin, WhatsApp ile Müşterilere Ulaşın!',
          link: '/ilan-ver',
        },
        {
          badge: '💎 VIP VİTRİN',
          text: 'Google Aramalarında En Üst Sırada Yer Alın',
          link: '/ilan-ver',
        },
        {
          badge: '⚡ CANLI DESTEK',
          text: '%100 Güvenli & 7/24 Canlı Müşteri Desteği',
          link: '/chat',
        },
      ],
    },
    sliderIlanIds: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
    oneCikanKategoriler: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true }
);

if (mongoose.models.HomepageConfig) {
  delete (mongoose.models as any).HomepageConfig;
}

const HomepageConfigModel: Model<IHomepageConfig> =
  mongoose.models.HomepageConfig || mongoose.model<IHomepageConfig>('HomepageConfig', HomepageConfigSchema);

export default HomepageConfigModel;
