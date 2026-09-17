import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';

// In-memory rate limiting map as fast pre-check (IP -> timestamp)
const inMemoryIpMap = new Map<string, number>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of inMemoryIpMap.entries()) {
    if (now - timestamp > 3600000) {
      inMemoryIpMap.delete(key);
    }
  }
}, 300000);

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
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1').trim();

    // 2. Cookie Tabanlı Hızlı Kontrol (60 Saniye)
    const lastCommentCookie = req.cookies.get('best_eskort_last_comment_time')?.value;
    const now = Date.now();
    if (lastCommentCookie) {
      const cookieTime = Number(lastCommentCookie);
      if (!isNaN(cookieTime) && now - cookieTime < 60000) {
        const waitSec = Math.ceil((60000 - (now - cookieTime)) / 1000);
        return NextResponse.json(
          { error: `Güvenlik Koruması: Lütfen yeni bir yorum yazmadan önce ${waitSec} saniye bekleyin.` },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const { listingSlug, yazar, yorum, puan, hp_field, visitorId } = body;
    const finalVisitorId = visitorId ? String(visitorId).slice(0, 80) : '';

    // 3. Anti-Bot Honeypot Check (Tuzak alan doluysa bot'tur)
    if (hp_field) {
      return NextResponse.json({ success: true, message: 'İşlem alındı' });
    }

    // 4. In-Memory IP Kontrolü
    const lastIpTime = inMemoryIpMap.get(clientIp);
    if (lastIpTime && now - lastIpTime < 60000) {
      const waitSec = Math.ceil((60000 - (now - lastIpTime)) / 1000);
      return NextResponse.json(
        { error: `Güvenlik Koruması: Lütfen yeni bir yorum yazmadan önce ${waitSec} saniye bekleyin.` },
        { status: 429 }
      );
    }

    // 5. Validation
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

    await connectToDatabase();

    // 6. DB SEVİYESİNDE %100 KESİN SPAM & RATE LIMIT KONTROLÜ
    // (Aynı IP veya Visitor ID'den son 60 saniyede DB'ye herhangi bir yorum atılmış mı?)
    const sixtySecondsAgo = new Date(now - 60000);
    const recentGlobalComment = await ListingModel.findOne({
      'anonimYorumlar': {
        $elemMatch: {
          $or: [
            { userIp: clientIp },
            ...(finalVisitorId ? [{ visitorId: finalVisitorId }] : [])
          ],
          createdAt: { $gte: sixtySecondsAgo }
        }
      }
    }).select('anonimYorumlar').lean();

    if (recentGlobalComment && recentGlobalComment.anonimYorumlar) {
      let newestTimestamp = 0;
      for (const c of recentGlobalComment.anonimYorumlar) {
        if (
          (c.userIp === clientIp || (finalVisitorId && c.visitorId === finalVisitorId)) &&
          c.createdAt
        ) {
          const t = new Date(c.createdAt).getTime();
          if (t > newestTimestamp) newestTimestamp = t;
        }
      }
      if (newestTimestamp && now - newestTimestamp < 60000) {
        const waitSec = Math.ceil((60000 - (now - newestTimestamp)) / 1000);
        return NextResponse.json(
          { error: `Güvenlik Koruması: Lütfen yeni bir yorum yazmadan önce ${waitSec} saniye bekleyin.` },
          { status: 429 }
        );
      }
    }

    // 7. İlan Kontrolü & Bu İlana Özel Limitler
    const listing = await ListingModel.findOne({ slug: listingSlug });
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    // A) Aynı ilana ikinci kez yorum yapma kuralı: TAMAMEN ENGELLENMİŞTİR (HER İLANA MAKSİMUM 1 YORUM)
    const alreadyCommentedOnThisListing = listing.anonimYorumlar?.some(
      (c: any) =>
        c.userIp === clientIp || (finalVisitorId && c.visitorId === finalVisitorId)
    );

    if (alreadyCommentedOnThisListing) {
      return NextResponse.json(
        { error: 'Bu ilana daha önce zaten yorum yaptınız. Güvenlik politikamız gereği her ilana yalnızca 1 kez yorum yapabilirsiniz.' },
        { status: 403 }
      );
    }

    // B) Aynı metinle duplicate gönderim engeli
    const isDuplicate = listing.anonimYorumlar?.some(
      (c: any) =>
        c.yorum?.toLowerCase() === sanitizedYorum.toLowerCase() &&
        now - new Date(c.createdAt).getTime() < 86400000
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Bu yorum metni daha önce bu ilana gönderilmiş.' },
        { status: 400 }
      );
    }

    // 8. Rumuz (Rumuz girilmediyse gerçekçi anonim rumuz üret)
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
      visitorId: finalVisitorId || undefined,
      createdAt: new Date(),
    };

    listing.anonimYorumlar = listing.anonimYorumlar || [];
    listing.anonimYorumlar.push(newComment as any);
    await listing.save();

    // In-memory kaydı güncelle
    inMemoryIpMap.set(clientIp, now);

    const sortedComments = [...listing.anonimYorumlar]
      .filter((c: any) => c.onayli !== false)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Yanıta Cookie ekle (60 saniyelik kilit)
    const response = NextResponse.json({
      success: true,
      newComment,
      comments: sortedComments,
    });

    response.cookies.set('best_eskort_last_comment_time', now.toString(), {
      path: '/',
      maxAge: 3600,
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Comment submission error:', error);
    return NextResponse.json({ error: 'Yorum kaydedilirken bir hata oluştu' }, { status: 500 });
  }
}
