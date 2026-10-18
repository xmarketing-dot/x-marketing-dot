import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnnouncementBarModel from '@/models/AnnouncementBar';

export const dynamic = 'force-dynamic';

let cachedAnnouncement: any = null;
let lastAnnouncementTime = 0;
const ANNOUNCEMENT_TTL = 60000; // 60 saniye in-memory cache

export async function GET() {
  try {
    const now = Date.now();
    if (cachedAnnouncement && (now - lastAnnouncementTime < ANNOUNCEMENT_TTL)) {
      return NextResponse.json(
        { success: true, data: cachedAnnouncement },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    await connectToDatabase();
    
    // Find or create initial config
    let record: any = await AnnouncementBarModel.findOne().lean();
    if (!record) {
      record = await AnnouncementBarModel.create({
        isActive: false,
        campaignId: 'camp_v1',
        title: "Türkiyenin en büyük eskort sitesi açıldı !",
        description: "escturkiye.devs.surf yayında! Tüm illerdeki doğrulanmış VIP ilanları hemen keşfedin.",
        badgeText: "🚀 YENİ AĞ",
        buttonText: "Hemen İncele →",
        targetUrl: "https://escturkiye.devs.surf",
        openInNewTab: true,
        stylePreset: 'fire',
      });
    }

    const payload = {
      isActive: record.isActive,
      campaignId: record.campaignId,
      displayType: record.displayType || 'drawer',
      delaySeconds: typeof record.delaySeconds === 'number' ? record.delaySeconds : 3,
      mediaUrl: record.mediaUrl || '',
      mediaType: record.mediaType || 'none',
      title: record.title,
      description: record.description,
      badgeText: record.badgeText,
      buttonText: record.buttonText,
      targetUrl: record.targetUrl,
      openInNewTab: record.openInNewTab,
      stylePreset: record.stylePreset,
    };

    cachedAnnouncement = payload;
    lastAnnouncementTime = now;

    // Only return public data
    return NextResponse.json(
      { success: true, data: payload },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
