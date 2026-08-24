import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Yüklenecek resim dosyası bulunamadı.' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      // 1. Strict MIME type check
      if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `"${file.name}" bir resim dosyası değil! Sadece resim yükleyebilirsiniz.` },
          { status: 400 }
        );
      }

      // 2. Read array buffer
      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // 3. Process & Convert to Optimized WebP with Sharp
      try {
        const processedBuffer = await sharp(inputBuffer)
          .rotate() // Auto-orient based on EXIF camera orientation
          .resize(1600, 1600, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85, effort: 4 })
          .toBuffer();

        // 4. Save to public/uploads with .webp extension
        const fileName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, processedBuffer);
        uploadedUrls.push(`/uploads/${fileName}`);
      } catch (sharpError) {
        console.error('Sharp Image Processing Error:', sharpError);
        return NextResponse.json(
          { error: `"${file.name}" bozuk veya geçersiz bir resim dosyası.` },
          { status: 400 }
        );
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'Geçerli resim dosyası yüklenemedi.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Resim yükleme hatası' }, { status: 500 });
  }
}
