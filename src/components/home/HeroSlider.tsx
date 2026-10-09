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
import { getAdminWhatsAppUrl } from '@/lib/siteConfig';
import { trackEvent } from '@/components/common/AnalyticsTracker';

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
  adminWhatsApp?: string;
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

export default function HeroSlider({ slides = [], promoSlides = [], banner = null, adminWhatsApp }: HeroSliderProps) {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [touching, setTouching] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sayfa tam yüklendiğinde slider'ı hazırla
  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    setActiveIdx((prev) => (prev + 1) % (fiveSlots.length || 1));
  }, [fiveSlots.length]);

  const prev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + (fiveSlots.length || 1)) % (fiveSlots.length || 1));
  }, [fiveSlots.length]);

  // ── MOBİL & DÜŞÜK GÜÇLÜ CİHAZ DOSTU ÖNBELLEKLEME ──────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nextIdx = (activeIdx + 1) % (fiveSlots.length || 1);
    const targets = [fiveSlots[activeIdx], fiveSlots[nextIdx]].filter(Boolean);

    targets.forEach((slot) => {
      const url = slot.type === 'listing' ? slot.data.anaFotograf?.url : slot.promoData?.gifUrl;
      if (!url) return;

      const img = new window.Image();
      img.src = url;
    });
  }, [activeIdx, fiveSlots]);

  // ── AKILLI SLIDE ZAMANLAYICI (İlk slaytta 7.5s rahat okuma/tıklama süresi) ──────────
  useEffect(() => {
    if (!isLoaded || fiveSlots.length <= 1 || isHovered || touching) return;

    // İlk açılışta kullanıcının WhatsApp veya Profili İncele butonuna rahatça tıklayabilmesi için 7.5 saniye bekle
    const delay = activeIdx === 0 ? 7500 : 6000;
    const timer = setTimeout(() => {
      next();
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoaded, fiveSlots.length, activeIdx, isHovered, touching, next]);

  const currentSlot = fiveSlots[activeIdx] || fiveSlots[0];

  // Canlı Vitrin İlanı Görüntülenme / Gösterim Takibi
  useEffect(() => {
    if (currentSlot && currentSlot.type === 'listing' && currentSlot.data) {
      if (typeof window !== 'undefined' && (window as any).trackListingImpression) {
        (window as any).trackListingImpression({
          listingId: currentSlot.data._id,
          slug: currentSlot.data.slug,
          title: currentSlot.data.baslik,
          city: `${currentSlot.data.ilSlug || ''}/${currentSlot.data.ilceSlug || ''}`,
        });
      }
    }
  }, [currentSlot]);

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || '');

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#0d1117] min-h-[500px] sm:min-h-[540px] h-[70vh] max-h-[640px] flex flex-col justify-between select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        // Mobilde GPU şişmesini önlemek için sadece aktif ve hemen yanındaki slayt DOM'a basılır
        const shouldMount = isCurrent || Math.abs(idx - activeIdx) <= 1 || (idx === 0 && activeIdx === fiveSlots.length - 1);
        if (!shouldMount) return null;

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
                priority={isCurrent}
                loading={isCurrent ? 'eager' : 'lazy'}
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
              priority={isCurrent}
              loading={isCurrent ? 'eager' : 'lazy'}
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

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/95 text-slate-950 font-black text-xs font-heading shadow-lg border border-emerald-300/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Teyitli</span>
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
          if (!current) return null;
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
            trackEvent('whatsapp_click', {
              listingId: current._id,
              title: current.baslik,
              phone: formattedNumber,
              city: `${current.ilSlug || ''}/${current.ilceSlug || ''}`,
              slug: current.slug,
            });
            if (current._id) {
              fetch('/api/listings/click-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: current._id }),
              }).catch(() => { });
            }
          };

          return (
            <div className="relative z-30 px-3.5 sm:px-5 pb-0 pt-1 flex flex-col gap-2 w-full max-w-2xl mx-auto text-left drop-shadow-2xl">
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

                {/* SAĞ: YENİ İL & İLÇE KART TASARIMI (LÜKS GPS PODU) */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-xl border border-amber-400/70 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(251,191,36,0.25)] shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-400/20 border border-amber-400/50 flex items-center justify-center shrink-0">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400/40" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-heading font-black uppercase tracking-wider">
                    <span className="text-white drop-shadow-sm">{ilName || 'TÜRKİYE'}</span>
                    {ilceName && (
                      <>
                        <span className="text-amber-400/80 font-bold">/</span>
                        <span className="text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">{ilceName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. ORTA: MODEL İSMİ VE BAŞLIK (AYRI TAM SATIR - ULTRA PREMİUM & ASLA ÇAKIŞMAZ) */}
              <div className="w-full pt-0.5">
                <Link href={`/ilan/${current.slug}`} className="block group/title">
                  <p className="font-heading font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] group-hover/title:text-amber-300 transition-colors line-clamp-2">
                    {current.baslik}
                  </p>
                </Link>
              </div>

              {/* 3. İKİ ADET DEV AKSİYON BUTONU */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full font-heading pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWaClick}
                  className="py-3.5 sm:py-4 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.65)] active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 border border-emerald-400/30"
                  title="WhatsApp ile Randevu Al"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0 drop-shadow" />
                  <span className="truncate">RANDEVU AL</span>
                </a>

                <Link
                  href={`/ilan/${current.slug}`}
                  className="relative overflow-hidden py-3.5 sm:py-4 px-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(251,191,36,0.35)] hover:shadow-[0_4px_30px_rgba(251,191,36,0.55)] active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-amber-400 hover:border-amber-300 group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent group-hover/btn:translate-x-full duration-700 transition-transform pointer-events-none" />
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400/30 group-hover/btn:fill-amber-400 transition-all shrink-0" />
                  <span className="truncate">PROFİLİ İNCELE</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3] text-amber-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform shrink-0" />
                </Link>
              </div>

              {/* 5 Slot İlerleme Çizgileri */}
              <div className="flex items-center justify-center gap-1.5 pt-1 pb-0.5">
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
          const promoWaUrl = getAdminWhatsAppUrl(
            `Merhaba, ${origin} adresindeki Anasayfa VIP Vitrin Slot #${activeIdx + 1} Reklam Alanında yer almak istiyorum. Fiyat ve detaylar hakkında bilgi alabilir miyim?`,
            adminWhatsApp
          );

          return (
            <div className="relative z-30 px-3.5 pb-0 pt-2 flex flex-col gap-2 w-full max-w-2xl mx-auto text-left">
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
                  onClick={(e) => {
                    e.preventDefault();
                    const url = getAdminWhatsAppUrl(
                      `Merhaba, ${origin} adresindeki Anasayfa VIP Vitrin Slot #${activeIdx + 1} Reklam Alanında yer almak istiyorum. Fiyat ve detaylar hakkında bilgi alabilir miyim?`,
                      adminWhatsApp
                    );
                    if (typeof window !== 'undefined') {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="py-3 sm:py-3.5 px-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
                  title="WhatsApp ile Reklam Ver"
                >
                  <OfficialWhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
                  <span className="truncate">REKLAM VER</span>
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
              <div className="flex items-center justify-center gap-1.5 pt-1 pb-0.5">
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
