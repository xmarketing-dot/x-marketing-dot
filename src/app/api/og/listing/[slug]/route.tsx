import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return new NextResponse('Slug required', { status: 400 });
    }

    await connectToDatabase();

    let listingData: any = null;
    let photoUrl = '';

    // 1. Try finding in Listings
    const listing = await ListingModel.findOne({ slug }).lean();
    if (listing) {
      listingData = listing;
      photoUrl =
        listing.anaFotograf?.url ||
        (listing.fotograflar && listing.fotograflar.length > 0 ? listing.fotograflar[0]?.url : '') ||
        '';
    }

    let rawBuffer: Buffer | null = null;

    // Handle Data URL (Base64) from real listing upload
    if (photoUrl && photoUrl.startsWith('data:image/')) {
      const match = photoUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,([\s\S]+)$/);
      if (match) {
        rawBuffer = Buffer.from(match[2], 'base64');
      }
    } else if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
      try {
        const imageRes = await fetch(photoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BestEskortOGProxy/1.0)',
          },
        });
        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          rawBuffer = Buffer.from(arrayBuffer);
        }
      } catch (fetchErr) {
        console.error('Listing OG fetch error:', fetchErr);
      }
    }

    if (rawBuffer) {
      try {
        // Convert to standard JPEG (1200x630) for 100% WhatsApp/Telegram preview compatibility
        const jpegBuffer = await sharp(rawBuffer)
          .resize(1200, 630, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 85 })
          .toBuffer();

        return new NextResponse(new Uint8Array(jpegBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': jpegBuffer.length.toString(),
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        });
      } catch (sharpErr) {
        return new NextResponse(new Uint8Array(rawBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    // Default Fallback JPEG via sharp
    const baslik = listingData?.baslik || 'Best Eskort VIP İlan';
    const sehir = `${listingData?.ilSlug || 'istanbul'} / ${listingData?.ilceSlug || 'merkez'}`.toUpperCase();

    const fallbackSvg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#0d1117"/>
        <rect x="20" y="20" width="1160" height="590" rx="24" fill="#161b22" stroke="#f59e0b" stroke-width="4"/>
        <text x="600" y="220" font-size="28" font-weight="bold" fill="#f59e0b" text-anchor="middle" font-family="sans-serif">👑 VIP ESKORT İLANI</text>
        <text x="600" y="320" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${baslik.slice(0, 35)}</text>
        <text x="600" y="400" font-size="24" font-weight="bold" fill="#8b949e" text-anchor="middle" font-family="sans-serif">${sehir} — %100 Doğrulanmış</text>
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
