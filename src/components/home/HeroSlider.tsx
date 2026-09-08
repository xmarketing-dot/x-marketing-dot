'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, Phone, Crown, Sparkles, Eye, ArrowUpRight } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { formatWhatsAppNumber } from '@/lib/format';

export interface DynamicHeroSlide {
  _id: string;
  slug: string;
  baslik: string;
  aciklama: string;
  ilSlug: string;
  ilceSlug: string;
  anaFotograf: { url: string };
  rozet?: string;
  whatsappNumara: string;
}

interface HeroSliderProps {
  slides?: DynamicHeroSlide[];
}

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [touching, setTouching] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const activeSlides = slides.length > 0 ? slides : [
    {
      _id: 'default-1',
      slug: 'bolgesel-ilan-rehberi',
      baslik: 'Türkiye\'nin En Güvenilir VIP İlan Platformu',
      aciklama: '81 il ve tüm ilçelerde doğrulanmış Ultra VIP ilanlar.',
      ilSlug: 'istanbul',
      ilceSlug: 'beylikduzu',
      anaFotograf: { url: 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=1200&auto=format&fit=crop&q=80' },
      rozet: 'ultravip',
      whatsappNumara: '05300000000',
    },
  ];

  const next = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % Math.max(1, activeSlides.length));
  }, [activeSlides.length]);

  const prev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + activeSlides.length) % Math.max(1, activeSlides.length));
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length, next]);

  const current = activeSlides[activeIdx];

  if (!current) return null;

  const formattedNumber = formatWhatsAppNumber(current?.whatsappNumara || '');
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || '');
  const sliderUrl = `${origin}/ilan/${current.slug}`;
  const ilName = current.ilSlug ? current.ilSlug.charAt(0).toUpperCase() + current.ilSlug.slice(1) : '';
  const ilceName = current.ilceSlug ? current.ilceSlug.charAt(0).toUpperCase() + current.ilceSlug.slice(1) : '';
  const locName = ilName && ilceName && ilName.toLowerCase() !== ilceName.toLowerCase()
    ? `${ilName} - ${ilceName} Eskort`
    : (ilceName ? `${ilceName} Eskort` : (ilName ? `${ilName} Eskort` : ''));
  const adLabel = locName ? `${locName} — ${current.baslik}` : current.baslik;
  const message = encodeURIComponent(`Merhaba, ben ${sliderUrl} adresindeki "${adLabel}" VIP ilanınızdan geliyorum. Görüşme ve detaylar hakkında bilgi alabilir miyim?`);
  const waUrl = `https://wa.me/${formattedNumber}?text=${message}`;

  const handleWaClick = () => {
    if (current._id) {
      fetch('/api/listings/click-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: current._id }),
      }).catch(() => { });
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-[#0d1117] min-h-[500px] sm:min-h-[540px] h-[70vh] max-h-[640px] flex flex-col justify-between"
      onTouchStart={e => { setTouching(true); setTouchStartX(e.touches[0].clientX); }}
      onTouchEnd={e => {
        if (!touching) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (diff > 40) next();
        else if (diff < -40) prev();
        setTouching(false);
      }}
    >
      {/* ── 1. CANLI, PARLAK VE NET FOTOĞRAF (KARARTMA KALDIRILDI) ──────────────── */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === activeIdx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.02] z-0'
            }`}
        >
          <Image
            src={slide.anaFotograf?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=1200'}
            alt={slide.baslik}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 600px) 100vw, 600px"
            className="object-cover object-top sm:object-center brightness-105 contrast-105"
          />
          {/* Sadece alt metin arkasında çok hafif, ipeksi ve şeffaf geçiş */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent z-10" />

          {/* Sahibinden-Style Diagonal Watermark for Vitrin */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden pb-16">
            <span className="font-heading font-black text-white/[0.18] text-3xl sm:text-5xl tracking-[0.25em] uppercase -rotate-25 whitespace-nowrap drop-shadow-sm">
              BEST ESKORT
            </span>
            <span className="font-sans font-bold text-amber-400/[0.22] text-xs sm:text-base tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap mt-1">
              {typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : 'Doğrulanmış Vitrin'}
            </span>
          </div>
        </div>
      ))}

      {/* ── 2. ÜST BAR: VİTRİN ROZETİ VE GÖSTERGELER ──────────────── */}
      <div className="relative z-30 px-4 pt-4 flex items-center justify-between w-full">
        {/* Canlı VIP Rozeti */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 font-black text-xs font-heading shadow-xl shadow-amber-500/30 border border-amber-300">
          <Crown className="w-4 h-4 fill-slate-950" />
          <span>VIP VİTRİN</span>
        </div>

        {/* Doğrulanmış Rozeti */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/90 text-slate-950 font-black text-xs font-heading shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>%100 Doğrulanmış</span>
        </div>
      </div>

      {/* ── 3. ALT KART & BUTONLAR (KUSURSUZ 3'LÜ GRID DÜZENİ) ──────────────── */}
      <div className="relative z-30 px-3.5 pb-4 pt-2 flex flex-col gap-2.5 w-full">

        {/* Başlık (Sol) ve Konum / Adres (Sağ) Alanı ──────────────── */}
        <div className="flex items-center justify-between gap-2.5 drop-shadow-lg w-full">
          {/* Sol: Model Adı */}
          <Link href={`/ilan/${current.slug}`} className="block min-w-0 flex-1">
            <h1 className="font-black text-base sm:text-xl text-white font-heading tracking-tight leading-tight drop-shadow-md hover:text-amber-300 transition-colors truncate">
              {current.baslik}
            </h1>
          </Link>

          {/* Sağ: Konum / Adres Rozeti */}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-amber-400 font-extrabold text-[11px] sm:text-xs uppercase border border-amber-400/35 font-heading shrink-0 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none capitalize">{current.ilSlug} / {current.ilceSlug}</span>
          </span>
        </div>

        {/* ── PREMİUM VE MOBİL-NATİVE 2 VİTRİN AKSİYON BUTONU (WHATSAPP & VİP PROFİLİ İNCELE) ──────────────── */}
        <div className="grid grid-cols-2 gap-2.5 w-full font-heading">

          {/* 1. WHATSAPP BUTONU */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWaClick}
            className="py-3.5 sm:py-4 px-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-xs sm:text-base tracking-wide shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            title="WhatsApp ile Mesaj Gönder"
          >
            <OfficialWhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
            <span className="truncate">WhatsApp İle Yaz</span>
          </a>

          {/* 2. PROFİLİ İNCELE BUTONU (Özel VIP Vitrin Altın Butonu) */}
          <Link
            href={`/ilan/${current.slug}`}
            className="py-3.5 sm:py-4 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-base tracking-wide shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-200"
          >
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950 shrink-0" />
            <span className="truncate">Profili İncele</span>
          </Link>

        </div>

        {/* Slide İlerleme Çizgileri */}
        {activeSlides.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIdx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40'
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dokunmatik Yan Geçiş Alanları */}
      {activeSlides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-0 top-0 bottom-24 w-16 z-20 opacity-0" aria-label="Önceki" />
          <button onClick={next} className="absolute right-0 top-0 bottom-24 w-16 z-20 opacity-0" aria-label="Sonraki" />
        </>
      )}
    </div>
  );
}

