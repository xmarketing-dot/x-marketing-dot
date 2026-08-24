import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PackageModel from '@/models/Package';

export async function GET() {
  try {
    await connectToDatabase();
    const packages = await PackageModel.find({}).sort({ siraOnceligi: -1 }).lean();
    return NextResponse.json({ packages: JSON.parse(JSON.stringify(packages)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
