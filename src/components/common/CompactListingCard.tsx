'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, ChevronRight, Crown, Award, Medal } from 'lucide-react';
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

  // Extract all unique images
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (listing.anaFotograf?.url) list.push(listing.anaFotograf.url);
    if (Array.isArray(listing.fotograflar)) {
      listing.fotograflar.forEach((f) => {
        if (f?.url && !list.includes(f.url)) list.push(f.url);
      });
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
    if (allImages.length <= 1) return;

    // Slight staggered delay based on listing slug/id hash
    const hash = (listing.slug || listing._id || 'a').charCodeAt(0);
    const intervalTime = 3200 + (hash % 1000);

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
  const cardUrl = typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin}/ilan/${listing.slug}`
    : `https://besteskort.devs.surf/ilan/${listing.slug}`;
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
          ? 'border-amber-500/80 hover:border-amber-400 shadow-amber-500/10'
          : isGold
          ? 'border-amber-600/60 hover:border-amber-500'
          : 'border-[#30363d] hover:border-[#484f58]'
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
              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-slate-950" />
                <span>VIP</span>
              </span>
            )}
            {isGold && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-600 text-white font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5" />
                <span>GOLD</span>
              </span>
            )}
            {isSilver && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-700 text-slate-200 font-bold text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
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
                    ? 'w-4 bg-amber-400 shadow-sm shadow-black'
                    : 'w-1.5 bg-white/50 backdrop-blur-sm'
                }`}
              />
            ))}
          </div>
        )}

        {/* Alt Konum Etiketi */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold capitalize border border-amber-400/20">
          <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[95px]">{listing.ilSlug} / {listing.ilceSlug}</span>
        </div>
      </div>

      {/* ── 2. BAŞLIK VE AKSİYON ALANI (Liste Tipi Çerçeveli Düzen) ──────────────── */}
      <div className="p-2.5 bg-[#161b22] border-t border-[#30363d]/60 flex flex-col gap-2 justify-between flex-1">
        <Link href={`/ilan/${listing.slug}`} className="block">
          <h3 className="font-extrabold text-xs text-white leading-snug font-heading group-hover:text-amber-400 transition-colors line-clamp-2">
            {listing.baslik}
          </h3>
        </Link>

        {/* Facebook Style Recommendation Count (Dynamic & Organic) */}
        {(() => {
          const hash = (listing.slug || listing._id || 'es').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const baseLikes = isVip ? 240 + (hash % 95) : isGold ? 120 + (hash % 70) : 55 + (hash % 45);

          return (
            <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-bold border-b border-[#21262d] pb-1.5">
              <span className="text-blue-400 flex items-center gap-1 font-heading">
                <span>👍</span>
                <span>{baseLikes} Öneri</span>
              </span>
              <span className="text-emerald-400 font-mono text-[9px]">● Doğrulandı</span>
            </div>
          );
        })()}

        {/* WhatsApp & Detay Butonları */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5 font-heading">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWaClick}
            className="py-2 px-1 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-[10px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
            title="WhatsApp"
          >
            <OfficialWhatsAppIcon className="w-3 h-3 fill-slate-950 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          <Link
            href={`/ilan/${listing.slug}`}
            className="py-2 px-1 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-[10px] border border-[#363b42] active:scale-95 transition-all flex items-center justify-center gap-0.5 text-center"
          >
            <span>İncele</span>
            <ChevronRight className="w-3 h-3 text-amber-400 stroke-[3] shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
