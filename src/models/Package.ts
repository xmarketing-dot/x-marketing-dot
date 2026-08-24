import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPackage extends Document {
  ad: string;
  tip: 'haftalik' | 'aylik';
  fiyatTL: number;
  fiyatUSDT: number;
  ozellikler: string[];
  rozet: 'ultravip' | 'vip' | 'gold' | 'silver' | 'standart';
  maxFotoSayisi: number;
  anasayfaSlider: boolean;
  siraOnceligi: number;
  aktif: boolean;
}

const PackageSchema = new Schema<IPackage>(
  {
    ad: { type: String, required: true },
    tip: { type: String, enum: ['haftalik', 'aylik'], required: true },
    fiyatTL: { type: Number, required: true },
    fiyatUSDT: { type: Number, required: true },
    ozellikler: [{ type: String }],
    rozet: { type: String, enum: ['ultravip', 'vip', 'gold', 'silver', 'standart'], default: 'silver' },
    maxFotoSayisi: { type: Number, default: 5 },
    anasayfaSlider: { type: Boolean, default: false },
    siraOnceligi: { type: Number, default: 0 },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.Package) {
  delete (mongoose.models as any).Package;
}

const PackageModel: Model<IPackage> = mongoose.model<IPackage>('Package', PackageSchema);

export default PackageModel;
