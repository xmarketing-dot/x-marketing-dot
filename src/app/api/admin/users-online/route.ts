import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Sadece online olan veya son 5 dakikada aktif olanları çekiyoruz
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineUsers = await UserModel.find({
      $or: [
        { isOnline: true },
        { lastActiveAt: { $gte: fiveMinutesAgo } }
      ]
    }).select('kullaniciAdi telefon ad isOnline lastActiveAt sessionStartedAt').sort({ lastActiveAt: -1 }).lean();

    return NextResponse.json({ success: true, users: onlineUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Veri çekilemedi' }, { status: 500 });
  }
}
