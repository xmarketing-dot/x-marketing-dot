import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // 1. Fetch active listings with photos from database
    const listings = await ListingModel.find({
      status: 'yayinda',
      $or: [
        { 'anaFotograf.url': { $exists: true, $ne: '' } },
        { 'fotograflar.0.url': { $exists: true, $ne: '' } },
      ],
    })
      .select('anaFotograf fotograflar baslik ilSlug ilceSlug rozet')
      .limit(30)
      .lean();

    let photoUrl = '';

    if (listings.length > 0) {
      // Pick a random listing from active pool
      const randomListing: any = listings[Math.floor(Math.random() * listings.length)];
      photoUrl =
        randomListing.anaFotograf?.url ||
        (randomListing.fotograflar && randomListing.fotograflar.length > 0 ? randomListing.fotograflar[0]?.url : '') ||
        '';
    }

    // 2. Stream Base64 (Data URI) as pure binary image bytes (WhatsApp / Telegram bot compatible)
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
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }
    }

    // 3. Stream Remote HTTP/HTTPS image
    if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
      try {
        const imageRes = await fetch(photoUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BestEskortSiteOGProxy/1.0)',
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
              'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        }
      } catch (fetchErr) {
        console.error('Site OG fetch error:', fetchErr);
      }
    }

    // 4. Fallback branded VIP OpenGraph Card
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
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1508 100%)',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Decorative Gold Frame */}
          <div
            style={{
              position: 'absolute',
              inset: '20px',
              borderRadius: '24px',
              border: '3px solid rgba(245, 158, 11, 0.4)',
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
              TÜRKİYE'NİN EN SEÇKİN REHBERİ
            </span>
          </div>

          {/* Brand Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '64px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
              marginBottom: '14px',
            }}
          >
            <span style={{ color: '#f59e0b', marginRight: '16px' }}>BEST</span>
            <span>ESKORT</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: 'flex',
              fontSize: '26px',
              color: '#8b949e',
              fontWeight: 600,
              textAlign: 'center',
              maxWidth: '850px',
              marginBottom: '30px',
            }}
          >
            81 İl ve Tüm İlçelerde %100 Doğrulanmış VIP İlanlar & WhatsApp İletişim Hatları
          </div>

          {/* Features Row */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#21262d',
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid #30363d',
                color: '#10b981',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              ✓ %100 Teyitli Fotoğraflar
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#21262d',
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid #30363d',
                color: '#f59e0b',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              ⭐ VIP & Ultra Vitrin
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#21262d',
                padding: '12px 20px',
                borderRadius: '16px',
                border: '1px solid #30363d',
                color: '#25D366',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              💬 Doğrudan WhatsApp
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
    console.error('OG Site Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
