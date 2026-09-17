'use client';

import React, { useState, useRef } from 'react';
import { Scissors, Check, X, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

interface ImageCropModalProps {
  imageSrc: string;
  aspectRatio?: number; // width / height, örn: 21 / 9 veya 3
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageSrc,
  aspectRatio = 21 / 9,
  onCropComplete,
  onCancel,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fare veya dokunmatik sürükleme
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Dokunmatik destek (Mobil telefonlar için)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Boyuna göre daralt / tam sığdır (Taşmayı önler)
  const handleFitHeight = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  // Alanı doldur
  const handleFillCover = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) {
      setZoom(1.8);
      return;
    }
    const containerAspect = container.clientWidth / container.clientHeight;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    if (imgAspect < containerAspect) {
      // Dikey görsel: Genişliğe göre büyüt
      const neededZoom = containerAspect / imgAspect;
      setZoom(Math.max(1, Math.min(3, neededZoom)));
    } else {
      setZoom(1.2);
    }
    setOffsetX(0);
    setOffsetY(0);
  };

  // Kırpılan görseli Canvas üzerinden oluşturup Blob olarak döndür
  const handleCropAndSave = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Hedef çıktı boyutu (örneğin 1200 x 514 veya 1200 x 400 banner)
    const targetWidth = 1200;
    const targetHeight = Math.round(targetWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Arka planı koyu siyah ile doldur (görsel küçültüldüğünde kenarlar taşmaz)
    ctx.fillStyle = '#0B0E14';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Kırpma penceresinin container ve görsel ekran koordinatları
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Ekrandan hedef Canvas çözünürlüğüne projeksiyon faktörü
    const factor = targetWidth / containerRect.width;

    const drawX = (imgRect.left - containerRect.left) * factor;
    const drawY = (imgRect.top - containerRect.top) * factor;
    const drawW = imgRect.width * factor;
    const drawH = imgRect.height * factor;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
        {/* Modal Başlık */}
        <div className="p-3.5 sm:p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-heading font-black text-xs sm:text-sm">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Banner Görselini Boyutlandır &amp; Kırp</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kırpma Önizleme Kutusu */}
        <div className="p-3.5 sm:p-4 flex flex-col items-center gap-3">
          <p className="text-[11px] sm:text-xs text-[#8b949e] text-center">
            Görseli parmağınızla/farenizle <strong className="text-amber-400">kaydırabilir</strong> ve alttaki çubukla <strong className="text-amber-400">boyunu daraltıp küçültebilirsiniz</strong>:
          </p>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ aspectRatio: `${aspectRatio}` }}
            className="relative w-full max-h-[260px] bg-[#0B0E14] rounded-2xl overflow-hidden border-2 border-amber-500 shadow-inner cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
          >
            {/* Fotoğraf */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Kırpılacak Fotoğraf"
              draggable={false}
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none',
                maxHeight: 'none',
                height: '100%',
                width: 'auto',
                pointerEvents: 'none',
              }}
              className="absolute select-none"
            />

            {/* Banner Kılavuz Çizgileri */}
            <div className="absolute inset-0 border border-white/20 pointer-events-none grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/15"></div>
              <div className="border-r border-b border-white/15"></div>
              <div className="border-b border-white/15"></div>
              <div className="border-r border-b border-white/15"></div>
              <div className="border-r border-b border-white/15"></div>
              <div className="border-b border-white/15"></div>
              <div className="border-r border-white/15"></div>
              <div className="border-r border-white/15"></div>
              <div></div>
            </div>

            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
              Canlı 21:9 Tepe Banner
            </div>
          </div>

          {/* Hızlı Boyutlandırma / Daraltma Butonları */}
          <div className="flex items-center justify-center gap-2 w-full pt-0.5">
            <button
              type="button"
              onClick={handleFitHeight}
              className="px-2.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Boyunu Daralt (Tam Sığdır)</span>
            </button>

            <button
              type="button"
              onClick={handleFillCover}
              className="px-2.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Alanı Doldur (Cover)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className="px-2 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Konumu ve Boyutu Sıfırla"
            >
              <RotateCw className="w-3 h-3" />
              <span>Sıfırla</span>
            </button>
          </div>

          {/* Yakınlaştırma / Daraltma (Zoom) Slider Kontrolü */}
          <div className="flex items-center justify-between w-full px-2 pt-1 gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] text-[#8b949e] font-mono shrink-0">Daralt</span>
              <ZoomOut className="w-4 h-4 text-[#8b949e]" />
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.02"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <ZoomIn className="w-4 h-4 text-[#8b949e]" />
              <span className="text-[10px] text-[#8b949e] font-mono shrink-0">Büyüt</span>
            </div>

            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
              %{Math.round(zoom * 100)}
            </span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="p-3.5 sm:p-4 border-t border-[#30363d] bg-[#0d1117] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleCropAndSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Kırp ve Bannerı Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
