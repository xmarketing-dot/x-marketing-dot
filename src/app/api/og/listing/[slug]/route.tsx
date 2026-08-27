import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
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
    } else {
      // 2. Try finding in VIP Celebrity Models
      const vipModel = await VipModel.findOne({ slug }).lean();
      if (vipModel) {
        listingData = vipModel;
        photoUrl =
          vipModel.anaFotografUrl ||
          (vipModel.fotograflar && vipModel.fotograflar.length > 0 ? vipModel.fotograflar[0] : '') ||
          '';
      }
    }

    // Handle Data URL (Base64) from real listing upload
    if (photoUrl && photoUrl.startsWith('data:image/')) {
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

    // Handle Remote HTTP/HTTPS URL from real listing
    if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
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

    // If no custom photo exists, generate a dedicated luxury VIP OpenGraph card tailored to this listing
    const title = listingData?.baslik || listingData?.tamAd || 'VIP Doğrulanmış Model';
    const city = listingData?.ilSlug ? listingData.ilSlug.toUpperCase() : 'TÜRKİYE';
    const district = listingData?.ilceSlug ? listingData.ilceSlug.toUpperCase() : 'VIP VİTRİN';

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c1508 100%)',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Gold Luxury Border */}
          <div
            style={{
              position: 'absolute',
              inset: '20px',
              borderRadius: '24px',
              border: '3px solid rgba(245, 158, 11, 0.45)',
              display: 'flex',
            }}
          />

          {/* Top Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid #f59e0b',
              borderRadius: '50px',
              padding: '10px 24px',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '24px', marginRight: '10px' }}>👑</span>
            <span
              style={{
                color: '#f59e0b',
                fontSize: '20px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              {district} — {city} VIP ESKORT
            </span>
          </div>

          {/* Listing Title */}
          <div
            style={{
              display: 'flex',
              fontSize: '52px',
              fontWeight: 900,
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '950px',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: '#8b949e',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            %100 Teyitli Profil &bull; Doğrudan WhatsApp İletişimi &bull; Best Eskort
          </div>

          {/* Bottom Features */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#21262d',
                padding: '10px 20px',
                borderRadius: '14px',
                border: '1px solid #30363d',
                color: '#10b981',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              ✓ Doğrulanmış Profil
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#21262d',
                padding: '10px 20px',
                borderRadius: '14px',
                border: '1px solid #30363d',
                color: '#25D366',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              💬 WhatsApp İle İletişim
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(245, 158, 11, 0.2)',
                padding: '10px 20px',
                borderRadius: '14px',
                border: '1px solid #f59e0b',
                color: '#f59e0b',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              ⭐ VIP Vitrin
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('OG Cover Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
