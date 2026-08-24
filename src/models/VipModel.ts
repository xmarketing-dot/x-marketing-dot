import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVipModelComment {
  _id?: string;
  yazar: string;
  yorum: string;
  puan: number;
  onayli: boolean;
  createdAt: Date;
}

export interface IVipModel extends Document {
  slug: string;
  tamAd: string;
  unvan: string;
  platformlar: string[];
  biyografi: string;
  likeSayisi: number;
  goruntulenmeSayisi: number;
  yas: number;
  boy: number;
  kilo: number;
  gogusOlcusu: string;
  sacRengi: string;
  gozRengi: string;
  burc?: string;
  uyruk: string;
  diller: string[];
  anaFotografUrl: string;
  fotograflar: string[];
  anonimYorumlar: IVipModelComment[];
  isVerified: boolean;
  siraNo: number;
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VipModelCommentSchema = new Schema<IVipModelComment>({
  yazar: { type: String, default: 'Anonim Hayran' },
  yorum: { type: String, required: true },
  puan: { type: Number, default: 5, min: 1, max: 5 },
  onayli: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const VipModelSchema = new Schema<IVipModel>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    tamAd: { type: String, required: true },
    unvan: { type: String, default: 'Dijital Fenomen & VIP Model' },
    platformlar: { type: [String], default: ['OnlyFans', 'Twitter / X', 'Instagram', 'TikTok'] },
    biyografi: { type: String, required: true },
    likeSayisi: { type: Number, default: 24890 },
    goruntulenmeSayisi: { type: Number, default: 84900 },
    yas: { type: Number, default: 25 },
    boy: { type: Number, default: 171 },
    kilo: { type: Number, default: 53 },
    gogusOlcusu: { type: String, default: '85C (Doğal)' },
    sacRengi: { type: String, default: 'Siyah' },
    gozRengi: { type: String, default: 'Koyu Kahve' },
    burc: { type: String, default: 'Akrep' },
    uyruk: { type: String, default: 'Türkiye' },
    diller: [{ type: String }],
    anaFotografUrl: { type: String, required: true },
    fotograflar: [{ type: String }],
    anonimYorumlar: [VipModelCommentSchema],
    isVerified: { type: Boolean, default: true },
    siraNo: { type: Number, default: 0 },
    aktif: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

if (mongoose.models.VipModel) {
  delete (mongoose.models as any).VipModel;
}

const VipModel: Model<IVipModel> =
  mongoose.models.VipModel || mongoose.model<IVipModel>('VipModel', VipModelSchema);

export default VipModel;
