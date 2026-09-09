'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, Award, Medal, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import CompactListingCard from '@/components/common/CompactListingCard';

interface CategorizedListingsSectionProps {
  vipListings: any[];
  goldListings: any[];
  silverListings: any[];
  allListings: any[];
}

export default function CategorizedListingsSection({
  vipListings,
  goldListings,
  silverListings,
  allListings,
}: CategorizedListingsSectionProps) {
  // Her kategori için başlangıçta 12 ilan göster, "Daha Fazla Göster" tıklandıkça 12 artır
  const [vipLimit, setVipLimit] = useState(12);
  const [goldLimit, setGoldLimit] = useState(12);
  const [silverLimit, setSilverLimit] = useState(12);
  const [allLimit, setAllLimit] = useState(16);

  const displayedVip = vipListings.slice(0, vipLimit);
  const displayedGold = goldListings.slice(0, goldLimit);
  const displayedSilver = silverListings.slice(0, silverLimit);
  const displayedAll = allListings.slice(0, allLimit);

  const hasCategorized = vipListings.length > 0 || goldListings.length > 0 || silverListings.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full pt-1">
      {/* ── 1. VIP VİTRİN İLANLARI (EN ÜSTTE) ── */}
      {vipListings.length > 0 && (
        <section className="px-2 sm:px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
                <Crown className="w-4 h-4 fill-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm text-white uppercase tracking-wider font-heading">
                  👑 VIP Vitrin İlanları
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-heading font-black">
                  EN POPÜLER
                </span>
              </div>
            </div>
            <Link
              href="/kategori/vip"
              className="text-xs text-amber-400 hover:text-amber-300 font-heading font-bold flex items-center gap-0.5"
            >
              <span>Tüm VIP ({vipListings.length})</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayedVip.map((listing: any, index: number) => (
              <CompactListingCard key={listing._id || index} listing={listing} />
            ))}
          </div>

          {vipListings.length > vipLimit && (
            <button
              onClick={() => setVipLimit((prev) => prev + 12)}
              className="mt-2 w-full py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-amber-500/40 text-amber-400 font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99]"
            >
              <span>Daha Fazla VIP İlan Göster ({vipListings.length - vipLimit} Kalan)</span>
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </section>
      )}

      {/* ── 2. GOLD VİTRİN İLANLARI (ORTADA) ── */}
      {goldListings.length > 0 && (
        <section className="px-2 sm:px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-yellow-500/40">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-yellow-500/30">
                <Award className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h2 className="font-black text-sm text-white uppercase tracking-wider font-heading">
                ⭐ Gold Vitrin İlanları
              </h2>
            </div>
            <Link
              href="/kategori/gold"
              className="text-xs text-yellow-400 hover:text-yellow-300 font-heading font-bold flex items-center gap-0.5"
            >
              <span>Tüm Gold ({goldListings.length})</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayedGold.map((listing: any, index: number) => (
              <CompactListingCard key={listing._id || index} listing={listing} />
            ))}
          </div>

          {goldListings.length > goldLimit && (
            <button
              onClick={() => setGoldLimit((prev) => prev + 12)}
              className="mt-2 w-full py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-yellow-500/40 text-yellow-300 font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99]"
            >
              <span>Daha Fazla Gold İlan Göster ({goldListings.length - goldLimit} Kalan)</span>
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </section>
      )}

      {/* ── 3. SILVER & GÜNCEL STANDART İLANLAR (EN ALTTA) ── */}
      {silverListings.length > 0 && (
        <section className="px-2 sm:px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-600/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Medal className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h2 className="font-black text-sm text-white uppercase tracking-wider font-heading">
                ⚡ Güncel Doğrulanmış Silver İlanlar
              </h2>
            </div>
            <Link
              href="/kategori/silver"
              className="text-xs text-slate-300 hover:text-white font-heading font-bold flex items-center gap-0.5"
            >
              <span>Tüm Silver ({silverListings.length})</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayedSilver.map((listing: any, index: number) => (
              <CompactListingCard key={listing._id || index} listing={listing} />
            ))}
          </div>

          {silverListings.length > silverLimit && (
            <button
              onClick={() => setSilverLimit((prev) => prev + 12)}
              className="mt-2 w-full py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-slate-600/50 text-slate-200 font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99]"
            >
              <span>Daha Fazla Silver İlan Göster ({silverListings.length - silverLimit} Kalan)</span>
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </section>
      )}

      {/* Fallback Tüm İlanlar (Kategorisiz durumlar için) */}
      {!hasCategorized && allListings.length > 0 && (
        <section className="px-2 sm:px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-[#30363d]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-black text-sm text-white uppercase tracking-wider font-heading">
                Günün Öne Çıkan Güncel İlanları
              </h2>
            </div>
            <span className="text-xs text-[#8b949e] font-mono">
              {allListings.length} İlan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayedAll.map((listing: any, index: number) => (
              <CompactListingCard key={listing._id || index} listing={listing} />
            ))}
          </div>

          {allListings.length > allLimit && (
            <button
              onClick={() => setAllLimit((prev) => prev + 16)}
              className="mt-2 w-full py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-amber-500/40 text-amber-400 font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99]"
            >
              <span>Daha Fazla İlan Göster ({allListings.length - allLimit} Kalan)</span>
              <ChevronDown className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </section>
      )}
    </div>
  );
}
