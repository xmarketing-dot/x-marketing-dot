'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Megaphone, ArrowRight, Zap, Gift } from 'lucide-react';

export default function FreePromoFooterBanner() {
  return (
    <section className="w-full px-4 py-8 font-heading text-center">
      <div className="max-w-xl mx-auto flex flex-col items-center gap-6">

        {/* ── ÜST ROZET & BAŞLIK ──────────────── */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase tracking-wider shadow-sm">
            <Gift className="w-4 h-4" />
            <span>%100 ÜCRETSİZ TANITIM KAMPANYASI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
            İLK 24 SAAT <span className="text-amber-400">0 ₺ HEDİYE!</span>
          </h2>

          <p className="text-sm sm:text-base font-bold text-slate-300 max-w-md mx-auto leading-relaxed">
            Hiçbir ödeme veya kart bilgisi gerekmez. İlanınızı veya reklamınızı anında yayınlayın, ilk 24 saat boyunca zirvede yer alın.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-mono font-black text-amber-400 bg-black/40 px-3.5 py-1 rounded-xl border border-amber-500/30">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>HİÇBİR ÖDEME GEREKMEZ • ANINDA BAŞLAT</span>
          </div>
        </div>

        {/* ── 2 BÜYÜK NATIVE BUTON ──────────────── */}
        <div className="w-full flex flex-col gap-3.5 pt-2">
          
          {/* 1. Ücretsiz İlan Butonu */}
          <Link
            href="/ucretsiz-ilan"
            className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-between gap-3 group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 fill-slate-950 text-slate-950" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black uppercase tracking-tight font-heading leading-tight">
                  24 SAAT ÜCRETSİZ VIP İLAN VER
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-400 font-mono text-[10px] font-black shrink-0">
                  0 ₺
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900/80 mt-0.5">
                Kendi ilanınızı 24 saat en üst VIP vitrinde bedava yayınlayın
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </div>
          </Link>

          {/* 2. Ücretsiz Banner Butonu */}
          <Link
            href="/ucretsiz-reklam"
            className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black shadow-xl shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-between gap-3 group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6 fill-slate-950 text-slate-950" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black uppercase tracking-tight font-heading leading-tight">
                  24 SAAT ÜCRETSİZ BANNER REKLAMI VER
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 text-emerald-400 font-mono text-[10px] font-black shrink-0">
                  0 ₺
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900/80 mt-0.5">
                21:9 ultra geniş tepe reklamınızı 24 saat ücretsiz asın
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}
