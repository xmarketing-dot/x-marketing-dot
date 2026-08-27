import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import VipModel from '@/models/VipModel';

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

    // 1. Try finding in Listings
    let photoUrl = '';
    const listing = await ListingModel.findOne({ slug }).lean();

    if (listing) {
      photoUrl =
        listing.anaFotograf?.url ||
        (listing.fotograflar && listing.fotograflar.length > 0 ? listing.fotograflar[0]?.url : '') ||
        '';
    } else {
      // 2. Try finding in VIP Celebrity Models
      const vipModel = await VipModel.findOne({ slug }).lean();
      if (vipModel) {
        photoUrl =
          vipModel.anaFotografUrl ||
          (vipModel.fotograflar && vipModel.fotograflar.length > 0 ? vipModel.fotograflar[0] : '') ||
          '';
      }
    }

    // Default fallback if no photo found
    if (!photoUrl) {
      photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80';
    }

    // Handle Data URL (Base64)
    if (photoUrl.startsWith('data:image/')) {
      const match = photoUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,([\s\S]+)$/);
      if (match) {
        const mimeType = match[1] || 'image/webp';
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        });
      }
    }

    // Handle Remote HTTP/HTTPS URL (e.g. Unsplash, Cloudinary, etc.)
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      try {
        const imageRes = await fetch(photoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BestEskortOGProxy/1.0)',
          },
        });

        if (imageRes.ok) {
          const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
          const arrayBuffer = await imageRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Length': buffer.length.toString(),
              'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
            },
          });
        }
      } catch (fetchErr) {
        console.error('Remote image fetch error:', fetchErr);
      }
    }

    // Fallback SVG Banner if everything else fails
    const svg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#0d1117"/>
        <rect x="20" y="20" width="1160" height="590" rx="30" fill="#161b22" stroke="#f59e0b" stroke-width="4"/>
        <circle cx="600" cy="240" r="80" fill="#f59e0b"/>
        <text x="600" y="270" font-size="70" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="#0d1117">👑</text>
        <text x="600" y="380" font-size="52" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="#ffffff">BEST ESKORT</text>
        <text x="600" y="440" font-size="26" font-weight="700" font-family="sans-serif" text-anchor="middle" fill="#f59e0b">Doğrulanmış %100 Teyitli VIP İlan Rehberi</text>
      </svg>
    `.trim();

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('OG Cover Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
