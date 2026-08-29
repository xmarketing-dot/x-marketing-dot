import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompetitor {
  position: number;
  domain: string;
  title?: string;
}

export interface IKeywordRank extends Document {
  keyword: string;
  targetDomain: string;
  currentPosition: number; // 0 = 100+ veya bulunamadı, 1-100 = sıralama
  previousPosition: number;
  change: number; // Pozitif = yükseldi (örn: +3), Negatif = düştü (örn: -2)
  bestPosition: number;
  topCompetitors: ICompetitor[];
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
    targetDomain: { type: String, default: 'besteskort.devs.surf' },
    currentPosition: { type: Number, default: 0 },
    previousPosition: { type: Number, default: 0 },
    change: { type: Number, default: 0 },
    bestPosition: { type: Number, default: 0 },
    topCompetitors: [CompetitorSchema],
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
