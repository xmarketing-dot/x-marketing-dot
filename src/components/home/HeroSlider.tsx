'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Crown, 
  Sparkles, 
  Eye, 
  ArrowUpRight, 
  Flame, 
  Headphones, 
  MessageSquare,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';
import { getAdminWhatsAppNumber } from '@/lib/siteConfig';

export interface DynamicHeroSlide {
  _id: string;
  slug: string;
  baslik: string;
  aciklama?: string;
  ilSlug: string;
  ilceSlug: string;
  anaFotograf: { url: string };
  rozet?: string;
  whatsappNumara: string;
  fiyat?: number;
  paraBirimi?: string;
  tamAd?: string;
  yas?: number;
}

export interface PromoSlideItem {
  _id?: string;
  id?: string;
  gifUrl: string;
  topBadge: string;
  trafficBadge: string;
  title: string;
  spot: string;
  aktif?: boolean;
}

interface HeroSliderProps {
  slides?: DynamicHeroSlide[];
  promoSlides?: PromoSlideItem[];
  banner?: any;
}

// ── VİTRİN BOŞKEN DÖNECEK ÖZEL GIF & SLOGAN LİSTESİ ────────────────
const DEFAULT_EMPTY_VITRIN_SLIDES: PromoSlideItem[] = [
  {
    id: 'promo-1',
    gifUrl: 'https://media.tenor.com/vDokuclgktwAAAAd/barbara-palvin-lingerie.gif',
    topBadge: '🔥 GÜNDE 50.000+ CANLI MÜŞTERİ',
    trafficBadge: '💎 EN ÇOK KAZANDIRAN ALAN',
    title: 'Zirvede Yerini Al, Telefonun Gece Gündüz Çalsın!',
    spot: 'Türkiye\'nin en popüler eskort vitrininde dakikalar içinde öne çıkın. WhatsApp hattınıza kesintisiz elit müşteri akışı başlatın.',
    aktif: true,
  },
  {
    id: 'promo-2',
    gifUrl: 'https://64.media.tumblr.com/8c1cf789da9ba9a6cca6ee396f6f2dc7/0ed1f7c7e2c38e0a-dc/s500x750/6924e4454a9f477b6d1eaddaf38cb52a1917c51d.gif',
    topBadge: '👑 VIP VİTRİN İLE KAZANCINI KATLA',
    trafficBadge: '⚡ ANINDA MÜŞTERİ AKIŞI',
    title: 'Günde 50.000 Canlı Ziyaretçi Doğrudan Seni Görsün!',
    spot: 'Sayfaya giren herkesin ilk gördüğü dev vitrinde yerini ayırt. Komisyonsuz, doğrudan ve anında randevularını doldur.',
    aktif: true,
  },
  {
    id: 'promo-3',
    gifUrl: 'https://i.looksmax.org/attachments/2022/12/3217147_booty-bounce-2.gif',
    topBadge: '💎 LÜKS & SEÇKİN PRESTİJ',
    trafficBadge: '🔥 %100 GERÇEK MÜŞTERİ',
    title: 'Bu Vitrinde Parlayın, En Çok Kazanan Siz Olun!',
    spot: 'Rakiplerinin önüne geç, anasayfanın 1 numaralı vitrinine yerleş. Saatlerce müşteri aramak yerine müşteriler sana yazsın.',
    aktif: true,
  },
  {
    id: 'promo-4',
    gifUrl: 'https://media.tenor.com/7rtlPza-UqcAAAAM/asian.gif',
    topBadge: '⚡ ANINDA RANDEVU DOLDURMA',
    trafficBadge: '🚀 GOOGLE & ARAMA LİDERİ',
    title: 'Vitrine Sabitlenin, Müşteri Mesajlarına Yetişemeyin!',
    spot: 'Best Eskort VIP vitrini ile tüm şehirden gelen elit müşterilere ilk sırada ulaşın. WhatsApp randevu trafiğinizi hemen katlayın.',
    aktif: true,
  },
  {
    id: 'promo-5',
    gifUrl: 'https://media.tenor.com/UpyRgPYevTMAAAAM/sexy-girl.gif',
    topBadge: '👑 SINIRSIZ GÖRÜNTÜLENME & GÜÇ',
    trafficBadge: '🌟 VIP ÖZEL AYRICALIK',
    title: 'İlanınızı Vitrine Taşıyın, Zirvenin Keyfini Çıkarın!',
    spot: 'Tek tıkla vitrinde yerinizi alın, profesyonel reklam avantajıyla sınırsız kazanç ve maksimum görünürlük elde edin.',
    aktif: true,
  },
];

