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

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeImages = images && images.length > 0 ? images : [
    { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1000&auto=format&fit=crop&q=80' },
  ];

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const openFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFullscreen(true);
  };

  return (
    <div>
      {/* Slider Main Viewport */}
      <div className={`relative w-full ${aspectRatio} bg-slate-950 overflow-hidden group ${className}`}>
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

        {/* Image Counter Pill */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/20 text-white font-black text-xs font-heading tracking-wider shadow-lg">
            {currentIndex + 1} / {safeImages.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90"
              aria-label="Önceki Fotoğraf"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90"
              aria-label="Sonraki Fotoğraf"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-lg">
            {safeImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Thumbnail Track */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-2 p-2.5 bg-[#161b22] border-t border-[#30363d] overflow-x-auto no-scrollbar">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCurrentIndex(idx);
              }}
              className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/30 ring-1 ring-amber-400' : 'border-[#30363d] opacity-50 hover:opacity-100'
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
          className="fixed inset-0 z-[99999] w-screen h-screen bg-black/95 backdrop-blur-3xl flex flex-col justify-between p-4 selection:bg-amber-500 selection:text-slate-950 animate-in fade-in duration-200"
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
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    idx === currentIndex ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/30' : 'border-[#30363d] opacity-60 hover:opacity-100'
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

