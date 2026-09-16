import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { identifier, status } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });
    }

    await connectToDatabase();
    
    // identifier, kullaniciAdi veya telefon veya email olabilir.
    const user = await UserModel.findOne({
      $or: [
        { kullaniciAdi: identifier },
        { telefon: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const now = new Date();

    if (status === 'offline') {
      user.isOnline = false;
      user.lastActiveAt = now;
      await user.save();
      return NextResponse.json({ success: true, status: 'offline' });
    }

    // Status is implicit or 'online'
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    // Eğer session Started At yoksa veya en son aktif olduğu süre 5 dakikadan önceyse yeni session başlat
    if (!user.sessionStartedAt || !user.lastActiveAt || (now.getTime() - user.lastActiveAt.getTime() > FIVE_MINUTES)) {
      user.sessionStartedAt = now;
    }

    user.lastActiveAt = now;
    user.isOnline = true;
    
    await user.save();

    return NextResponse.json({ success: true, status: 'online' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
