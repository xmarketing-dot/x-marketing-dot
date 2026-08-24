import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users });
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
