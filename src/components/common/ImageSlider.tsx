'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Maximize2, X } from 'lucide-react';

interface ImageSliderProps {
  images: { url: string; publicId?: string }[];
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
  badge?: string | null;
  className?: string;
}

export default function ImageSlider({
  images,
  alt,
  aspectRatio = 'aspect-[4/3]',
  priority = false,
  badge = null,
  className = '',
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const touchStartXRef = React.useRef<number | null>(null);
  const touchEndXRef = React.useRef<number | null>(null);
  const thumbTrackRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isFullscreen]);

  const safeImages = images && images.length > 0 ? images : [
    { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1000&auto=format&fit=crop&q=80' },
  ];

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 35;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const openFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFullscreen(true);
  };

  return (
    <div>
      {/* Slider Main Viewport with Mobile Touch Gestures */}
      <div 
        className={`relative w-full ${aspectRatio} bg-slate-950 overflow-hidden select-none group ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Active Image */}
        <Image
          src={safeImages[currentIndex]?.url || safeImages[0].url}
          alt={`${alt} - ${currentIndex + 1}`}
          fill
          unoptimized
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 800px"
          className="object-cover transition-all duration-700 ease-out group-hover:scale-105 cursor-pointer"
          onClick={openFullscreen}
        />

        {/* Badge Overlay */}
        {badge && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-xl border border-amber-400 text-amber-400 font-black text-xs uppercase tracking-wider shadow-2xl font-heading">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>{badge}</span>
          </div>
        )}

        {/* Fullscreen Trigger Button */}
        <button
          onClick={openFullscreen}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl"
          title="Resimleri Tam Ekran İncele"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Sahibinden-Style Diagonal Semi-Transparent Center Watermark */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-heading font-black text-white/[0.18] text-2xl sm:text-4xl tracking-[0.25em] uppercase -rotate-25 whitespace-nowrap drop-shadow-sm">
            BEST ESKORT
          </span>
          <span className="font-sans font-bold text-amber-400/[0.22] text-xs sm:text-sm tracking-[0.2em] uppercase -rotate-25 whitespace-nowrap mt-1">
            {typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '') : 'Doğrulanmış Profil'}
          </span>
        </div>

        {/* Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90"
              aria-label="Önceki Fotoğraf"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90"
              aria-label="Sonraki Fotoğraf"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
            </button>
          </>
        )}

        {/* ── ORTALANMIŞ SLIDE GÖSTERGESİ (CENTERED DOTS) ──────────────── */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 shadow-xl pointer-events-auto">
              {safeImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-amber-400 shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Fotoğraf ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── ALTTAN ORTALANMIŞ RESİM SEÇİM ŞERİDİ (CENTERED THUMBNAILS) ──────────────── */}
      {safeImages.length > 1 && (
        <div 
          ref={thumbTrackRef}
          className="flex items-center justify-center gap-2 p-2.5 bg-[#161b22] border-t border-[#30363d] overflow-x-auto no-scrollbar"
        >
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCurrentIndex(idx);
              }}
              className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50 z-10'
                  : 'border-[#30363d] opacity-50 hover:opacity-100 hover:scale-100'
              }`}
            >
              <Image src={img.url} alt={`Resim ${idx + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* REACT PORTAL: 100vw x 100vh FULLSCREEN LIGHTBOX MODAL */}
      {isFullscreen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999999] w-screen h-screen bg-black/95 backdrop-blur-3xl flex flex-col justify-between p-4 selection:bg-amber-500 selection:text-slate-950 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between z-50 pt-2 px-2">
            <div className="flex flex-col text-white">
              <span className="font-black text-base leading-tight font-heading">{alt}</span>
              <span className="text-xs text-amber-400 font-bold font-mono">
                {currentIndex + 1} / {safeImages.length} Fotoğraf (Tam Ekran)
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-3 rounded-full bg-[#21262d] border border-[#363b42] text-white hover:bg-rose-600 transition-colors shadow-2xl"
              title="Kapat"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Fullscreen Edge-to-Edge Image */}
          <div
            className="relative flex-1 w-full h-full my-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeImages[currentIndex]?.url || safeImages[0].url}
              alt={`${alt} - Tam Ekran`}
              fill
              unoptimized
              className="object-contain p-2"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50 p-3.5 rounded-full bg-[#161b22]/90 text-white hover:bg-amber-500 hover:text-slate-950 transition-all shadow-2xl border border-white/20 active:scale-95"
                >
                  <ChevronLeft className="w-7 h-7 stroke-[3]" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-50 p-3.5 rounded-full bg-[#161b22]/90 text-white hover:bg-amber-500 hover:text-slate-950 transition-all shadow-2xl border border-white/20 active:scale-95"
                >
                  <ChevronRight className="w-7 h-7 stroke-[3]" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {safeImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-3 z-50 bg-[#161b22]/90 backdrop-blur-md rounded-2xl border border-[#30363d]"
              onClick={(e) => e.stopPropagation()}
            >
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${idx === currentIndex ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/30' : 'border-[#30363d] opacity-60 hover:opacity-100'
                    }`}
                >
                  <Image src={img.url} alt="Küçük resim" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

