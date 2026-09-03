import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBannerAd extends Document {
  konum: 'anasayfa' | 'ilan_detay' | 'her_ikisi';
  baslik: string;
  gorselUrl: string; // /api/img/[id] or https://...
  hedefUrl: string; // WhatsApp link or external site
  baslangicTarihi?: Date;
  bitisTarihi?: Date;
  sureGun: number; // 7, 15, 30
  fiyatTL: number;
  musteriIletisim: string; // WhatsApp / Tel
  odemeYontemi?: string;
  durum: 'odeme_bekliyor' | 'onay_bekliyor' | 'yayinda' | 'reddedildi' | 'suresi_doldu';
  goruntulenmeSayisi: number;
  tiklamaSayisi: number;
  redNedeni?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BannerAdSchema = new Schema<IBannerAd>(
  {
    konum: {
      type: String,
      enum: ['anasayfa', 'ilan_detay', 'her_ikisi'],
      default: 'her_ikisi',
      required: true,
      index: true,
    },
    baslik: { type: String, required: true, trim: true },
    gorselUrl: { type: String, required: true },
    hedefUrl: { type: String, required: true, trim: true },
    baslangicTarihi: { type: Date },
    bitisTarihi: { type: Date },
    sureGun: { type: Number, default: 7 },
    fiyatTL: { type: Number, default: 5000 },
    musteriIletisim: { type: String, required: true, trim: true },
    odemeYontemi: { type: String, default: 'kripto' },
    durum: {
      type: String,
      enum: ['odeme_bekliyor', 'onay_bekliyor', 'yayinda', 'reddedildi', 'suresi_doldu'],
      default: 'onay_bekliyor',
      index: true,
    },
    goruntulenmeSayisi: { type: Number, default: 0 },
    tiklamaSayisi: { type: Number, default: 0 },
    redNedeni: { type: String },
  },
  { timestamps: true, autoIndex: false }
);

const BannerAdModel: Model<IBannerAd> =
  mongoose.models.BannerAd || mongoose.model<IBannerAd>('BannerAd', BannerAdSchema);

export default BannerAdModel;
