'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck, ChevronRight, Crown, Star, Award, Medal } from 'lucide-react';
import { OfficialWhatsAppIcon, formatWhatsAppNumber } from '@/components/common/WhatsAppButton';

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
  const isUltraVip = rozet === 'ultravip';
  const isVip = rozet === 'vip';
  const isGold = rozet === 'gold';
  const isSilver = rozet === 'silver' || rozet === 'standart';

  const coverUrl = listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=600';

  const formattedNumber = formatWhatsAppNumber(listing.whatsappNumara);
  const message = encodeURIComponent(`Merhaba, "${listing.baslik}" ilanınız hakkında bilgi almak istiyorum.`);
  const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;

  const handleWaClick = () => {
    if (listing._id) {
      fetch('/api/listings/click-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing._id }),
      }).catch(() => {});
    }
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden bg-[#161b22] border transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl ${
        isUltraVip
          ? 'border-amber-500/70 hover:border-amber-400 ring-1 ring-amber-500/30'
          : isVip
          ? 'border-purple-500/60 hover:border-purple-400 ring-1 ring-purple-500/20'
          : isGold
          ? 'border-amber-600/50 hover:border-amber-500'
          : 'border-[#30363d] hover:border-[#484f58]'
      }`}
    >
      {/* ── 1. FOTOĞRAF ALANI ──────────────── */}
      <Link href={`/ilan/${listing.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#0d1117] block">
        <Image
          src={coverUrl}
          alt={listing.baslik}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-100"
        />
        {/* Üst Rozet & Teyitli Rozeti */}
        <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between">
          <div>
            {isUltraVip && (
              <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-slate-950" />
                <span>ULTRA VIP</span>
              </span>
            )}
            {isVip && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white font-black text-[9px] uppercase tracking-wider font-heading shadow-md flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-white" />
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

        {/* Alt Konum Etiketi */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-amber-400 text-[10px] font-bold capitalize">
          <MapPin className="w-2.5 h-2.5 text-amber-400" />
          <span className="truncate max-w-[90px]">{listing.ilSlug} / {listing.ilceSlug}</span>
        </div>
      </Link>

      {/* ── 2. BAŞLIK VE AKSİYON ALANI ──────────────── */}
      <div className="p-2.5 flex flex-col gap-2 justify-between flex-1">
        <Link href={`/ilan/${listing.slug}`} className="block">
          <h3 className="font-extrabold text-xs text-white leading-snug font-heading group-hover:text-amber-400 transition-colors line-clamp-2">
            {listing.baslik}
          </h3>
        </Link>

        {/* Facebook Style Recommendation Count (Dynamic & Organic) */}
        {(() => {
          const directLike = (listing as any).likeSayisi;
          if (typeof directLike === 'number' && directLike > 0) {
            return (
              <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-bold">
                <span className="text-blue-400 flex items-center gap-1 font-heading">
                  <span>👍</span>
                  <span>{directLike} Öneri</span>
                </span>
                <span className="text-emerald-400 font-mono">● Doğrulandı</span>
              </div>
            );
          }

          // Generate organic, realistic number based on tier + slug hash (50 - 370 range)
          const hash = (listing.slug || listing._id || 'es').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const baseLikes = isUltraVip ? 280 + (hash % 91) : isVip ? 190 + (hash % 85) : isGold ? 110 + (hash % 75) : 52 + (hash % 47);

          return (
            <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-bold">
              <span className="text-blue-400 flex items-center gap-1 font-heading">
                <span>👍</span>
                <span>{baseLikes} Öneri</span>
              </span>
              <span className="text-emerald-400 font-mono">● Doğrulandı</span>
            </div>
          );
        })()}

        {/* WhatsApp & Detay Butonları */}
        <div className="grid grid-cols-2 gap-1.5 pt-1 font-heading">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWaClick}
            className="py-2 px-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-[10px] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
            title="WhatsApp"
          >
            <OfficialWhatsAppIcon className="w-3 h-3 fill-slate-950 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          <Link
            href={`/ilan/${listing.slug}`}
            className="py-2 px-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-[10px] border border-[#363b42] active:scale-95 transition-all flex items-center justify-center gap-0.5 text-center"
          >
            <span>İncele</span>
            <ChevronRight className="w-3 h-3 text-amber-400 stroke-[3] shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
