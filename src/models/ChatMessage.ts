import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  gonderenTipi: 'user' | 'admin';
  mesaj: string;
  okundu: boolean;
  telegramMessageId?: number;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true, index: true },
    gonderenTipi: { type: String, enum: ['user', 'admin'], required: true },
    mesaj: { type: String, required: true },
    okundu: { type: Boolean, default: false },
    telegramMessageId: { type: Number, index: true },
  },
  { timestamps: true, autoIndex: false }
);

const ChatMessageModel: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessageModel;
