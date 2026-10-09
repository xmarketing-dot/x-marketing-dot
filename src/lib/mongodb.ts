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
  maxPoolSize: 2,
  minPoolSize: 0,
  maxIdleTimeMS: 5000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 20000,
};

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
      const uri = primaryUri || directFallbackUri || '';
      
      // Ensure Google/Cloudflare DNS to resolve SRV cleanly without local ISP blocking
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      } catch (e) {}

      return await mongoose.connect(uri, connectionOptions);
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
