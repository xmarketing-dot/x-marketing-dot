'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, Crown, Award, Medal } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';
import { trackEvent } from '@/components/common/AnalyticsTracker';

// Global scroll takibi: Kullanıcı parmağıyla scroll yaparken kartların resim değiştirmesini dondurur (FPS düşüşünü sıfırlar)
let isGlobalScrolling = false;
let globalScrollTimeout: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      isGlobalScrolling = true;
      if (globalScrollTimeout) clearTimeout(globalScrollTimeout);
      globalScrollTimeout = setTimeout(() => {
        isGlobalScrolling = false;
      }, 150);
    },
    { passive: true }
  );
}

// ── PERFORMANS İÇİN TEK PAYLAŞIMLI INTERSECTION OBSERVER (350 ayrı observer yerine 1 adet) ──
let sharedObserver: IntersectionObserver | null = null;
const cardCallbacks = new Map<Element, (isIntersecting: boolean) => void>();

function getSharedObserver() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cb = cardCallbacks.get(entry.target);
          if (cb) cb(entry.isIntersecting);
        });
      },
      { rootMargin: '800px 0px', threshold: 0.01 }
    );
  }
  return sharedObserver;
}

/**
 * Grid görünümünde 1600px orijinal yerine 480px Retina (~15KB) hafif ve net thumbnail ister
 */
