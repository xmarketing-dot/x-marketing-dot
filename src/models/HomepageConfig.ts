import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITickerItem {
  badge: string;
  text: string;
  link: string;
}

export interface IOzelIlanReklam {
  _id?: string;
  aktif: boolean;
  ilanId?: mongoose.Types.ObjectId | null;
  hedefIlSlug?: string; // 'tum_turkiye', 'istanbul', 'izmir', 'ankara', vb.
  gecikmeSaniye: number;
  baslik?: string;
  spotMetin?: string;
  rozet?: string;
}

export interface IBosVitrinSlider {
  _id?: string;
  gifUrl: string;
  topBadge: string;
  trafficBadge: string;
  title: string;
  spot: string;
  aktif: boolean;
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
  ozelIlanReklamlar: IOzelIlanReklam[];
  duyurular: ITickerItem[];
  bosVitrinSliderlar: IBosVitrinSlider[];
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
    _id: { type: String },
    aktif: { type: Boolean, default: false },
    ilanId: { type: Schema.Types.ObjectId, ref: 'Listing', default: null },
    hedefIlSlug: { type: String, default: 'tum_turkiye' },
    gecikmeSaniye: { type: Number, default: 4 },
    baslik: { type: String, default: '👑 GÜNÜN ÖZEL VIP İLANI' },
    spotMetin: { type: String, default: 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı' },
    rozet: { type: String, default: '🔥 SPONSORLU ÖZEL İLAN' },
  },
  { _id: false }
);

const BosVitrinSliderSchema = new Schema<IBosVitrinSlider>(
  {
    _id: { type: String },
    gifUrl: { type: String, required: true },
    topBadge: { type: String, default: '🔥 VİTRİNDE YERİNİZİ ALIN' },
    trafficBadge: { type: String, default: 'Günde 50.000+ Canlı Müşteri' },
    title: { type: String, default: 'İlanınız Bu Vitrinde Dönsün, Telefonunuz Susmasın!' },
    spot: { type: String, default: 'Türkiye\'nin en çok ziyaret edilen VIP eskort kataloğunun zirvesinde yer alın. WhatsApp hattınıza anında kesintisiz müşteri akışı sağlayın.' },
    aktif: { type: Boolean, default: true },
  },
  { _id: false, strict: false }
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
        hedefIlSlug: 'tum_turkiye',
        gecikmeSaniye: 4,
        baslik: '👑 GÜNÜN ÖZEL VIP İLANI',
        spotMetin: 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı',
        rozet: '🔥 SPONSORLU ÖZEL İLAN',
      }),
    },
    ozelIlanReklamlar: {
      type: [OzelIlanReklamSchema],
      default: [],
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
    bosVitrinSliderlar: {
      type: [BosVitrinSliderSchema],
      default: [
        {
          _id: 'promo-1',
          gifUrl: 'https://media.tenor.com/vDokuclgktwAAAAd/barbara-palvin-lingerie.gif',
          topBadge: '🔥 GÜNDE 50.000+ CANLI MÜŞTERİ',
          trafficBadge: '💎 EN ÇOK KAZANDIRAN ALAN',
          title: 'Zirvede Yerini Al, Telefonun Gece Gündüz Çalsın!',
          spot: 'Türkiye\'nin en popüler eskort vitrininde dakikalar içinde öne çıkın. WhatsApp hattınıza kesintisiz elit müşteri akışı başlatın.',
          aktif: true,
        },
        {
          _id: 'promo-2',
          gifUrl: 'https://64.media.tumblr.com/8c1cf789da9ba9a6cca6ee396f6f2dc7/0ed1f7c7e2c38e0a-dc/s500x750/6924e4454a9f477b6d1eaddaf38cb52a1917c51d.gif',
          topBadge: '👑 VIP VİTRİN İLE KAZANCINI KATLA',
          trafficBadge: '⚡ ANINDA MÜŞTERİ AKIŞI',
          title: 'Günde 50.000 Canlı Ziyaretçi Doğrudan Seni Görsün!',
          spot: 'Sayfaya giren herkesin ilk gördüğü dev vitrinde yerini ayırt. Komisyonsuz, doğrudan ve anında randevularını doldur.',
          aktif: true,
        },
        {
          _id: 'promo-3',
          gifUrl: 'https://i.looksmax.org/attachments/2022/12/3217147_booty-bounce-2.gif',
          topBadge: '💎 LÜKS & SEÇKİN PRESTİJ',
          trafficBadge: '🔥 %100 GERÇEK MÜŞTERİ',
          title: 'Bu Vitrinde Parlayın, En Çok Kazanan Siz Olun!',
          spot: 'Rakiplerinin önüne geç, anasayfanın 1 numaralı vitrinine yerleş. Saatlerce müşteri aramak yerine müşteriler sana yazsın.',
          aktif: true,
        },
        {
          _id: 'promo-4',
          gifUrl: 'https://media.tenor.com/7rtlPza-UqcAAAAM/asian.gif',
          topBadge: '⚡ ANINDA RANDEVU DOLDURMA',
          trafficBadge: '🚀 GOOGLE & ARAMA LİDERİ',
          title: 'Vitrine Sabitlenin, Müşteri Mesajlarına Yetişemeyin!',
          spot: 'Best Eskort VIP vitrini ile tüm şehirden gelen elit müşterilere ilk sırada ulaşın. WhatsApp randevu trafiğinizi hemen katlayın.',
          aktif: true,
        },
        {
          _id: 'promo-5',
          gifUrl: 'https://media.tenor.com/UpyRgPYevTMAAAAM/sexy-girl.gif',
          topBadge: '👑 SINIRSIZ GÖRÜNTÜLENME & GÜÇ',
          trafficBadge: '🌟 VIP ÖZEL AYRICALIK',
          title: 'İlanınızı Vitrine Taşıyın, Zirvenin Keyfini Çıkarın!',
          spot: 'Tek tıkla vitrinde yerinizi alın, profesyonel reklam avantajıyla sınırsız kazanç ve maksimum görünürlük elde edin.',
          aktif: true,
        },
      ],
    },
    sliderIlanIds: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
    oneCikanKategoriler: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true, autoIndex: false }
);

const HomepageConfigModel: Model<IHomepageConfig> =
  mongoose.models.HomepageConfig || mongoose.model<IHomepageConfig>('HomepageConfig', HomepageConfigSchema);

export default HomepageConfigModel;
