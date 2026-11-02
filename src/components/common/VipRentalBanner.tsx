'use client';

import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';

interface Props {
  konum?: string;
}

export default function VipRentalBanner({ konum = 'anasayfa' }: Props) {
  return (
    <div className="w-full select-none relative group my-1">
      {/* ── DIŞ SİBER RGB NEON ÇERÇEVE (Cyan & Neon Kırmızı/Rose Lazer Akışı) ── */}
      <div className="w-full relative p-[1px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_22px_rgba(6,182,212,0.35),0_0_22px_rgba(244,63,94,0.3)] transition-all duration-300 group-hover:scale-[1.004]">
        {/* Taban Koyu Katman */}
        <div className="absolute inset-0 bg-[#050813] pointer-events-none" />

        {/* Saat Yönünde Dönen Canlı RGB Lazer Çerçeve (Cyan, Beyaz, Rose, Kırmızı) */}
        <div
          className="absolute -inset-[250%] animate-border-rotate pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, #ffffff 0deg, #06b6d4 30deg, #229ED9 60deg, transparent 95deg, transparent 180deg, #ffffff 180deg, #f43f5e 210deg, #ef4444 240deg, transparent 275deg, transparent 360deg)',
          }}
        />

        {/* ── İÇ GERÇEK BANNER GÖVDESİ ── */}
        <div className="relative z-10 w-full rounded-[11px] sm:rounded-[15px] bg-[#050813] py-2.5 sm:py-3 px-3 sm:px-6 overflow-hidden flex flex-col items-center justify-center text-center">

          {/* LED / Cyber Nokta Dokusu */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:14px_14px] opacity-15 pointer-events-none" />

          {/* Çift Yönlü Canlı Neon Spotlar: Sol Elektrik Cyan, Sağ Kırmızı/Rose */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-24 bg-cyan-500/25 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-24 bg-red-500/25 blur-3xl pointer-events-none" />

          {/* Çapraz Hareketli Lazer Işık Tarama */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-300/15 via-rose-300/15 to-transparent animate-billboard-shimmer" />
          </div>

          {/* ── 1. BAŞLIK: SEXY & PRESTİJLİ (Öpücük ve Kalp ile) ── */}
          <div className="relative z-10 my-0.5">
            <h2 className="text-sm sm:text-lg md:text-xl font-heading font-black uppercase tracking-tight text-white flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-200 drop-shadow-[0_2px_12px_rgba(6,182,212,0.9)]">
                BESTESKORT AGENCY
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 drop-shadow-[0_2px_12px_rgba(244,63,94,0.9)]">
                RESMİ TELEGRAM KANALI
              </span>

            </h2>
          </div>



          {/* ── 3. RESMİ TELEGRAM LOGOLU BUTON (@besteskortagency BİR TIK ALTA ALINDI, %100 OKUNUR) ── */}
          <div className="relative z-10 w-full max-w-sm flex justify-center mt-1">
            <a
              href="https://t.me/besteskortagency"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between gap-3 px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#229ED9] via-[#0088cc] to-rose-600 hover:from-[#0088cc] hover:to-rose-500 text-white font-heading font-black shadow-[0_0_25px_rgba(34,158,217,0.6),0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(34,158,217,0.85)] hover:scale-[1.015] active:scale-95 transition-all duration-300"
            >
              {/* Orijinal Telegram Dairesel Vektör Logosu */}
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="12" r="12" fill="url(#vipTelegramGrad)" />
                <path
                  d="M17.8 6.9L4.9 11.9C4 12.3 4 12.8 4.8 13.1L8.1 14.1L15.7 9.3C16.1 9.1 16.4 9.3 16.1 9.5L9.9 15.1L9.7 18.4C10 18.4 10.2 18.3 10.5 18L12.5 16.1L15.9 18.6C16.6 18.9 17 18.8 17.2 18.1L19.4 7.7C19.7 6.8 19.1 6.4 18.4 6.7L17.8 6.9Z"
                  fill="white"
                />
                <defs>
                  <linearGradient id="vipTelegramGrad" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2AABEE" />
                    <stop offset="1" stopColor="#229ED9" />
                  </linearGradient>
                </defs>
              </svg>

              {/* İki Katmanlı Net Metin: Başlık Üstte, Kanal Adresi Net Olarak Altta */}
              <div className="flex flex-col items-center flex-1 leading-tight">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-white drop-shadow-sm">
                  TELEGRAM KANALINA KATIL
                </span>
                <span className="text-[11px] sm:text-xs text-cyan-200 tracking-wide font-extrabold flex items-center gap-1">
                  <span>@besteskortagency</span>
                  <span className="text-[11px]">💋</span>
                </span>
              </div>

              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] shrink-0 text-white group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
