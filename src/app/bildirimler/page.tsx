'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellRing,
  ChevronLeft,
  User,
  Headphones,
  CheckCheck,
  Check,
  Sparkles,
  ExternalLink,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  X,
  Flame,
  Crown,
  Megaphone,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  url: string;
  imageUrl?: string;
  type: 'admin_broadcast' | 'announcement_bar' | 'new_listing' | 'pwa_prompt' | 'system';
  badge: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitorId, setVisitorId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'admin' | 'listings'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  // PWA Kurulum Durumu
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaCardDismissed, setPwaCardDismissed] = useState(false);

  // 1. Visitor ID ve PWA Kontrolleri
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let vId = localStorage.getItem('analytics_visitor_id');
    if (!vId) {
      vId = 'v_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('analytics_visitor_id', vId);
    }
    setVisitorId(vId);

    const ua = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('pwa_installed_success') === 'true';
    setPwaInstalled(isStandalone);

    if (sessionStorage.getItem('pwa_bildirim_card_dismissed') === 'true') {
      setPwaCardDismissed(true);
    }

    const handlePrompt = (e: any) => {
      setDeferredPrompt(e);
      (window as any).__pwaPrompt = e;
    };
    if ((window as any).__pwaPrompt) {
      setDeferredPrompt((window as any).__pwaPrompt);
    }
    window.addEventListener('beforeinstallprompt', handlePrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  // 2. Bildirimleri Çek
  const fetchNotifications = useCallback(async (vId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?visitorId=${encodeURIComponent(vId)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visitorId) {
      fetchNotifications(visitorId);
    }
  }, [visitorId, fetchNotifications]);

  // 3. Tek Bildirimi Okundu Yap ve Yönlendir
  const handleMarkAsRead = async (notificationId: string, targetUrl?: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );

      fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, visitorId }),
      }).catch(() => {});

      if (targetUrl) {
        if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
          window.open(targetUrl, '_blank');
        } else {
          router.push(targetUrl);
        }
      }
    } catch (_) {}
  };

  // 4. Tümünü Okundu Yap
  const handleMarkAllAsRead = async () => {
    if (!visitorId || markingAll) return;
    setMarkingAll(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, visitorId }),
      });
    } catch (err) {
      console.error('Tümü okundu yapılamadı:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  // 5. PWA Yükleme Tetikleyici
  const handleInstallClick = async () => {
    if (isIOS) {
      setShowPwaGuide(true);
      return;
    }
    const activePrompt = deferredPrompt || (typeof window !== 'undefined' && (window as any).__pwaPrompt);
    if (activePrompt && typeof activePrompt.prompt === 'function') {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setPwaInstalled(true);
          localStorage.setItem('pwa_installed_success', 'true');
        }
        setDeferredPrompt(null);
        return;
      } catch (e) {
        console.warn('Native prompt hatası:', e);
      }
    }
    setShowPwaGuide(true);
  };

  // Filtreleme
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'admin') return n.type === 'admin_broadcast' || n.type === 'announcement_bar';
    if (activeTab === 'listings') return n.type === 'new_listing';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes < 1) return 'Az önce';
      if (minutes < 60) return `${minutes} dk önce`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} sa önce`;
      const days = Math.floor(hours / 24);
      return `${days} gün önce`;
    } catch (_) {
      return '';
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'admin_broadcast':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'announcement_bar':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'new_listing':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5 pb-24 text-left">
      {/* ── ÜST BAR: ANASAYFAYA DÖNÜŞ, PANELİM (PERSONEL) VE CANLI DESTEK ──────────────── */}
      <div className="flex items-center justify-between border-b border-[#30363d]/60 pb-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors py-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-medium">Anasayfa</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/panelim"
            className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-amber-400 font-bold text-xs border border-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 font-heading"
          >
            <User className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Panelim</span>
          </Link>

          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 font-heading uppercase tracking-wider cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Destek</span>
          </button>
        </div>
      </div>

      {/* ── SAYFA BAŞLIĞI & AKSİYONLAR ──────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-heading font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>BİLDİRİM MERKEZİ</span>
            </span>
            {unreadCount > 0 && (
              <span className="text-[11px] text-rose-400 font-bold font-mono">
                {unreadCount} Okunmamış
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-[11px] text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{markingAll ? 'Okundu...' : 'Tümünü Okundu Yap'}</span>
            </button>
          )}
        </div>

        <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2 mt-0.5">
          <BellRing className="w-6 h-6 text-amber-400 shrink-0" />
          <span>Bildirimler &amp; Canlı Akış</span>
        </h1>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          Sitedeki en yeni VIP ilanlar, özel duyurular ve yönetici mesajları anlık olarak burada listelenir.
        </p>
      </div>

      {/* ── 5. UYGULAMAYI YÜKLE VIP KARTI (Bildirimler Sayfasına Entegre) ──────────────── */}
      {!pwaInstalled && !pwaCardDismissed && (
        <div className="rounded-2xl bg-[#161b22] border border-amber-500/40 p-3.5 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0d1117] border border-amber-500/30 p-1 flex items-center justify-center shrink-0">
              <Image
                src="/favicon-120x120.png"
                alt="App"
                width={28}
                height={28}
                className="rounded-lg object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xs text-white truncate">
                  VIP Mobil Uygulaması
                </span>
                <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                  RESMİ
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] truncate mt-0.5">
                BTK engelsiz kesintisiz VIP erişim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer uppercase"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Yükle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPwaCardDismissed(true);
                sessionStorage.setItem('pwa_bildirim_card_dismissed', 'true');
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── FİLTRELEME SEKMELERİ (MOBİL UYUMLU 4'LÜ IZGARA - KAYDIRMA YOK, SIFIR TAŞMA) ──────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#161b22] border border-[#30363d]/80 text-xs font-heading font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Tümü</span>
          <span className="text-[10px] opacity-75 font-mono">({notifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-rose-500 text-white font-black shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Okunmamış</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold">
              +{unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'admin'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 shrink-0" />
          <span>Duyurular</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-white/5'
          }`}
        >
          <Crown className="w-3.5 h-3.5 shrink-0" />
          <span>İlanlar</span>
        </button>
      </div>

      {/* ── BİLDİRİMLER LİSTESİ ──────────────── */}
      {loading ? (
        <div className="py-14 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs font-heading font-bold">Bildirimler yükleniyor...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-12 px-4 rounded-3xl bg-[#161b22] border border-[#30363d]/80 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center text-slate-400 border border-[#30363d]">
            <Bell className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-black text-white text-sm">
              {activeTab === 'unread' ? 'Tüm Bildirimleri Okudunuz' : 'Henüz Bildirim Yok'}
            </h3>
            <p className="text-xs text-[#8b949e] max-w-xs mx-auto">
              {activeTab === 'unread'
                ? 'Okunmamış yeni bildiriminiz bulunmuyor.'
                : 'Yeni VIP ilanlar ve yönetici duyuruları yayınlandığında burada görünecektir.'}
            </p>
          </div>
          {activeTab !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all"
            >
              Tümünü Göster
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotifications.map((notif) => {
            const hasImage = Boolean(notif.imageUrl && notif.imageUrl.trim());

            return (
              <div
                key={notif._id}
                onClick={() => handleMarkAsRead(notif._id, notif.url)}
                className={`group rounded-2xl transition-all cursor-pointer p-3.5 flex flex-col gap-2.5 border ${
                  !notif.isRead
                    ? 'bg-gradient-to-r from-[#1c180e] via-[#161b22] to-[#161b22] border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-[#161b22] hover:bg-[#1a202c] border-[#30363d]/70'
                }`}
              >
                {/* 1. SATIR: ROZET, TARİH VE OKUNDU/OKUNMADI DURUMU */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-black border ${getBadgeClass(
                        notif.type
                      )}`}
                    >
                      {notif.badge}
                    </span>
                    <span className="text-[10px] text-[#8b949e] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#8b949e]" />
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                    </span>
                  </div>

                  {!notif.isRead ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>YENİ</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Okundu
                    </span>
                  )}
                </div>

                {/* 2. SATIR: GÖRSEL + BAŞLIK & METİN */}
                <div className="flex items-start gap-3">
                  {hasImage ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#0d1117]">
                      <img
                        src={notif.imageUrl}
                        alt={notif.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#0d1117] border border-white/10 flex items-center justify-center shrink-0">
                      {notif.type === 'new_listing' ? (
                        <Crown className="w-5 h-5 text-emerald-400" />
                      ) : notif.type === 'announcement_bar' ? (
                        <Flame className="w-5 h-5 text-amber-400" />
                      ) : notif.type === 'admin_broadcast' ? (
                        <Megaphone className="w-5 h-5 text-rose-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-heading font-black text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-[#8b949e] line-clamp-2 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* 3. SATIR: İNCELE BUTONU (TAM GENİŞLİK, DOKUNMA DOSTU) */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-heading font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                  <span className="text-[11px] text-[#8b949e]">Detayları görüntülemek için dokunun</span>
                  <div className="flex items-center gap-1">
                    <span>İncele</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MANUEL PWA KURULUM MODALI ──────────────── */}
      {showPwaGuide && (
        <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#161b22] border border-amber-500/40 p-5 shadow-2xl text-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-black text-sm text-white">
                  {isIOS ? 'iPhone / iPad Kurulumu' : 'Cihazınıza Yükleyin'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-300">
              {isIOS ? (
                <>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <Share className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1. Safari alt menüsündeki <strong>Paylaş</strong> simgesine dokunun.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <PlusSquare className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>2. Aşağı kaydırıp <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçin.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <MoreVertical className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1. Tarayıcı menüsündeki <strong>üç nokta (⋮)</strong> simgesine dokunun.</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d1117] border border-white/5">
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. <strong>&apos;Uygulamayı Yükle&apos;</strong> veya <strong>&apos;Ana Ekrana Ekle&apos;</strong> seçin.</span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPwaGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs text-center transition-all cursor-pointer font-heading uppercase"
            >
              Tamamdır
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
