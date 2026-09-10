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
      vitrinRequests,
      unreadChatThreads,
      pendingBanners,
      activeBans,
      recentUsers,
      activeBacklinks,
    ] = await Promise.all([
      ListingModel.countDocuments({ status: 'onay_bekliyor' }).catch(() => 0),
      ListingModel.countDocuments({ vitrinIstegi: true }).catch(() => 0),
      ChatThreadModel.countDocuments({ okunmadiAdminSayisi: { $gt: 0 } }).catch(() => 0),
      BannerAdModel.countDocuments({ durum: 'onay_bekliyor' }).catch(() => 0),
      BanModel.countDocuments({ aktif: true }).catch(() => 0),
      UserModel.countDocuments({ createdAt: { $gte: oneDayAgo } }).catch(() => 0),
      BacklinkModel.countDocuments({ aktif: true }).catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        pendingListings,
        vitrinRequests,
        unreadChats: unreadChatThreads,
        pendingBanners,
        activeBans,
        recentUsers,
        activeBacklinks,
        // Menu item badges:
        ilanlarBadge: pendingListings + vitrinRequests,
        anasayfaBadge: vitrinRequests,
        chatBadge: unreadChatThreads,
        bannersBadge: pendingBanners,
        guvenlikBadge: activeBans,
        kullanicilarBadge: recentUsers,
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