export default function HeroSlider({ slides = [], promoSlides = [], banner = null }: HeroSliderProps) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [touching, setTouching] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  // Sadece aktif olan GIF slide'larını al
  const effectivePromoSlides = React.useMemo(() => {
    const pool = Array.isArray(promoSlides) && promoSlides.length > 0 ? promoSlides : DEFAULT_EMPTY_VITRIN_SLIDES;
    const filtered = pool.filter((s) => s && s.aktif !== false && Boolean(s.gifUrl));
    return filtered.length > 0 ? filtered : DEFAULT_EMPTY_VITRIN_SLIDES;
  }, [promoSlides]);

  // ══════════════════════════════════════════════════════════════════
  // 5 SLOTLU HİBRİT VİTRİN MATRİSİ:
  // Toplam Vitrin Kapasitesi = Tam 5 Slot!
  // N = Canlı İlan Sayısı (0-5).
  // İlk N slot canlı ilanlar, kalan (5 - N) slot ise boş reklam GIF'leridir.
  // ══════════════════════════════════════════════════════════════════
  const liveListings = React.useMemo(() => slides.slice(0, 5), [slides]);
  const liveCount = liveListings.length;
  const emptyCount = 5 - liveCount;

  const fiveSlots = React.useMemo(() => {
    const slots: Array<
      | { type: 'listing'; slotIndex: number; data: DynamicHeroSlide }
      | {
          type: 'empty_promo';
          slotIndex: number;
          promoData: PromoSlideItem;
          emptySlotNumber: number;
          totalEmpty: number;
        }
    > = [];

    // 1. Canlı İlan Slotları (Varsa 1..N)
    for (let i = 0; i < liveCount; i++) {
      slots.push({
        type: 'listing',
        slotIndex: i,
        data: liveListings[i],
      });
    }

    // 2. Boş Kalan Slotlar (N..5)
    for (let i = liveCount; i < 5; i++) {
      const promoIndex = (i - liveCount) % effectivePromoSlides.length;
      slots.push({
        type: 'empty_promo',
        slotIndex: i,
        promoData: effectivePromoSlides[promoIndex],
        emptySlotNumber: i - liveCount + 1,
        totalEmpty: emptyCount,
      });
    }

    return slots;
  }, [liveListings, liveCount, emptyCount, effectivePromoSlides]);

  // Vitrinde yer alma butonuna basıldığında yönlendirme
  // Kural: İlanı olmayan kişi vitrin satın alamaz, önce ilan oluşturmalı!
  const handleVitrinNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const hasSession = localStorage.getItem('panel_user_session');
      if (hasSession) {
        try {
          router.push('/panelim?action=vitrin');
          return;
        } catch (err) {}
      }
      // İlanı olmayan / giriş yapmamış kişi direkt ilan verme sayfasına yönlendirilir
      router.push('/ilan-ver?vitrin=1');
    } else {
      router.push('/ilan-ver?vitrin=1');
    }
  };

  // 5 Slot Arasında Otomatik Dönen Rotasyon
  const next = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % fiveSlots.length);
  }, [fiveSlots.length]);

  const prev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + fiveSlots.length) % fiveSlots.length);
  }, [fiveSlots.length]);

  // ── AGGRESSIVE CLIENT-SIDE GIF & IMAGE CACHE PRELOADER ──────────
  // Tüm vitrin GIF'lerini ve ilan fotoğraflarını istemcinin (telefon/PC)
  // tarayıcı belleğine ve GPU'suna anında önbellekler.
  // Kullanıcı slaytlar arasında dönerken download beklemez, anında gösterilir.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Toplanacak tüm medya URL'leri (5 slot + tüm aktif havuz GIF'leri)
    const urlsToPreload = new Set<string>();

    // 1. 5 slotun içerikleri
    fiveSlots.forEach((slot) => {
      if (slot.type === 'listing' && slot.data.anaFotograf?.url) {
        urlsToPreload.add(slot.data.anaFotograf.url);
      } else if (slot.type === 'empty_promo' && slot.promoData?.gifUrl) {
        urlsToPreload.add(slot.promoData.gifUrl);
      }
    });

    // 2. Yedek havuzdaki tüm aktif GIF'ler
    effectivePromoSlides.forEach((p) => {
      if (p.gifUrl) urlsToPreload.add(p.gifUrl);
    });

    urlsToPreload.forEach((url) => {
      if (!url) return;

      // A) <link rel="preload" as="image"> ekle (Tarayıcı en yüksek ağ önceliğiyle indirir ve disk önbelleğine yazar)
      try {
        const linkId = `preload-vitrin-${encodeURIComponent(url).slice(0, 32)}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.rel = 'preload';
          link.as = 'image';
          link.href = url;
          document.head.appendChild(link);
        }
      } catch (e) {}

      // B) new Image() nesnesi oluşturup GPU belleğine (.decode) çöz (Render anında 0 ms gecikme)
      try {
        const img = new window.Image();
        img.src = url;
        if (typeof img.decode === 'function') {
          img.decode().catch(() => {});
        }
      } catch (e) {}

      // C) HTTP force-cache fetch ile tarayıcının yerel önbellek havuzuna zorla
      try {
        if (typeof fetch === 'function') {
          fetch(url, { mode: 'no-cors', cache: 'force-cache' }).catch(() => {});
        }
      } catch (e) {}
    });
  }, [fiveSlots, effectivePromoSlides]);

  useEffect(() => {
    if (fiveSlots.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [fiveSlots.length, next]);

  const currentSlot = fiveSlots[activeIdx] || fiveSlots[0];

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || '');
  const cleanAdminWaNumber = getAdminWhatsAppNumber();

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#0d1117] min-h-[500px] sm:min-h-[540px] h-[70vh] max-h-[640px] flex flex-col justify-between select-none"
      onTouchStart={e => { setTouching(true); setTouchStartX(e.touches[0].clientX); }}
      onTouchEnd={e => {
        if (!touching) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (diff > 40) next();
        else if (diff < -40) prev();
        setTouching(false);
      }}
    >
      {/* ── 1. 5 SLOT ARKA PLANLARI (Canlı İlan Fotoğrafları VEYA Parlak GIF'ler) ──────────────── */}
      {fiveSlots.map((slot, idx) => {
        const isCurrent = idx === activeIdx;

        if (slot.type === 'listing') {
          return (
            <div
              key={`slot-listing-${slot.data._id || idx}`}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.02] z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slot.data.anaFotograf?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=1200'}
                alt={slot.data.baslik}
                fill
                unoptimized
                priority
                loading="eager"
                sizes="(max-width: 640px) 100vw, 1200px"
                className="object-cover object-top sm:object-center brightness-105 contrast-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent z-10" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-black/20 to-transparent z-10" />

              {/* Su damgası */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden pb-16">
                <span className="font-heading font-black text-white/[0.16] text-3xl sm:text-5xl tracking-[0.25em] uppercase -rotate-25 whitespace-nowrap drop-shadow-sm">
                  BEST ESKORT
                </span>
                <span className="font-sans font-bold text-amber-400/[0.22] text-xs sm:text-base tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap mt-1">
                  Doğrulanmış VIP Vitrin #{idx + 1}
                </span>
              </div>
            </div>
          );
        }

        // Boş Vitrin Reklam GIF Slotu
        return (
          <div
            key={`slot-promo-${slot.promoData._id || slot.promoData.id || idx}`}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.02] z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slot.promoData.gifUrl}
              alt={slot.promoData.title}
              fill
              unoptimized
              priority
              loading="eager"
              sizes="(max-width: 640px) 100vw, 1200px"
              className="object-cover object-center brightness-100 contrast-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/75 to-transparent z-10" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-black/20 to-transparent z-10" />

            {/* Boş Vitrin Damgası */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden pb-16">
              <span className="font-heading font-black text-amber-400/[0.18] text-3xl sm:text-5xl tracking-[0.25em] uppercase -rotate-25 whitespace-nowrap drop-shadow-sm">
                BU ALAN BOŞTUR
              </span>
              <span className="font-sans font-bold text-white/[0.22] text-xs sm:text-base tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap mt-1">
                KONTENJAN #{idx + 1} / 5 • REKLAM VERİN
              </span>
            </div>
          </div>
        );
      })}

      {/* ── 2. ÜST BAR: ROZETLER & KONTENJAN BİLGİSİ ──────────────── */}
      <div className="relative z-30 px-4 pt-4 flex items-center justify-between w-full">
        {currentSlot.type === 'listing' ? (
          <>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-xs font-heading shadow-xl shadow-amber-500/30 border border-amber-300">
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>VIP VİTRİN • #{activeIdx + 1} / 5</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 text-slate-950 font-black text-xs font-heading shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>%100 Doğrulanmış</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white font-black text-xs font-heading shadow-xl shadow-purple-500/30 border border-purple-300">
              <Sparkles className="w-4 h-4" />
              <span>BOŞ VİTRİN ALANI • #{activeIdx + 1} / 5</span>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-amber-400 font-black text-xs font-heading border border-amber-500/40 flex items-center gap-1.5 shadow-lg">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{emptyCount} KONTENJAN BOŞ</span>
            </span>
          </>
        )}
      </div>

      {/* ── 3. ALT KART & BUTONLAR ──────────────── */}
      {currentSlot.type === 'listing' ? (
        // CANLI İLAN KARTI
        (() => {
          const current = currentSlot.data;
          const formattedNumber = formatWhatsAppNumber(current?.whatsappNumara || '');
          const sliderUrl = `${origin}/ilan/${current.slug}`;
          const ilName = current.ilSlug ? current.ilSlug.charAt(0).toUpperCase() + current.ilSlug.slice(1) : '';
          const ilceName = current.ilceSlug ? current.ilceSlug.charAt(0).toUpperCase() + current.ilceSlug.slice(1) : '';
          const locName = ilName && ilceName && ilName.toLowerCase() !== ilceName.toLowerCase()
            ? `${ilName} - ${ilceName} Eskort`
            : (ilceName ? `${ilceName} Eskort` : (ilName ? `${ilName} Eskort` : ''));
          const adLabel = locName ? `${locName} — ${current.baslik}` : current.baslik;
          const message = encodeURIComponent(`Merhaba, ben ${sliderUrl} adresindeki "${adLabel}" VIP ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`);
          const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;

          const handleWaClick = () => {
            if (current._id) {
              fetch('/api/listings/click-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: current._id }),
              }).catch(() => { });
            }
          };

          return (
            <div className="relative z-30 px-3.5 sm:px-5 pb-4 pt-1 flex flex-col gap-2 w-full max-w-2xl mx-auto text-left drop-shadow-2xl">
              {/* 1. ÜST BİLGİ SATIRI: SOLDA SIRA & CANLI, SAĞDA KONUM (ASLA ÜST ÜSTE BİNMEZ) */}
              <div className="flex items-center justify-between gap-2 w-full">
                {/* SOL: VİTRİN SIRASI & CANLI DURUM */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wide shadow-xl border border-amber-200">
                    <Crown className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
                    <span>VİTRİN #{activeIdx + 1}</span>
                  </span>

                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-emerald-500/50 text-emerald-400 font-mono font-bold text-[10px] sm:text-xs shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>CANLI</span>
                  </span>
                </div>

                {/* SAĞ: KONUM (LOCATION - SAĞ TARAFTA BELİRGİN & LÜKS) */}
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border-2 border-amber-400 text-amber-300 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">
                    {ilName ? `${ilName}${ilceName ? ` / ${ilceName}` : ''}` : 'TÜRKİYE'}
                  </span>
                </span>
              </div>

              {/* 2. ORTA: MODEL İSMİ VE BAŞLIK (AYRI TAM SATIR - ULTRA PREMİUM & ASLA ÇAKIŞMAZ) */}
              <div className="w-full pt-0.5">
                <Link href={`/ilan/${current.slug}`} className="block group/title">
                  <h1 className="font-heading font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] group-hover/title:text-amber-300 transition-colors line-clamp-2">
                    {current.baslik}
                  </h1>
                </Link>
              </div>

              {/* 3. İKİ ADET DEV AKSİYON BUTONU */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full font-heading pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWaClick}
                  className="py-3.5 sm:py-4 px-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                  title="WhatsApp ile Mesaj Gönder"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                  <span>WhatsApp İle Yaz</span>
                </a>

                <Link
                  href={`/ilan/${current.slug}`}
                  className="py-3.5 sm:py-4 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 border border-amber-200"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 shrink-0" />
                  <span>Profili İncele</span>
                </Link>
              </div>

              {/* 5 Slot İlerleme Çizgileri */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                {fiveSlots.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIdx 
                        ? 'w-8 bg-amber-400' 
                        : s.type === 'listing' ? 'w-2.5 bg-amber-500/60' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Slot ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        })()
      ) : (
        // BOŞ VİTRİN PROMO REKLAM KARTI
        (() => {
          const promo = currentSlot.promoData;
          const promoWaMessage = encodeURIComponent(`Merhaba, ${origin} adresindeki Anasayfa VIP Vitrin Slot #${activeIdx + 1} Reklam Alanında yer almak istiyorum. Fiyat ve detaylar hakkında bilgi alabilir miyim?`);
          const promoWaUrl = `https://wa.me/${cleanAdminWaNumber}?text=${promoWaMessage}`;

          return (
            <div className="relative z-30 px-3.5 pb-4 pt-2 flex flex-col gap-2 w-full max-w-2xl mx-auto text-left">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-mono font-black text-amber-300 uppercase tracking-wider bg-purple-900/60 border border-purple-400/40 px-2.5 py-0.5 rounded-full w-fit shadow-md flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>BU ALAN BOŞTUR • SLOT #{activeIdx + 1}/5</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold hidden sm:inline">
                    Günde 50.000+ Müşteri
                  </span>
                </div>

                <h2 className="font-black text-lg sm:text-2xl text-white font-heading tracking-tight leading-tight drop-shadow-md">
                  {promo.title || 'İlanınız Bu Vitrinde Dönsün, Telefonunuz Susmasın!'}
                </h2>
                <p className="text-[11px] sm:text-xs text-[#e6edf3] leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
                  {promo.spot || "Best Eskort VIP Vitrini İle Kazancınızı Katlayın! Anasayfa 5 vitrin slotundan biri boşta, hemen yerinizi ayırtın."}
                </p>
              </div>

              {/* 2 Adet Aksiyon Butonu */}
              <div className="grid grid-cols-2 gap-2.5 w-full font-heading pt-0.5">
                <a
                  href={promoWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 sm:py-3.5 px-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
                  title="WhatsApp ile Reklam Ver"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                  <span className="truncate">WhatsApp ile Reklam Ver</span>
                </a>

                <button
                  type="button"
                  onClick={handleVitrinNavigation}
                  className="py-3 sm:py-3.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-200 text-center"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 shrink-0" />
                  <span className="truncate">Vitrinde Yer Al</span>
                </button>
              </div>

              {/* 5 Slot İlerleme Çizgileri */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {fiveSlots.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIdx 
                        ? 'w-8 bg-amber-400' 
                        : s.type === 'listing' ? 'w-2.5 bg-amber-500/60' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Slot ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        })()
      )}

      {/* Dokunmatik Yan Geçiş Alanları */}
      <button onClick={prev} className="absolute left-0 top-0 bottom-24 w-16 z-40 opacity-0" aria-label="Önceki" />
      <button onClick={next} className="absolute right-0 top-0 bottom-24 w-16 z-40 opacity-0" aria-label="Sonraki" />
    </div>
  );
}
