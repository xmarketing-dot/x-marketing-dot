'use client';

import React from 'react';
import { Crown, Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useAdminWhatsApp } from '@/lib/useAdminWhatsApp';

interface Props {
  konum?: string;
}

export default function VipRentalBanner({ konum = 'anasayfa' }: Props) {
  const { openWhatsApp, details } = useAdminWhatsApp();

  const handleRentalClick = () => {
    const defaultMsg = `Merhaba, besteskort.online sitesindeki VIP Banner alanını (${konum === 'ilan_detay' ? 'İlan Detay' : 'Ana Sayfa'} - Aylık Kiralık) kiralamak istiyorum. Fiyat ve detaylar hakkında bilgi alabilir miyim?`;
    openWhatsApp(defaultMsg);
  };

  return (
    <div
      onClick={handleRentalClick}
      className="w-full my-2 sm:my-3 group relative cursor-pointer select-none overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#0d121d] via-[#151c2e] to-[#0d121d] p-3 sm:p-4 md:p-5 shadow-[0_0_25px_rgba(245,158,11,0.12)] transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:scale-[1.003]"
    >
      {/* Arka Plan Lüks Altın & Işıltı Efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-400/20 transition-all duration-500 pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-400/20 transition-all duration-500 pointer-events-none" />

      {/* Üst Satır Rozetler */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm backdrop-blur-sm">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            VIP SPONSORLUK ALANI
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Özel Prestij Konumu
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Boşta • Hemen Kirala</span>
        </div>
      </div>

      {/* Ana İçerik ve Buton Düzeni */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        {/* Sol Alan: Başlık & Değer Önerisi */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 group-hover:text-amber-200 transition-colors">
            <span>👑 BU ALAN AYLIK KİRALIKTIR</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-2">
            Ajans, Masaj Salonu veya VIP İlanınızı sitenin en üstünde doğrudan binlerce ziyaretçiye duyurun.
          </p>

          {/* İstatistik ve Avantaj Hapları */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
              <Users className="w-3 h-3 text-amber-400" />
              <span>Günlük <strong>1.500+</strong> Canlı Ziyaretçi</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>%100 Doğrudan Hedef Kitle</span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-[11px] sm:text-xs text-amber-300/90 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
              <span>💎 Sabit Aylık Ücret • Kesintisiz Gösterim</span>
            </div>
          </div>
        </div>

        {/* Sağ Alan: WhatsApp Butonu */}
        <div className="flex-shrink-0 flex items-center justify-end sm:justify-start">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.55)] transition-all duration-200 transform group-hover:translate-x-0.5 active:scale-95"
          >
            {/* WhatsApp SVG İkonu */}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="whitespace-nowrap">WhatsApp İle Kirala</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
