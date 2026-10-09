'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Crown, Dices, Send, Flame, ArrowRight } from 'lucide-react';

interface Props {
  konum?: string;
}

const WORDS = [
  {
    text: 'BU',
    colorClass: 'text-cyan-300 drop-shadow-[0_2px_12px_rgba(6,182,212,0.95)]',
  },
  {
    text: 'ALAN',
    colorClass: 'text-white drop-shadow-[0_2px_14px_rgba(255,255,255,0.95)]',
  },
  {
    text: 'KİRALIKTIR',
    colorClass: 'text-rose-400 drop-shadow-[0_2px_12px_rgba(244,63,94,0.95)]',
  },
];

export default function VipRentalBanner({ konum = 'anasayfa' }: Props) {
  // İlk girişte beklemeden anında başlaması için varsayılan true
  const [inView, setInView] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = bannerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          setAnimKey((prev) => prev + 1);
        } else {
          setInView(false);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '120px 0px 50px 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Karakter sayacıyla her harfe hızlı film şeridi TAK TAK TAK gecikmesi (16ms)
  let charCounter = 0;

  return (
    <Link
      href="/reklam-ver"
      className="block w-full cursor-pointer select-none relative group"
    >
      {/* ── DIŞ SİBER RGB NEON ÇERÇEVE (İnce 1px - Saat Yönünde Dönen Lazer Çerçeve) ── */}
      <div
        ref={bannerRef}
        className="w-full relative p-[1px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.25),0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 group-hover:scale-[1.006]"
      >
        {/* Taban Koyu Katman */}
        <div className="absolute inset-0 bg-[#090d1a] pointer-events-none" />

        {/* Saat Yönünde Dönen İki Başlı RGB Neon Lazer Akışı */}
        <div
          className="absolute -inset-[250%] animate-border-rotate pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, #ffffff 0deg, #06b6d4 30deg, #3b82f6 60deg, transparent 95deg, transparent 180deg, #ffffff 180deg, #f43f5e 210deg, #ef4444 240deg, transparent 275deg, transparent 360deg)',
          }}
        />

        {/* ── İÇ GERÇEK BANNER GÖVDESİ (Kompakt Yükseklik: 95px - 110px, İnce 1px Kenarlık) ── */}
        <div className="relative z-10 w-full rounded-[11px] sm:rounded-[15px] bg-[#050813] py-2 sm:py-2.5 px-3 sm:px-6 overflow-hidden flex flex-col items-center justify-center text-center">

          {/* LED / Cyber Nokta Dokusu */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:14px_14px] opacity-15 pointer-events-none" />

          {/* Çift Yönlü Neon Arka Spotlar: Sol Mavi, Sağ Kırmızı */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-44 h-24 bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-44 h-24 bg-red-500/25 blur-3xl pointer-events-none" />

          {/* Çapraz Hareketli Lazer Işık Tarama */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-300/15 via-rose-300/10 to-transparent animate-billboard-shimmer" />
          </div>

          {/* ── SONİK DARBE (Harfler Kilitlendiği An Patlayan Yumuşak Flaş - Çizgisiz) ── */}
          {inView && (
            <div
              key={`shockwave-layer-${animKey}`}
              className="absolute inset-0 pointer-events-none overflow-hidden z-20 flex items-center justify-center"
            >
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.45)_0%,_rgba(244,63,94,0.3)_40%,_transparent_75%)] animate-sonic-flash pointer-events-none"
                style={{ animationDelay: '240ms' }}
              />
            </div>
          )}

          {/* ── TEPE SOL SPOT IŞIĞI (Elektrik Cyan/Mavi - Ortaya Yönelik) ── */}
          <div className="absolute top-0 left-3 sm:left-10 z-20 pointer-events-none flex flex-col items-center">
            {/* Lamba Armatürü */}
            <div className="w-5 sm:w-6 h-2 sm:h-2.5 rounded-b-md bg-gradient-to-b from-slate-600 via-slate-800 to-black border-x border-b border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.8)] flex items-center justify-center">
              <div className="w-2.5 sm:w-3.5 h-1 rounded-full bg-cyan-200 shadow-[0_0_8px_#22d3ee,0_0_16px_#06b6d4]" />
            </div>
            {/* Işık Hüzmesi (Merkeze Çapraz Işık Demeti) */}
            <div
              className="w-28 sm:w-44 h-32 sm:h-40 -mt-0.5 animate-spotlight-left opacity-75 mix-blend-screen"
              style={{
                background: 'linear-gradient(180deg, rgba(34,211,238,0.75) 0%, rgba(6,182,212,0.25) 45%, rgba(6,182,212,0.02) 85%, transparent 100%)',
                clipPath: 'polygon(44% 0%, 56% 0%, 100% 100%, 0% 100%)',
              }}
            />
          </div>

          {/* ── TEPE SAĞ SPOT IŞIĞI (Neon Kırmızı/Rose - Ortaya Yönelik) ── */}
          <div className="absolute top-0 right-3 sm:right-10 z-20 pointer-events-none flex flex-col items-center">
            {/* Lamba Armatürü */}
            <div className="w-5 sm:w-6 h-2 sm:h-2.5 rounded-b-md bg-gradient-to-b from-slate-600 via-slate-800 to-black border-x border-b border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.8)] flex items-center justify-center">
              <div className="w-2.5 sm:w-3.5 h-1 rounded-full bg-rose-200 shadow-[0_0_8px_#fb7185,0_0_16px_#f43f5e]" />
            </div>
            {/* Işık Hüzmesi (Merkeze Çapraz Işık Demeti) */}
            <div
              className="w-28 sm:w-44 h-32 sm:h-40 -mt-0.5 animate-spotlight-right opacity-75 mix-blend-screen"
              style={{
                background: 'linear-gradient(180deg, rgba(244,63,94,0.75) 0%, rgba(239,68,68,0.25) 45%, rgba(239,68,68,0.02) 85%, transparent 100%)',
                clipPath: 'polygon(44% 0%, 56% 0%, 100% 100%, 0% 100%)',
              }}
            />
          </div>

          {/* ── 2. SATIR: DEV 3D BAŞLIK (Film Şeridi Harf Harf Uzaktan Zoom & Snap) ── */}
          <div className="relative z-10 my-0.5" style={{ perspective: '900px' }}>
            <h2
              key={animKey}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative z-10 text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight flex items-center justify-center select-none"
            >
              {WORDS.map((w, wIdx) => (
                <span
                  key={wIdx}
                  className={`inline-block ${w.colorClass} mr-2 sm:mr-3 last:mr-0 tracking-wider`}
                >
                  {w.text.split('').map((char, cIdx) => {
                    const currentDelay = charCounter * 16;
                    charCounter++;
                    return (
                      <span
                        key={cIdx}
                        className={`inline-block ${
                          inView ? 'animate-letter-slam' : 'opacity-0'
                        }`}
                        style={{
                          animationDelay: `${currentDelay}ms`,
                          willChange: 'transform, opacity, filter',
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              ))}
            </h2>
          </div>

          {/* ── 3. SATIR: HEDEF SEKTÖRLER (Casino, Adult, Telegram - Canlı İkon Reaksiyonları) ── */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
              <Dices className="w-3 h-3 text-cyan-400 animate-dice-wiggle" />
              CASINO & BAHİS
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold bg-red-500/15 text-red-300 border border-red-500/40">
              <Flame className="w-3 h-3 text-red-400 animate-flame-flicker" />
              ADULT & ESCORT
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold bg-blue-500/15 text-blue-300 border border-blue-500/40">
              <Send className="w-3 h-3 text-blue-400 animate-telegram-glide" />
              TELEGRAM
            </span>
          </div>

          {/* ── 4. SATIR: DİKKAT ÇEKEN NEON BUTON (Tıklayınca /reklam-ver) ── */}
          <div className="relative z-10 mt-1 w-full max-w-xs flex justify-center">
            <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6),0_0_15px_rgba(239,68,68,0.5)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.9),0_0_25px_rgba(239,68,68,0.8)] group-hover:scale-105 active:scale-95 transition-all duration-300">
              <Crown className="w-4 h-4 fill-white" />
              <span>REKLAM ALANI KİRALA</span>
              <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
