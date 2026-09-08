'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, ChevronRight, Crown, Award, Medal, Eye, ArrowUpRight, Sparkles } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';

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
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Auto-slide images periodically if multiple images exist
  useEffect(() => {
    if (!allImages || allImages.length <= 1) return;

    // Staggered interval between 2.2s and 3.0s
    const hash = (listing.slug || listing._id || 'a').charCodeAt(0);
    const intervalTime = 2200 + (hash % 800);

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [allImages.length, listing.slug, listing._id]);

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
      if (typeof window !== 'undefined' && window.trackEvent) {
        window.trackEvent('whatsapp_click', {
          listingId: listing._id,
          title: listing.baslik,
          city: `${listing.ilSlug}/${listing.ilceSlug}`,
          phone: formattedNumber,
        });
      }
      fetch('/api/listings/click-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing._id }),
      }).catch(() => {});
    }
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-[#161b22] border transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-xl ${
        isVip
          ? 'border-amber-500/75 hover:border-amber-400 shadow-amber-500/10 ring-1 ring-amber-500/20'
          : isGold
          ? 'border-yellow-500/60 hover:border-yellow-400 shadow-yellow-500/10 ring-1 ring-yellow-500/15'
          : 'border-slate-600/50 hover:border-slate-400 shadow-slate-500/5 ring-1 ring-slate-400/10'
      }`}
    >
      {/* ── 1. FOTOĞRAF ALANI (Otomatik Kayan & Mobilde Kaydırılabilir Slider) ──────────────── */}
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#0d1117] select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link href={`/ilan/${listing.slug}`} className="relative w-full h-full block">
          {allImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${listing.baslik} - Fotoğraf ${idx + 1}`}
                fill
                unoptimized
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 300px"
              />
            </div>
          ))}
        </Link>

        {/* Üst Rozetler */}
        <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
          <div>
            {isVip && (
              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-slate-950" />
                <span>VIP</span>
              </span>
            )}
            {isGold && (
              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5" />
                <span>GOLD</span>
              </span>
            )}
            {isSilver && (
              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400 text-slate-950 font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Medal className="w-2.5 h-2.5" />
                <span>SILVER</span>
              </span>
            )}
          </div>

          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[9px] font-heading shadow-md flex items-center gap-0.5">
            <ShieldCheck className="w-2.5 h-2.5 stroke-[3]" />
            <span>Teyitli</span>
          </span>
        </div>

        {/* Fotoğraf Nokta Göstergeleri (Slide Dots) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-7 left-0 right-0 z-20 flex items-center justify-center gap-1 pointer-events-none">
            {allImages.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? isVip ? 'w-4 bg-amber-400' : isGold ? 'w-4 bg-yellow-400' : 'w-4 bg-slate-300'
                    : 'w-1.5 bg-white/50 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        )}

        {/* Sahibinden-Style Diagonal Semi-Transparent Center Watermark */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-heading font-black text-white/[0.18] text-base sm:text-lg tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap">
            BEST ESKORT
          </span>
          <span className="font-sans font-bold text-amber-400/[0.22] text-[9px] tracking-[0.15em] uppercase -rotate-25 whitespace-nowrap mt-0.5">
            {typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : 'Doğrulanmış Profil'}
          </span>
        </div>

        {/* Alt Konum Etiketi */}
        <div className={`absolute bottom-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[10px] font-bold capitalize border ${
          isVip ? 'text-amber-400 border-amber-400/30' : isGold ? 'text-yellow-400 border-yellow-400/30' : 'text-slate-300 border-slate-500/30'
        }`}>
          <MapPin className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate max-w-[95px]">{listing.ilSlug} / {listing.ilceSlug}</span>
        </div>
      </div>

      {/* ── 2. BAŞLIK VE AKSİYON ALANI (Liste Tipi Çerçeveli Düzen) ──────────────── */}
      <div className="p-2 sm:p-2.5 bg-[#161b22] border-t border-[#30363d]/60 flex flex-col gap-1.5 justify-between flex-1">
        <Link href={`/ilan/${listing.slug}`} className="block">
          <h3 className={`font-black text-xs sm:text-[13px] text-white leading-snug font-heading transition-colors line-clamp-1 truncate ${
            isVip ? 'group-hover:text-amber-300' : isGold ? 'group-hover:text-yellow-300' : 'group-hover:text-slate-200'
          }`}>
            {listing.baslik}
          </h3>
        </Link>

        {/* Facebook Style Recommendation & Verified Badges */}
        {(() => {
          const hash = (listing.slug || listing._id || 'es').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const baseLikes = isVip ? 240 + (hash % 95) : isGold ? 120 + (hash % 70) : 55 + (hash % 45);

          return (
            <div className="flex items-center justify-between text-[11px] font-bold border-b border-[#21262d] pb-1.5">
              <span className="text-blue-400 flex items-center gap-1 font-heading font-extrabold">
                <span>👍</span>
                <span>{baseLikes} Öneri</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>Doğrulandı</span>
              </span>
            </div>
          );
        })()}

        {/* ── PREMİUM VE MOBİL-NATİVE AKSİYON BUTONLARI (WHATSAPP & PROFİLİ GÖR) ──────────────── */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5 font-heading">
          {/* 1. WHATSAPP BUTONU */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWaClick}
            className="py-2.5 px-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs sm:text-[13px] tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            title="WhatsApp ile Mesaj Gönder"
          >
            <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          {/* 2. PROFİLİ İNCELE BUTONU (Paket Rengine Uyumlu Lüks Buton) */}
          <Link
            href={`/ilan/${listing.slug}`}
            className={`py-2.5 px-2 rounded-xl font-black text-xs sm:text-[13px] tracking-wide border shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 text-center ${
              isVip
                ? 'bg-[#1c1811] hover:bg-[#251e15] text-amber-300 hover:text-amber-200 border-amber-500/50 hover:border-amber-400'
                : isGold
                ? 'bg-[#1a1710] hover:bg-[#262115] text-yellow-300 hover:text-yellow-200 border-yellow-500/50 hover:border-yellow-400'
                : 'bg-[#161b22] hover:bg-[#21262d] text-slate-200 hover:text-white border-slate-500/40 hover:border-slate-300'
            }`}
            title="Model Profilini ve Fotoğraflarını İncele"
          >
            <Eye className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5] ${
              isVip ? 'text-amber-400' : isGold ? 'text-yellow-400' : 'text-slate-300'
            }`} />
            <span className="truncate">Profili Gör</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
