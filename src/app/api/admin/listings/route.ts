import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ListingModel from '@/models/Listing';
import ChatMessageModel from '@/models/ChatMessage';
import ChatThreadModel from '@/models/ChatThread';
import { chatEmitter } from '@/lib/chatEmitter';

export const dynamic = 'force-dynamic';

let adminListingsCache: any[] | null = null;
let adminListingsCacheTime = 0;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const id = req.nextUrl.searchParams.get('id');
    if (id) {
      const single = await ListingModel.findById(id).lean();
      return NextResponse.json({ listing: single });
    }

    const now = Date.now();
    if (adminListingsCache && now - adminListingsCacheTime < 15000) {
      return NextResponse.json({ listings: adminListingsCache });
    }

    // fotograflar dizisi devasa base64 veriler içerebildiği için liste çekerken hariç tutuyoruz
    const listings = await ListingModel.find({})
      .select('-fotograflar')
      .sort({ createdAt: -1 })
      .lean();

    adminListingsCache = JSON.parse(JSON.stringify(listings));
    adminListingsCacheTime = now;

    return NextResponse.json({ listings: adminListingsCache });
  } catch (error: any) {
    return NextResponse.json({ error: 'İlanlar listelenemedi' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, baslik, aciklama, rozet, ilSlug, ilceSlug, whatsappNumara, status, yayinSuresi, fotograflar, anaFotografUrl, ekleGun, panelSifresi } = body;

    if (!id) {
      return NextResponse.json({ error: 'İlan ID zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await ListingModel.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'İlan bulunamadı.' }, { status: 404 });
    }

    const wasPending = existing.status === 'onay_bekliyor';
    const updateFields: any = {};

    if (baslik) updateFields.baslik = baslik.trim();
    if (aciklama !== undefined) updateFields.aciklama = aciklama.trim();
    if (rozet) updateFields.rozet = rozet;
    if (ilSlug) updateFields.ilSlug = ilSlug.trim().toLowerCase();
    if (ilceSlug) updateFields.ilceSlug = ilceSlug.trim().toLowerCase();
    if (whatsappNumara) updateFields.whatsappNumara = whatsappNumara.trim();
    if (status) updateFields.status = status;
    if (panelSifresi) updateFields.panelSifresi = panelSifresi.trim();

    // Özel VIP Model Profil ve Biyografi Alanları (Admin Tarafından)
    if (body.tamAd !== undefined) updateFields.tamAd = body.tamAd ? body.tamAd.trim() : null;
    if (body.yas !== undefined) updateFields.yas = Number(body.yas) || undefined;
    if (body.boy !== undefined) updateFields.boy = Number(body.boy) || undefined;
    if (body.kilo !== undefined) updateFields.kilo = Number(body.kilo) || undefined;
    if (body.gogusOlcusu !== undefined) updateFields.gogusOlcusu = body.gogusOlcusu ? body.gogusOlcusu.trim() : null;
    if (body.sacRengi !== undefined) updateFields.sacRengi = body.sacRengi ? body.sacRengi.trim() : null;
    if (body.gozRengi !== undefined) updateFields.gozRengi = body.gozRengi ? body.gozRengi.trim() : null;
    if (body.likeSayisi !== undefined) updateFields.likeSayisi = Number(body.likeSayisi) || 0;
    if (body.isVerifiedProfile !== undefined) updateFields.isVerifiedProfile = Boolean(body.isVerifiedProfile);
    if (body.hakkindaBiyografi !== undefined) updateFields.hakkindaBiyografi = body.hakkindaBiyografi;

    if (body.diller) {
      updateFields.diller = Array.isArray(body.diller) 
        ? body.diller 
        : body.diller.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    if (body.hizmetMekanlari) {
      updateFields.hizmetMekanlari = Array.isArray(body.hizmetMekanlari)
        ? body.hizmetMekanlari
        : body.hizmetMekanlari.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    // Onaylama anında otomatik süre başlatma (Eğer 'yayinda' yapılıyorsa)
    let calculatedExpiry = existing.paketBitisTarihi;
    if (status === 'yayinda') {
      const days = (yayinSuresi || existing.yayinSuresi) === 'gunluk' ? 1 : (yayinSuresi || existing.yayinSuresi) === 'aylik' ? 30 : 7;
      calculatedExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      updateFields.paketBitisTarihi = calculatedExpiry;
      updateFields.onaylanmaTarihi = new Date();
    }

    // Photos update
    if (Array.isArray(fotograflar) && fotograflar.length > 0) {
      updateFields.fotograflar = fotograflar.map((f: any) => (typeof f === 'string' ? { url: f } : f));
      
      if (anaFotografUrl) {
        updateFields.anaFotograf = { url: anaFotografUrl };
      } else {
        updateFields.anaFotograf = updateFields.fotograflar[0];
      }
    }

    // Extend days option
    if (ekleGun && typeof ekleGun === 'number') {
      const currentExpiry = existing.paketBitisTarihi && existing.paketBitisTarihi > new Date()
        ? new Date(existing.paketBitisTarihi)
        : new Date();

      currentExpiry.setDate(currentExpiry.getDate() + ekleGun);
      updateFields.paketBitisTarihi = currentExpiry;
      updateFields.status = 'yayinda';
      calculatedExpiry = currentExpiry;
    }

    const updatedListing = await ListingModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedListing) {
      return NextResponse.json({ error: 'İlan güncellenemedi.' }, { status: 404 });
    }

    // ── OTOMATİK CHAT ONAY VE BİLGİLENDİRME MESAJI GÖNDERME ────────────────
    if (status === 'yayinda' && (wasPending || body.notifyChat)) {
      try {
        let targetThreadId: string | null = updatedListing.chatThreadId ? updatedListing.chatThreadId.toString() : null;

        // Fallback: If no direct chatThreadId, find thread by user or phone
        if (!targetThreadId && updatedListing.whatsappNumara) {
          const matchedThread = await ChatThreadModel.findOne({
            $or: [
              { userIdentifier: updatedListing.whatsappNumara },
              { userIdentifier: updatedListing.whatsappNumara.replace(/\D/g, '') },
            ]
          }).sort({ updatedAt: -1 });

          if (matchedThread) {
            targetThreadId = matchedThread._id.toString();
          }
        }

        if (targetThreadId) {
          const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://besteskort.com';
          const liveListingUrl = `${origin}/ilan/${updatedListing.slug}`;
          const panelUrl = `${origin}/panelim`;
          
          const expiryStr = calculatedExpiry ? new Date(calculatedExpiry).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '7 Gün';
          const tierStr = (updatedListing.rozet || 'ultravip').toUpperCase();

          const approvalMessageText = 
`🎉 TEBRİKLER! İLANINIZ ONAYLANDI VE YAYINA ALINDI! 👑

🌟 İlan Başlığı: ${updatedListing.baslik}
📍 Konum: ${(updatedListing.ilSlug || '').toUpperCase()} / ${(updatedListing.ilceSlug || '').toUpperCase()}
💎 Vitrin Paketi: ${tierStr}
⏳ Yayın Bitiş Tarihi: ${expiryStr}

🔗 Canlı İlan Linkiniz:
${liveListingUrl}

🔑 İlan Yönetim Paneliniz:
${panelUrl}
${updatedListing.panelSifresi ? `Şifreniz: ${updatedListing.panelSifresi}\n` : ''}
Bol kazançlar ve bol müşteriler dileriz! 🚀💎`;

          const newMsg = await ChatMessageModel.create({
            threadId: targetThreadId,
            gonderenTipi: 'admin',
            mesaj: approvalMessageText,
            okundu: false,
          });

          // Update thread metadata & bind listing credentials
          await ChatThreadModel.findByIdAndUpdate(targetThreadId, {
            listingId: updatedListing._id.toString(),
            listingBaslik: updatedListing.baslik,
            listingSlug: updatedListing.slug,
            password: updatedListing.panelSifresi || undefined,
            sonMesajOzeti: '🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.',
            updatedAt: new Date(),
            $inc: { okunmadiKullaniciSayisi: 1 },
          });

          // Trigger Real-time Event for Client SSE and Floating Toast
          chatEmitter.emit('newMessage', {
            threadId: targetThreadId,
            message: newMsg,
          });
        }
      } catch (chatErr) {
        // Silent
      }
    }

    adminListingsCache = null;
    return NextResponse.json({ success: true, listing: updatedListing });
  } catch (error: any) {
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'İlan ID zorunludur.' }, { status: 400 });
    }

    await connectToDatabase();
    await ListingModel.findByIdAndDelete(id);

    adminListingsCache = null;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 });
  }
}
