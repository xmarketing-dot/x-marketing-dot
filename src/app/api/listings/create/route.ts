import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

function generateSlug(ilce: string, baslik: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u'
  };
  const raw = `${ilce}-${baslik}`;
  let clean = raw.split('').map((char) => trMap[char] || char).join('');
  clean = clean.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  const randomHex = Math.random().toString(36).substring(2, 8);
  return `${clean || 'ilan'}-${randomHex}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      baslik, 
      aciklama, 
      ilSlug, 
      ilceSlug, 
      rozet, 
      yayinSuresi, 
      fiyat, 
      whatsappNumara, 
      anaFotografUrl, 
      fotograflar,
      chatThreadId,
      kullaniciId 
    } = body;

    if (!baslik || !aciklama || !ilSlug || !ilceSlug || !whatsappNumara) {
      return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
    }

    await connectToDatabase();

    const slug = generateSlug(ilceSlug, baslik);
    const imageUrl = anaFotografUrl && anaFotografUrl.trim() !== ''
      ? anaFotografUrl
      : 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800';

    const photoList = fotograflar && Array.isArray(fotograflar) && fotograflar.length > 0
      ? fotograflar
      : [{ url: imageUrl }];

    // Yayın Bitiş Tarihi Hesaplama
    const durationDays = yayinSuresi === 'gunluk' ? 1 : yayinSuresi === 'aylik' ? 30 : 7;
    const paketBitisTarihi = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const newListing = await ListingModel.create({
      slug,
      baslik,
      aciklama,
      ilSlug,
      ilceSlug,
      anaFotograf: { url: imageUrl },
      fotograflar: photoList,
      whatsappNumara,
      fiyat: fiyat ? Number(fiyat) : 0,
      paraBirimi: 'TL',
      rozet: rozet || 'ultravip',
      yayinSuresi: yayinSuresi || 'haftalik',
      paketBitisTarihi,
      chatThreadId: chatThreadId || null,
      kullaniciId: kullaniciId || null,
      status: 'onay_bekliyor',
    });

    // Eşleştirme: Eğer chatThreadId varsa ChatThread modeline ilanı bağla
    if (chatThreadId) {
      const ChatThreadModel = (await import('@/models/ChatThread')).default;
      await ChatThreadModel.findByIdAndUpdate(chatThreadId, {
        listingId: newListing._id.toString(),
        listingBaslik: newListing.baslik,
        listingSlug: newListing.slug,
        kullaniciAdi: `👑 ${newListing.baslik}`,
      }).catch(() => {});
    }

    return NextResponse.json({ 
      success: true, 
      listing: newListing 
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'İlan oluşturulurken hata meydana geldi.' }, { status: 500 });
  }
}
