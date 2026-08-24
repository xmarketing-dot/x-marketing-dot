import { EventEmitter } from 'events';

class ChatEmitter extends EventEmitter {}

// Singleton event emitter across hot reloads
const globalForChat = global as unknown as { chatEmitter: ChatEmitter };

export const chatEmitter = globalForChat.chatEmitter || new ChatEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForChat.chatEmitter = chatEmitter;
}
