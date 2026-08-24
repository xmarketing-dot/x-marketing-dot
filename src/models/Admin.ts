import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  sifreHash: string;
  ad: string;
  role: string;
  sonGirisTarihi?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, index: true },
    sifreHash: { type: String, required: true },
    ad: { type: String, default: 'Süper Yönetici' },
    role: { type: String, default: 'superadmin' },
    sonGirisTarihi: { type: Date },
  },
  { timestamps: true }
);

const AdminModel: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default AdminModel;
