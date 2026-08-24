import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanUsername = username.trim().toLowerCase();

    // Find user by kullaniciAdi or phone/email fallback
    const user = await UserModel.findOne({
      $or: [
        { kullaniciAdi: cleanUsername },
        { kullaniciAdi: username.trim() },
        { telefon: username.trim() },
        { email: cleanUsername },
      ],
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı. Lütfen bilgilerinizi kontrol edin.' }, { status: 401 });
    }

    // Verify password
    if (user.sifreHash && user.sifreHash !== password.trim()) {
      return NextResponse.json({ error: 'Şifre hatalı!' }, { status: 401 });
    }

    // Return user session data
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        ad: user.ad,
        kullaniciAdi: user.kullaniciAdi || user.ad,
        telefon: user.telefon,
        email: user.email || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Giriş işlemi gerçekleştirilemedi.' }, { status: 500 });
  }
}
