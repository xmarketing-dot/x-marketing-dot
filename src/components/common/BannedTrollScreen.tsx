'use client';

import React, { useEffect, useState } from 'react';

interface BannedTrollScreenProps {
  clientIp?: string;
}

export default function BannedTrollScreen({ clientIp }: BannedTrollScreenProps) {
  const [progress, setProgress] = useState(98.7);
  const [statusIdx, setStatusIdx] = useState(0);

  const funnyStatusMessages = [
    'Kuantum paketleri hizalanıyor...',
    'Kozmik sinyaller şifreleniyor...',
    'Uzay-zaman sürekliliği kalibre ediliyor...',
    'Ördekler sıraya diziliyor...',
    'Sunucu işlemcisi çay molasında, az sonra...',
    'Matrix kodları yeniden hesaplanıyor (%99.9)...',
    'Lütfen sayfayı yenilemeyin, patates kızartması hazırlanıyor...',
  ];

  // Permanent Device Stamping (Modem Reset Hunter)
  useEffect(() => {
    try {
      // 1. Drop permanent 1-year ban cookie
      document.cookie = 'bms_banned=1; max-age=31536000; path=/; SameSite=Lax';
      // 2. Drop permanent localStorage flag
      localStorage.setItem('bms_banned', '1');
      // 3. Optional: track the blocked view in analytics
      const vid = localStorage.getItem('bms_vid');
      const sid = sessionStorage.getItem('bms_sid');
      if (vid) {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: vid,
            sessionId: sid || 'banned_sess',
            path: window.location.pathname || '/',
            pageTitle: 'Kozmik Bekleme Odası (Troll)',
            referer: document.referrer || '',
            device: window.innerWidth < 768 ? 'mobile' : 'desktop',
            isBanned: true,
          }),
        }).catch(() => {});
      }
    } catch (e) {}
  }, []);

  // Oscillating infinite progress between 98.6% and 99.9%
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const delta = (Math.random() - 0.48) * 0.3;
        const next = prev + delta;
        if (next > 99.9) return 98.4;
        if (next < 97.5) return 99.1;
        return parseFloat(next.toFixed(1));
      });
    }, 1800);

    const textTimer = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % funnyStatusMessages.length);
    }, 3600);

    return () => {
      clearInterval(progressTimer);
      clearInterval(textTimer);
    };
  }, [funnyStatusMessages.length]);

  return (
    <div className="fixed inset-0 z-[999999] bg-[#07090e] text-[#f0f6fc] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      
      {/* Hypnotic Ambient Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none animate-pulse -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse -bottom-20 -right-20"></div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center">
        
        {/* Animated Funny Cosmic Icon / Duck */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600/20 to-amber-500/20 border border-purple-500/30 flex items-center justify-center shadow-2xl backdrop-blur-md animate-bounce">
            <span className="text-5xl select-none filter drop-shadow-lg">🦆</span>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          Kozmik Bağlantı Optimize Ediliyor...
        </h1>

        {/* Status ticker */}
        <p className="text-sm text-[#a1a1aa] h-6 mb-8 transition-all duration-300 font-medium">
          {funnyStatusMessages[statusIdx]}
        </p>

        {/* Fake Infinite Loading Progress Bar */}
        <div className="w-full bg-[#161b22] border border-[#30363d] rounded-full h-3 p-0.5 mb-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Percentage Counter */}
        <div className="flex items-center justify-between w-full px-1 text-xs font-mono text-[#8b949e] mb-8">
          <span>Protokol v4.2.0</span>
          <span className="font-bold text-amber-400">%{progress}</span>
        </div>

        {/* Absurd Mysterious Note */}
        <div className="p-4 rounded-2xl bg-[#161b22]/70 border border-[#30363d]/60 backdrop-blur-sm text-xs text-[#8b949e] leading-relaxed max-w-sm">
          Ağ trafiğiniz kuantum tünellerinden geçiriliyor. Lütfen sayfayı kapatmadan bekleyin, sabır en büyük erdemdir. ☕
        </div>

        {/* Ghost Security Stamp (Invisible detail for geeks) */}
        {clientIp && (
          <span className="text-[10px] font-mono text-[#30363d] mt-8 tracking-widest">
            SESSION_SIG // {clientIp.slice(0, 10)}***
          </span>
        )}

      </div>
    </div>
  );
}
