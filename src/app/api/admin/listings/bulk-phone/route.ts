import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (!userId && !username) {
      return NextResponse.json({ error: 'userId veya username zorunludur' }, { status: 400 });
    }

    let user: any = null;
    if (userId) {
      user = await UserModel.findById(userId).lean();
    }
    if (!user && username) {
      const clean = username.replace(/^@/, '').trim();
      user = await UserModel.findOne({
        $or: [
          { kullaniciAdi: { $regex: `^${clean}$`, $options: 'i' } },
          { username: { $regex: `^${clean}$`, $options: 'i' } },
        ]
      }).lean();
    }

    const userConditions: any[] = [];
    if (user) {
      userConditions.push({ kullaniciId: user._id });
      userConditions.push({ kullaniciId: user._id.toString() });
      if (user.kullaniciAdi) {
        userConditions.push({ kullaniciAdi: { $regex: `^${user.kullaniciAdi}$`, $options: 'i' } });
        userConditions.push({ 'kullanici.kullaniciAdi': { $regex: `^${user.kullaniciAdi}$`, $options: 'i' } });
        userConditions.push({ username: { $regex: `^${user.kullaniciAdi}$`, $options: 'i' } });
      }
    } else if (username) {
      const clean = username.replace(/^@/, '').trim();
      userConditions.push({ kullaniciAdi: { $regex: `^${clean}$`, $options: 'i' } });
      userConditions.push({ 'kullanici.kullaniciAdi': { $regex: `^${clean}$`, $options: 'i' } });
      userConditions.push({ username: { $regex: `^${clean}$`, $options: 'i' } });
    }

    const listings = await ListingModel.find({ $or: userConditions })
      .select('_id baslik whatsappNumara status')
      .lean();

    const distinctNumbers = Array.from(new Set(listings.map(l => l.whatsappNumara).filter(Boolean)));

    return NextResponse.json({
      success: true,
      user: user ? { _id: user._id, kullaniciAdi: user.kullaniciAdi, telefon: user.telefon } : null,
      totalListings: listings.length,
      currentNumbers: distinctNumbers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { userId, username, rawNumbers, mode = 'random' } = body;

    // 1. Validate numbers
    let numbersList: string[] = [];
    if (Array.isArray(rawNumbers)) {
      numbersList = rawNumbers.map(n => String(n).trim()).filter(Boolean);
    } else if (typeof rawNumbers === 'string') {
      numbersList = rawNumbers
        .split(/[\n,;]+/)
        .map(n => n.trim())
        .filter(n => n.length >= 7);
    }

    if (numbersList.length === 0) {
      return NextResponse.json({ error: 'Lütfen en az bir geçerli WhatsApp numarası giriniz.' }, { status: 400 });
    }

    // 2. Find target user
    let user: any = null;
    if (userId) {
      user = await UserModel.findById(userId).lean();
    }
    
    if (!user && username) {
      const cleanUsername = username.replace(/^@/, '').trim();
      user = await UserModel.findOne({
        $or: [
          { kullaniciAdi: { $regex: `^${cleanUsername}$`, $options: 'i' } },
          { username: { $regex: `^${cleanUsername}$`, $options: 'i' } },
        ]
      }).lean();
    }

    if (!user && !userId && !username) {
      return NextResponse.json({ error: 'Kullanıcı seçimi veya kullanıcı adı zorunludur.' }, { status: 400 });
    }

    // 3. Find listings belonging to this user
    const userConditions: any[] = [];
    if (user) {
      userConditions.push({ kullaniciId: user._id });
      userConditions.push({ kullaniciId: user._id.toString() });
      if (user.kullaniciAdi) {
        userConditions.push({ kullaniciAdi: { $regex: `^${user.kullaniciAdi}$`, $options: 'i' } });
        userConditions.push({ 'kullanici.kullaniciAdi': { $regex: `^${user.kullaniciAdi}$`, $options: 'i' } });
        userConditions.push({ username: { $regex: `^${user.kullaniciAdi}$`, $options: 'i' } });
      }
    } else if (username) {
      const cleanUsername = username.replace(/^@/, '').trim();
      userConditions.push({ kullaniciAdi: { $regex: `^${cleanUsername}$`, $options: 'i' } });
      userConditions.push({ 'kullanici.kullaniciAdi': { $regex: `^${cleanUsername}$`, $options: 'i' } });
      userConditions.push({ username: { $regex: `^${cleanUsername}$`, $options: 'i' } });
    }

    const listings = await ListingModel.find({ $or: userConditions }).select('_id baslik whatsappNumara').lean();

    if (listings.length === 0) {
      return NextResponse.json({
        error: `Seçilen kullanıcıya (${user?.kullaniciAdi || username}) ait herhangi bir ilan bulunamadı.`
      }, { status: 404 });
    }

    // 4. Distribution logic
    const distributionStats: Record<string, number> = {};
    numbersList.forEach(num => { distributionStats[num] = 0; });

    const bulkOperations = listings.map((l: any, idx: number) => {
      let assignedNumber: string;
      if (numbersList.length === 1) {
        assignedNumber = numbersList[0];
      } else if (mode === 'round_robin') {
        assignedNumber = numbersList[idx % numbersList.length];
      } else {
        // Random
        const randIdx = Math.floor(Math.random() * numbersList.length);
        assignedNumber = numbersList[randIdx];
      }

      distributionStats[assignedNumber] = (distributionStats[assignedNumber] || 0) + 1;

      return {
        updateOne: {
          filter: { _id: l._id },
          update: { $set: { whatsappNumara: assignedNumber } },
        }
      };
    });

    await ListingModel.bulkWrite(bulkOperations);

    // Also update user's registered phone if 1 number was provided
    if (user && numbersList.length === 1) {
      await UserModel.updateOne({ _id: user._id }, { $set: { telefon: numbersList[0] } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user?._id || null,
        kullaniciAdi: user?.kullaniciAdi || username,
      },
      totalUpdated: listings.length,
      mode: numbersList.length === 1 ? 'single' : mode,
      numbersUsed: numbersList,
      distribution: distributionStats,
    });
  } catch (error: any) {
    console.error('Bulk Phone Update Error:', error);
    return NextResponse.json({ error: error.message || 'Numaralar güncellenemedi.' }, { status: 500 });
  }
}
