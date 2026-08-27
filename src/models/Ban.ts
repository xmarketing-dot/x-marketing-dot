import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBan extends Document {
  ip?: string;
  threadId?: string;
  sebep: string;
  engellemeTuru: 'tam_ban' | 'chat_ban';
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BanSchema = new Schema<IBan>(
  {
    ip: { type: String, index: true, default: null },
    threadId: { type: String, index: true, default: null },
    sebep: { type: String, default: 'Yönetici tarafından engellendi' },
    engellemeTuru: {
      type: String,
      enum: ['tam_ban', 'chat_ban'],
      default: 'tam_ban',
    },
    aktif: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

BanSchema.index({ aktif: 1, ip: 1 });
BanSchema.index({ aktif: 1, threadId: 1 });

const BanModel: Model<IBan> = mongoose.models.Ban || mongoose.model<IBan>('Ban', BanSchema);
export default BanModel;
