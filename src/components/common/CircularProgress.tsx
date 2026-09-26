'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, Database, ShieldCheck } from 'lucide-react';

interface CircularProgressProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  steps?: string[];
  className?: string;
}

export default function CircularProgress({
  size = 'lg',
  title = 'Veriler Hesaplanıyor...',
  subtitle = 'Veritabanı taranıyor ve analitik modelleri oluşturuluyor',
  steps = [
    'Ziyaretçi kayıtları taranıyor...',
    'Arama motoru ve bot filtreleri ayrıştırılıyor...',
    'Kullanıcı oturum ve sadakat modelleri hesaplanıyor...',
    'WhatsApp dönüşümleri ve metrikler birleştiriliyor...',
  ],
  className = '',
}: CircularProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!steps || steps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [steps]);

  // Dimension configurations
  const dimensions = {
    sm: { svgSize: 48, radius: 18, stroke: 3, iconSize: 'w-4 h-4' },
    md: { svgSize: 72, radius: 28, stroke: 4, iconSize: 'w-6 h-6' },
    lg: { svgSize: 110, radius: 44, stroke: 5, iconSize: 'w-8 h-8' },
    xl: { svgSize: 150, radius: 60, stroke: 6, iconSize: 'w-10 h-10' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;

  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center p-6 sm:p-10 select-none animate-fadeIn ${className}`}>
      {/* Glow Backdrop */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Neon Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-amber-400/10 rounded-full blur-2xl scale-125 pointer-events-none animate-pulse" />

        {/* Circular SVG Rings */}
        <svg
          width={dimensions.svgSize}
          height={dimensions.svgSize}
          viewBox={`0 0 ${dimensions.svgSize} ${dimensions.svgSize}`}
          className="relative z-10 transform -rotate-90"
        >
          <defs>
            <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={dimensions.svgSize / 2}
            cy={dimensions.svgSize / 2}
            r={dimensions.radius}
            stroke="#21262d"
            strokeWidth={dimensions.stroke}
            fill="transparent"
            className="opacity-50"
          />

          {/* Outer Dashed Orbit Ring */}
          <circle
            cx={dimensions.svgSize / 2}
            cy={dimensions.svgSize / 2}
            r={dimensions.radius + 4}
            stroke="#30363d"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            fill="transparent"
            className="animate-spin opacity-40 origin-center"
            style={{ animationDuration: '8s' }}
          />

          {/* Foreground Animated Glowing Progress Arc */}
          <circle
            cx={dimensions.svgSize / 2}
            cy={dimensions.svgSize / 2}
            r={dimensions.radius}
            stroke="url(#circGrad)"
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.3}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#glow)"
            className="animate-spin origin-center"
            style={{ animationDuration: '1.4s' }}
          />
        </svg>

        {/* Center Animated Core Icon */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#161b22]/90 border border-amber-500/30 flex items-center justify-center shadow-inner text-amber-400">
            <Activity className={`${dimensions.iconSize} animate-pulse text-amber-400`} />
          </div>
        </div>
      </div>

      {/* Text & Steps Status */}
      <div className="flex flex-col items-center gap-1.5 max-w-md z-10">
        <h3 className="font-heading font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </h3>
        
        {steps && steps.length > 0 ? (
          <div className="h-6 flex items-center justify-center overflow-hidden">
            <span 
              key={currentStepIndex}
              className="text-xs font-mono font-bold text-amber-300 animate-fadeIn"
            >
              ⏳ {steps[currentStepIndex]}
            </span>
          </div>
        ) : subtitle ? (
          <p className="text-xs text-[#8b949e]">{subtitle}</p>
        ) : null}

        {/* Step dots */}
        {steps && steps.length > 1 && (
          <div className="flex items-center gap-1.5 mt-1">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-5 bg-gradient-to-r from-amber-400 to-emerald-400'
                    : 'w-1.5 bg-[#30363d]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
