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

    // 1. Find Listing
    const listing = await ListingModel.findOne({ slug }).lean();
    if (listing) {
      listingData = listing;
      photoUrl =
        listing.anaFotograf?.url ||
        (listing.fotograflar && listing.fotograflar.length > 0 ? listing.fotograflar[0]?.url : '') ||
        '';
    }

    let inputBuffer: Buffer | null = null;

    // Handle Data URL (Base64)
    if (photoUrl && photoUrl.startsWith('data:image/')) {
      const match = photoUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,([\s\S]+)$/);
      if (match) {
        inputBuffer = Buffer.from(match[2], 'base64');
      }
    } else if (photoUrl && photoUrl.startsWith('/')) {
      // Local uploaded image file
      try {
        const fs = await import('fs');
        const path = await import('path');
        const localPath = path.join(process.cwd(), 'public', photoUrl);
        if (fs.existsSync(localPath)) {
          inputBuffer = fs.readFileSync(localPath);
        } else {
          const { getSiteUrl } = await import('@/lib/siteUrl');
          const fullUrl = `${getSiteUrl()}${photoUrl}`;
          const imageRes = await fetch(fullUrl);
          if (imageRes.ok) {
            inputBuffer = Buffer.from(await imageRes.arrayBuffer());
          }
        }
      } catch (fsErr) {
        console.error('Error reading local photo in OG route:', fsErr);
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
          inputBuffer = Buffer.from(arrayBuffer);
        }
      } catch (fetchErr) {
        console.error('Remote image fetch error:', fetchErr);
      }
    }

    // Convert to 100% WhatsApp/Telegram compliant JPEG
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
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        });
      } catch (err) {
        // Fallback convert without resize
        try {
          const fallbackJpeg = await sharp(inputBuffer).jpeg({ quality: 85 }).toBuffer();
          return new NextResponse(new Uint8Array(fallbackJpeg), {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Content-Length': fallbackJpeg.length.toString(),
              'Cache-Control': 'public, max-age=86400',
            },
          });
        } catch (e) {}
      }
    }

    // Default Fallback VIP Card in pure JPEG
    const title = (listingData?.baslik || 'VIP Doğrulanmış Model').slice(0, 32);
    const city = (listingData?.ilSlug ? listingData.ilSlug.toUpperCase() : 'TÜRKİYE');
    const district = (listingData?.ilceSlug ? listingData.ilceSlug.toUpperCase() : 'VIP');

    const svgCard = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0d1117"/>
            <stop offset="50%" stop-color="#161b22"/>
            <stop offset="100%" stop-color="#1c1508"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#f59e0b" stroke-width="4" stroke-opacity="0.6"/>
        <rect x="360" y="100" width="480" height="54" rx="27" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="2"/>
        <text x="600" y="136" font-size="22" font-weight="bold" fill="#f59e0b" text-anchor="middle" font-family="sans-serif" letter-spacing="2">👑 ${district} — ${city} VIP ESKORT</text>
        <text x="600" y="290" font-size="56" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="sans-serif">${title}</text>
        <text x="600" y="370" font-size="26" font-weight="bold" fill="#8b949e" text-anchor="middle" font-family="sans-serif">%100 Teyitli Profil • Doğrudan WhatsApp İletişimi</text>
        <rect x="250" y="440" width="320" height="60" rx="18" fill="#21262d" stroke="#30363d" stroke-width="2"/>
        <text x="410" y="478" font-size="20" font-weight="bold" fill="#10b981" text-anchor="middle" font-family="sans-serif">✓ Doğrulanmış Profil</text>
        <rect x="630" y="440" width="320" height="60" rx="18" fill="#21262d" stroke="#30363d" stroke-width="2"/>
        <text x="790" y="478" font-size="20" font-weight="bold" fill="#25D366" text-anchor="middle" font-family="sans-serif">💬 WhatsApp İletişim</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgCard);
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
    console.error('OG Cover Error:', error);
    return new NextResponse('OG Error', { status: 500 });
  }
}
