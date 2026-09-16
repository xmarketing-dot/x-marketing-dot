import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Son 5 dakikada aktif olan veya isOnline=true olanlar
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineUsers = await UserModel.find({
      $or: [
        { isOnline: true },
        { lastActiveAt: { $gte: fiveMinutesAgo } }
      ]
    })
      .select('kullaniciAdi telefon ad isOnline lastActiveAt sessionStartedAt lastLogoutAt currentTab')
      .sort({ lastActiveAt: -1 })
      .lean();

    // İlanları çek ve her kullanıcıyla eşleştir
    const userIds = onlineUsers.map((u: any) => u._id);
    const userPhones = onlineUsers.map((u: any) => u.telefon).filter(Boolean);

    const allListings = await ListingModel.find({
      $or: [
        { kullaniciId: { $in: userIds } },
        { whatsappNumara: { $in: userPhones } }
      ]
    }).select('_id baslik slug ilSlug ilceSlug rozet status anaFotograf kullaniciId whatsappNumara').lean();

    const enrichedOnlineUsers = onlineUsers.map((u: any) => {
      const uIdStr = u._id.toString();
      const uPhoneClean = (u.telefon || '').replace(/\D/g, '');

      const matchedListings = allListings.filter((l: any) => {
        if (l.kullaniciId && l.kullaniciId.toString() === uIdStr) return true;
        if (uPhoneClean && l.whatsappNumara) {
          const lPhoneClean = l.whatsappNumara.replace(/\D/g, '');
          if (lPhoneClean && (lPhoneClean === uPhoneClean || (lPhoneClean.length >= 10 && uPhoneClean.length >= 10 && lPhoneClean.slice(-10) === uPhoneClean.slice(-10)))) {
            return true;
          }
        }
        return false;
      });

      const primaryListing = matchedListings[0];

      return {
        ...u,
        primaryListingTitle: primaryListing?.baslik || null,
        primaryListingSlug: primaryListing?.slug || null,
        primaryListingPhoto: primaryListing?.anaFotograf?.url || null,
        primaryListingLocation: primaryListing ? `${primaryListing.ilSlug}/${primaryListing.ilceSlug}` : null,
        totalListingsCount: matchedListings.length,
      };
    });

    return NextResponse.json({ success: true, users: enrichedOnlineUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Veri çekilemedi' }, { status: 500 });
  }
}
