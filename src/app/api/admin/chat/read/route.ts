import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatThreadModel from '@/models/ChatThread';

export async function POST(req: NextRequest) {
  try {
    const { threadId } = await req.json();
    await connectToDatabase();

    await ChatThreadModel.findByIdAndUpdate(threadId, {
      okunmadiAdminSayisi: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
