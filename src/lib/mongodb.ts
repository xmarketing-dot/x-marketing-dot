import mongoose from 'mongoose';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

function applyPublicDNS() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Silent
  }
}

const primaryUri = process.env.MONGODB_URI;

if (!primaryUri) {
  throw new Error('Database connection configuration missing.');
}

const directFallbackUri = process.env.MONGODB_FALLBACK_URI || primaryUri;

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

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  applyPublicDNS();

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        return await mongoose.connect(primaryUri as string, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000,
        });
      } catch (firstErr) {
        try {
          return await mongoose.connect(directFallbackUri, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
          });
        } catch (secondErr) {
          throw firstErr;
        }
      }
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
