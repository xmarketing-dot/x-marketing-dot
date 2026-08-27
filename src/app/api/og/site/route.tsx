import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Query active listings with photos
    const listings = await ListingModel.find({
      status: 'yayinda',
      $or: [
        { 'anaFotograf.url': { $exists: true, $ne: '' } },
        { 'fotograflar.0.url': { $exists: true, $ne: '' } },
      ],
    })
      .select('anaFotograf fotograflar')
      .sort({ updatedAt: -1 })
      .limit(30)
      .lean();

    let rawBuffer: Buffer | null = null;

    if (listings.length > 0) {
      // Pick random listing from active pool
      const randomListing: any = listings[Math.floor(Math.random() * listings.length)];
      const photoUrl =
        randomListing.anaFotograf?.url ||
        (randomListing.fotograflar && randomListing.fotograflar.length > 0 ? randomListing.fotograflar[0]?.url : '');

      if (photoUrl && photoUrl.startsWith('data:image/')) {
        const match = photoUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,([\s\S]+)$/);
        if (match) {
          rawBuffer = Buffer.from(match[2], 'base64');
        }
      } else if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
        try {
          const imgRes = await fetch(photoUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BestEskortOGProxy/1.0)',
            },
          });
          if (imgRes.ok) {
            const arr = await imgRes.arrayBuffer();
            rawBuffer = Buffer.from(arr);
          }
        } catch (e) {}
      }
    }

    if (rawBuffer) {
      try {
        // Convert to standard JPEG format (1200x630) for 100% WhatsApp/Telegram preview compatibility
        const jpegBuffer = await sharp(rawBuffer)
          .resize(1200, 630, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 85 })
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
        return new NextResponse(new Uint8Array(rawBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=60',
          },
        });
      }
    }

    // Default Fallback JPEG via sharp
    const fallbackSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#0d1117"/>
        <rect x="20" y="20" width="1160" height="590" rx="24" fill="#161b22" stroke="#f59e0b" stroke-width="4"/>
        <text x="600" y="260" font-size="72" font-weight="900" fill="#f59e0b" text-anchor="middle" font-family="sans-serif">BEST ESKORT</text>
        <text x="600" y="340" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle" font-family="sans-serif">TÜRKİYE'NİN EN GÜVENİLİR VIP ESKORT İLANLARI</text>
        <text x="600" y="420" font-size="22" font-weight="bold" fill="#8b949e" text-anchor="middle" font-family="sans-serif">81 İl ve Tüm İlçelerde Doğrulanmış Güncel İlanlar</text>
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
