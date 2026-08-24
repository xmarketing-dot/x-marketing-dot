import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  ad: string;
  slug: string;
  ikon?: string;
  aciklama?: string;
  siraNo: number;
  aktif: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    ad: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    ikon: { type: String, default: 'Tag' },
    aciklama: { type: String },
    siraNo: { type: Number, default: 0 },
    aktif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default CategoryModel;
