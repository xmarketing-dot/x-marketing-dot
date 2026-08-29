import mongoose from 'mongoose';

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

const connectionOptions = {
  bufferCommands: false,
  maxPoolSize: 20,
  minPoolSize: 1,
  maxIdleTimeMS: 45000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
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
      try {
        return await mongoose.connect(primaryUri as string, connectionOptions);
      } catch (firstErr) {
        try {
          return await mongoose.connect(directFallbackUri, connectionOptions);
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
