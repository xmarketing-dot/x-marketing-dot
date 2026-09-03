'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Check, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropModalProps {
  imageSrc: string;
  aspectRatio?: number; // width / height, örn: 1200 / 400 = 3
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageSrc,
  aspectRatio = 3, // 1200x400 yatay banner için varsayılan 3:1
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

  // Kırpılan görseli Canvas üzerinden oluşturup Blob olarak döndür
  const handleCropAndSave = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Hedef çıktı boyutu (örneğin 1200 x 400 banner)
    const targetWidth = 1200;
    const targetHeight = Math.round(targetWidth / aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Kırpma penceresinin container içindeki oranlarını hesapla
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Scale oranı
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Kırpma penceresinin görsele göre başlangıç X ve Y koordinatları
    const sourceX = Math.max(0, (containerRect.left - imgRect.left) * scaleX);
    const sourceY = Math.max(0, (containerRect.top - imgRect.top) * scaleY);
    const sourceWidth = Math.min(img.naturalWidth - sourceX, containerRect.width * scaleX);
    const sourceHeight = Math.min(img.naturalHeight - sourceY, containerRect.height * scaleY);

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
        {/* Modal Başlık */}
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-heading font-black text-sm">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Dikey Fotoğrafı Banner Alanına Göre Kırp</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kırpma Önizleme Kutusu (3:1 En/Boy Oranı — Tam Banner Boyutu) */}
        <div className="p-4 flex flex-col items-center gap-3">
          <p className="text-xs text-[#8b949e] text-center">
            Fotoğrafı parmağınızla/farenizle <strong className="text-amber-400">kaydırarak</strong> banner çerçevesine en uygun kısmı ayarlayın:
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
            className="relative w-full aspect-[3/1] bg-[#0d1117] rounded-2xl overflow-hidden border-2 border-amber-500 shadow-inner cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
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
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover',
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

            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/30">
              Canlı Banner Çerçevesi (1200x400)
            </div>
          </div>

          {/* Yakınlaştırma (Zoom) Kontrolü */}
          <div className="flex items-center justify-between w-full px-2 pt-2 gap-4">
            <div className="flex items-center gap-2 flex-1">
              <ZoomOut className="w-4 h-4 text-[#8b949e]" />
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <ZoomIn className="w-4 h-4 text-[#8b949e]" />
            </div>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[11px] font-bold text-[#8b949e] hover:text-white transition-colors shrink-0 flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white font-bold text-xs transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleCropAndSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Kırp ve Banner Olarak Kullan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