function getThumbnailUrl(rawUrl: string, width = 480): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('/api/img/')) {
    const separator = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${separator}w=${width}`;
  }
  return rawUrl;
}

interface CompactListingCardProps {
  listing: {
    _id: string;
    slug: string;
    baslik: string;
    ilSlug: string;
    ilceSlug: string;
    anaFotograf?: { url: string };
    fotograflar?: { url: string }[];
    rozet?: 'ultravip' | 'vip' | 'gold' | 'silver' | 'standart' | null;
    whatsappNumara: string;
    isPassive?: boolean;
    status?: string;
  };
  priority?: boolean;
}

export default function CompactListingCard({ listing, priority = false }: CompactListingCardProps) {
  if (!listing) return null;
  const isPassive = Boolean(listing.isPassive || listing.status === 'pasif' || listing.status === 'suresi_doldu');
  const rozet = listing.rozet || 'silver';
  const isVip = !isPassive && (rozet === 'vip' || rozet === 'ultravip');
  const isGold = !isPassive && rozet === 'gold';
  const isSilver = !isPassive && (rozet === 'silver' || rozet === 'standart');

  // Extract all unique images with robust string/object format support (Duplicate temizliği)
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    const pushImg = (val: any) => {
      if (!val) return;
      const url = typeof val === 'string' ? val : val?.url;
      if (typeof url === 'string') {
        const cleanUrl = url.trim();
        if (cleanUrl && !list.includes(cleanUrl)) {
          list.push(cleanUrl);
        }
      }
    };

    pushImg(listing.anaFotograf);
    if (Array.isArray(listing.fotograflar)) {
      listing.fotograflar.forEach(pushImg);
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600');
    }
    return list;
  }, [listing.anaFotograf, listing.fotograflar]);

  // Gerçekçi durum dağılımı: Pasif ilanlar asla online görünmez
  const isOnline = React.useMemo(() => {
    if (isPassive) return false;
    const hash = (listing.slug || listing._id || 'a').charCodeAt(0) + (listing.slug || '').length;
    return hash % 3 !== 0;
  }, [isPassive, listing.slug, listing._id]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Tek paylaşımlı IntersectionObserver ile kart görünürlük takibi (800px önceden tetiklenir)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) {
      setIsVisible(true);
      return;
    }

    const observer = getSharedObserver();
    if (!observer) {
      setIsVisible(true);
      return;
    }

    cardCallbacks.set(el, (intersecting) => {
      setIsVisible(intersecting);
    });
    observer.observe(el);

    return () => {
      cardCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, []);

  // Otomatik Görüntülenme / Gösterim (Impression) Takibi (Yalnızca ekranda görününce)
  useEffect(() => {
    if (!isVisible || !listing || !listing._id) return;
    if (typeof window !== 'undefined' && window.trackListingImpression) {
      window.trackListingImpression({
        listingId: listing._id,
        slug: listing.slug,
        title: listing.baslik,
        city: `${listing.ilSlug || ''}/${listing.ilceSlug || ''}`,
      });
    }
  }, [isVisible, listing._id, listing.slug, listing.baslik, listing.ilSlug, listing.ilceSlug]);

  // Auto-slide: Sadece ekrandaki öncelikli VIP kartlar için sakin ritimde çalışır
  useEffect(() => {
    if (!priority || !isVisible || !allImages || allImages.length <= 1) return;

    const hash = (listing.slug || listing._id || 'a').charCodeAt(0) + (listing.slug || '').length;
    const intervalTime = 6500 + (hash % 3000);

    const timer = setInterval(() => {
      if (isGlobalScrolling) return;
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [priority, isVisible, allImages.length, listing.slug, listing._id]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Photo
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Photo
      setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const formattedNumber = formatWhatsAppNumber(listing.whatsappNumara);
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || '');
  const cardUrl = `${origin}/ilan/${listing.slug}`;
  const ilName = listing.ilSlug ? listing.ilSlug.charAt(0).toUpperCase() + listing.ilSlug.slice(1) : '';
  const ilceName = listing.ilceSlug ? listing.ilceSlug.charAt(0).toUpperCase() + listing.ilceSlug.slice(1) : '';
  const locName = ilName && ilceName && ilName.toLowerCase() !== ilceName.toLowerCase()
    ? `${ilName} - ${ilceName} Eskort`
    : (ilceName ? `${ilceName} Eskort` : (ilName ? `${ilName} Eskort` : ''));
  const adLabel = locName ? `${locName} — ${listing.baslik}` : listing.baslik;
  const message = encodeURIComponent(`Merhaba, ben ${cardUrl} adresindeki "${adLabel}" ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`);
  const waUrl = isPassive ? '#' : `https://wa.me/${formattedNumber}?text=${message}`;

  const handleWaClick = () => {
    if (isPassive) return;
    if (listing._id) {
      trackEvent('whatsapp_click', {
        listingId: listing._id,
        title: listing.baslik,
        city: `${listing.ilSlug}/${listing.ilceSlug}`,
        phone: formattedNumber,
        slug: listing.slug,
      });
      fetch('/api/listings/click-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing._id }),
      }).catch(() => {});
    }
  };

  const currentPhotoUrl = getThumbnailUrl(allImages[currentIndex] || allImages[0], 360);

  return (
    <div
      ref={cardRef}
      style={{ contain: 'layout paint' }}
      className={`group relative aspect-[3/4.8] sm:aspect-[3/4.5] w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#0d1117] border shadow-md select-none ${
        isPassive
          ? 'border-zinc-800/80 bg-zinc-950/90 opacity-90'
          : isVip
          ? 'border-amber-500/75 shadow-amber-500/10 ring-1 ring-amber-500/20'
          : isGold
          ? 'border-yellow-500/60 shadow-yellow-500/10 ring-1 ring-yellow-500/15'
          : 'border-slate-600/50 shadow-slate-500/5 ring-1 ring-slate-400/10'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── 1. FOTOĞRAF (Kartın Tamamını En Tepeden En Alta Kadar %100 Kaplar) ── */}
      <Link href={`/ilan/${listing.slug}`} prefetch={false} className="absolute inset-0 block w-full h-full z-0 overflow-hidden">
        <div className="relative w-full h-full">
          <img
            src={currentPhotoUrl}
            alt={`${listing.baslik} - Fotoğraf ${currentIndex + 1}`}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
            decoding="async"
            className={`w-full h-full object-cover object-top select-none pointer-events-none transition-opacity duration-300 ${
              isPassive ? 'grayscale contrast-125 brightness-75' : ''
            }`}
          />
        </div>
      </Link>

      {/* Pasif İlan Çapraz Şerit (Ribbon) */}
      {isPassive && (
        <div className="absolute inset-0 z-15 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[140%] py-1 bg-rose-600/90 text-white font-black text-[8px] sm:text-[9.5px] tracking-wider uppercase text-center -rotate-25 shadow-lg border-y border-rose-400/50 font-heading">
            ⚠️ SÜRESİ DOLDU
          </div>
        </div>
      )}

      {/* Üst Rozetler */}
      <div className="absolute top-1.5 left-1.5 right-1.5 z-20 flex items-center justify-between pointer-events-none">
        <div>
          {isPassive ? (
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-extrabold text-[8px] sm:text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>PASİF</span>
            </span>
          ) : (
            <>
              {isVip && (
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-[8px] sm:text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5 fill-slate-950" />
                  <span>VIP</span>
                </span>
              )}
              {isGold && (
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black text-[8px] sm:text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" />
                  <span>GOLD</span>
                </span>
              )}
              {isSilver && (
                <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400 text-slate-950 font-black text-[8px] sm:text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                  <Medal className="w-2.5 h-2.5" />
                  <span>SILVER</span>
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Canlı Online Nabzı */}
          {isOnline && (
            <span className="p-1 rounded-full bg-black/85 border border-emerald-500/40 shadow-sm flex items-center justify-center">
              <span className="relative flex h-1.5 w-1.5">
                {priority && isVisible && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
              </span>
            </span>
          )}

          {!isPassive && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[8.5px] sm:text-[9.5px] font-heading shadow-md flex items-center gap-0.5 ring-1 ring-emerald-400/40">
              <ShieldCheck className="w-2.5 h-2.5 stroke-[3]" />
              <span>Teyitli</span>
            </span>
          )}
        </div>
      </div>

      {/* Fotoğraf Nokta Göstergeleri */}
      {allImages.length > 1 && !isPassive && (
        <div className="absolute bottom-[58px] sm:bottom-[64px] left-0 right-0 z-20 flex items-center justify-center gap-1 pointer-events-none">
          {allImages.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`h-1 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex
                  ? isVip ? 'w-2.5 bg-amber-400' : isGold ? 'w-2.5 bg-yellow-400' : 'w-2.5 bg-slate-300'
                  : 'w-1 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Diagonal Filigran */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-heading font-black text-white/[0.14] text-[10px] sm:text-xs tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap">
          BEST ESKORT
        </span>
      </div>

      {/* ── 2. BAŞLIK, KONUM VE WHATSAPP BUTONU ──────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-1.5 sm:p-2 pt-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-1.5 pointer-events-auto">
        {/* Başlık ve İl */}
        <div className="flex items-center justify-between gap-1">
          <Link href={`/ilan/${listing.slug}`} prefetch={false} className="block min-w-0 flex-1">
            <h3 className={`font-black text-[10.5px] sm:text-xs text-white leading-tight font-heading transition-colors line-clamp-1 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
              isPassive ? 'text-zinc-400 line-through' : isVip ? 'group-hover:text-amber-300' : isGold ? 'group-hover:text-yellow-300' : 'group-hover:text-slate-200'
            }`}>
              {listing.baslik}
            </h3>
          </Link>

          <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-amber-400 shrink-0 drop-shadow-sm capitalize">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate max-w-[50px] sm:max-w-[70px]">{listing.ilSlug}</span>
          </span>
        </div>

        {/* WHATSAPP BUTONU (Pasif İlanlar İçin Kilitli & Güvenli) */}
        {isPassive ? (
          <button
            type="button"
            disabled
            className="w-full py-1.5 sm:py-2 px-2 rounded-md sm:rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-[10px] sm:text-[11px] cursor-not-allowed flex items-center justify-center gap-1.5 select-none font-heading"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
            <span className="truncate">İlan Pasif (İletişim Kapalı)</span>
          </button>
        ) : (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWaClick}
            className="w-full py-1.5 sm:py-2 px-2 rounded-md sm:rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10.5px] sm:text-xs tracking-wide shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 font-heading"
            title="WhatsApp ile İletişime Geç"
          >
            <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
