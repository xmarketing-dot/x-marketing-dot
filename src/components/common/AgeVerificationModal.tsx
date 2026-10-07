'use client';

import React from 'react';
import { ShieldAlert, Check, Lock } from 'lucide-react';
import CorporateLogo from './CorporateLogo';

import { isSearchEngineBot } from '@/lib/botDetection';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject?: () => void;
}

export default function AgeVerificationModal({ isOpen, onConfirm, onReject }: AgeVerificationModalProps) {
  // Arama motoru botlarına (Googlebot, Google-InspectionTool, YandexBot vb.) asla engel modalı gösterme
  if (isSearchEngineBot()) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none text-left">
      <div className="w-full max-w-md bg-[#161b22] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col items-center text-center gap-5">
        
        {/* +18 Rozeti & Güvenlik İkonu */}
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-amber-500/40 font-heading">
            +18
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-black text-xs ring-2 ring-[#161b22]">
            <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/15 px-3 py-0.5 rounded-full w-fit mx-auto border border-amber-500/30">
            YASAL UYARI &amp; YAŞ DOĞRULAMA
          </span>
          <h2 className="font-heading font-black text-2xl text-white tracking-tight leading-snug">
            18 Yaşından Büyük müsünüz?
          </h2>
          <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed font-medium mt-1">
            Bu web sitesi yetişkinlere yönelik (+18) eskort, arkadaşlık ve rehberlik içerikleri barındırmaktadır. Devam etmek için <strong className="text-amber-300">18 yaşını doldurmuş</strong> olduğunuzu onaylamanız gerekmektedir.
          </p>
        </div>

        {/* Kurallar & Onay Metni */}
        <div className="w-full p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-left text-xs text-[#8b949e] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Kullanım Şartları &amp; Sorumluluk:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#8b949e]">
            Sitedeki ilanlar bağımsız şahıslar tarafından yayınlanmaktadır. 18 yaşından küçüklerin bu platforma girmesi kesinlikle yasaktır.
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col gap-2.5 w-full font-heading pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3] text-slate-950" />
            <span>18 YAŞINDAN BÜYÜĞÜM ➔ GİRİŞ YAP</span>
          </button>

          <button
            type="button"
            onClick={onReject || onConfirm}
            className="w-full py-2.5 px-6 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#30363d]"
          >
            18 Yaşından Küçüğüm / Vazgeç
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
          <CorporateLogo className="w-4 h-4 grayscale opacity-60" />
          <span>Best Eskort — 2026 • Güvenli Platform</span>
        </div>

      </div>
    </div>
  );
}
