'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare, Smartphone, Check, MoreVertical } from 'lucide-react';
import { subscribeToPushNotifications } from '@/lib/pushClient';

export default function AddToHomeScreenPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  // ── KURULUMU ANALİTİK VERİTABANINA BİLDİRME ──
  const recordInstallEvent = useCallback(async (method: string) => {
    try {
      if (typeof window === 'undefined') return;
      if (localStorage.getItem('pwa_install_recorded')) return;
      
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
          targetTitle: 'PWA Kurulumu (' + platform.toUpperCase() + ')',
          path: window.location.pathname,
          metadata: {
            method,
            platform,
            browser,
            installedAt: new Date().toISOString(),
          },
        }),
      });
      console.log('✅ PWA Kurulumu başarıyla veritabanına kaydedildi:', method);
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

    // 2. Standalone Kontrolü
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('utm_source=pwa');

    if (isApp) {
      setIsStandalone(true);
      recordInstallEvent('standalone_launch');
      subscribeToPushNotifications();
      return;
    }

    if (localStorage.getItem('pwa_installed_success') === 'true') {
      setIsInstalledSuccess(true);
      if (!localStorage.getItem('pwa_uninstall_logged')) {
        localStorage.setItem('pwa_uninstall_logged', 'true');
        fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId: localStorage.getItem('analytics_visitor_id') || 'v_anon',
            sessionId: sessionStorage.getItem('analytics_session_id') || 's_anon',
            eventType: 'pwa_uninstall',
            targetTitle: 'PWA Kaldırıldı / Tarayıcıya Dönüldü',
            path: window.location.pathname,
            metadata: {
              reason: 'browser_fallback',
              platform: /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ? 'ios' : (/android|mobile/.test(navigator.userAgent.toLowerCase()) ? 'android' : 'desktop'),
              browser: /chrome|crios/.test(navigator.userAgent.toLowerCase()) ? 'Chrome' : (/safari/.test(navigator.userAgent.toLowerCase()) ? 'Safari' : 'Other'),
              uninstalledAt: new Date().toISOString()
            }
          })
        }).catch(() => {});
      }
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 3. W3C Standart Kurulum Başarılı Olayı
    const handleAppInstalled = () => {
      recordInstallEvent('appinstalled_event');
      setIsInstalledSuccess(true);
      setIsVisible(false);
      subscribeToPushNotifications();
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. beforeinstallprompt Dinleme (Erken yakalama desteğiyle)
    const handlePrompt = (e: any) => {
      // Mobilde Chrome'un yerel panelini engellemiyoruz (preventDefault çağırmıyoruz)
      setDeferredPrompt(e);
      (window as any).__pwaPrompt = e;
    };

    if ((window as any).__pwaPrompt) {
      setDeferredPrompt((window as any).__pwaPrompt);
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);

    // 1.5 saniye sonra nazikçe bildirimi göster
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [recordInstallEvent]);

  // ── YÜKLE BUTONUNA BASILDIĞINDA (GARANTİLİ ÇALIŞMA MEKANİZMASI) ──
  const handleInstallClick = async () => {
    // iOS için Safari yönlendirmesi
    if (isIOS) {
      setShowManualGuide(true);
      return;
    }

    // Chrome / Edge / Android Prompt Kontrolü
    const activePrompt = deferredPrompt || (window as any).__pwaPrompt;

    if (activePrompt && typeof activePrompt.prompt === 'function') {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          recordInstallEvent('prompt_accepted');
          setIsVisible(false);
          setIsInstalledSuccess(true);
          setTimeout(() => {
            subscribeToPushNotifications();
          }, 1000);
        } else {
          setIsMinimized(true);
        }
        setDeferredPrompt(null);
        (window as any).__pwaPrompt = null;
        return;
      } catch (e) {
        console.warn('Native prompt call failed, showing manual guide:', e);
      }
    }

    // Eğer tarayıcı prompt'u henüz ateşlemediyse veya izin vermiyorsa doğrudan adım adım çözümü aç:
    setShowManualGuide(true);
  };

  // Uygulama yüklüyse gizle
  if (isStandalone || isInstalledSuccess) {
    return null;
  }

  return (
    <>
      {/* ── 1. MANUEL KURULUM REHBERİ (EĞER NATIVE PROMPT AÇILAMAZSA ASLA BOŞ KALMAZ) ── */}
      {showManualGuide && (
        <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#161b22] border border-blue-500/40 p-5 shadow-2xl text-white flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-heading font-black text-sm text-white">
                  {isIOS ? 'iPhone / iPad Kurulumu' : 'Telefona / Bilgisayara Yükle'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-300">
              {isIOS ? (
                <>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <Share className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1. Safari alt çubuğundaki <strong>Paylaş</strong> simgesine dokunun.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <PlusSquare className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>2. Aşağı kaydırıp <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçeneğine basın.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <MoreVertical className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1. Chrome sağ üst köşesindeki <strong>üç nokta (⋮)</strong> menüsüne dokunun.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Menüden <strong>&apos;Uygulamayı Yükle&apos;</strong> veya <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçin.</span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowManualGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-all"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* ── 2. KÜÇÜLTÜLMÜŞ YÜZEN BUTON (PİLL) ── */}
      {isMinimized && (
        <aside
          aria-label="Uygulamayı Yükle"
          className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[999980] animate-in fade-in zoom-in-95 duration-200 select-none"
        >
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d1117]/95 hover:bg-[#161b22] text-white border border-blue-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl active:scale-95 transition-all cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow-md">
              <Download className="w-3.5 h-3.5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-xs font-bold text-white pr-0.5">
              Uygulamayı Yükle
            </span>
          </button>
        </aside>
      )}

      {/* ── 3. TEK KATMANLI ŞIK BİLDİRİM BARI (KART İÇİNDE KART YOK - SIFIR KARMAŞA) ── */}
      {isVisible && !isMinimized && (
        <aside
          aria-label="Uygulama Yükleme Bildirimi"
          className="fixed top-3 inset-x-3 sm:top-5 sm:right-5 sm:left-auto sm:w-[380px] z-[999990] animate-in fade-in slide-in-from-top-4 duration-300 select-none"
        >
          <div className="p-3 rounded-2xl bg-[#0d1117]/98 text-white border border-[#30363d] shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex items-center justify-between gap-3">
            
            {/* LOGO */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#161b22] to-[#21262d] border border-blue-500/30 p-1 flex items-center justify-center shrink-0 shadow-md">
              <Image
                src="/favicon-120x120.png"
                alt="Esc Türkiye"
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
            </div>

            {/* BAŞLIK & METİN */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xs text-white truncate">
                  Esc Türkiye
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  RESMİ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                BTK engelsiz hızlı ve güvenli VIP erişim
              </p>
            </div>

            {/* AKSİYON BUTONLARI: ÇALIŞAN YÜKLE BUTONU & KAPAT */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-black text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Yükle</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </aside>
      )}
    </>
  );
}
