import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BanModel from '@/models/Ban';
import ChatThreadModel from '@/models/ChatThread';
import ListingModel from '@/models/Listing';
import { invalidateBanCache } from '@/lib/banCheck';

export async function GET() {
  try {
    await connectToDatabase();
    
    const [bans, rawThreads, allListings] = await Promise.all([
      BanModel.find().sort({ createdAt: -1 }).lean(),
      ChatThreadModel.find().sort({ updatedAt: -1 }).limit(40).lean(),
      ListingModel.find({}).select('_id baslik slug ilSlug ilceSlug rozet whatsappNumara panelSifresi chatThreadId anaFotograf kullaniciAdi').lean(),
    ]);

    const listingByThreadId: Record<string, any> = {};
    const listingById: Record<string, any> = {};

    allListings.forEach((l) => {
      if (l.chatThreadId) listingByThreadId[l.chatThreadId.toString()] = l;
      listingById[l._id.toString()] = l;
    });

    const enrichedThreads = rawThreads.map((t) => {
      const threadIdStr = t._id.toString();
      const matchedListing = (t.listingId && listingById[t.listingId]) || listingByThreadId[threadIdStr] || null;

      const panelUser = matchedListing 
        ? ((matchedListing as any).kullaniciAdi || matchedListing.slug || matchedListing.whatsappNumara)
        : t.username || null;

      return {
        ...t,
        listingId: matchedListing ? matchedListing._id.toString() : t.listingId || null,
        listingBaslik: matchedListing ? matchedListing.baslik : t.listingBaslik || null,
        listingSlug: matchedListing ? matchedListing.slug : t.listingSlug || null,
        listingRozet: matchedListing ? matchedListing.rozet : null,
        listingKonum: matchedListing ? `${matchedListing.ilSlug}/${matchedListing.ilceSlug}` : null,
        listingFoto: matchedListing?.anaFotograf?.url || null,
        whatsappNumara: matchedListing?.whatsappNumara || t.kullaniciTelefon || null,
        username: panelUser,
        password: matchedListing?.panelSifresi || t.password || null,
        kullaniciAdi: matchedListing ? `👑 ${matchedListing.baslik}` : t.kullaniciAdi,
      };
    });

    return NextResponse.json({ 
      bans: JSON.parse(JSON.stringify(bans)),
      recentThreads: JSON.parse(JSON.stringify(enrichedThreads))
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ban list error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ip, threadId, sebep, engellemeTuru } = await req.json();

    if (!ip && !threadId) {
      return NextResponse.json({ error: 'IP veya Thread ID gereklidir' }, { status: 400 });
    }

    await connectToDatabase();

    const banType = engellemeTuru || 'tam_ban';
    const reason = sebep || 'Yönetici tarafından kural ihlali nedeniyle engellendi';

    // 1. Create Ban Record
    const newBan = await BanModel.create({
      ip: ip ? ip.trim() : null,
      threadId: threadId || null,
      sebep: reason,
      engellemeTuru: banType,
      aktif: true,
    });

    // 2. If threadId provided, mark ChatThread banned
    if (threadId) {
      await ChatThreadModel.findByIdAndUpdate(threadId, {
        isBanned: true,
        banTuru: banType,
        banSebebi: reason,
      });
    }

    // 3. If IP provided, mark all threads with this IP banned
    if (ip) {
      await ChatThreadModel.updateMany(
        { ip: ip.trim() },
        {
          isBanned: true,
          banTuru: banType,
          banSebebi: reason,
        }
      );
    }

    invalidateBanCache();
    return NextResponse.json({ success: true, ban: JSON.parse(JSON.stringify(newBan)) });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ban create error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const banId = searchParams.get('banId');
    const threadId = searchParams.get('threadId');
    const ip = searchParams.get('ip');

    await connectToDatabase();

    if (banId) {
      const ban = await BanModel.findByIdAndDelete(banId).lean();
      if (ban) {
        if (ban.threadId) {
          await ChatThreadModel.findByIdAndUpdate(ban.threadId, { isBanned: false, banTuru: null, banSebebi: null });
        }
        if (ban.ip) {
          await ChatThreadModel.updateMany({ ip: ban.ip }, { isBanned: false, banTuru: null, banSebebi: null });
        }
      }
    } else if (threadId) {
      await BanModel.deleteMany({ threadId });
      await ChatThreadModel.findByIdAndUpdate(threadId, { isBanned: false, banTuru: null, banSebebi: null });
    } else if (ip) {
      await BanModel.deleteMany({ ip });
      await ChatThreadModel.updateMany({ ip }, { isBanned: false, banTuru: null, banSebebi: null });
    }

    invalidateBanCache();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unban error' }, { status: 500 });
  }
}
