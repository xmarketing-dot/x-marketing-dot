'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, PlusCircle } from 'lucide-react';

interface PostAdPromoCardProps {
  title?: string;
  initialGif?: string;
}

// Vitrinde kullandığımız gerçek neon dancer kız GIF'leri
const VITRIN_GIFS = [
  '/images/neon_dancer_vip.gif',
  '/images/neondancer2.gif',
];

export default function PostAdPromoCard({
  title = 'ESKORT İLANI VER',
  initialGif,
}: PostAdPromoCardProps) {
  // Vitrin GIF'leri arasında rastgele seçim
  const [gifSrc, setGifSrc] = useState(initialGif || VITRIN_GIFS[0]);

  useEffect(() => {
    if (!initialGif) {
      const randomChoice = VITRIN_GIFS[Math.floor(Math.random() * VITRIN_GIFS.length)];
      setGifSrc(randomChoice);
    }
  }, [initialGif]);

  return (
    <>
      {/* ── GPU DESTEKLİ, TAM ORGANİK & SMOOTH S-CURVE CSS KEYFRAMES ── */}
      <style>{`
        @keyframes smoothFloat1 {
          0% { transform: translate3d(0, 0, 0) scale(0.6) rotate(-16deg); opacity: 0; }
          18% { opacity: 0.95; transform: translate3d(8px, -18px, 0) scale(1.05) rotate(6deg); }
          45% { opacity: 0.85; transform: translate3d(-6px, -46px, 0) scale(1) rotate(-8deg); }
          75% { opacity: 0.65; transform: translate3d(7px, -74px, 0) scale(0.85) rotate(12deg); }
          100% { transform: translate3d(-3px, -100px, 0) scale(0.5) rotate(-14deg); opacity: 0; }
        }
        @keyframes smoothFloat2 {
          0% { transform: translate3d(0, 0, 0) scale(0.55) rotate(14deg); opacity: 0; }
          22% { opacity: 0.9; transform: translate3d(-10px, -22px, 0) scale(1.1) rotate(-10deg); }
          55% { opacity: 0.8; transform: translate3d(6px, -52px, 0) scale(0.95) rotate(8deg); }
          80% { opacity: 0.55; transform: translate3d(-5px, -80px, 0) scale(0.75) rotate(-6deg); }
          100% { transform: translate3d(4px, -105px, 0) scale(0.45) rotate(10deg); opacity: 0; }
        }
        @keyframes smoothFloat3 {
          0% { transform: translate3d(0, 0, 0) scale(0.7) rotate(-4deg); opacity: 0; filter: drop-shadow(0 0 4px rgba(244,63,94,0.6)); }
          20% { opacity: 1; transform: translate3d(5px, -20px, 0) scale(1.2) rotate(10deg); filter: drop-shadow(0 0 16px rgba(244,63,94,1)); }
          50% { opacity: 0.9; transform: translate3d(-6px, -48px, 0) scale(1.05) rotate(-6deg); filter: drop-shadow(0 0 12px rgba(244,63,94,0.85)); }
          78% { opacity: 0.65; transform: translate3d(4px, -76px, 0) scale(0.85) rotate(8deg); filter: drop-shadow(0 0 8px rgba(244,63,94,0.6)); }
          100% { transform: translate3d(-2px, -102px, 0) scale(0.55) rotate(-8deg); opacity: 0; }
        }
        @keyframes smoothFloat4 {
          0% { transform: translate3d(0, 0, 0) scale(0.65) rotate(8deg); opacity: 0; }
          25% { opacity: 0.95; transform: translate3d(9px, -24px, 0) scale(1.08) rotate(-8deg); }
          60% { opacity: 0.8; transform: translate3d(-7px, -56px, 0) scale(0.92) rotate(10deg); }
          85% { opacity: 0.5; transform: translate3d(5px, -84px, 0) scale(0.7) rotate(-4deg); }
          100% { transform: translate3d(-4px, -108px, 0) scale(0.45) rotate(6deg); opacity: 0; }
        }
        @keyframes smoothFloat5 {
          0% { transform: translate3d(0, 0, 0) scale(0.5) rotate(-10deg); opacity: 0; }
          20% { opacity: 0.9; transform: translate3d(-8px, -18px, 0) scale(1.12) rotate(8deg); }
          52% { opacity: 0.85; transform: translate3d(7px, -48px, 0) scale(1) rotate(-10deg); }
          80% { opacity: 0.6; transform: translate3d(-5px, -78px, 0) scale(0.8) rotate(6deg); }
          100% { transform: translate3d(3px, -104px, 0) scale(0.4) rotate(-8deg); opacity: 0; }
        }
      `}</style>

      <Link
        href="/ilan-ver"
        prefetch={false}
        className="group relative aspect-[3/4.8] sm:aspect-[3/4.5] w-full rounded-lg sm:rounded-xl overflow-hidden p-[1.5px] cursor-pointer select-none transition-all duration-300 shadow-[0_0_18px_rgba(244,63,94,0.35)] hover:shadow-[0_0_28px_rgba(244,63,94,0.65)] hover:scale-[1.015] active:scale-[0.985] block"
      >
        {/* ── 1. DÖNEN SİBER LAZER RGB ÇERÇEVE ── */}
        <div
          className="absolute -inset-[200%] animate-border-rotate pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, #ffffff 0deg, #f43f5e 35deg, #fb7185 70deg, transparent 105deg, transparent 180deg, #ffffff 180deg, #f59e0b 215deg, #e11d48 250deg, transparent 295deg, transparent 360deg)',
          }}
        />

        {/* ── 2. İÇ KART GÖVDESİ ── */}
        <div className="relative z-10 w-full h-full rounded-[6.5px] sm:rounded-[10.5px] bg-[#0d1117] overflow-hidden">
          {/* VİTRİNDE KULLANILAN SEXY DANCER RASTGELE GİF */}
          <div className="absolute inset-0 block w-full h-full z-0 overflow-hidden">
            <img
              src={gifSrc}
              alt={title}
              decoding="async"
              className="w-full h-full object-cover object-center select-none pointer-events-none opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
            />
            {/* Karartma degrade katmanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/35 pointer-events-none" />
          </div>

          {/* LED / Siber Nokta Dokusu */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.6px,transparent_0.6px)] [background-size:10px_10px] opacity-[0.08] pointer-events-none" />

          {/* ── ÜST ROZET (İLAN VER BUTONU GİBİ ORTALANMIŞ VE YANLARA UZATILMIŞ BEST ESKORT ŞERİDİ) ── */}
          <div className="absolute top-1.5 inset-x-1.5 sm:inset-x-2 z-20 pointer-events-none flex items-center justify-center">
            <div className="w-full py-0.5 sm:py-1 px-1 rounded-md bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider font-heading shadow-md shadow-rose-600/40 ring-1 ring-white/25 text-center whitespace-nowrap overflow-hidden truncate">
              BEST ESKORT
            </div>
          </div>

          {/* ── 3. UÇUŞAN VE TAM RANDOM, SMOOTH S-CURVE ÖPÜCÜK, KALP VE ALEV (💋, 💖, 🔥, ❤️) ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-15 flex flex-col items-center justify-center">
            {/* Sol Uçuşan Öpücük - S-Curve Yolu 1 */}
            <span
              className="absolute text-xl sm:text-2xl select-none"
              style={{
                bottom: '22%',
                left: '14%',
                animation: 'smoothFloat1 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite -1.2s',
                willChange: 'transform, opacity',
              }}
            >
              💋
            </span>

            {/* Sağ Uçuşan Pembe Kalp - S-Curve Yolu 2 */}
            <span
              className="absolute text-base sm:text-lg select-none"
              style={{
                bottom: '18%',
                right: '15%',
                animation: 'smoothFloat2 5.7s cubic-bezier(0.4, 0, 0.2, 1) infinite -3.8s',
                willChange: 'transform, opacity',
              }}
            >
              💖
            </span>

            {/* Ortada Uçuşan & Parlayan Orijinal Alev - S-Curve Yolu 3 */}
            <span
              className="absolute select-none"
              style={{
                bottom: '24%',
                left: '42%',
                animation: 'smoothFloat3 4.1s cubic-bezier(0.4, 0, 0.2, 1) infinite -0.5s',
                willChange: 'transform, opacity',
              }}
            >
              <Flame className="w-8 h-8 sm:w-9 sm:h-9 text-rose-500 fill-rose-500 drop-shadow-[0_0_14px_rgba(244,63,94,0.95)]" />
            </span>

            {/* Sağ Uçuşan Öpücük - S-Curve Yolu 4 */}
            <span
              className="absolute text-xl sm:text-2xl select-none"
              style={{
                bottom: '26%',
                right: '28%',
                animation: 'smoothFloat4 6.3s cubic-bezier(0.4, 0, 0.2, 1) infinite -4.5s',
                willChange: 'transform, opacity',
              }}
            >
              💋
            </span>

            {/* Sol Uçuşan Kırmızı Kalp - S-Curve Yolu 5 */}
            <span
              className="absolute text-base sm:text-lg select-none"
              style={{
                bottom: '15%',
                left: '28%',
                animation: 'smoothFloat5 5.2s cubic-bezier(0.4, 0, 0.2, 1) infinite -2.3s',
                willChange: 'transform, opacity',
              }}
            >
              ❤️
            </span>
          </div>

          {/* Diagonal Filigran */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="font-heading font-black text-white/[0.14] text-[10px] sm:text-xs tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap">
              BEST ESKORT
            </span>
          </div>

          {/* ── 4. BAŞLIK VE İLAN VER BUTONU (İlk Tasarımdaki "SEN DE BURADA OL" + "ESKORT İLANI VER") ── */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-1.5 sm:p-2 pt-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-1.5 pointer-events-auto">
            {/* İlk Tasarımdaki Başlık Yapısı */}
            <div className="flex flex-col items-center justify-center gap-0.5 text-center">
              <span className="text-[9px] sm:text-[9.5px] text-pink-300 font-extrabold tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                SEN DE BURADA OL
              </span>
              <h3 className="font-black text-[11px] sm:text-xs text-white leading-tight font-heading text-center line-clamp-1 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:text-pink-300 transition-colors uppercase tracking-wide">
                {title}
              </h3>
            </div>

            {/* İLAN VER BUTONU (CompactListingCard WhatsApp Butonu ile Birebir Aynı Boyut & Yapı) */}
            <div
              className="w-full py-1.5 sm:py-2 px-2 rounded-md sm:rounded-lg bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-[10.5px] sm:text-xs tracking-wide shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 font-heading cursor-pointer shadow-rose-600/30"
              title="İlan Ver"
            >
              <PlusCircle className="w-3.5 h-3.5 fill-white/20 stroke-[2.5] shrink-0" />
              <span>İLAN VER</span>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
