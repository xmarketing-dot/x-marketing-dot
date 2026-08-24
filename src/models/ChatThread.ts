import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatThread extends Document {
  kullaniciAdi: string;
  kullaniciTelefon?: string;
  ip?: string;
  isBanned?: boolean;
  banTuru?: 'tam_ban' | 'chat_ban';
  banSebebi?: string;
  listingId?: string;
  listingBaslik?: string;
  listingSlug?: string;
  username?: string;
  password?: string;
  sonMesajOzeti: string;
  okunmadiAdminSayisi: number;
  okunmadiKullaniciSayisi: number;
  updatedAt: Date;
  createdAt: Date;
}

const ChatThreadSchema = new Schema<IChatThread>(
  {
    kullaniciAdi: { type: String, required: true, default: 'Ziyaretçi' },
    kullaniciTelefon: { type: String },
    ip: { type: String, index: true },
    isBanned: { type: Boolean, default: false, index: true },
    banTuru: { type: String, enum: ['tam_ban', 'chat_ban'], default: null },
    banSebebi: { type: String, default: null },
    listingId: { type: String, index: true, default: null },
    listingBaslik: { type: String, default: null },
    listingSlug: { type: String, default: null },
    username: { type: String, default: null },
    password: { type: String, default: null },
    sonMesajOzeti: { type: String, default: '' },
    okunmadiAdminSayisi: { type: Number, default: 0 },
    okunmadiKullaniciSayisi: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (mongoose.models.ChatThread) {
  delete (mongoose.models as any).ChatThread;
}

const ChatThreadModel: Model<IChatThread> =
  mongoose.models.ChatThread || mongoose.model<IChatThread>('ChatThread', ChatThreadSchema);

export default ChatThreadModel;
