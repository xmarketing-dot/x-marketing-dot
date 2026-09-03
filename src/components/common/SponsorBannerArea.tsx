'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Megaphone, 
  ArrowUpRight, 
  Sparkles, 
  Crown, 
  TrendingUp,
  Zap,
  CheckCircle2,
  ExternalLink,
  Flame
} from 'lucide-react';

interface BannerAdData {
  _id: string;
  baslik: string;
  gorselUrl: string;
  hedefUrl: string;
  konum: string;
}

interface Props {
  konum: 'anasayfa' | 'ilan_detay';
}

export default function SponsorBannerArea({ konum }: Props) {
  const [banner, setBanner] = useState<BannerAdData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/banners?konum=${konum}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.success && data.banner) {
            setBanner(data.banner);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [konum]);

  const handleBannerClick = () => {
    if (!banner?._id) return;
    fetch('/api/banners/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerId: banner._id }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="w-full h-24 sm:h-28 rounded-2xl bg-[#161b22]/60 border border-[#30363d]/50 animate-pulse my-1.5" />
    );
  }

  // 1. EĞER YAYINDA REKLAM VARSA (Geniş, Yüksek Çözünürlüklü ve Lüks Çerçeveli)
  if (banner) {
    return (
      <div className="w-full my-1.5 relative group">
        <a
          href={banner.hedefUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleBannerClick}
          className="block relative w-full h-32 sm:h-40 md:h-44 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-xl shadow-amber-500/15 hover:border-amber-400 hover:shadow-amber-500/25 transition-all duration-300"
        >
          {/* Banner Görseli */}
          <Image
            src={banner.gorselUrl}
            alt={banner.baslik}
            fill
            sizes="(max-width: 600px) 100vw, 1000px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Şık Alt Gradyan & Başlık Çubuğu */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 flex flex-col justify-between p-3.5 sm:p-4">
            {/* Üst Rozet */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/40 text-[10px] font-heading font-black tracking-wider uppercase shadow-lg">
                <Crown className="w-3 h-3 fill-amber-400" />
                <span>SPONSORLU VIP BANNER</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-heading font-black flex items-center gap-1 shadow-lg group-hover:bg-amber-400 transition-colors">
                <span>ZİYARET ET</span>
                <ExternalLink className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            {/* Alt Başlık */}
            <div className="flex items-end justify-between gap-4">
              <span className="font-heading font-black text-xs sm:text-base text-white drop-shadow-lg truncate max-w-[85%]">
                {banner.baslik}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold hidden sm:inline-block bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Teyitli Reklamveren ✓
              </span>
            </div>
          </div>
        </a>
      </div>
    );
  }

  const handleEmptyBannerClick = () => {
    fetch('/api/banners/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBoşAlan: true, konum }),
    }).catch(() => {});
  };

  // 2. REKLAM YOKSA -> ULTRA DİKKAT ÇEKİCİ, LÜKS & BÜYÜK YAZILI "REKLAM ALANI"
  return (
    <div className="w-full my-1.5">
      <Link
        href="/reklam-ver"
        onClick={handleEmptyBannerClick}
        className="relative block w-full px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-[#2a1b04] via-[#1c1407] to-[#120e06] border-2 border-dashed border-amber-500/70 hover:border-amber-400 shadow-xl shadow-amber-500/15 group transition-all duration-300 hover:scale-[1.005] overflow-hidden"
      >
        {/* Arka Plan Hareketli Parlama Işığı */}
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-500" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Sol Taraf: İkon ve Büyük Yazılar */}
          <div className="flex items-center gap-3.5 text-left min-w-0">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0 group-hover:rotate-6 group-hover:scale-105 transition-all duration-300">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            </div>

            <div className="flex flex-col min-w-0 gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-black text-sm sm:text-lg md:text-xl text-white tracking-wide group-hover:text-amber-400 transition-colors drop-shadow-sm">
                  BURAYA REKLAM VERİN
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-[10px] sm:text-xs font-heading tracking-wider shadow-sm animate-pulse">
                  BOŞ REKLAM ALANI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#e6edf3] font-medium leading-tight">
                Günde <strong className="text-amber-400 font-black">50.000+</strong> tekil müşterinin ekranında en üst sırada görünün!
              </p>
            </div>
          </div>

          {/* Sağ Taraf: Büyük Satın Al Butonu */}
          <div className="flex items-center justify-end shrink-0 w-full sm:w-auto">
            <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-all">
              <span>Hemen Reklam Ver</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}
