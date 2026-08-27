import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  ad?: string;
  kullaniciAdi: string;
  telefon?: string;
  email?: string;
  sifreHash?: string;
  chatThreadId?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    ad: { type: String, default: '' },
    kullaniciAdi: { type: String, required: true, unique: true, index: true },
    telefon: { type: String, default: '' },
    email: { type: String, default: '' },
    sifreHash: { type: String, default: '' },
    chatThreadId: { type: Schema.Types.ObjectId, ref: 'ChatThread' },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
