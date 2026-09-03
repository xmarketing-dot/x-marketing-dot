import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompetitor {
  position: number;
  domain: string;
  title?: string;
}

export interface IKeywordRank extends Document {
  keyword: string;
  targetDomain: string;
  currentPosition: number; // 0 = 100+ veya bulunamadı, 1-100 = Google sıralama
  previousPosition: number;
  change: number; // Google değişim
  bestPosition: number;
  topCompetitors: ICompetitor[];
  // Yandex Canlı Sıralamaları
  yandexPosition?: number;
  previousYandexPosition?: number;
  yandexChange?: number;
  yandexCompetitors?: ICompetitor[];
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitorSchema = new Schema<ICompetitor>(
  {
    position: { type: Number, required: true },
    domain: { type: String, required: true },
    title: { type: String },
  },
  { _id: false }
);

const KeywordRankSchema = new Schema<IKeywordRank>(
  {
    keyword: { type: String, required: true, unique: true, trim: true, lowercase: true },
    targetDomain: { type: String, default: '' },
    currentPosition: { type: Number, default: 0 },
    previousPosition: { type: Number, default: 0 },
    change: { type: Number, default: 0 },
    bestPosition: { type: Number, default: 0 },
    topCompetitors: [CompetitorSchema],
    yandexPosition: { type: Number, default: 0 },
    previousYandexPosition: { type: Number, default: 0 },
    yandexChange: { type: Number, default: 0 },
    yandexCompetitors: [CompetitorSchema],
    lastCheckedAt: { type: Date },
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

const KeywordRankModel: Model<IKeywordRank> =
  mongoose.models.KeywordRank || mongoose.model<IKeywordRank>('KeywordRank', KeywordRankSchema);

export default KeywordRankModel;
