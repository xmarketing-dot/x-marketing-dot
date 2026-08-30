'use client';

import React, { useEffect, useState } from 'react';

export default function BannedTrollScreen() {
  const [progress, setProgress] = useState(99.1);
  const [statusIdx, setStatusIdx] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [trollAlert, setTrollAlert] = useState<string | null>(null);

  const funnyStatusMessages = [
    'Kuantum paketleri hizalanıyor (%99.1)...',
    'Kozmik sinyaller şifreleniyor, az sabır...',
    'Uzay-zaman sürekliliği kalibre ediliyor...',
    'Ördekler tek sıra halinde diziliyor 🦆...',
    'Sunucu işlemcisi çay molasında, az sonra...',
    'Matrix kodları yeniden hesaplanıyor...',
    'Lütfen sayfayı yenilemeyin, patates kızartması hazırlanıyor 🍟...',
    'Bağlantı tüneli biraz dar, genişletiliyor...',
  ];

  const fakeLiveComments = [
    { name: 'Ahmet K.', time: '3 sn önce', text: 'Sakın F5 yapmayın baştan başlıyor!' },
    { name: 'Kerem T.', time: '14 sn önce', text: '6 saattir %99.9 bekliyorum az kaldı inşallah' },
    { name: 'Burak D.', time: '28 sn önce', text: 'Modemi resetledim yine aynı ekran açıldı amk 🤡' },
    { name: 'Selin B.', time: '45 sn önce', text: 'Ben bekliyorum siz gidin' },
    { name: 'Mehmet Y.', time: '1 dk önce', text: 'Patatesler çıtır olsun abi' },
  ];

  // Permanent Device Stamping (Modem Reset Hunter)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // If somehow loaded on admin portal, do not set ban cookie!
        if (window.location.pathname.includes('/bms-secure-portal')) {
          document.cookie = 'bms_banned=; max-age=0; path=/';
          localStorage.removeItem('bms_banned');
          return;
        }

        document.cookie = 'bms_banned=1; max-age=31536000; path=/; SameSite=Lax';
        localStorage.setItem('bms_banned', '1');

        const vid = localStorage.getItem('bms_vid');
        const sid = sessionStorage.getItem('bms_sid');
        if (vid) {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorId: vid,
              sessionId: sid || 'troll_sess',
              path: window.location.pathname || '/',
              pageTitle: '🤡 Kozmik Bekleme Odası (Troll)',
              referer: document.referrer || '',
              device: window.innerWidth < 768 ? 'mobile' : 'desktop',
              isBanned: true,
            }),
          }).catch(() => {});
        }
      }
    } catch (e) {}
  }, []);

  // Oscillating infinite progress between 98.4% and 99.9%
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const delta = (Math.random() - 0.49) * 0.4;
        const next = prev + delta;
        if (next > 99.9) return 98.2;
        if (next < 97.4) return 99.1;
        return parseFloat(next.toFixed(1));
      });
    }, 1600);

    const textTimer = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % funnyStatusMessages.length);
    }, 3200);

    return () => {
      clearInterval(progressTimer);
      clearInterval(textTimer);
    };
  }, [funnyStatusMessages.length]);

  const handleTurboClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 1) {
      setProgress(12.4);
      setTrollAlert('⚠️ HATA: Butona bastığın için sunucu aşırı ısındı! İlerleme %12.4 seviyesine sıfırlandı 🤡');
    } else if (newCount === 2) {
      setProgress(4.1);
      setTrollAlert('🤦‍♂️ Yapma dedikçe basıyorsun... Şimdi %4.1 oldu, ördekler kaçıştı!');
    } else {
      setProgress(0.1);
      setTrollAlert('🦆 Tebrikler! Sistem tamamen dondu. Şimdi arkana yaslan ve derin nefes al.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-[#07090e] text-[#f0f6fc] flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-y-auto font-sans">
      
      {/* Hypnotic Ambient Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none animate-pulse -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse -bottom-20 -right-20"></div>
      <div className="absolute w-72 h-72 rounded-full bg-pink-600/10 blur-2xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center my-auto py-6">
        
        {/* Animated Funny Cosmic Icon / Duck */}
        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600/30 via-pink-500/20 to-amber-500/30 border-2 border-amber-400/40 flex items-center justify-center shadow-2xl backdrop-blur-md animate-bounce">
            <span className="text-6xl select-none filter drop-shadow-xl hover:rotate-45 transition-transform">🦆</span>
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[10px] text-black font-black items-center justify-center">!</span>
          </span>
        </div>

        {/* Big Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 font-heading">
          Kozmik Ağ Hizalanıyor...
        </h1>

        {/* Status Ticker */}
        <p className="text-sm text-amber-300/90 h-6 mb-6 font-bold transition-all duration-300">
          {funnyStatusMessages[statusIdx]}
        </p>

        {/* Fake Infinite Loading Progress Bar */}
        <div className="w-full bg-[#161b22] border-2 border-[#30363d] rounded-full h-4 p-0.5 mb-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Percentage Counter */}
        <div className="flex items-center justify-between w-full px-1 text-xs font-mono text-[#8b949e] mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Sunucu v4.20 (Aktif)
          </span>
          <span className="font-black text-base text-amber-400">%{progress}</span>
        </div>

        {/* Turbo Speed Button (Troll Trap) */}
        <button
          onClick={handleTurboClick}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg shadow-amber-500/20 active:scale-95 transition-all mb-4 flex items-center justify-center gap-2"
        >
          <span>⚡ Bağlantıyı Hızlandır (%100 Yap)</span>
        </button>

        {/* Troll Alert Popup */}
        {trollAlert && (
          <div className="w-full p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold leading-relaxed mb-4 animate-shake">
            {trollAlert}
          </div>
        )}

        {/* Absurd Note */}
        <div className="w-full p-3.5 rounded-2xl bg-[#161b22]/80 border border-[#30363d] backdrop-blur-md text-xs text-[#8b949e] leading-relaxed mb-4">
          ✨ <strong className="text-white">Kozmik Uyarı:</strong> Ağ trafiğiniz kuantum filtrelerinden süzülmektedir. Sayfayı kapatmadan beklerseniz evrenin sırrına erebilirsiniz. ☕
        </div>

        {/* Fake Live Activity / Chat Ticker */}
        <div className="w-full rounded-2xl bg-[#0d1117] border border-[#21262d] p-3 text-left">
          <div className="text-[10px] font-black text-[#8b949e] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>💬 Bekleyenler Odası (Canlı)</span>
            <span className="text-emerald-400 font-mono">1.428 Kişi</span>
          </div>
          <div className="flex flex-col gap-2">
            {fakeLiveComments.map((c, i) => (
              <div key={i} className="flex items-start justify-between gap-2 text-[11px] border-b border-[#161b22] pb-1.5 last:border-0 last:pb-0">
                <span className="font-bold text-amber-400 shrink-0">{c.name}:</span>
                <span className="text-[#c9d1d9] truncate flex-1">{c.text}</span>
                <span className="text-[9px] text-[#484f58] shrink-0 font-mono">{c.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
