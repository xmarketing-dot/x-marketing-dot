'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, X, ShieldCheck, Share, PlusSquare, ArrowRight, Laptop, Smartphone } from 'lucide-react';

export default function AddToHomeScreenPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  // ── KURULUMU ANALİTİK VERİTABANINA BİLDİRME (%100 GERÇEK SAYIM) ──
  const recordInstallEvent = useCallback(async (method: string) => {
    try {
      if (typeof window === 'undefined') return;
      
      if (localStorage.getItem('pwa_install_recorded')) {
        return;
      }
      localStorage.setItem('pwa_install_recorded', 'true');
      localStorage.setItem('pwa_installed_success', 'true');
      setIsInstalledSuccess(true);
      setIsVisible(false);

      const visitorId = localStorage.getItem('analytics_visitor_id') || ('v_' + Math.random().toString(36).substring(2, 9));
      const sessionId = sessionStorage.getItem('analytics_session_id') || ('s_' + Math.random().toString(36).substring(2, 9));

      const ua = window.navigator.userAgent.toLowerCase();
      const platform = /iphone|ipad|ipod/.test(ua) ? 'ios' : (/android|mobile/.test(ua) ? 'android' : 'desktop');
      const browser = /chrome|crios/.test(ua) ? 'Chrome' : (/safari/.test(ua) ? 'Safari' : 'Other');

      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          sessionId,
          eventType: 'pwa_install',
          targetTitle: 'Best Eskort PWA Kurulumu (' + platform.toUpperCase() + ')',
          targetCity: 'Türkiye',
          path: window.location.pathname,
          metadata: {
            method,
            platform,
            browser,
            installedAt: new Date().toISOString(),
          },
        }),
      });
      console.log('✅ Best Eskort PWA Kurulumu başarıyla veritabanına kaydedildi:', method, platform);
    } catch (err) {
      console.debug('PWA install log error:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Service Worker Kaydı
    if ('serviceWorker' in navigator) {
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

    // 2. Standalone kontrolü
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('utm_source=pwa');

    if (isApp) {
      setIsStandalone(true);
      recordInstallEvent('standalone_launch');
      return;
    }

    if (localStorage.getItem('pwa_installed_success') === 'true') {
      setIsInstalledSuccess(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(ua) || window.innerWidth < 768;
    setIsIOS(isIosDevice);
    setIsMobile(isMobileDevice);

    // 3. W3C Standart `appinstalled` Olayı
    const handleAppInstalled = () => {
      recordInstallEvent('appinstalled_event');
      setIsInstalledSuccess(true);
      setIsVisible(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. Chrome / Edge `beforeinstallprompt` dinle
    const handleBeforeInstallPrompt = (e: Event) => {
      setDeferredPrompt(e);

      // MOBİLDE CHROME'UN KENDİ YEREL POPUP'I ÇIKSIN! (preventDefault çağırma!)
      if (isMobileDevice) {
        setIsVisible(false);
        return;
      }

      // MASAÜSTÜNDE
      e.preventDefault();
      setTimeout(() => setIsVisible(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Masaüstünde fallback
    let fallbackTimer: any = null;
    if (!isMobileDevice) {
      fallbackTimer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [recordInstallEvent]);

  // Yükle butonuna basıldığında
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          recordInstallEvent('prompt_accepted');
          setIsVisible(false);
          setIsInstalledSuccess(true);
        } else {
          setIsMinimized(true);
        }
        setDeferredPrompt(null);
      } catch {
        setIsMinimized(true);
      }
    } else {
      setShowIOSTip(true);
    }
  };

  const handleDismissToPill = () => {
    setIsMinimized(true);
    setShowIOSTip(false);
  };

  if (isStandalone || isInstalledSuccess) {
    return null;
  }

  return (
    <>
      {/* ── 1. MOBİLDE VEYA MASAÜSTÜNDE KÜÇÜLTÜLMÜŞ DURUM: YÜZEN BUTON ── */}
      {(isMinimized || (isMobile && !isVisible && !isStandalone && !isInstalledSuccess)) && (
        <aside
          aria-label="Uygulamayı Yükle Kısayolu"
          className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[999980] animate-in fade-in zoom-in-95 duration-200 select-none"
        >
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#0d1117]/95 hover:bg-[#161b22] text-white border border-rose-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-white/10 active:scale-95 transition-all cursor-pointer group"
            title="Best Eskort'u Cihaza Yükle"
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-rose-600/30 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-white pr-1">
              {isMobile ? 'Uygulamayı Yükle' : 'Masaüstüne Ekle'}
            </span>
          </button>
        </aside>
      )}

      {/* ── 2. iOS SAFARI BİLGİLENDİRME MODALI ── */}
      {showIOSTip && isIOS && (
        <aside
          aria-label="iOS Kurulum Rehberi"
          className="fixed bottom-20 inset-x-3 sm:max-w-[380px] sm:left-auto sm:right-5 z-[999995] animate-in fade-in slide-in-from-bottom-4 duration-300 select-none"
        >
          <div className="p-4 rounded-2xl bg-[#0d1117]/98 text-white border border-rose-500/40 shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                iPhone / iPad Kurulumu
              </span>
              <button
                type="button"
                onClick={() => setShowIOSTip(false)}
                className="p-1 text-[#8b949e] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Share className="w-4 h-4 text-rose-400 shrink-0" />
                <span>1. Safari alt çubuğundaki <strong>Paylaş</strong> butonuna dokunun.</span>
              </div>
              <div className="flex items-center gap-2">
                <PlusSquare className="w-4 h-4 text-rose-400 shrink-0" />
                <span>2. Menüden <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçeneğine basın.</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── 3. MASAÜSTÜ İÇİN KURUMSAL ADRES ÇUBUĞU BİLDİRİM KARTI (SADECE MASAÜSTÜNDE ÇIKAR) ── */}
      {isVisible && !isMobile && !isMinimized && (
        <aside
          aria-label="Uygulama Yükleme Bildirimi"
          className="fixed top-5 right-5 max-w-[400px] z-[999990] animate-in fade-in slide-in-from-top-4 duration-300 select-none hidden sm:block"
        >
          <div className="p-4 rounded-2xl bg-[#0d1117]/98 text-white border border-rose-950/60 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-white/10 flex flex-col gap-3">
            
            {/* ÜST BAR */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Doğrulanmış Web Uygulaması</span>
              </div>

              <button
                type="button"
                onClick={handleDismissToPill}
                className="p-1 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Küçült"
                aria-label="Bildirimi Küçült"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* İÇERİK */}
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#161b22] to-[#21262d] border border-rose-500/40 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                <Image
                  src="/icon-192.png"
                  alt="Best Eskort Logo"
                  width={44}
                  height={44}
                  className="rounded-lg object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-heading font-black text-sm text-white leading-tight truncate">
                    Best Eskort
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                    VIP RESMİ
                  </span>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-1 leading-snug">
                  BTK engellerinden etkilenmeden, bilgisayarınızdan kesintisiz doğrudan VIP vitrine erişin.
                </p>
              </div>
            </div>

            {/* CHROME ADRES ÇUBUĞU SİMÜLASYONU */}
            <div className="p-2.5 rounded-xl bg-[#161b22] border border-[#30363d]/80 text-[11px] text-[#c9d1d9] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] text-[#8b949e] font-mono">
                <span>🌐 Google Chrome Adres Çubuğu</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Masaüstü Kurulum
                </span>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0d1117] border border-[#21262d] text-[11px] font-mono">
                <span className="text-slate-400 truncate">https://besteskort.online</span>
                <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] shrink-0 animate-pulse">
                  <Download className="w-3 h-3" />
                  <span>Yükle (⊕)</span>
                </span>
              </div>

              <p className="text-[10px] text-[#8b949e] leading-tight">
                Chrome adres çubuğundaki <strong className="text-white">⊕ Yükle</strong> simgesine tıklayabilir veya aşağıdaki butonu kullanabilirsiniz.
              </p>
            </div>

            {/* BUTONLAR */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#21262d]">
              <button
                type="button"
                onClick={handleDismissToPill}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#8b949e] hover:text-white transition-colors cursor-pointer"
              >
                Daha Sonra
              </button>
              
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-heading font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Chrome ile Yükle</span>
                <ArrowRight className="w-3 h-3 ml-0.5 opacity-80" />
              </button>
            </div>

          </div>
        </aside>
      )}
    </>
  );
}
