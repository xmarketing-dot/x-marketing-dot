import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import HomepageConfigModel from '@/models/HomepageConfig';
import ListingModel from '@/models/Listing';
import LocationModel from '@/models/Location';
import UserModel from '@/models/User';
import {
  checkAndExpireShowcases,
  assignListingToShowcase,
  extendListingVitrinDuration
} from '@/lib/vitrinManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Süresi dolmuş vitrin ilanlarını otomatik temizle ve kullanıcılara bildir
    await checkAndExpireShowcases();

    let config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();
    if (!config) {
      const created = await HomepageConfigModel.create({ key: 'singleton' });
      config = created.toObject();
    }

    const DEFAULT_PROMOS = [
      {
        _id: 'promo-1',
        gifUrl: 'https://media.tenor.com/vDokuclgktwAAAAd/barbara-palvin-lingerie.gif',
        topBadge: '🔥 GÜNDE 50.000+ CANLI MÜŞTERİ',
        trafficBadge: '💎 EN ÇOK KAZANDIRAN ALAN',
        title: 'Zirvede Yerini Al, Telefonun Gece Gündüz Çalsın!',
        spot: 'Türkiye\'nin en popüler eskort vitrininde dakikalar içinde öne çıkın. WhatsApp hattınıza kesintisiz elit müşteri akışı başlatın.',
        aktif: true,
      },
      {
        _id: 'promo-2',
        gifUrl: 'https://64.media.tumblr.com/8c1cf789da9ba9a6cca6ee396f6f2dc7/0ed1f7c7e2c38e0a-dc/s500x750/6924e4454a9f477b6d1eaddaf38cb52a1917c51d.gif',
        topBadge: '👑 VIP VİTRİN İLE KAZANCINI KATLA',
        trafficBadge: '⚡ ANINDA MÜŞTERİ AKIŞI',
        title: 'Günde 50.000 Canlı Ziyaretçi Doğrudan Seni Görsün!',
        spot: 'Sayfaya giren herkesin ilk gördüğü dev vitrinde yerini ayırt. Komisyonsuz, doğrudan ve anında randevularını doldur.',
        aktif: true,
      },
      {
        _id: 'promo-3',
        gifUrl: 'https://i.looksmax.org/attachments/2022/12/3217147_booty-bounce-2.gif',
        topBadge: '💎 LÜKS & SEÇKİN PRESTİJ',
        trafficBadge: '🔥 %100 GERÇEK MÜŞTERİ',
        title: 'Bu Vitrinde Parlayın, En Çok Kazanan Siz Olun!',
        spot: 'Rakiplerinin önüne geç, anasayfanın 1 numaralı vitrinine yerleş. Saatlerce müşteri aramak yerine müşteriler sana yazsın.',
        aktif: true,
      },
      {
        _id: 'promo-4',
        gifUrl: 'https://media.tenor.com/7rtlPza-UqcAAAAM/asian.gif',
        topBadge: '⚡ ANINDA RANDEVU DOLDURMA',
        trafficBadge: '🚀 GOOGLE & ARAMA LİDERİ',
        title: 'Vitrine Sabitlenin, Müşteri Mesajlarına Yetişemeyin!',
        spot: 'Best Eskort VIP vitrini ile tüm şehirden gelen elit müşterilere ilk sırada ulaşın. WhatsApp randevu trafiğinizi hemen katlayın.',
        aktif: true,
      },
      {
        _id: 'promo-5',
        gifUrl: 'https://media.tenor.com/UpyRgPYevTMAAAAM/sexy-girl.gif',
        topBadge: '👑 SINIRSIZ GÖRÜNTÜLENME & GÜÇ',
        trafficBadge: '🌟 VIP ÖZEL AYRICALIK',
        title: 'İlanınızı Vitrine Taşıyın, Zirvenin Keyfini Çıkarın!',
        spot: 'Tek tıkla vitrinde yerinizi alın, profesyonel reklam avantajıyla sınırsız kazanç ve maksimum görünürlük elde edin.',
        aktif: true,
      },
    ];

    if (!config.bosVitrinSliderlar) {
      config.bosVitrinSliderlar = DEFAULT_PROMOS;
    }

    const [allListings, allLocations, allUsers] = await Promise.all([
      ListingModel.find({})
        .select('_id baslik slug ilSlug ilceSlug rozet vitrinIstegi isVitrin vitrinPaketi vitrinBaslangicTarihi vitrinBitisTarihi status whatsappNumara anaFotograf fotograflar createdAt paketBitisTarihi kullaniciId panelSifresi')
        .sort({ createdAt: -1 })
        .lean(),
      LocationModel.find({})
        .select('il ilSlug ilceler')
        .sort({ il: 1 })
        .lean(),
      UserModel.find({}).select('_id kullaniciAdi telefon email ad').lean().catch(() => []),
    ]);

    const userMapById: Record<string, any> = {};
    const userMapByPhone: Record<string, any> = {};

    allUsers.forEach((u: any) => {
      userMapById[u._id.toString()] = u;
      if (u.telefon) {
        const clean = u.telefon.replace(/\D/g, '');
        if (clean) userMapByPhone[clean] = u;
      }
    });

    const enrichedListings = allListings.map((l: any) => {
      let matchedUser = (l.kullaniciId && userMapById[l.kullaniciId.toString()]) || null;
      if (!matchedUser && l.whatsappNumara) {
        const clean = l.whatsappNumara.replace(/\D/g, '');
        if (clean) matchedUser = userMapByPhone[clean] || null;
      }

      return {
        ...l,
        kullaniciAdi: matchedUser?.kullaniciAdi || (l as any).kullaniciAdi || null,
        kullaniciTelefon: matchedUser?.telefon || l.whatsappNumara || null,
        kullaniciObj: matchedUser || null,
      };
    });

    return NextResponse.json({
      config: JSON.parse(JSON.stringify(config)),
      allListings: JSON.parse(JSON.stringify(enrichedListings)),
      allLocations: JSON.parse(JSON.stringify(allLocations)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Config get error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      heroBaslik,
      heroAltBaslik,
      bannerMetin,
      bannerLink,
      bannerAktif,
      bannerRozet,
      duyurular,
      sliderIlanIds,
      ozelIlanReklam,
      ozelIlanReklamlar,
      bosVitrinSliderlar,
      approveVitrinListingId,
      rejectVitrinListingId,
      assignVitrinDuration, // { listingId, days, paketi }
      extendVitrinDuration, // { listingId, extraDays }
      removeVitrinListingId, // listingId
    } = body;

    const mongoose = await connectToDatabase();

    // 1. Vitrin süresi uzatma işlemi
    if (extendVitrinDuration && extendVitrinDuration.listingId) {
      await extendListingVitrinDuration(
        extendVitrinDuration.listingId,
        Number(extendVitrinDuration.extraDays) || 1
      );
    }

    // 2. Vitrine süre belirleyerek doğrudan atama/onaylama
    if (assignVitrinDuration && assignVitrinDuration.listingId) {
      await assignListingToShowcase(
        assignVitrinDuration.listingId,
        Number(assignVitrinDuration.days) || 1,
        assignVitrinDuration.paketi || (assignVitrinDuration.days === 7 ? 'haftalik' : 'gunluk')
      );
    }

    // 3. Vitrinden tek tıkla çıkarma
    if (removeVitrinListingId && mongoose.Types.ObjectId.isValid(removeVitrinListingId)) {
      await ListingModel.findByIdAndUpdate(removeVitrinListingId, {
        $set: {
          isVitrin: false,
          vitrinIstegi: false,
        }
      });
      await HomepageConfigModel.updateOne(
        { key: 'singleton' },
        { $pull: { sliderIlanIds: new mongoose.Types.ObjectId(removeVitrinListingId) } }
      );
    }

    // 4. Standart onay/red
    if (approveVitrinListingId && mongoose.Types.ObjectId.isValid(approveVitrinListingId)) {
      const days = Number(body.vitrinGun) || 1;
      await assignListingToShowcase(
        approveVitrinListingId,
        days,
        days === 7 ? 'haftalik' : 'gunluk'
      );
    }

    if (rejectVitrinListingId && mongoose.Types.ObjectId.isValid(rejectVitrinListingId)) {
      await ListingModel.findByIdAndUpdate(rejectVitrinListingId, {
        $set: { vitrinIstegi: false, isVitrin: false }
      });
      await HomepageConfigModel.updateOne(
        { key: 'singleton' },
        { $pull: { sliderIlanIds: new mongoose.Types.ObjectId(rejectVitrinListingId) } }
      );
    }

    const updateData: any = {};

    if (heroBaslik !== undefined) updateData['hero.baslik'] = heroBaslik;
    if (heroAltBaslik !== undefined) updateData['hero.altBaslik'] = heroAltBaslik;
    if (bannerMetin !== undefined) updateData['aktifBanner.metin'] = bannerMetin;
    if (bannerLink !== undefined) updateData['aktifBanner.link'] = bannerLink;
    if (bannerAktif !== undefined) updateData['aktifBanner.aktif'] = Boolean(bannerAktif);
    if (bannerRozet !== undefined) updateData['aktifBanner.rozet'] = bannerRozet || '👑 VIP DUYURU';

    if (Array.isArray(bosVitrinSliderlar)) {
      updateData.bosVitrinSliderlar = bosVitrinSliderlar.map((slide: any, idx: number) => {
        const isAktif = slide.aktif === false || slide.aktif === 'false' ? false : true;
        return {
          _id: String(slide._id || `promo-${Date.now()}-${idx}`),
          gifUrl: String(slide.gifUrl || '').trim(),
          topBadge: String(slide.topBadge || '🔥 VİTRİNDE YERİNİZİ ALIN').trim(),
          trafficBadge: String(slide.trafficBadge || 'Günde 50.000+ Canlı Müşteri').trim(),
          title: String(slide.title || 'İlanınız Bu Vitrinde Dönsün!').trim(),
          spot: String(slide.spot || 'Best Eskort VIP Vitrini İle Kazancınızı Katlayın!').trim(),
          aktif: isAktif,
        };
      }).filter((s: any) => Boolean(s.gifUrl));
    }

    if (ozelIlanReklam && typeof ozelIlanReklam === 'object') {
      const validIlanId = ozelIlanReklam.ilanId && mongoose.Types.ObjectId.isValid(ozelIlanReklam.ilanId)
        ? new mongoose.Types.ObjectId(ozelIlanReklam.ilanId)
        : null;

      updateData.ozelIlanReklam = {
        _id: String(ozelIlanReklam._id || 'ad_single'),
        aktif: Boolean(ozelIlanReklam.aktif),
        ilanId: validIlanId,
        hedefIlSlug: ozelIlanReklam.hedefIlSlug || 'tum_turkiye',
        gecikmeSaniye: Number(ozelIlanReklam.gecikmeSaniye) || 4,
        baslik: ozelIlanReklam.baslik || '👑 GÜNÜN ÖZEL VIP İLANI',
        spotMetin: ozelIlanReklam.spotMetin || 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı',
        rozet: ozelIlanReklam.rozet || '🔥 SPONSORLU ÖZEL İLAN',
      };
    }

    if (Array.isArray(ozelIlanReklamlar)) {
      updateData.ozelIlanReklamlar = ozelIlanReklamlar.map((ad: any, idx: number) => {
        const validIlanId = ad.ilanId && mongoose.Types.ObjectId.isValid(ad.ilanId)
          ? new mongoose.Types.ObjectId(ad.ilanId)
          : null;

        return {
          _id: String(ad._id || `ad_${Date.now()}_${idx}`),
          aktif: Boolean(ad.aktif),
          ilanId: validIlanId,
          hedefIlSlug: ad.hedefIlSlug || 'tum_turkiye',
          gecikmeSaniye: Number(ad.gecikmeSaniye) || 4,
          baslik: ad.baslik || '👑 GÜNÜN ÖZEL VIP İLANI',
          spotMetin: ad.spotMetin || 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı',
          rozet: ad.rozet || '🔥 SPONSORLU ÖZEL İLAN',
        };
      });
    }

    if (Array.isArray(duyurular)) {
      updateData.duyurular = duyurular;
    }

    if (Array.isArray(sliderIlanIds)) {
      const validIds = sliderIlanIds
        .filter((id: any) => id && mongoose.Types.ObjectId.isValid(id))
        .slice(0, 5);

      updateData.sliderIlanIds = validIds.map((id: any) => new mongoose.Types.ObjectId(id));

      // Seçilen ilanların isVitrin durumunu ve varsa süresini güncelle (eğer süresi yoksa varsayılan 1 gün ver)
      const now = new Date();
      for (const validId of validIds) {
        const existing = await ListingModel.findById(validId);
        if (existing) {
          const bitis = existing.vitrinBitisTarihi && new Date(existing.vitrinBitisTarihi) > now
            ? existing.vitrinBitisTarihi
            : new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

          await ListingModel.findByIdAndUpdate(validId, {
            $set: {
              isVitrin: true,
              vitrinBaslangicTarihi: existing.vitrinBaslangicTarihi || now,
              vitrinBitisTarihi: bitis,
              vitrinSuresiDolduBildirildi: false,
            }
          });
        }
      }
    }

    await HomepageConfigModel.collection.updateOne(
      { key: 'singleton' },
      { $set: updateData },
      { upsert: true }
    );

    const config = await HomepageConfigModel.findOne({ key: 'singleton' }).lean();

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Config update error:', error);
    return NextResponse.json({ error: error.message || 'Config update error' }, { status: 500 });
  }
}
