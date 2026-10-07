'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Award, Medal, ChevronRight, Sparkles } from 'lucide-react';
import CompactListingCard from '@/components/common/CompactListingCard';
import SponsorBannerArea from '@/components/common/SponsorBannerArea';

interface CategorizedListingsSectionProps {
  vipListings: any[];
  goldListings: any[];
  silverListings: any[];
  allListings: any[];
  passiveListings?: any[];
  banner?: any;
}

export default function CategorizedListingsSection({
  vipListings,
  goldListings,
  silverListings,
  allListings,
  passiveListings,
  banner,
}: CategorizedListingsSectionProps) {
  // Kontenjan sınırları: VIP (50), Gold (100), Silver (200) - Tümü doğrudan gösterilir
  const displayedVip = vipListings.slice(0, 50);
  const displayedGold = goldListings.slice(0, 100);
  const displayedSilver = silverListings.slice(0, 200);
  // Pasif ilanlar en fazla 1-2 adet olarak listenin en sonunda gösterilir
  const displayedPassive = (passiveListings || []).slice(0, 2);
  const displayedAll = allListings;

  const hasCategorized = vipListings.length > 0 || goldListings.length > 0 || silverListings.length > 0;

  return (
    <div className="flex flex-col gap-5 w-full pt-1">
      {/* ── 1. VIP VİTRİN İLANLARI (EN ÜSTTE) ── */}
      {displayedVip.length > 0 && (
        <section className="px-1.5 sm:px-4 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/40">
            <Link href="/kategori/vip" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider font-heading group-hover:text-amber-400 transition-colors">
                  👑 VIP VİTRİN
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] sm:text-[9px] font-heading font-black">
                  50 VİTRİN
                </span>
              </div>
            </Link>
            <Link
              href="/kategori/vip"
              className="text-[11px] sm:text-xs text-amber-400 hover:text-amber-300 font-heading font-bold flex items-center gap-0.5"
            >
              <span>Tüm VIP ({displayedVip.length}/50)</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </Link>
          </div>

          {/* 3'LÜ YAN YANA İLAN GRID */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {displayedVip.map((listing: any, index: number) => (
              <React.Fragment key={listing._id || index}>
                <CompactListingCard listing={listing} />
                {(index + 1) % 12 === 0 && index < displayedVip.length - 1 && (
                  <div className="col-span-3 my-2 w-full">
                    <SponsorBannerArea konum="anasayfa" initialBanner={banner} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* ── 2. GOLD VİTRİN İLANLARI (ORTADA) ── */}
      {displayedGold.length > 0 && (
        <section className="px-1.5 sm:px-4 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-yellow-500/40">
            <Link href="/kategori/gold" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-yellow-500/30 group-hover:scale-105 transition-transform shrink-0">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider font-heading group-hover:text-yellow-400 transition-colors">
                  ⭐ GOLD VİTRİN
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[8px] sm:text-[9px] font-heading font-black">
                  100 VİTRİN
                </span>
              </div>
            </Link>
            <Link
              href="/kategori/gold"
              className="text-[11px] sm:text-xs text-yellow-400 hover:text-yellow-300 font-heading font-bold flex items-center gap-0.5"
            >
              <span>Tüm Gold ({displayedGold.length}/100)</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </Link>
          </div>

          {/* 3'LÜ YAN YANA İLAN GRID */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {displayedGold.map((listing: any, index: number) => (
              <React.Fragment key={listing._id || index}>
                <CompactListingCard listing={listing} />
                {(index + 1) % 12 === 0 && index < displayedGold.length - 1 && (
                  <div className="col-span-3 my-2 w-full">
                    <SponsorBannerArea konum="anasayfa" initialBanner={banner} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* ── 3. SILVER & GÜNCEL STANDART İLANLAR (EN ALTTA) ── */}
      {displayedSilver.length > 0 && (
        <section className="px-1.5 sm:px-4 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-600/50">
            <Link href="/kategori/silver" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950 flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider font-heading group-hover:text-slate-200 transition-colors">
                  ⚡ SILVER VİTRİN
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 text-[8px] sm:text-[9px] font-heading font-black">
                  200 VİTRİN
                </span>
              </div>
            </Link>
            <Link
              href="/kategori/silver"
              className="text-[11px] sm:text-xs text-slate-300 hover:text-white font-heading font-bold flex items-center gap-0.5"
            >
              <span>Tüm Silver ({displayedSilver.length}/200)</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </Link>
          </div>

          {/* 3'LÜ YAN YANA İLAN GRID */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {displayedSilver.map((listing: any, index: number) => (
              <React.Fragment key={listing._id || index}>
                <CompactListingCard listing={listing} />
                {(index + 1) % 12 === 0 && index < displayedSilver.length - 1 && (
                  <div className="col-span-3 my-2 w-full">
                    <SponsorBannerArea konum="anasayfa" initialBanner={banner} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. SÜRESİ DOLAN / PASİF İLANLAR (EN SON SIRADA, EN FAZLA 1-2 TANE) ── */}
      {displayedPassive.length > 0 && (
        <section className="px-1.5 sm:px-4 flex flex-col gap-2 opacity-85">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-zinc-900 border border-zinc-800 text-rose-400 flex items-center justify-center font-black">
                <span className="text-xs">⚠️</span>
              </div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-xs sm:text-sm text-zinc-400 uppercase tracking-wider font-heading">
                  Süresi Dolan Son İlanlar
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-zinc-900 text-rose-400 border border-rose-900/40 text-[8px] sm:text-[9px] font-heading font-black">
                  İLETİŞİM KAPALI
                </span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Pasif ({displayedPassive.length})
            </span>
          </div>

          {/* 3'LÜ YAN YANA İLAN GRID */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {displayedPassive.map((listing: any, index: number) => (
              <CompactListingCard key={listing._id || index} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Fallback Tüm İlanlar (Kategorisiz durumlar için) */}
      {!hasCategorized && displayedAll.length > 0 && (
        <section className="px-1.5 sm:px-4 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider font-heading">
                Günün Öne Çıkan Güncel İlanları
              </h2>
            </div>
            <span className="text-xs text-[#8b949e] font-mono">
              {displayedAll.length} İlan
            </span>
          </div>

          {/* 3'LÜ YAN YANA İLAN GRID */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {displayedAll.map((listing: any, index: number) => (
              <React.Fragment key={listing._id || index}>
                <CompactListingCard listing={listing} />
                {(index + 1) % 12 === 0 && index < displayedAll.length - 1 && (
                  <div className="col-span-3 my-2 w-full">
                    <SponsorBannerArea konum="anasayfa" initialBanner={banner} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

