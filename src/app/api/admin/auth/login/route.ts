import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AdminModel from '@/models/Admin';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`bms_secure_salt_${password}`).digest('hex');
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, sifre } = await req.json();

    if (!email || !sifre) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const inputHash = hashPassword(sifre);

    // Dynamic database lookup (no hardcoded credentials in source code)
    const admin = await AdminModel.findOne({ email: normalizedEmail });

    if (!admin || admin.sifreHash !== inputHash) {
      return NextResponse.json({ error: 'Geçersiz yönetici e-posta adresi veya şifre.' }, { status: 401 });
    }

    // Update last login timestamp
    admin.sonGirisTarihi = new Date();
    await admin.save();

    // Create session response
    const response = NextResponse.json({
      success: true,
      message: 'Yönetici girişi başarılı.',
      admin: {
        id: admin._id,
        email: admin.email,
        ad: admin.ad,
        role: admin.role,
      },
    });

    response.cookies.set('bms_admin_auth', 'authenticated_superadmin_session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
