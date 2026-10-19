import React from 'react';

export default function ListingDetailLoading() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-28 w-full max-w-6xl mx-auto px-1 sm:px-4 animate-pulse">
      {/* ── 1. MERKEZİ PROFİL DÜZENİ SKELETON ──────────────── */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl mx-auto px-0 pt-0 sm:pt-2">

        {/* ── FOTOĞRAF GALERİSİ SKELETON ──────────────── */}
        <div className="w-full overflow-hidden bg-[#161b22] relative rounded-2xl sm:rounded-[32px] border border-[#30363d] sm:border-2 shadow-xl aspect-[3/4] sm:aspect-[4/5] min-h-[480px] h-[68vh] max-h-[640px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent opacity-80" />
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>

        {/* ── PROFİL & AÇIKLAMA KARTI SKELETON ──────────────── */}
        <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-4 sm:gap-5">
          {/* Üst Satır: Başlık & Konum Rozeti */}
          <div className="flex items-start justify-between gap-3 w-full">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-6 sm:h-8 bg-[#21262d] rounded-xl w-3/4" />
              <div className="h-4 bg-[#21262d] rounded-lg w-1/2" />
            </div>
            <div className="w-28 h-8 rounded-xl bg-[#21262d] shrink-0" />
          </div>

          {/* Orta Satır: Rozetler */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#30363d]/70">
            <div className="flex items-center gap-2">
              <div className="w-24 h-6 rounded-lg bg-[#21262d]" />
              <div className="w-20 h-6 rounded-lg bg-[#21262d]" />
            </div>
            <div className="w-16 h-7 rounded-xl bg-[#21262d]" />
          </div>

          {/* Canlı FOMO Çubuğu */}
          <div className="p-3 rounded-xl bg-[#21262d]/50 border border-[#30363d]/50 flex items-center justify-between">
            <div className="w-32 h-4 rounded-md bg-[#30363d]" />
            <div className="w-40 h-4 rounded-md bg-[#30363d]" />
          </div>

          {/* Açıklama Kutusu Skeleton */}
          <div className="flex flex-col gap-2">
            <div className="w-48 h-4 rounded-md bg-[#21262d]" />
            <div className="bg-[#0d1117]/80 border border-[#30363d]/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5">
              <div className="h-3.5 bg-[#21262d] rounded w-full" />
              <div className="h-3.5 bg-[#21262d] rounded w-11/12" />
              <div className="h-3.5 bg-[#21262d] rounded w-4/5" />
              <div className="h-3.5 bg-[#21262d] rounded w-2/3" />
            </div>
          </div>

          {/* 4'lü Hızlı Özellik Çipleri */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-[#21262d]/60 border border-[#30363d] h-12" />
            <div className="p-2.5 rounded-xl bg-[#21262d]/60 border border-[#30363d] h-12" />
            <div className="p-2.5 rounded-xl bg-[#21262d]/60 border border-[#30363d] h-12" />
            <div className="p-2.5 rounded-xl bg-[#21262d]/60 border border-[#30363d] h-12" />
          </div>

          {/* WhatsApp Buton Skeleton */}
          <div className="h-14 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/60 border border-emerald-500/20" />
        </div>
      </div>

      {/* ── MOBİLDE ALTA YAPIŞIK SABİT İLETİŞİM BARI SKELETON ──────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0d1117]/95 backdrop-blur-xl border-t border-[#30363d] p-3 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-2.5">
          <div className="flex-1 h-12 rounded-xl bg-[#21262d] border border-[#30363d]" />
        </div>
      </div>
    </div>
  );
}
