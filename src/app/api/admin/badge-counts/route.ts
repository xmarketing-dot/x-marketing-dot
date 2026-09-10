import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import ChatThreadModel from '@/models/ChatThread';
import BannerAdModel from '@/models/BannerAd';
import BanModel from '@/models/Ban';
import UserModel from '@/models/User';
import BacklinkModel from '@/models/Backlink';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      pendingListings,
      unreadChatThreads,
      pendingBanners,
    ] = await Promise.all([
      ListingModel.countDocuments({ status: 'onay_bekliyor' }).catch(() => 0),
      ChatThreadModel.countDocuments({ okunmadiAdminSayisi: { $gt: 0 } }).catch(() => 0),
      BannerAdModel.countDocuments({ durum: 'onay_bekliyor' }).catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        pendingListings,
        vitrinRequests: 0,
        unreadChats: unreadChatThreads,
        pendingBanners,
        activeBans: 0,
        recentUsers: 0,
        activeBacklinks: 0,
        // Menu item badges (Sadece gerçekten aksiyon/onay bekleyen bildirimler):
        ilanlarBadge: pendingListings,
        anasayfaBadge: 0,
        chatBadge: unreadChatThreads,
        bannersBadge: pendingBanners,
        guvenlikBadge: 0,
        kullanicilarBadge: 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Badge counts error',
        counts: {
          pendingListings: 0,
          vitrinRequests: 0,
          unreadChats: 0,
          pendingBanners: 0,
          activeBans: 0,
          recentUsers: 0,
          activeBacklinks: 0,
          ilanlarBadge: 0,
          anasayfaBadge: 0,
          chatBadge: 0,
          bannersBadge: 0,
          guvenlikBadge: 0,
          kullanicilarBadge: 0,
        },
      },
      { status: 200 }
    );
  }
}
