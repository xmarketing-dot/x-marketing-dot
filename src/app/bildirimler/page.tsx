'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellRing,
  ChevronLeft,
  KeyRound,
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

  // 3. Tek Bildirimi Okundu Yap
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
      if (hours < 24) return `${hours} saat önce`;
      const days = Math.floor(hours / 24);
      return `${days} gün önce`;
    } catch (_) {
      return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin_broadcast':
        return <Megaphone className="w-4 h-4 text-rose-400" />;
      case 'announcement_bar':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'new_listing':
        return <Crown className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
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
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full pb-20 text-left">
      {/* ── ÜST BAR: GERİ DÖNÜŞ, PANELİM VE CANLI DESTEK ──────────────── */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anasayfa</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/panelim"
            className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 font-black text-xs border border-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 font-heading"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Panelim</span>
          </Link>

          <button
            onClick={() => router.push('/chat')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 font-heading uppercase tracking-wider cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Canlı Destek</span>
          </button>
        </div>
      </div>

      {/* ── SAYFA BAŞLIĞI & AKSİYONLAR ──────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-heading font-black flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>BİLDİRİM MERKEZİ</span>
            </span>
            {unreadCount > 0 && (
              <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {unreadCount} Okunmamış Bildirim
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-bold"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>{markingAll ? 'İşleniyor...' : 'Tümünü Okundu Say'}</span>
            </button>
          )}
        </div>

        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
          <BellRing className="w-7 h-7 text-amber-400" />
          <span>Bildirimler &amp; Canlı Akış</span>
        </h1>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          Best Eskort ağındaki en yeni VIP ilanlar, özel duyurular ve yönetici mesajları anlık olarak burada listelenir.
        </p>
      </div>

      {/* ── 5. UYGULAMAYI YÜKLE VIP KARTI (Bildirimler Sayfasına Entegre) ──────────────── */}
      {!pwaInstalled && (
        <aside
          aria-label="Uygulama Yükleme Alanı"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c180e] via-[#161b22] to-[#161b22] border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-[#0d1117] border border-amber-500/40 p-1 flex items-center justify-center shrink-0 shadow-lg">
              <Image
                src="/favicon-120x120.png"
                alt="Best Eskort App"
                width={38}
                height={38}
                className="rounded-xl object-contain"
              />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-[#0d1117]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-sm text-white">
                  Best Eskort VIP Mobil Uygulaması
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  RESMİ
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-0.5">
                BTK engeli olmadan tek tıkla VIP ilanlara ve canlı sohbete kesintisiz erişin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer uppercase tracking-wider"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Uygulamayı Yükle</span>
          </button>
        </aside>
      )}

      {/* ── FİLTRELEME SEKMELERİ ──────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#30363d] text-xs font-heading font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white hover:bg-[#21262d] border border-[#30363d]'
          }`}
        >
          <span>Tümü</span>
          <span className="px-1.5 py-0.2 rounded-md bg-black/20 text-[10px] font-mono">
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white hover:bg-[#21262d] border border-[#30363d]'
          }`}
        >
          <span>Okunmamış</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[10px] font-mono font-bold">
              +{unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'admin'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white hover:bg-[#21262d] border border-[#30363d]'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Duyurular &amp; Yönetici</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white hover:bg-[#21262d] border border-[#30363d]'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Yeni İlanlar</span>
        </button>
      </div>

      {/* ── BİLDİRİMLER LİSTESİ ──────────────── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs font-heading font-bold">Bildirimler yükleniyor...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#21262d] flex items-center justify-center text-slate-400 border border-[#30363d]">
            <Bell className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-black text-white text-base">
              {activeTab === 'unread' ? 'Tüm Bildirimleri Okudunuz' : 'Henüz Bildirim Yok'}
            </h3>
            <p className="text-xs text-[#8b949e] max-w-sm">
              {activeTab === 'unread'
                ? 'Okunmamış yeni bildiriminiz kalmadı. Yeni duyurular ve ilanlar eklendiğinde burada görünecektir.'
                : 'Sisteme yeni VIP ilanlar ve yönetici duyuruları eklendikçe burada anında yayınlanacaktır.'}
            </p>
          </div>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="mt-2 px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all"
            >
              Tüm Bildirimleri Göster
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
                className={`group relative p-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 border ${
                  !notif.isRead
                    ? 'bg-gradient-to-r from-[#1c180e] via-[#161b22] to-[#161b22] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-[#161b22] hover:bg-[#1a202c] border-[#30363d]/80'
                }`}
              >
                {/* Okunmadı Noktası */}
                {!notif.isRead && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50 animate-pulse" />
                )}

                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Fotoğraf veya İkon */}
                  {hasImage ? (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[#0d1117] shadow-md">
                      <img
                        src={notif.imageUrl}
                        alt={notif.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#0d1117] border border-white/10 flex items-center justify-center shrink-0 shadow-md">
                      {getTypeIcon(notif.type)}
                    </div>
                  )}

                  {/* Metin İçeriği */}
                  <div className="flex flex-col min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-black border ${getBadgeClass(
                          notif.type
                        )}`}
                      >
                        {notif.badge}
                      </span>
                      <span className="text-[10px] text-[#8b949e] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notif.createdAt)}</span>
                      </span>
                    </div>

                    <h4 className="font-heading font-black text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-[#8b949e] line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Aksiyon Butonu */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-xs font-heading font-black text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                    <span>İncele</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
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
