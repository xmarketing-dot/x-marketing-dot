'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, ShieldCheck, Share, PlusSquare, Monitor, Smartphone } from 'lucide-react';

const STORAGE_KEY = 'pwa_prompt_dismissed_until';
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 gün gizle

export default function AddToHomeScreenPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // 1. Service Worker Kaydı (BTK Kalkanı ve Cihaz İçi Kurtarma)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.debug('SW register failed:', err);
        });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Standalone (PWA olarak zaten açılmış mı?) kontrolü
    if (typeof window !== 'undefined') {
      const isApp =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      if (isApp) {
        setIsStandalone(true);
        return;
      }

      // Kullanıcı yakın zamanda kapattıysa gösterme
      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }

      // iOS tespiti
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Android / Chrome / Edge için beforeinstallprompt dinle
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Sayfa yüklendikten 2.5 saniye sonra nazikçe göster
        setTimeout(() => setIsVisible(true), 2500);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // iOS Safari için (beforeinstallprompt yoktur, doğrudan 3 saniye sonra göster)
      if (isIosDevice && !(window.navigator as any).standalone) {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
      }

      // Masaüstü Chrome/Edge için yedek zamanlayıcı
      const fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 4000);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Tarayıcı doğrudan prompt desteklemiyorsa ipucu ver
      alert('Tarayıcınızın menüsünden (⋮ veya Paylaş) "Ana Ekrana Ekle" veya "Masaüstüne Kısayol Oluştur" seçeneğini kullanabilirsiniz.');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSTip(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
    } catch {}
  };

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:right-5 sm:left-auto sm:max-w-md z-[999990] animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-slate-950/95 text-white border-2 border-amber-500/80 shadow-2xl backdrop-blur-xl ring-1 ring-black/50 flex flex-col gap-3">
        {/* Üst Bar: Rozet ve Kapatma */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider font-heading">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>BTK Engelsiz Hızlı Erişim</span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Daha Sonra"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Başlık ve Açıklama */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-md text-slate-950 font-black">
            {isIOS ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-black text-sm text-white leading-tight">
              Masaüstüne &amp; Ana Ekrana Ekle
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Domain engellense bile tek tıkla her zaman güncel adrese kesintisiz ulaşın.
            </p>
          </div>
        </div>

        {/* iOS İpucu Kutusu */}
        {showIOSTip && isIOS && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs flex flex-col gap-1 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold">
              <span>1.</span>
              <Share className="w-3.5 h-3.5 text-amber-400" />
              <span>Safari altındaki <strong>Paylaş</strong> simgesine dokunun.</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span>2.</span>
              <PlusSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Aşağı kaydırıp <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçin.</span>
            </div>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Daha Sonra
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Nasıl Eklenir?' : 'Hemen Ekle (Kısayol)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
