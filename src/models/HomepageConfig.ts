import mongoose, { Schema, Document, Model } from 'mongoose';

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
    renk?: string;
    hedefKitle?: string;
  };
  sliderIlanIds: mongoose.Types.ObjectId[];
  oneCikanKategoriler: mongoose.Types.ObjectId[];
}

const HomepageConfigSchema = new Schema<IHomepageConfig>(
  {
    key: { type: String, required: true, unique: true, default: 'singleton' },
    hero: {
      baslik: { type: String, default: 'Bölgenizdeki En İyi İlanları Keşfedin' },
      altBaslik: { type: String, default: '81 il ve tüm ilçelerde güvenli alışveriş ve hizmet rehberi' },
      gorselUrl: { type: String },
    },
    aktifBanner: {
      aktif: { type: Boolean, default: true },
      metin: { type: String, default: '🎉 İlan verin, binlerce kullanıcıya hemen ulaşın!' },
      link: { type: String, default: '/ilan-ver' },
      renk: { type: String, default: 'amber' },
      hedefKitle: { type: String, default: 'herkes' },
    },
    sliderIlanIds: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
    oneCikanKategoriler: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true }
);

const HomepageConfigModel: Model<IHomepageConfig> =
  mongoose.models.HomepageConfig || mongoose.model<IHomepageConfig>('HomepageConfig', HomepageConfigSchema);

export default HomepageConfigModel;
