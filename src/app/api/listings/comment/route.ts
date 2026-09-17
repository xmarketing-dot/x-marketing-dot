import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

// In-memory rate limiting map (IP -> timestamp)
const rateLimitMap = new Map<string, number>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > 3600000) {
      rateLimitMap.delete(key);
    }
  }
}, 600000);

const randomMaskedNames = [
  'M*** K***', 'A*** S***', 'E*** T***', 'C*** B***', 'S*** Y***',
  'B*** R***', 'K*** O***', 'D*** M***', 'O*** G***', 'H*** Ç***',
  'T*** L***', 'V*** N***', 'İ*** Ş***', 'Y*** Z***', 'F*** A***',
  'G*** V***', 'U*** B***', 'N*** C***', 'R*** K***', 'Z*** E***'
];

const randomLabels = [
  'Doğrulanmış Misafir',
  'VIP Üye',
  'Ziyaretçi',
  'Rezidans Misafiri',
  'Gold Üye',
  'Onaylı Kullanıcı',
  'Özel Misafir'
];

function generateRandomRumuz(): string {
  const name = randomMaskedNames[Math.floor(Math.random() * randomMaskedNames.length)];
  const label = randomLabels[Math.floor(Math.random() * randomLabels.length)];
  return `${name} (${label})`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parametresi zorunludur' }, { status: 400 });
    }

    await connectToDatabase();
    const listing = await ListingModel.findOne({ slug }).select('anonimYorumlar').lean();

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    const comments = (listing.anonimYorumlar || [])
      .filter((c: any) => c.onayli !== false)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Yorumlar getirilemedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP & Visitor Identification
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    const body = await req.json();
    const { listingSlug, yazar, yorum, puan, hp_field, visitorId } = body;

    // 2. Anti-Bot Honeypot Check (Eğer gizli tuzak alan doldurulduysa bot'tur)
    if (hp_field) {
      return NextResponse.json({ success: true, message: 'İşlem alındı' });
    }

    // 3. Validation
    if (!listingSlug || !yorum) {
      return NextResponse.json({ error: 'Yorum metni zorunludur' }, { status: 400 });
    }

    const sanitizedYorum = String(yorum).replace(/<[^>]*>?/gm, '').trim();
    if (sanitizedYorum.length < 5) {
      return NextResponse.json({ error: 'Yorum en az 5 karakter olmalıdır.' }, { status: 400 });
    }
    if (sanitizedYorum.length > 500) {
      return NextResponse.json({ error: 'Yorum en fazla 500 karakter olabilir.' }, { status: 400 });
    }

    // 4. Rate-Limiting / Spam Koruması (Aynı IP'den 45 saniyede max 1 yorum)
    const rateLimitKey = `${clientIp}_${listingSlug}`;
    const lastCommentTime = rateLimitMap.get(rateLimitKey);
    const now = Date.now();

    if (lastCommentTime && now - lastCommentTime < 45000) {
      const waitSec = Math.ceil((45000 - (now - lastCommentTime)) / 1000);
      return NextResponse.json(
        { error: `Lütfen yeni bir yorum yazmadan önce ${waitSec} saniye bekleyin.` },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // 5. İlan Kontrolü & Çift Yorum (Duplicate) Koruması
    const listing = await ListingModel.findOne({ slug: listingSlug });
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    const isDuplicate = listing.anonimYorumlar?.some(
      (c: any) =>
        c.yorum?.toLowerCase() === sanitizedYorum.toLowerCase() &&
        now - new Date(c.createdAt).getTime() < 3600000
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Bu yorum daha önce bu ilana gönderilmiş.' },
        { status: 400 }
      );
    }

    // 6. Rumuz (Rumuz girilmediyse gerçekçi anonim rumuz üret)
    let finalAuthor = (yazar || '').replace(/<[^>]*>?/gm, '').trim();
    if (!finalAuthor || finalAuthor.length < 2) {
      finalAuthor = generateRandomRumuz();
    } else {
      finalAuthor = finalAuthor.slice(0, 35);
    }

    const numericPuan = Math.min(5, Math.max(1, Number(puan) || 5));

    const newComment = {
      yazar: finalAuthor,
      yorum: sanitizedYorum,
      puan: numericPuan,
      onayli: true,
      userIp: clientIp,
      visitorId: visitorId || undefined,
      createdAt: new Date(),
    };

    listing.anonimYorumlar = listing.anonimYorumlar || [];
    listing.anonimYorumlar.push(newComment as any);
    await listing.save();

    // Rate-limit kaydını güncelle
    rateLimitMap.set(rateLimitKey, now);

    const sortedComments = [...listing.anonimYorumlar]
      .filter((c: any) => c.onayli !== false)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      newComment,
      comments: sortedComments,
    });
  } catch (error: any) {
    console.error('Comment submission error:', error);
    return NextResponse.json({ error: 'Yorum kaydedilirken bir hata oluştu' }, { status: 500 });
  }
}
