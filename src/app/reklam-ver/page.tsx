'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  ChevronLeft,
  Sparkles,
  Dices,
  Flame,
  Send,
  Users,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useAdminWhatsApp } from '@/lib/useAdminWhatsApp';

export default function ReklamVerPage() {
  const { openWhatsApp } = useAdminWhatsApp();

  const handleWhatsAppContact = () => {
    openWhatsApp(
      'Merhaba, besteskort.online sitesindeki VIP Banner reklam alanını kiralamak istiyorum. Reklam şartları ve fiyat teklifi hakkında bilgi alabilir miyim?'
    );
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-white flex flex-col items-center justify-center text-center py-8 sm:py-16 px-4 sm:px-6 select-none">
      <div className="w-full max-w-xl flex flex-col items-center text-center gap-8 sm:gap-10">

        {/* ── ÜST BAR ──────────────── */}
        <div className="flex items-center justify-between w-full border-b border-slate-800 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Vitrine Geri Dön</span>
          </Link>
          <span className="text-sm font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-amber-400" />
            VIP REKLAM PANOSU
          </span>
        </div>

        {/* ── 1. DEV BAŞLIK (Büyük, Net ve Okunabilir) ──────────────── */}
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-sm font-black text-slate-200">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AYLIK 30.000+ AKTİF TEKİL ZİYARETÇİ</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight uppercase leading-tight">
            ZİRVEDE YERİNİZİ ALIN
          </h1>

          <p className="text-base sm:text-lg text-slate-200 font-medium max-w-lg leading-relaxed">
            Sitenin en üstünde sabit banner ile markanızı, sitenizi veya kanalınızı doğrudan binlerce müşteriye ulaştırın.
          </p>
        </div>

        {/* ── 2. HEDEF KATEGORİLER (Büyük Yazılı Haplar) ──────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-base font-black bg-slate-900 text-white border border-slate-700 shadow-md">
            <Dices className="w-4 h-4 text-cyan-400" />
            CASINO &amp; BAHİS
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-base font-black bg-slate-900 text-white border border-slate-700 shadow-md">
            <Flame className="w-4 h-4 text-rose-500" />
            ADULT &amp; ESCORT
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-base font-black bg-slate-900 text-white border border-slate-700 shadow-md">
            <Send className="w-4 h-4 text-sky-400" />
            TELEGRAM KANALLARI
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm sm:text-base font-black bg-slate-900 text-white border border-slate-700 shadow-md">
            <Crown className="w-4 h-4 text-amber-400" />
            VIP SPONSORLUK
          </span>
        </div>

        {/* ── 3. CANLI BİLLBOARD ÖNİZLEME (Kompakt ve Net) ──────────────── */}
        <div className="w-full">
          <div className="w-full p-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-600 to-rose-600 animate-neon-blue-red-border animate-neon-blue-red-glow shadow-xl">
            <div className="w-full rounded-[14px] bg-[#050813] py-6 px-4 flex flex-col items-center justify-center text-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-900 text-slate-200 border border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                SABİT TEPE KONUMU
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                BURADA SİZİN REKLAMINIZ YAYINLANIR
              </h2>

              <p className="text-sm text-slate-300">
                Görseliniz ve doğrudan yönlendirme linkiniz 7/24 kesintisiz sabit kalır.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. NET VE BÜYÜK AVANTAJ MADDELERİ (Uzun Metin Yok, Net Bilgi) ──────────────── */}
        <div className="grid grid-cols-1 gap-3 w-full">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-3 text-center">
            <Users className="w-6 h-6 text-cyan-400 shrink-0" />
            <span className="text-base sm:text-lg font-bold text-white">
              Aylık 30.000+ Canlı Organik Türk Ziyaretçi
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-3 text-center">
            <Target className="w-6 h-6 text-rose-500 shrink-0" />
            <span className="text-base sm:text-lg font-bold text-white">
              %100 Doğrudan İlgili ve Satın Alan Hedef Kitle
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center gap-3 text-center">
            <Zap className="w-6 h-6 text-amber-400 shrink-0" />
            <span className="text-base sm:text-lg font-bold text-white">
              Sırasız ve Rotasyonsuz Sabit Gösterim
            </span>
          </div>
        </div>

        {/* ── 5. DEV WHATSAPP BUTONU (Büyük, Rahat Okunan ve Tıklanan) ──────────────── */}
        <div className="w-full flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-base sm:text-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <OfficialWhatsAppIcon className="w-7 h-7 fill-white shrink-0" />
            <span>WHATSAPP İLE REKLAM VER</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>

          <span className="text-xs sm:text-sm text-slate-400 font-semibold">
            ⚡ Tıklayın, doğrudan WhatsApp üzerinden anında fiyat alıp yerinizi ayırtın.
          </span>
        </div>

      </div>
    </div>
  );
}
