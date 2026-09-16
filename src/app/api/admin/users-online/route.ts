import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Gerçek canlılık için son 2 dakikada heartbeat göndermiş olması şarttır
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    
    // Sekmeyi kapatıp çıkan ve 2 dakikadır sinyal göndermeyenleri otomatik offline yap
    await UserModel.updateMany(
      { isOnline: true, $or: [{ lastActiveAt: { $lt: twoMinutesAgo } }, { lastActiveAt: { $exists: false } }] },
      { $set: { isOnline: false } }
    );
    
    const onlineUsers = await UserModel.find({
      isOnline: true,
      lastActiveAt: { $gte: twoMinutesAgo }
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
