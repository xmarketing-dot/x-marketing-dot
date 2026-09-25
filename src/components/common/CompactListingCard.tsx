'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, Crown, Award, Medal } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';
import { trackEvent } from '@/components/common/AnalyticsTracker';

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
  };
}

export default function CompactListingCard({ listing }: CompactListingCardProps) {
  const rozet = listing.rozet || 'silver';
  const isVip = rozet === 'vip' || rozet === 'ultravip';
  const isGold = rozet === 'gold';
  const isSilver = rozet === 'silver' || rozet === 'standart';

  // Extract all unique images with robust string/object format support
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    const pushImg = (val: any) => {
      if (!val) return;
      const url = typeof val === 'string' ? val : val?.url;
      if (typeof url === 'string' && url.trim() && !list.includes(url.trim())) {
        list.push(url.trim());
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // IntersectionObserver: Yalnızca ekranda görünen kartlar timer çalıştırsın (CPU & Pil tasarrufu)
  useEffect(() => {
    if (!cardRef.current || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '100px', threshold: 0.15 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
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

  // Auto-slide images periodically ONLY IF VISIBLE on screen
  useEffect(() => {
    if (!isVisible || !allImages || allImages.length <= 1) return;

    // Staggered interval between 2.8s and 3.6s
    const hash = (listing.slug || listing._id || 'a').charCodeAt(0);
    const intervalTime = 2800 + (hash % 800);

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isVisible, allImages.length, listing.slug, listing._id]);

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
  const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;

  const handleWaClick = () => {
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

  return (
    <div
      ref={cardRef}
      className={`group relative aspect-[3/4.8] sm:aspect-[3/4.5] w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#0d1117] border transition-all duration-300 shadow-md hover:shadow-xl select-none ${
        isVip
          ? 'border-amber-500/75 hover:border-amber-400 shadow-amber-500/10 ring-1 ring-amber-500/20'
          : isGold
          ? 'border-yellow-500/60 hover:border-yellow-400 shadow-yellow-500/10 ring-1 ring-yellow-500/15'
          : 'border-slate-600/50 hover:border-slate-400 shadow-slate-500/5 ring-1 ring-slate-400/10'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── 1. FOTOĞRAF (Kartın Tamamını En Tepeden En Alta Kadar %100 Kaplar) ──────────────── */}
      <Link href={`/ilan/${listing.slug}`} className="absolute inset-0 block w-full h-full z-0">
        {allImages.map((imgUrl, idx) => {
          const isCurrent = idx === currentIndex;
          // Sadece aktif ve sonraki fotoğrafı DOM'da tut (Bellek ve GPU rahatlatması)
          const shouldRender = isCurrent || Math.abs(idx - currentIndex) <= 1 || (idx === 0 && currentIndex === allImages.length - 1);
          if (!shouldRender) return null;

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${listing.baslik} - Fotoğraf ${idx + 1}`}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 33vw, 240px"
                className="object-cover object-top"
              />
            </div>
          );
        })}
      </Link>

      {/* Üst Rozetler */}
      <div className="absolute top-1.5 left-1.5 right-1.5 z-20 flex items-center justify-between pointer-events-none">
        <div>
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
        </div>

        <div className="flex items-center gap-1">
          {/* Canlı Online Nabzı */}
          <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-emerald-400 font-bold text-[8px] sm:text-[9px] flex items-center gap-1 border border-emerald-500/40 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Aktif</span>
          </span>

          <span className="px-1.5 py-0.5 rounded bg-emerald-500/90 backdrop-blur-xs text-slate-950 font-black text-[8.5px] sm:text-[9.5px] font-heading shadow-md flex items-center gap-0.5 ring-1 ring-emerald-400/40">
            <ShieldCheck className="w-2.5 h-2.5 stroke-[3]" />
            <span>Teyitli</span>
          </span>
        </div>
      </div>

      {/* Fotoğraf Nokta Göstergeleri */}
      {allImages.length > 1 && (
        <div className="absolute bottom-[58px] sm:bottom-[64px] left-0 right-0 z-20 flex items-center justify-center gap-1 pointer-events-none">
          {allImages.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`h-1 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex
                  ? isVip ? 'w-2.5 bg-amber-400' : isGold ? 'w-2.5 bg-yellow-400' : 'w-2.5 bg-slate-300'
                  : 'w-1 bg-white/60 backdrop-blur-sm'
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

      {/* ── 2. BAŞLIK, KONUM VE WHATSAPP BUTONU (Doğrudan Fotoğrafın Altında Yüzen Katman) ──────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-1.5 sm:p-2 pt-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-1.5 pointer-events-auto">
        {/* Başlık ve İl */}
        <div className="flex items-center justify-between gap-1">
          <Link href={`/ilan/${listing.slug}`} className="block min-w-0 flex-1">
            <h3 className={`font-black text-[10.5px] sm:text-xs text-white leading-tight font-heading transition-colors line-clamp-1 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${
              isVip ? 'group-hover:text-amber-300' : isGold ? 'group-hover:text-yellow-300' : 'group-hover:text-slate-200'
            }`}>
              {listing.baslik}
            </h3>
          </Link>

          <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-amber-400 shrink-0 drop-shadow-sm capitalize">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate max-w-[50px] sm:max-w-[70px]">{listing.ilSlug}</span>
          </span>
        </div>

        {/* GENİŞ WHATSAPP BUTONU */}
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
      </div>
    </div>
  );
}
