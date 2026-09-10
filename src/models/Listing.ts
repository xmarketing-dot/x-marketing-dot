import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhoto {
  url: string;
  publicId?: string;
  siraNo?: number;
}

export interface IComment {
  _id?: string;
  yazar: string;
  yorum: string;
  puan: number;
  onayli: boolean;
  createdAt: Date;
}

export interface IListing extends Document {
  slug: string;
  baslik: string;
  aciklama: string;
  kategoriId?: mongoose.Types.ObjectId;
  ilSlug: string;
  ilceSlug: string;
  kullaniciId?: mongoose.Types.ObjectId;
  chatThreadId?: string;
  panelSifresi?: string;
  paketId?: mongoose.Types.ObjectId;
  yayinSuresi: 'gunluk' | 'haftalik' | 'aylik';
  paketBitisTarihi?: Date;
  fotograflar: IPhoto[];
  anaFotograf: IPhoto;
  whatsappNumara: string;
  fiyat: number;
  paraBirimi: string;
  rozet: 'ultravip' | 'vip' | 'gold' | 'silver' | 'standart' | null;
  status: 'taslak' | 'odeme_bekliyor' | 'onay_bekliyor' | 'yayinda' | 'reddedildi' | 'suresi_doldu';
  reddedilmeNedeni?: string;
  goruntulenmeSayisi: number;
  whatsappTiklamaSayisi: number;
  likeSayisi: number;
  vitrinIstegi: boolean;
  isVitrin?: boolean;
  vitrinPaketi?: 'gunluk' | 'haftalik';
  vitrinBaslangicTarihi?: Date;
  vitrinBitisTarihi?: Date;
  vitrinSuresiDolduBildirildi?: boolean;
  
  // %100 Doğrulanmış Özel Profil Alanları
  isVerifiedProfile: boolean;
  tamAd?: string;
  yas?: number;
  boy?: number;
  kilo?: number;
  gogusOlcusu?: string;
  sacRengi?: string;
  gozRengi?: string;
  uyruk?: string;
  diller?: string[];
  hizmetMekanlari?: string[];
  hakkindaBiyografi?: string;
  anonimYorumlar?: IComment[];

  visitorId?: string;
  creatorIp?: string;

  onaylanmaTarihi?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  url: { type: String, required: true },
  publicId: { type: String },
  siraNo: { type: Number, default: 0 },
});

const CommentSchema = new Schema<IComment>({
  yazar: { type: String, default: 'Anonim Kullanıcı' },
  yorum: { type: String, required: true },
  puan: { type: Number, default: 5, min: 1, max: 5 },
  onayli: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const ListingSchema = new Schema<IListing>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    baslik: { type: String, required: true },
    aciklama: { type: String, required: true },
    kategoriId: { type: Schema.Types.ObjectId, ref: 'Category', required: false, index: true },
    ilSlug: { type: String, required: true, index: true },
    ilceSlug: { type: String, required: true, index: true },
    kullaniciId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    chatThreadId: { type: String, index: true },
    panelSifresi: { type: String },
    paketId: { type: Schema.Types.ObjectId, ref: 'Package' },
    yayinSuresi: { type: String, enum: ['gunluk', 'haftalik', 'aylik'], default: 'haftalik' },
    paketBitisTarihi: { type: Date, index: true },
    fotograflar: [PhotoSchema],
    anaFotograf: { type: PhotoSchema, required: true },
    whatsappNumara: { type: String, required: true },
    fiyat: { type: Number, default: 0 },
    paraBirimi: { type: String, default: 'TL' },
    rozet: {
      type: String,
      enum: ['ultravip', 'vip', 'gold', 'silver', 'standart', null],
      default: 'silver',
      index: true,
    },
    status: {
      type: String,
      enum: ['taslak', 'odeme_bekliyor', 'onay_bekliyor', 'yayinda', 'reddedildi', 'suresi_doldu'],
      default: 'onay_bekliyor',
      index: true,
    },
    reddedilmeNedeni: { type: String },
    goruntulenmeSayisi: { type: Number, default: 0 },
    whatsappTiklamaSayisi: { type: Number, default: 0 },
    likeSayisi: { type: Number, default: 0, index: true },
    vitrinIstegi: { type: Boolean, default: false, index: true },
    isVitrin: { type: Boolean, default: false, index: true },
    vitrinPaketi: { type: String, enum: ['gunluk', 'haftalik'], default: 'gunluk' },
    vitrinBaslangicTarihi: { type: Date },
    vitrinBitisTarihi: { type: Date, index: true },
    vitrinSuresiDolduBildirildi: { type: Boolean, default: false },

    // Özel Profil ve Yorum Sistemi
    isVerifiedProfile: { type: Boolean, default: false, index: true },
    tamAd: { type: String, default: null },
    yas: { type: Number, default: null },
    boy: { type: Number, default: null },
    kilo: { type: Number, default: null },
    gogusOlcusu: { type: String, default: null },
    sacRengi: { type: String, default: null },
    gozRengi: { type: String, default: null },
    uyruk: { type: String, default: 'Türkiye' },
    diller: [{ type: String }],
    hizmetMekanlari: [{ type: String }],
    hakkindaBiyografi: { type: String, default: null },
    anonimYorumlar: [CommentSchema],

    visitorId: { type: String, index: true },
    creatorIp: { type: String, index: true },

    onaylanmaTarihi: { type: Date },
  },
  {
    timestamps: true,
    autoIndex: false,
    strict: false,
  }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.Listing) {
  delete (mongoose.models as any).Listing;
}

const ListingModel: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);

export default ListingModel;
