import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBacklink extends Document {
  baslik: string;
  url: string; // https://orneksite.com
  aciklama?: string;
  anchorText?: string;
  nofollow: boolean; // false = dofollow (güçlü SEO link suyu)
  aktif: boolean;
  konum: 'footer' | 'header' | 'sidebar' | 'tum_sayfalar';
  tiklamaSayisi: number;
  siraNo: number;
  createdAt: Date;
  updatedAt: Date;
}

const BacklinkSchema = new Schema<IBacklink>(
  {
    baslik: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    aciklama: { type: String, trim: true },
    anchorText: { type: String, trim: true },
    nofollow: { type: Boolean, default: false }, // Varsayılan dofollow (Google Bot gücü aktarımı)
    aktif: { type: Boolean, default: true, index: true },
    konum: {
      type: String,
      enum: ['footer', 'header', 'sidebar', 'tum_sayfalar'],
      default: 'footer',
    },
    tiklamaSayisi: { type: Number, default: 0 },
    siraNo: { type: Number, default: 0 },
  },
  { timestamps: true, autoIndex: false }
);

const BacklinkModel: Model<IBacklink> =
  mongoose.models.Backlink || mongoose.model<IBacklink>('Backlink', BacklinkSchema);

export default BacklinkModel;
