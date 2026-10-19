import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * In-memory buffer cache for serverless hot instances (Bypass GridFS on repeated hits)
 */
const memCache = new Map<string, { buffer: Buffer; contentType: string; filename: string }>();
const MAX_MEM_CACHE = 500;

/**
 * GET /api/img/[id]
 * MongoDB GridFS'ten fotoğrafı çekip servis eder.
 * Vercel Edge CDN (s-maxage) ile 1 yıl boyunca Vercel sunucularında önbelleğe alınır,
 * böylece MongoDB'ye tekrar tekrar sorgu gitmez ve bağlantı kotası dolmaz.
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

    // 1. Sıcak bellek kontrolü (0ms, 0 db bağlantısı)
    if (memCache.has(id)) {
      const cached = memCache.get(id)!;
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

    // 2. Veritabanına bağlan
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      return new NextResponse('Veritabanı hazır değil', { status: 503 });
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const objectId = new mongoose.Types.ObjectId(id);

    // GridFS'ten doğrudan stream olarak oku (Ayrı find sorgusunu bypass ederek gecikmeyi yarıya indirir)
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

    const buffer = Buffer.concat(chunks);
    const contentType = fileDoc?.metadata?.contentType || 'image/webp';
    const filename = fileDoc?.filename || `image-${id}.webp`;

    // Bellek sınırını koru
    if (memCache.size >= MAX_MEM_CACHE) {
      const firstKey = memCache.keys().next().value;
      if (firstKey) memCache.delete(firstKey);
    }
    memCache.set(id, { buffer, contentType, filename });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Vercel Pro Edge CDN + Browser 1 Yıl Kalıcı Önbellek
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable',
        'CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Cache': 'MISS-DB',
      },
    });
  } catch (error: any) {
    console.error('Image serve error:', error);
    return new NextResponse('Resim yüklenemedi', { status: 500 });
  }
}
