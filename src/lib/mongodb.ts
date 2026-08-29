import mongoose from 'mongoose';

const primaryUri = process.env.MONGODB_URI;

if (!primaryUri) {
  throw new Error('Database connection configuration missing.');
}

const directFallbackUri = process.env.MONGODB_FALLBACK_URI || 
  'mongodb://serkanbilsel_db_user:YbMs2qtpzjmJ8Fgi@ac-lmw0if1-shard-00-00.nj0njt0.mongodb.net:27017,ac-lmw0if1-shard-00-01.nj0njt0.mongodb.net:27017,ac-lmw0if1-shard-00-02.nj0njt0.mongodb.net:27017/marketing_pazarlama?ssl=true&authSource=admin&retryWrites=true&w=majority';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

const connectionOptions = {
  bufferCommands: false,
  autoIndex: false,
  maxPoolSize: 20,
  minPoolSize: 1,
  maxIdleTimeMS: 45000,
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 30000,
};

let indexesEnsured = false;
async function ensureEssentialIndexes(m: typeof mongoose) {
  if (indexesEnsured || process.env.NEXT_PHASE === 'phase-production-build') return;
  indexesEnsured = true;
  try {
    const db = m.connection.db;
    if (db) {
      // 1. ChatMessage: Instant lookup by threadId + chronological sorting
      db.collection('chatmessages').createIndex({ threadId: 1, createdAt: 1 }, { background: true }).catch(() => {});
      // 2. ChatThread: Fast sorting for admin thread list
      db.collection('chatthreads').createIndex({ updatedAt: -1 }, { background: true }).catch(() => {});
      db.collection('chatthreads').createIndex({ isBanned: 1, ip: 1 }, { background: true }).catch(() => {});
      // 3. Listing: High-speed status + tier + date indexing
      db.collection('listings').createIndex({ status: 1, rozet: -1, createdAt: -1 }, { background: true }).catch(() => {});
      db.collection('listings').createIndex({ status: 1, ilSlug: 1, ilceSlug: 1 }, { background: true }).catch(() => {});
      db.collection('listings').createIndex({ slug: 1 }, { background: true }).catch(() => {});
    }
  } catch (e) {
    // Non-fatal
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // If mongoose is already connected and ready, reuse connection immediately (0ms)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    ensureEssentialIndexes(mongoose);
    return mongoose;
  }

  if (cached.conn) {
    ensureEssentialIndexes(cached.conn);
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      // 1. Try direct shard hosts first (bypasses slow/broken DNS SRV lookups, connects in 500ms)
      try {
        return await mongoose.connect(directFallbackUri, connectionOptions);
      } catch (directErr) {
        console.warn('Direct connection failed, trying primary SRV URI...', directErr);
        try {
          return await mongoose.connect(primaryUri as string, connectionOptions);
        } catch (srvErr) {
          throw directErr;
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
    ensureEssentialIndexes(cached.conn);
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
