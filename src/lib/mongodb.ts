import mongoose from 'mongoose';
import dns from 'dns';

// Fixes ECONNREFUSED on local Turkish ISP routers / Windows DNS caches
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const primaryUri = process.env.MONGODB_URI;
const directFallbackUri = process.env.MONGODB_FALLBACK_URI;

if (!primaryUri && !directFallbackUri) {
  throw new Error('Database connection configuration missing. Please define MONGODB_URI.');
}

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
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 45000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

function resolveDirectAtlasUri(uri: string): string | null {
  try {
    const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)(\?.*)?$/);
    if (!match) return null;
    const [, user, pass, host, db] = match;
    if (host.includes('nj0njt0.mongodb.net')) {
      const shards = [
        'ac-lmw0if1-shard-00-00.nj0njt0.mongodb.net:27017',
        'ac-lmw0if1-shard-00-01.nj0njt0.mongodb.net:27017',
        'ac-lmw0if1-shard-00-02.nj0njt0.mongodb.net:27017',
      ].join(',');
      return `mongodb://${user}:${pass}@${shards}/${db}?ssl=true&authSource=admin&replicaSet=atlas-x07qfw-shard-0&retryWrites=true&w=majority`;
    }
  } catch (e) {}
  return null;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // If mongoose is already connected and ready, reuse connection immediately (0ms)
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      const rawUri = primaryUri || directFallbackUri || '';
      const directResolved = resolveDirectAtlasUri(rawUri) || directFallbackUri;

      // 1. Doğrudan shard sunucularına bağlan (DNS SRV ECONNREFUSED hatasını ve 60s timeout'unu çözer, 500ms)
      if (directResolved) {
        try {
          return await mongoose.connect(directResolved, connectionOptions);
        } catch (directErr) {
          console.warn('Direct connection failed, trying standard SRV URI...', directErr);
        }
      }

      // 2. Standart SRV URI dene
      return await mongoose.connect(rawUri, connectionOptions);
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
