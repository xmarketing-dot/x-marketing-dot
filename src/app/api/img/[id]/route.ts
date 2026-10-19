import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import sharp from 'sharp';

/**
 * In-memory buffer cache for serverless hot instances (Bypass GridFS on repeated hits)
 */
const memCache = new Map<string, { buffer: Buffer; contentType: string; filename: string }>();
const MAX_MEM_CACHE = 800;

/**
 * GET /api/img/[id]
 * MongoDB GridFS'ten fotoğrafı çekip servis eder.
 * ?w=360 gibi parametreler ile anında ultra hafif thumbnail üretir ve Vercel CDN'de 1 yıl saklar.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse('Geçersiz resim ID', { status: 400 });
    }

    const rawW = req.nextUrl.searchParams.get('w');
    const isRaw = rawW === 'raw' || rawW === 'orig';
    const targetWidth = isRaw ? 0 : (rawW ? Math.min(1200, Math.max(80, parseInt(rawW, 10) || 0)) : 1080);
    const cacheKey = targetWidth > 0 ? `${id}_w${targetWidth}` : id;

    // 1. Sıcak bellek kontrolü (0ms, 0 db bağlantısı)
    if (memCache.has(cacheKey)) {
      const cached = memCache.get(cacheKey)!;
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
          'CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
          'Content-Length': cached.buffer.length.toString(),
          'Content-Disposition': `inline; filename="${cached.filename}"`,
          'X-Cache': 'HIT-MEM',
        },
      });
    }

    // 2. Orijinal buffer'ı bellekten veya GridFS'ten temin et
    let originalBuffer: Buffer;
    let contentType = 'image/webp';
    let filename = `image-${id}.webp`;

    if (memCache.has(id)) {
      const orig = memCache.get(id)!;
      originalBuffer = orig.buffer;
      contentType = orig.contentType;
      filename = orig.filename;
    } else {
      await connectToDatabase();
      const db = mongoose.connection.db;
      if (!db) {
        return new NextResponse('Veritabanı hazır değil', { status: 503 });
      }

      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
      const objectId = new mongoose.Types.ObjectId(id);

      const downloadStream = bucket.openDownloadStream(objectId);
      let fileDoc: any = null;
      downloadStream.on('file', (file) => {
        fileDoc = file;
      });

      const chunks: Buffer[] = [];
      try {
        await new Promise<void>((resolve, reject) => {
          downloadStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          downloadStream.on('end', () => resolve());
          downloadStream.on('error', reject);
        });
      } catch (streamErr: any) {
        return new NextResponse('Resim bulunamadı', { status: 404 });
      }

      if (chunks.length === 0) {
        return new NextResponse('Resim içeriği boş', { status: 404 });
      }

      originalBuffer = Buffer.concat(chunks);
      contentType = fileDoc?.metadata?.contentType || 'image/webp';
      filename = fileDoc?.filename || `image-${id}.webp`;

      if (memCache.size >= MAX_MEM_CACHE) {
        const firstKey = memCache.keys().next().value;
        if (firstKey) memCache.delete(firstKey);
      }
      memCache.set(id, { buffer: originalBuffer, contentType, filename });
    }

    // 3. Boyutlandırma istenmişse Sharp ile ultra hafif thumbnail üret (~10KB)
    let finalBuffer = originalBuffer;
    let finalContentType = contentType;

    if (targetWidth > 0 && !contentType.includes('gif')) {
      try {
        finalBuffer = await sharp(originalBuffer)
          .resize(targetWidth, null, { withoutEnlargement: true })
          .webp({ quality: 86, effort: 4 })
          .toBuffer();
        finalContentType = 'image/webp';
      } catch (sharpErr) {
        console.error('Sharp resize error, falling back to original:', sharpErr);
        finalBuffer = originalBuffer;
      }
    }

    if (cacheKey !== id) {
      if (memCache.size >= MAX_MEM_CACHE) {
        const firstKey = memCache.keys().next().value;
        if (firstKey) memCache.delete(firstKey);
      }
      memCache.set(cacheKey, { buffer: finalBuffer, contentType: finalContentType, filename });
    }

    return new NextResponse(new Uint8Array(finalBuffer), {
      status: 200,
      headers: {
        'Content-Type': finalContentType,
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
        'CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
        'Content-Length': finalBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Cache': 'MISS-DB',
      },
    });
  } catch (error: any) {
    console.error('Image serve error:', error);
    return new NextResponse('Resim yüklenemedi', { status: 500 });
  }
}

