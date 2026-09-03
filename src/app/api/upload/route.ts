import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import { Readable } from 'stream';

// Allowed image MIME types & extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
  '.avif',
]);

/**
 * GridFS'e buffer yükler ve dosya ID'sini döner.
 * Vercel read-only dosya sistemi sorununu tamamen ortadan kaldırır.
 */
async function uploadToGridFS(buffer: Buffer, filename: string): Promise<string> {
  await connectToDatabase();
  const db = mongoose.connection.db!;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

  return new Promise((resolve, reject) => {
    const readable = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType: 'image/webp', uploadedAt: new Date() },
    });

    readable.pipe(uploadStream);

    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.on('error', reject);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Yüklenecek resim dosyası bulunamadı.' }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Tek seferde en fazla 10 fotoğraf yükleyebilirsiniz.' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `"${file.name}" çok büyük. Maksimum dosya boyutu 10MB olmalıdır.` }, { status: 400 });
      }

      const fileExt = (file.name ? require('path').extname(file.name) : '').toLowerCase();
      const mime = (file.type || '').toLowerCase();

      const isValid = ALLOWED_MIME_TYPES.has(mime) || mime.startsWith('image/') || ALLOWED_EXTENSIONS.has(fileExt);

      if (!isValid) {
        return NextResponse.json(
          { error: `"${file.name}" desteklenmeyen bir dosya türü. Lütfen JPG, JPEG, PNG veya WEBP yükleyin.` },
          { status: 400 }
        );
      }

      // Read buffer
      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // Process with Sharp → WebP + Anti-Theft Watermark
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
      const cleanDomain = host ? host.split(':')[0].toLowerCase() : 'besteskort.com';

      const image = sharp(inputBuffer).rotate();
      const metadata = await image.metadata();
      const imgWidth = metadata.width || 1200;
      const imgHeight = metadata.height || 1200;

      const fontSize = Math.round(imgWidth * 0.08);
      const watermarkSvg = `
      <svg width="${imgWidth}" height="${imgHeight}" viewBox="0 0 ${imgWidth} ${imgHeight}" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-28 ${imgWidth / 2} ${imgHeight / 2})">
          <text x="${imgWidth / 2}" y="${imgHeight / 2 - fontSize * 0.2}" font-family="sans-serif" font-size="${fontSize}" font-weight="900" fill="white" fill-opacity="0.22" text-anchor="middle" letter-spacing="6">BEST ESKORT</text>
          <text x="${imgWidth / 2}" y="${imgHeight / 2 + fontSize * 0.85}" font-family="sans-serif" font-size="${Math.round(fontSize * 0.42)}" font-weight="700" fill="#fbbf24" fill-opacity="0.25" text-anchor="middle" letter-spacing="3">${cleanDomain}</text>
        </g>
      </svg>
      `;

      const processedBuffer = await image
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .composite([{ input: Buffer.from(watermarkSvg), gravity: 'center', blend: 'over' }])
        .webp({ quality: 86, effort: 4 })
        .toBuffer();

      // GridFS'e yükle — Vercel read-only sorununu aşar
      const fileName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
      const fileId = await uploadToGridFS(processedBuffer, fileName);

      // /api/img/[id] route üzerinden servis edilecek
      uploadedUrls.push(`/api/img/${fileId}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Resim yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
