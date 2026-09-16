import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import ListingModel from '@/models/Listing';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, identifier, telefon, kullaniciAdi, status, currentTab } = body;

    const rawIdent = (identifier || kullaniciAdi || telefon || '').toString().trim();
    if (!rawIdent && !userId) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    await connectToDatabase();
    
    const cleanIdent = rawIdent.toLowerCase();
    const cleanPhone = rawIdent.replace(/\D/g, '');
    const directPhone = (telefon || '').toString().replace(/\D/g, '');

    // 1. Önce UserModel içinde tüm olası alanlarla ara
    const searchConditions: any[] = [];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(userId) });
    }
    if (rawIdent) {
      searchConditions.push({ kullaniciAdi: rawIdent });
      searchConditions.push({ kullaniciAdi: cleanIdent });
      searchConditions.push({ telefon: rawIdent });
      searchConditions.push({ email: cleanIdent });
    }
    if (cleanPhone && cleanPhone.length >= 10) {
      searchConditions.push({ telefon: { $regex: cleanPhone.slice(-10) } });
    }
    if (directPhone && directPhone.length >= 10) {
      searchConditions.push({ telefon: { $regex: directPhone.slice(-10) } });
    }

    let user = await UserModel.findOne({ $or: searchConditions });

    // 2. Eğer UserModel'de bulunamadıysa -> ListingModel üzerinden kullaniciId bul
    if (!user && (rawIdent || cleanPhone || directPhone)) {
      const listingPhone = cleanPhone.length >= 10 ? cleanPhone : directPhone;
      const listing = await ListingModel.findOne({
        $or: [
          ...(userId && mongoose.Types.ObjectId.isValid(userId) ? [{ _id: new mongoose.Types.ObjectId(userId) }] : []),
          ...(rawIdent ? [{ baslik: rawIdent }, { whatsappNumara: rawIdent }] : []),
          ...(listingPhone ? [{ whatsappNumara: { $regex: listingPhone.slice(-10) } }] : []),
        ]
      }).select('kullaniciId whatsappNumara baslik').lean();

      if (listing) {
        if (listing.kullaniciId && mongoose.Types.ObjectId.isValid(listing.kullaniciId)) {
          user = await UserModel.findById(listing.kullaniciId);
        }
        if (!user && listing.whatsappNumara) {
          const lPhone = listing.whatsappNumara.replace(/\D/g, '');
          if (lPhone.length >= 10) {
            user = await UserModel.findOne({ telefon: { $regex: lPhone.slice(-10) } });
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const now = new Date();

    if (status === 'offline') {
      user.isOnline = false;
      user.lastActiveAt = now;
      user.lastLogoutAt = now;
      await user.save();
      return NextResponse.json({ success: true, status: 'offline' });
    }

    // Status is 'online'
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    // Eğer sessionStartedAt yoksa veya en son aktif olduğu süre 5 dakikadan önceyse yeni oturum başlat
    if (!user.sessionStartedAt || !user.lastActiveAt || (now.getTime() - new Date(user.lastActiveAt).getTime() > FIVE_MINUTES)) {
      user.sessionStartedAt = now;
    }

    user.lastActiveAt = now;
    user.isOnline = true;
    if (currentTab) {
      user.currentTab = currentTab;
    }
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      status: 'online', 
      user: { 
        _id: user._id, 
        kullaniciAdi: user.kullaniciAdi,
        isOnline: user.isOnline,
        lastActiveAt: user.lastActiveAt,
        sessionStartedAt: user.sessionStartedAt
      } 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
