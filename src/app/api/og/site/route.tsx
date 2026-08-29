import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Optional query params: ?il=istanbul&ilce=beylikduzu
    const { searchParams } = new URL(req.url);
    const ilFilter = searchParams.get('il');
    const ilceFilter = searchParams.get('ilce');

    // Build query — prefer filtered (bölgesel gateway), fallback to all
    const buildQuery = (ilSlug?: string | null, ilceSlug?: string | null) => {
      const base: any = {
        status: 'yayinda',
        $or: [
          { 'anaFotograf.url': { $exists: true, $ne: '' } },
          { 'fotograflar.0.url': { $exists: true, $ne: '' } },
        ],
      };
      if (ilSlug) base.ilSlug = ilSlug;
      if (ilceSlug) base.ilceSlug = ilceSlug;
      return base;
    };

    // Try filtered first, then broader fallback
    let listings: any[] = [];
    if (ilceFilter) {
      listings = await ListingModel.find(buildQuery(ilFilter, ilceFilter))
        .select('anaFotograf fotograflar')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();
    }
    if (!listings.length && ilFilter) {
      listings = await ListingModel.find(buildQuery(ilFilter, null))
        .select('anaFotograf fotograflar')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();
    }
    if (!listings.length) {
      listings = await ListingModel.find(buildQuery(null, null))
        .select('anaFotograf fotograflar')
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();
    }

    let inputBuffer: Buffer | null = null;

    if (listings.length > 0) {
      // Try each listing until we get a valid image buffer
      const shuffled = [...listings].sort(() => Math.random() - 0.5);

      for (const listing of shuffled) {
        const photoUrl: string =
          listing.anaFotograf?.url ||
          (listing.fotograflar?.length > 0 ? listing.fotograflar[0]?.url : '');

        if (!photoUrl) continue;

        // Case 1: Base64 data URL
        if (photoUrl.startsWith('data:image/')) {
          const match = photoUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,([\s\S]+)$/);
          if (match) {
            inputBuffer = Buffer.from(match[2], 'base64');
            break;
          }
        }

        // Case 2: Local /uploads/ path (relative) — read from filesystem
        if (photoUrl.startsWith('/uploads/')) {
          try {
            const localPath = path.join(process.cwd(), 'public', photoUrl);
            if (fs.existsSync(localPath)) {
              inputBuffer = fs.readFileSync(localPath);
              break;
            }
          } catch (e) {}
        }

        // Case 3: Absolute HTTP(S) URL
        if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
          try {
            const imgRes = await fetch(photoUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BestEskortOGProxy/1.0)' },
              signal: AbortSignal.timeout(5000),
            });
            if (imgRes.ok) {
              inputBuffer = Buffer.from(await imgRes.arrayBuffer());
              break;
            }
          } catch (e) {}
        }
      }
    }

    if (inputBuffer) {
      try {
        const jpegBuffer = await sharp(inputBuffer)
          .resize(1200, 630, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 88, mozjpeg: true })
          .toBuffer();

        return new NextResponse(new Uint8Array(jpegBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': jpegBuffer.length.toString(),
            'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
          },
        });
      } catch (sharpErr) {
        try {
          const fallbackJpeg = await sharp(inputBuffer).jpeg({ quality: 85 }).toBuffer();
          return new NextResponse(new Uint8Array(fallbackJpeg), {
            status: 200,
            headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=60' },
          });
        } catch (e) {}
      }
    }

    // Final fallback: branded SVG → JPEG
    const regionLabel = ilceFilter
      ? `${ilceFilter.charAt(0).toUpperCase() + ilceFilter.slice(1)} Eskort İlanları`
      : ilFilter
      ? `${ilFilter.charAt(0).toUpperCase() + ilFilter.slice(1)} Eskort İlanları`
      : 'Best Eskort — Türkiye Geneli';

    const fallbackSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#0d1117"/>
        <rect x="24" y="24" width="1152" height="582" rx="24" fill="#161b22" stroke="#f59e0b" stroke-width="4"/>
        <text x="600" y="240" font-size="72" font-weight="900" fill="#f59e0b" text-anchor="middle" font-family="sans-serif">BEST ESKORT</text>
        <text x="600" y="330" font-size="32" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${regionLabel}</text>
        <text x="600" y="410" font-size="22" font-weight="bold" fill="#8b949e" text-anchor="middle" font-family="sans-serif">Doğrulanmış Güncel İlanlar &amp; WhatsApp Hatları</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(fallbackSvg);
    const jpegFallback = await sharp(svgBuffer).jpeg({ quality: 90 }).toBuffer();

    return new NextResponse(new Uint8Array(jpegFallback), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': jpegFallback.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    return new NextResponse('OG Error', { status: 500 });
  }
}
