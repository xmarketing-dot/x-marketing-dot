'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import ImageSlider from '@/components/common/ImageSlider';
import WhatsAppButton from '@/components/common/WhatsAppButton';

interface ListingCardProps {
  listing: {
    _id: string;
    slug: string;
    baslik: string;
    fiyat?: number;
    paraBirimi?: string;
    ilSlug: string;
    ilceSlug: string;
    anaFotograf: { url: string };
    fotograflar?: { url: string }[];
    rozet?: 'ultravip' | 'vip' | 'gold' | 'silver' | 'standart' | null;
    whatsappNumara: string;
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const isUltraVip = listing.rozet === 'ultravip';
  const isVip = listing.rozet === 'vip';
  const isGold = listing.rozet === 'gold';

  const allImages = listing.fotograflar && listing.fotograflar.length > 0
    ? listing.fotograflar
    : [listing.anaFotograf || { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800' }];

  const badgeText = isUltraVip
    ? '💎 Ultra VIP'
    : isVip
    ? '⭐ VIP'
    : isGold
    ? '🥇 Gold'
    : null;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-[#161b22] border transition-all duration-300 shadow-xl ${
        isUltraVip
          ? 'border-amber-500/60 ring-1 ring-amber-500/20'
          : isVip
          ? 'border-purple-500/50 ring-1 ring-purple-500/20'
          : isGold
          ? 'border-amber-600/40'
          : 'border-[#30363d]'
      }`}
    >
      {/* Photo Showcase */}
      <div className="relative w-full">
        <ImageSlider
          images={allImages}
          alt={listing.baslik}
          badge={badgeText}
          aspectRatio="aspect-[4/3]"
          className="rounded-none"
        />
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col gap-3">
        
        {/* Title Link */}
        <Link href={`/ilan/${listing.slug}`} className="group flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-[15px] text-white leading-snug tracking-tight font-heading group-hover:text-amber-400 transition-colors line-clamp-2">
            {listing.baslik}
          </h3>
          <div className="w-7 h-7 rounded-xl bg-[#21262d] border border-[#30363d] flex items-center justify-center shrink-0 text-[#8b949e] group-hover:text-amber-400 group-hover:border-amber-400/40 transition-all">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </Link>

        {/* Location & Verification Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold font-heading capitalize bg-[#21262d] px-3 py-1 rounded-xl border border-[#30363d]">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{listing.ilSlug} / {listing.ilceSlug}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold font-heading">
            <ShieldCheck className="w-4 h-4" />
            <span>Doğrulanmış</span>
          </div>
        </div>

        {/* WhatsApp Action Button */}
        <div className="pt-1">
          <WhatsAppButton
            numara={listing.whatsappNumara}
            baslik={listing.baslik}
            listingId={listing._id}
          />
        </div>
      </div>
    </div>
  );
}

