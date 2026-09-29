import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

// Temporary memory store for in-flight chunks (keyed by uploadId)
// Cleans up stale uploads after 5 minutes
const inFlightChunks = new Map<
  string,
  {
    chunks: string[];
    totalChunks: number;
    filename: string;
    mimeType: string;
    createdAt: number;
  }
>();

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of inFlightChunks.entries()) {
    if (now - session.createdAt > 5 * 60 * 1000) {
      inFlightChunks.delete(id);
    }
  }
}, 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uploadId, chunkIndex, totalChunks, chunkBase64, filename, mimeType } = body;

    if (!uploadId || chunkIndex === undefined || !totalChunks || !chunkBase64) {
      return NextResponse.json({ error: 'Eksik parametreler.' }, { status: 400 });
    }

    if (!inFlightChunks.has(uploadId)) {
      inFlightChunks.set(uploadId, {
        chunks: new Array(totalChunks),
        totalChunks,
        filename: filename || `file_${Date.now()}`,
        mimeType: mimeType || 'image/gif',
        createdAt: Date.now(),
      });
    }

    const session = inFlightChunks.get(uploadId)!;
    session.chunks[chunkIndex] = chunkBase64;

    // Check if all chunks received
    const allReceived = session.chunks.filter(Boolean).length === session.totalChunks;

    if (!allReceived) {
      return NextResponse.json({
        success: true,
        status: 'chunk_received',
        chunkIndex,
        totalChunks: session.totalChunks,
      });
    }

    // All chunks received -> Assemble full buffer
    const fullBase64 = session.chunks.join('');
    const fullBuffer = Buffer.from(fullBase64, 'base64');
    inFlightChunks.delete(uploadId);

    // Enforce 15MB limit
    if (fullBuffer.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Toplam dosya boyutu 15MB sınırını aşıyor.' }, { status: 400 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db!;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

    const isGif = session.mimeType === 'image/gif' || session.filename.toLowerCase().endsWith('.gif');
    const finalFilename = isGif
      ? `gif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.gif`
      : `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;

    const fileId = await new Promise<string>((resolve, reject) => {
      const readable = Readable.from(fullBuffer);
      const uploadStream = bucket.openUploadStream(finalFilename, {
        metadata: {
          contentType: isGif ? 'image/gif' : session.mimeType || 'image/webp',
          uploadedAt: new Date(),
        },
      });
      readable.pipe(uploadStream);
      uploadStream.on('finish', () => resolve(uploadStream.id.toString()));
      uploadStream.on('error', reject);
    });

    return NextResponse.json({
      success: true,
      urls: [`/api/img/${fileId}`],
      url: `/api/img/${fileId}`,
    });
  } catch (error: any) {
    console.error('Chunked Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Parçalı dosya yükleme sırasında hata oluştu.' },
      { status: 500 }
    );
  }
}
