import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
}
