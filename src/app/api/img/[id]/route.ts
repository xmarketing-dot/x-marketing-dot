import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * GET /api/img/[id]
 * MongoDB GridFS'ten fotoğrafı çekip servis eder.
 * Vercel'in read-only dosya sistemini tamamen bypass eder.
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

    await connectToDatabase();
    const db = mongoose.connection.db!;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

    const objectId = new mongoose.Types.ObjectId(id);

    // Dosya bilgilerini al
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return new NextResponse('Resim bulunamadı', { status: 404 });
    }

    const file = files[0];

    // GridFS'ten stream olarak oku
    const downloadStream = bucket.openDownloadStream(objectId);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      downloadStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      downloadStream.on('end', () => resolve());
      downloadStream.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': (file as any).metadata?.contentType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 yıl browser cache
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="${file.filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Image serve error:', error);
    return new NextResponse('Resim yüklenemedi', { status: 500 });
  }
}
