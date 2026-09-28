import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AnnouncementBarModel from '@/models/AnnouncementBar';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    let config = await AnnouncementBarModel.findOne().lean();
    if (!config) {
      config = await AnnouncementBarModel.create({
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

    const uniqueViewsCount = (config.uniqueViewers || []).length;
    const uniqueClicksCount = (config.uniqueClickers || []).length;
    const ctr = uniqueViewsCount > 0 ? ((uniqueClicksCount / uniqueViewsCount) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        uniqueViewsCount,
        uniqueClicksCount,
        ctr,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const {
      isActive,
      title,
      description,
      badgeText,
      buttonText,
      targetUrl,
      openInNewTab,
      stylePreset,
      action,
    } = body;

    let updateFields: any = {};

    if (action === 'reset_campaign') {
      // Generate fresh campaign ID and reset counters
      updateFields = {
        campaignId: 'camp_' + Date.now().toString(36),
        viewsCount: 0,
        clicksCount: 0,
        dismissCount: 0,
        uniqueViewers: [],
        uniqueClickers: [],
        recentLogs: [],
      };
    } else {
      if (typeof isActive === 'boolean') updateFields.isActive = isActive;
      if (title !== undefined) updateFields.title = title;
      if (description !== undefined) updateFields.description = description;
      if (badgeText !== undefined) updateFields.badgeText = badgeText;
      if (buttonText !== undefined) updateFields.buttonText = buttonText;
      if (targetUrl !== undefined) updateFields.targetUrl = targetUrl;
      if (typeof openInNewTab === 'boolean') updateFields.openInNewTab = openInNewTab;
      if (stylePreset !== undefined) updateFields.stylePreset = stylePreset;
    }

    const updated = await AnnouncementBarModel.findOneAndUpdate(
      {},
      { $set: updateFields },
      { upsert: true, new: true }
    ).lean();

    const uniqueViewsCount = (updated.uniqueViewers || []).length;
    const uniqueClicksCount = (updated.uniqueClickers || []).length;
    const ctr = uniqueViewsCount > 0 ? ((uniqueClicksCount / uniqueViewsCount) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      success: true,
      message: action === 'reset_campaign' ? 'Kampanya başarıyla sıfırlandı ve tüm kullanıcılara tekrar aktif edildi!' : 'Duyuru barı ayarları başarıyla kaydedildi!',
      data: {
        ...updated,
        uniqueViewsCount,
        uniqueClicksCount,
        ctr,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
