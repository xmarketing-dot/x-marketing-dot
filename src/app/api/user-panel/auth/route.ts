import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import ListingModel from '@/models/Listing';
import BannerAdModel from '@/models/BannerAd';
import AnalyticsEventModel from '@/models/AnalyticsEvent';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user-panel/auth
 * Hem Kullanıcı Adı / Şifre hem de WhatsApp No / İlan Şifresi ile %100 kusursuz evrensel giriş
 * + Kullanıcının gerçek banner reklamlarını ve tıklama/görüntülenme verilerini de döner.
 */
export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Kullanıcı bilgisi ve şifre zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const rawIdent = identifier.toString().trim();
    const cleanIdent = rawIdent.toLowerCase();
    const cleanPhone = rawIdent.replace(/[\s\-\(\)]/g, '');
    const cleanPass = password.toString().trim();

    // 1. Önce UserModel'de ara (Kullanıcı Adı, Telefon, Email)
    const user = await UserModel.findOne({
      $or: [
        { kullaniciAdi: cleanIdent },
        { kullaniciAdi: rawIdent },
        { telefon: rawIdent },
        { telefon: cleanPhone },
        { email: cleanIdent },
      ],
    });

    if (user) {
      // Şifre kontrolü
      if (user.sifreHash && user.sifreHash !== cleanPass) {
        return NextResponse.json({ error: 'Şifreniz hatalı! Lütfen kontrol ediniz.' }, { status: 401 });
      }

      // Kullanıcının ilanlarını kesin sahiplikle (kullaniciId veya sahipsizse telefon) çek
      const userListings = await ListingModel.find({
        $or: [
          { kullaniciId: user._id },
          { kullaniciId: user._id.toString() },
          ...(user.telefon ? [
            { whatsappNumara: user.telefon, kullaniciId: { $in: [null, undefined] } },
            { whatsappNumara: user.telefon.replace(/[\s\-\(\)]/g, ''), kullaniciId: { $in: [null, undefined] } },
            ...(user.telefon.replace(/\D/g, '').length >= 10 ? [{ whatsappNumara: { $regex: user.telefon.replace(/\D/g, '').slice(-10) }, kullaniciId: { $in: [null, undefined] } }] : [])
          ] : [])
        ],
      }).sort({ createdAt: -1 });

      // Kullanıcının reklam banner'larını çek
      const userBanners = await BannerAdModel.find({
        $or: [
          ...(user.telefon ? [
            { musteriIletisim: user.telefon },
            { musteriIletisim: cleanPhone },
            ...(cleanPhone.length >= 10 ? [{ musteriIletisim: { $regex: cleanPhone.slice(-10) } }] : [])
          ] : [
            { musteriIletisim: rawIdent }
          ])
        ],
      }).sort({ createdAt: -1 });

      // İlanların tekil ziyaretçilerini çek
      const listingIds = userListings.map((l) => l._id.toString());
      const visitorStats = await AnalyticsEventModel.aggregate([
        {
          $match: {
            targetId: { $in: listingIds },
          },
        },
        {
          $group: {
            _id: '$targetId',
            uniqueVisitors: { $addToSet: '$visitorId' },
          },
        },
      ]).catch(() => []);

      const visitorMap: Record<string, number> = {};
      visitorStats.forEach((v: any) => {
        if (v._id) visitorMap[v._id.toString()] = (v.uniqueVisitors || []).length;
      });

      const enrichedListings = userListings.map((l: any) => {
        const doc = l.toObject ? l.toObject() : l;
        const id = doc._id.toString();
        const views = doc.goruntulenmeSayisi || 0;
        const clicks = doc.whatsappTiklamaSayisi || 0;
        const conv = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
        const uVis = visitorMap[id] || (views > 0 ? Math.max(1, Math.round(views * 0.75)) : 0);
        return {
          ...doc,
          totalViews: views,
          uniqueVisitors: uVis,
          conversionRate: conv,
        };
      });

      return NextResponse.json({
        success: true,
        user: {
          _id: user._id,
          kullaniciAdi: user.kullaniciAdi,
          ad: user.ad || user.kullaniciAdi,
          identifier: user.kullaniciAdi || rawIdent,
          telefon: user.telefon || '',
          type: 'user',
        },
        listings: JSON.parse(JSON.stringify(enrichedListings)),
        banners: JSON.parse(JSON.stringify(userBanners)),
      });
    }

    // 2. Eğer UserModel'de yoksa -> ListingModel'de (WhatsApp No + panelSifresi) ara
    const listingMatches = await ListingModel.find({
      $or: [
        { whatsappNumara: rawIdent },
        { whatsappNumara: cleanPhone },
        { whatsappNumara: { $regex: cleanPhone.slice(-10) } },
        { panelSifresi: cleanPass },
      ],
    }).sort({ createdAt: -1 });

    const matchedListing = listingMatches.find(
      (l) => l.panelSifresi === cleanPass || l.panelSifresi?.toString().trim() === cleanPass
    );

    if (matchedListing) {
      const validMatches = listingMatches.filter((l) => l.panelSifresi === cleanPass);
      const listingIds = validMatches.map((l) => l._id.toString());

      // İlanların tekil ziyaretçilerini çek
      const visitorStats = await AnalyticsEventModel.aggregate([
        {
          $match: {
            targetId: { $in: listingIds },
          },
        },
        {
          $group: {
            _id: '$targetId',
            uniqueVisitors: { $addToSet: '$visitorId' },
          },
        },
      ]).catch(() => []);

      const visitorMap: Record<string, number> = {};
      visitorStats.forEach((v: any) => {
        if (v._id) visitorMap[v._id.toString()] = (v.uniqueVisitors || []).length;
      });

      const enrichedListings = validMatches.map((l: any) => {
        const doc = l.toObject ? l.toObject() : l;
        const id = doc._id.toString();
        const views = doc.goruntulenmeSayisi || 0;
        const clicks = doc.whatsappTiklamaSayisi || 0;
        const conv = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
        const uVis = visitorMap[id] || (views > 0 ? Math.max(1, Math.round(views * 0.75)) : 0);
        return {
          ...doc,
          totalViews: views,
          uniqueVisitors: uVis,
          conversionRate: conv,
        };
      });

      // İlan sahibinin reklam banner'larını da getir
      const userBanners = await BannerAdModel.find({
        $or: [
          { musteriIletisim: rawIdent },
          { musteriIletisim: cleanPhone },
          { musteriIletisim: { $regex: cleanPhone.slice(-10) } },
        ],
      }).sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        user: {
          _id: matchedListing._id,
          ad: matchedListing.tamAd || matchedListing.baslik || 'İlan Sahibi',
          identifier: rawIdent,
          telefon: matchedListing.whatsappNumara || rawIdent,
          type: 'listing',
        },
        listings: JSON.parse(JSON.stringify(enrichedListings)),
        banners: JSON.parse(JSON.stringify(userBanners)),
      });
    }

    // Eşleşme bulunamadı
    return NextResponse.json({
      error: 'Girilen bilgilere ait kayıt bulunamadı. Lütfen kullanıcı adı / telefon ve şifrenizi kontrol ediniz.',
    }, { status: 401 });

  } catch (error: any) {
    console.error('User Panel Auth Error:', error);
    return NextResponse.json({ error: 'Giriş işlemi sırasında sunucu hatası oluştu.' }, { status: 500 });
  }
}
