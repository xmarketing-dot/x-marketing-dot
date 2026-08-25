import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import HomepageConfigModel from '@/models/HomepageConfig';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'listingId zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await ListingModel.findByIdAndDelete(listingId);
    if (!deleted) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    // Also remove from homepage showcase if selected
    try {
      await HomepageConfigModel.updateOne(
        { key: 'singleton' },
        { $pull: { selectedShowcaseIds: listingId } }
      );
    } catch (e) {}

    // Invalidate caches immediately
    try {
      revalidatePath('/', 'page');
      revalidatePath('/sehirler', 'page');
      if (deleted.ilSlug) {
        revalidatePath(`/${deleted.ilSlug}`, 'page');
        if (deleted.ilceSlug) {
          revalidatePath(`/${deleted.ilSlug}/${deleted.ilceSlug}`, 'page');
        }
      }
      if (deleted.slug) {
        revalidatePath(`/ilan/${deleted.slug}`, 'page');
      }
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'İlan başarıyla silindi ve tüm sayfalardan kaldırıldı.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Silme hatası' }, { status: 500 });
  }
}
