import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import ListingModel from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();

    // Fetch all listings to map accurately to each user
    const allListings = await ListingModel.find()
      .select('_id baslik slug ilSlug ilceSlug status rozet anaFotograf goruntulenmeSayisi whatsappTiklamaSayisi kullaniciId panelSifresi whatsappNumara createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const enrichedUsers = users.map((user: any) => {
      const userListings = allListings.filter((l: any) => {
        const matchesId = l.kullaniciId && l.kullaniciId.toString() === user._id.toString();
        const matchesPwd = user.sifreHash && l.panelSifresi === user.sifreHash;
        const matchesPhone = user.telefon && l.whatsappNumara && l.whatsappNumara.replace(/\D/g, '') === user.telefon.replace(/\D/g, '');
        return matchesId || matchesPwd || matchesPhone;
      });

      const totalViews = userListings.reduce((acc: number, l: any) => acc + (l.goruntulenmeSayisi || 0), 0);
      const totalWhatsapp = userListings.reduce((acc: number, l: any) => acc + (l.whatsappTiklamaSayisi || 0), 0);
      const activeCount = userListings.filter((l: any) => l.status === 'yayinda').length;
      const pendingCount = userListings.filter((l: any) => l.status !== 'yayinda').length;

      return {
        ...user,
        stats: {
          totalListings: userListings.length,
          activeListings: activeCount,
          pendingListings: pendingCount,
          totalViews,
          totalWhatsapp,
        },
        listings: userListings.map((l: any) => ({
          _id: l._id.toString(),
          baslik: l.baslik,
          slug: l.slug,
          ilSlug: l.ilSlug,
          ilceSlug: l.ilceSlug,
          status: l.status,
          rozet: l.rozet || 'silver',
          anaFotograf: l.anaFotograf?.url || null,
          views: l.goruntulenmeSayisi || 0,
          whatsappClicks: l.whatsappTiklamaSayisi || 0,
          createdAt: l.createdAt,
        })),
      };
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Kullanıcılar alınamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { kullaniciAdi, sifre, telefon } = await req.json();

    if (!kullaniciAdi || !sifre) {
      return NextResponse.json({ error: 'Kullanıcı Adı ve Şifre zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanUsername = kullaniciAdi.trim().toLowerCase().replace(/\s+/g, '');

    // Check if username already exists
    const existing = await UserModel.findOne({ kullaniciAdi: cleanUsername });
    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılıyor! Başka bir kullanıcı adı seçin.' }, { status: 400 });
    }

    const newUser = await UserModel.create({
      ad: cleanUsername,
      kullaniciAdi: cleanUsername,
      telefon: telefon ? telefon.trim() : '',
      sifreHash: sifre.trim(),
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Kullanıcı oluşturma hatası' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Kullanıcı ID zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();
    await UserModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Silme hatası' }, { status: 500 });
  }
}
