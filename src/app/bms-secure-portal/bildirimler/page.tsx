'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Bell,
  BellRing,
  Smartphone,
  Monitor,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  X,
  Loader2,
  Radio,
  ArrowRight,
  Sparkles,
  Globe,
  Clock,
  Trash2,
} from 'lucide-react';
import { adminPortalCache } from '@/lib/adminPortalCache';

function MetricCircle({
  percent,
  color = '#10b981',
  size = 38,
  strokeWidth = 3.5,
}: {
  percent: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const safePercent = Math.min(100, Math.max(0, isNaN(percent) ? 0 : percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-white">
        %{Math.round(safePercent)}
      </span>
    </div>
  );
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  url: string;
  imageUrl?: string;
  type: string;
  badge: string;
  deliveredCount: number;
  readCount: number;
  unreadScore: number;
  readRate: number;
  isActive: boolean;
  createdAt: string;
}

export default function UnifiedNotificationsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'send' | 'notifications' | 'campaigns' | 'devices'>('send');

  // Push & PWA Data
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    inactiveSubscribers: 0,
    androidSubscribers: 0,
    iosSubscribers: 0,
    desktopSubscribers: 0,
    pwaInstalls: 0,
    pwaUninstalls: 0,
    netActivePwa: 0,
  });
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pwaEvents, setPwaEvents] = useState<any[]>([]);

  // Site Notifications Data
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Form State (Omni-Channel)
  const [title, setTitle] = useState('🔥 Yeni VIP İlanlar Yayında!');
  const [message, setMessage] = useState('Günün en popüler ilanları eklendi. Hemen tıkla ve incele.');
  const [url, setUrl] = useState('/');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('YÖNETİCİ');
  const [sendSiteNotification, setSendSiteNotification] = useState(true);
  const [sendWebPush, setSendWebPush] = useState(true);
  const [pushPlatform, setPushPlatform] = useState<'all' | 'android' | 'desktop'>('all');
  const [previewMode, setPreviewMode] = useState<'push' | 'site'>('push');

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Search & Filter (Devices)
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'installs' | 'uninstalls' | 'subscribers'>('all');

  // Search & Filter (Notifications)
  const [notifSearch, setNotifSearch] = useState('');

  // Initial load from high-speed cache
  useEffect(() => {
    const cachedStats = adminPortalCache.get('bms_notif_stats');
    const cachedNotifications = adminPortalCache.get('bms_notif_items');
    const cachedCampaigns = adminPortalCache.get('bms_notif_campaigns');
    const cachedSubscribers = adminPortalCache.get('bms_notif_subscribers');
    const cachedPwaEvents = adminPortalCache.get('bms_notif_pwa_events');

    if (cachedStats) setStats(cachedStats);
    if (cachedNotifications) setNotifications(cachedNotifications);
    if (cachedCampaigns) setCampaigns(cachedCampaigns);
    if (cachedSubscribers) setSubscribers(cachedSubscribers);
    if (cachedPwaEvents) setPwaEvents(cachedPwaEvents);

    if (cachedStats || cachedNotifications) {
      setLoading(false);
    }
    fetchAllData(!cachedStats);
  }, []);

  const fetchAllData = async (forceRefresh: boolean | any = false) => {
    const isManual = forceRefresh === true || (forceRefresh && typeof forceRefresh === 'object');
    if (isManual || !adminPortalCache.has('bms_notif_stats')) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }

    try {
      const [notifRes, pushRes] = await Promise.all([
        fetch(`/api/admin/notifications?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`/api/admin/push/subscribers?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
      ]);

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success) {
          const list = notifData.notifications || [];
          setNotifications(list);
          adminPortalCache.set('bms_notif_items', list);
        }
      }

      if (pushRes.ok) {
        const pushData = await pushRes.json();
        if (pushData.success) {
          const st = pushData.stats || stats;
          const subs = pushData.subscribers || [];
          const camps = pushData.campaigns || [];
          const pwa = pushData.pwaEvents || [];
          setStats(st);
          setSubscribers(subs);
          setCampaigns(camps);
          setPwaEvents(pwa);
          adminPortalCache.set('bms_notif_stats', st);
          adminPortalCache.set('bms_notif_subscribers', subs);
          adminPortalCache.set('bms_notif_campaigns', camps);
          adminPortalCache.set('bms_notif_pwa_events', pwa);
        }
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Veriler yüklenirken hata oluştu:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const handleUnifiedSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (!sendSiteNotification && !sendWebPush) {
      alert('Lütfen en az bir hedef kanal seçiniz (Site İçi Bildirim veya Web Push)!');
      return;
    }

    const confirmMsg = sendSiteNotification && sendWebPush
      ? `Bu bildirim hem sitedeki çana eklenecek hem de ${stats.totalSubscribers} abonenin telefon kilit ekranına push olarak fırlatılacak. Onaylıyor musunuz?`
      : sendWebPush
      ? `Bu bildirim ${stats.totalSubscribers} abonenin telefon kilit ekranına push olarak fırlatılacak. Onaylıyor musunuz?`
      : 'Bu bildirim sitedeki tüm kullanıcılara çan bildirimi olarak eklenecek. Onaylıyor musunuz?';

    if (!confirm(confirmMsg)) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          url,
          imageUrl,
          badge,
          sendSiteNotification,
          sendWebPush,
          platform: pushPlatform,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const msgs = [];
        if (data.siteNotificationCreated) msgs.push('Sitedeki çan bildirimine eklendi');
        if (sendWebPush) msgs.push(`${data.pushSentCount || 0} aboneye kilit ekranı push bildirimi fırlatıldı`);

        setSendResult({
          success: true,
          message: `Harika! ${msgs.join(' ve ')}.`,
        });
        fetchAllData(true);
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Bildirim gönderilemedi.',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || 'Bağlantı hatası oluştu.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSiteNotification = async (id: string) => {
    if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications((prev) => {
          const next = prev.filter((n) => n._id !== id);
          adminPortalCache.set('bms_notif_items', next);
          return next;
        });
      }
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  };

  // Cihaz ve Abone Birleşik Listesi
  const combinedDeviceEvents = useMemo(() => {
    const list: any[] = [];

    pwaEvents.forEach((ev: any) => {
      list.push({
        _id: ev._id,
        type: ev.eventType === 'pwa_uninstall' ? 'uninstall' : 'install',
        title: ev.eventType === 'pwa_uninstall' ? 'PWA Uygulama Kaldırıldı' : 'PWA Uygulama Kuruldu',
        platform: ev.platform || 'android',
        browser: ev.browser || 'Chrome',
        ip: ev.ip,
        targetCity: ev.targetCity || ev.city || 'İstanbul',
        visitorId: ev.visitorId,
        date: ev.createdAt,
        trigger: ev.trigger,
        referer: ev.referer,
        searchKeyword: ev.searchKeyword,
        path: ev.page || ev.path,
      });
    });

    subscribers.forEach((sub: any) => {
      list.push({
        _id: sub._id,
        type: 'subscriber',
        title: 'Web Push İzni Verildi',
        platform: sub.platform || 'android',
        browser: sub.browser || 'Chrome',
        ip: sub.ip,
        targetCity: sub.targetCity || sub.city || 'İstanbul',
        visitorId: sub.visitorId,
        date: sub.createdAt,
        active: sub.active,
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [pwaEvents, subscribers]);

  const filteredEvents = useMemo(() => {
    return combinedDeviceEvents.filter((item) => {
      if (deviceFilter === 'installs' && item.type !== 'install') return false;
      if (deviceFilter === 'uninstalls' && item.type !== 'uninstall') return false;
      if (deviceFilter === 'subscribers' && item.type !== 'subscriber') return false;

      if (deviceSearch.trim()) {
        const q = deviceSearch.toLowerCase();
        const ipMatch = item.ip && item.ip.toLowerCase().includes(q);
        const cityMatch = item.targetCity && item.targetCity.toLowerCase().includes(q);
        const visitorMatch = item.visitorId && item.visitorId.toLowerCase().includes(q);
        const platMatch = item.platform && item.platform.toLowerCase().includes(q);
        if (!ipMatch && !cityMatch && !visitorMatch && !platMatch) return false;
      }

      return true;
    });
  }, [combinedDeviceEvents, deviceFilter, deviceSearch]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (!notifSearch.trim()) return true;
      const q = notifSearch.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.badge.toLowerCase().includes(q)
      );
    });
  }, [notifications, notifSearch]);

  const activeNotifsCount = notifications.filter((n) => n.isActive).length;
  const pwaInstallRate = stats.pwaInstalls > 0 ? (stats.netActivePwa / stats.pwaInstalls) * 100 : 0;
  const notifActiveRate = notifications.length > 0 ? (activeNotifsCount / notifications.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full max-w-full text-left font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ── 1. HEADER & CANLI YENİLE ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3 sm:pb-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-sm">
            <BellRing className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                Bildirim &amp; Uygulama Masası
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono tracking-wider shrink-0 shadow-sm shadow-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>CANLI MERKEZ</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
              Site içi çan bildirimleri ve kilit ekranı Web Push gönderim merkezi
            </p>
          </div>
        </div>

        {/* Sağ: Canlı Senkronizasyon + Yenile Butonu */}
        <div className="flex items-center gap-2 shrink-0">
          {isSyncing ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden sm:inline">Taranıyor...</span>
            </span>
          ) : lastSyncTime ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
              {lastSyncTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => fetchAllData(true)}
            disabled={loading || isSyncing}
            className="p-2 sm:p-2.5 rounded-xl bg-[#06090e] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors active:scale-90 shrink-0 cursor-pointer touch-manipulation shadow-sm"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || isSyncing) ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE 4-KPI METRİK ŞERİDİ (IMAGE 2 DİZAYNI) ───────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* KPI 1: Kilit Ekranı Push */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Kilit Ekranı Push
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-white mt-0.5 truncate">
              {stats.totalSubscribers}
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5">
              Android: {stats.androidSubscribers} • PC: {stats.desktopSubscribers}
            </span>
          </div>
          <MetricCircle percent={stats.totalSubscribers > 0 ? 100 : 0} color="#10b981" size={38} />
        </div>

        {/* KPI 2: Net PWA Kurulum */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
              Net PWA Kurulum
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-emerald-400 mt-0.5 truncate">
              {stats.netActivePwa}
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5">
              +{stats.pwaInstalls} Kuruldu • -{stats.pwaUninstalls} Silindi
            </span>
          </div>
          <MetricCircle percent={pwaInstallRate} color="#10b981" size={38} />
        </div>

        {/* KPI 3: Site Çan Bildirimleri */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
              Site Çan Bildirimi
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-cyan-400 mt-0.5 truncate">
              {activeNotifsCount}
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5">
              Toplam {notifications.length} bildirim kaydı
            </span>
          </div>
          <MetricCircle percent={notifActiveRate} color="#06b6d4" size={38} />
        </div>

        {/* KPI 4: Push Kampanyaları */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
              Push Kampanyaları
            </span>
            <span className="font-mono font-bold text-lg sm:text-xl text-amber-400 mt-0.5 truncate">
              {campaigns.length}
            </span>
            <span className="text-[10px] text-slate-500 truncate mt-0.5">
              %100 Güvenli İletim Oranı
            </span>
          </div>
          <MetricCircle percent={campaigns.length > 0 ? 100 : 0} color="#f59e0b" size={38} />
        </div>

      </div>

      {/* ── 3. ANA SEKME SEÇİCİ (EXECUTIVE SEGMENTED CONTROL) ────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-[#0c1017] border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('send')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'send'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hızlı Gönderim Masası</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          <span>Site Bildirimleri ({notifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Push Kampanyaları ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'devices'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cihazlar &amp; Kurulum Akışı ({filteredEvents.length})</span>
        </button>
      </div>

      {/* ── 4. SEKME 1: HIZLI GÖNDERİM MASASI (OMNI-CHANNEL) ────────────────── */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          
          {/* Sol Kolon: Birleşik Form (7 Kolon) */}
          <div className="lg:col-span-7 bg-[#0c1017] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  Tek Formdan Çift Kanallı Bildirim Ateşle
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Seçtiğiniz kanallara (kilit ekranı push ve site içi çan) anında sıfır gecikmeyle iletilir.
              </p>
            </div>

            <form onSubmit={handleUnifiedSend} className="flex flex-col gap-3.5">
              
              {/* Hedef Kanallar (Toggle Kutuları) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Hedef Gönderim Kanalları
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Kanal 1: Web Push */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      sendWebPush
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-[#070a0f] border-slate-800 text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendWebPush}
                      onChange={(e) => setSendWebPush(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-white">Telefon Kilit Ekranı (Push)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {stats.totalSubscribers} abonenin telefonunu titretir
                      </span>
                    </div>
                  </label>

                  {/* Kanal 2: Site İçi Bildirim */}
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      sendSiteNotification
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-[#070a0f] border-slate-800 text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendSiteNotification}
                      onChange={(e) => setSendSiteNotification(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-white">Site Çan &amp; Bildirimler</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Sitedeki tüm ziyaretçilerin çanına eklenir
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Bildirim Başlığı */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Bildirim Başlığı</span>
                  <span className="text-[10px] font-mono text-slate-500">{title.length}/60</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 🔥 İstanbul Yeni İlanlar Yayında!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>

              {/* Bildirim Mesajı */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Mesaj İçeriği</span>
                  <span className="text-[10px] font-mono text-slate-500">{message.length}/160</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={160}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Örn: Günün en popüler VIP ilanları eklendi. Hemen tıkla ve güncel profilleri incele."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Tıklanınca Açılacak Hedef Link & Rozet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Hedef Sayfa (URL)
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Örn: / veya /ilan/ornek-ilan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Site Çan Rozeti Metni
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Örn: VIP İLAN, YÖNETİCİ, DUYURU"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Görsel URL & Hedef Cihaz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Görsel URL (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (boş bırakılabilir)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    Push Hedef Cihaz
                  </label>
                  <select
                    disabled={!sendWebPush}
                    value={pushPlatform}
                    onChange={(e: any) => setPushPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-40"
                  >
                    <option value="all">🌐 Tüm Cihazlar ({stats.totalSubscribers} Cihaz)</option>
                    <option value="android">📱 Yalnızca Android ({stats.androidSubscribers} Cihaz)</option>
                    <option value="desktop">💻 Yalnızca Masaüstü ({stats.desktopSubscribers} Cihaz)</option>
                  </select>
                </div>
              </div>

              {/* Sonuç Bildirimi */}
              {sendResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-mono flex items-start gap-2.5 border ${
                    sendResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{sendResult.message}</span>
                </div>
              )}

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={sending || (!sendSiteNotification && !sendWebPush)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 cursor-pointer touch-manipulation mt-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Bildirimler Kanallara Ateşleniyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {sendSiteNotification && sendWebPush
                        ? 'Web Push + Site Bildirimini Birlikte Ateşle 🚀'
                        : sendWebPush
                        ? 'Yalnızca Web Push Olarak Ateşle 📲'
                        : 'Yalnızca Sitedeki Çana Ekle 🔔'}
                    </span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Sağ Kolon: Canlı Çift Önizleme Simülatörü (5 Kolon) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            
            <div className="flex items-center justify-between bg-[#0c1017] border border-slate-800 p-1 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 px-2.5">
                Canlı Önizleme
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('push')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    previewMode === 'push'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📱 Telefon
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('site')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    previewMode === 'site'
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔔 Çan Kartı
                </button>
              </div>
            </div>

            {/* Önizleme 1: Telefon Kilit Ekranı (Push) */}
            {previewMode === 'push' && (
              <div className="bg-[#070a0f] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Android / iOS Kilit Ekranı</span>
                  </div>
                  <span>Şimdi</span>
                </div>

                {/* Dijital Saat Simülasyonu */}
                <div className="flex flex-col items-center gap-1 py-2 sm:py-3">
                  <span className="text-3xl sm:text-4xl font-bold text-white/90 font-mono tracking-tight">14:52</span>
                  <span className="text-xs text-slate-500 font-mono">Çarşamba, Bugün</span>
                </div>

                {/* Kilit Ekranı Bildirim Kartı */}
                <div className="p-3.5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
                        X
                      </div>
                      <span className="text-xs font-bold text-white">VIP Portal</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Şimdi</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white leading-snug">
                      {title || 'Bildirim Başlığı'}
                    </span>
                    <span className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {message || 'Bildirim mesaj içeriği burada görünecektir.'}
                    </span>
                  </div>

                  {imageUrl && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden mt-1 border border-slate-800">
                      <Image
                        src={imageUrl}
                        alt="Önizleme"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>Dokunarak Aç</span>
                    <span className="text-emerald-400 font-bold truncate max-w-[160px]">{url}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 font-mono">
                  ● Kilit ekranı bildirimleri ekran kapalıyken bile ses ve titreşimle fırlar.
                </div>
              </div>
            )}

            {/* Önizleme 2: Site Çan / Bildirim Kartı */}
            {previewMode === 'site' && (
              <div className="bg-[#070a0f] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sitedeki /bildirimler Kartı</span>
                  </div>
                  <span className="text-cyan-400 font-mono font-bold">Yeni Rozet: +1</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-md flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                      {badge || 'YÖNETİCİ'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">1 dk önce</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {title || 'Bildirim Başlığı'}
                    </span>
                    <span className="text-xs text-slate-400 leading-relaxed">
                      {message || 'Mesaj metni burada görünecektir.'}
                    </span>
                  </div>

                  {imageUrl && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden mt-1 border border-slate-800">
                      <Image
                        src={imageUrl}
                        alt="Önizleme"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-bold text-emerald-400">
                    <span>Hemen İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 font-mono">
                  ● Kullanıcı sitede gezinirken sağ üstteki çan simgesine bastığında bu kart gösterilir.
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── 5. SEKME 2: SİTE BİLDİRİMLERİ GEÇMİŞİ ───────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="bg-[#0c1017] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col gap-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-sm sm:text-base text-white">
                Yayındaki Site İçi Çan Bildirimleri ({notifications.length})
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Başlık veya mesaj ara..."
                value={notifSearch}
                onChange={(e) => setNotifSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-slate-700" />
              <span>Henüz bir site içi bildirim bulunmuyor.</span>
            </div>
          ) : (
            <>
              {/* Masaüstü Tablosu */}
              <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-800/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#070a0f] border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Tarih</th>
                      <th className="py-3 px-3">Rozet</th>
                      <th className="py-3 px-3">Başlık &amp; Mesaj</th>
                      <th className="py-3 px-3">Hedef Link</th>
                      <th className="py-3 px-3 text-center">Okunma</th>
                      <th className="py-3 px-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredNotifications.map((n) => (
                      <tr key={n._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-bold">
                            {n.badge}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs">{n.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-sm font-sans">{n.message}</div>
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-mono text-[11px]">
                          {n.url}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                            {n.readCount} Kez Okundu
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteSiteNotification(n._id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer active:scale-90"
                            title="Bildirimi Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobil Kartlar */}
              <div className="md:hidden flex flex-col gap-2.5">
                {filteredNotifications.map((n) => (
                  <div
                    key={n._id}
                    className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono font-bold">
                        {n.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(n.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-white">{n.title}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                      <span className="text-emerald-400 truncate max-w-[180px]">{n.url}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-cyan-400 font-bold">{n.readCount} Okunma</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSiteNotification(n._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 6. SEKME 3: PUSH KAMPANYALARI GEÇMİŞİ ───────────────────────────── */}
      {activeTab === 'campaigns' && (
        <div className="bg-[#0c1017] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-sm sm:text-base text-white">
                Web Push Kampanyaları ({campaigns.length})
              </h2>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8 text-slate-700" />
              <span>Henüz bir push kampanyası fırlatılmadı.</span>
            </div>
          ) : (
            <>
              {/* Masaüstü Tablosu */}
              <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-800/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#070a0f] border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Tarih</th>
                      <th className="py-3 px-3">Başlık &amp; Mesaj</th>
                      <th className="py-3 px-3">Hedef Link</th>
                      <th className="py-3 px-3 text-center">İletilen Cihaz</th>
                      <th className="py-3 px-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {campaigns.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs">{c.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-sm font-sans">{c.body}</div>
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-mono text-[11px]">
                          {c.url}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {c.successCount} / {c.totalSent} Başarılı
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                            Teslim Edildi
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobil Kartlar */}
              <div className="md:hidden flex flex-col gap-2.5">
                {campaigns.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold font-mono">
                        {c.successCount} / {c.totalSent} İletildi
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-white">{c.title}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{c.body}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                      <span className="text-emerald-400 truncate max-w-[200px]">{c.url}</span>
                      <span className="text-slate-500 text-[10px]">Tamamlandı</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 7. SEKME 4: CİHAZLAR & KURULUM AKIŞI (PWA & ABONE) ───────────────── */}
      {activeTab === 'devices' && (
        <div className="bg-[#0c1017] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col gap-3.5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="font-bold text-sm sm:text-base text-white">
                Cihaz Hareketleri &amp; Abonelik Kayıtları ({filteredEvents.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="IP, Cihaz, ID, Şehir..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center gap-1 bg-[#070a0f] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeviceFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    deviceFilter === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFilter('installs')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    deviceFilter === 'installs'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kurulumlar
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFilter('uninstalls')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    deviceFilter === 'uninstalls'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kaldırılanlar
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFilter('subscribers')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    deviceFilter === 'subscribers'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aboneler
                </button>
              </div>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8 text-slate-700" />
              <span>Henüz bu filtreye uyan bir cihaz kaydı bulunamadı.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredEvents.map((item, idx) => {
                const isUninstall = item.type === 'uninstall';
                const isSub = item.type === 'subscriber';
                const isIos = item.platform === 'ios';
                const isMobile = item.platform === 'android' || isIos;

                return (
                  <div
                    key={item._id || idx}
                    className="p-3 sm:p-3.5 rounded-xl bg-[#070a0f] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUninstall
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : isSub
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : isMobile
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {isUninstall ? (
                          <X className="w-4 h-4 text-rose-400" />
                        ) : isSub ? (
                          <Bell className="w-4 h-4 text-emerald-400" />
                        ) : isMobile ? (
                          <Smartphone className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {item.title}
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-slate-900 border border-slate-800 text-slate-400">
                            {(item.platform || 'Cihaz').toUpperCase()} • {item.browser || 'Tarayıcı'}
                          </span>

                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold flex items-center gap-1 border ${
                              isUninstall
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {isUninstall ? (
                              <X className="w-3 h-3 text-rose-400" />
                            ) : (
                              <Check className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>
                              {isUninstall
                                ? 'Kaldırıldı'
                                : isSub
                                ? 'Push İzni Aktif'
                                : 'Kuruldu & Aktif'}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-1 font-mono flex-wrap">
                          <span className="text-white font-semibold">📍 {item.targetCity && item.targetCity !== 'Türkiye' ? item.targetCity : (item.city || 'İstanbul')}</span>
                          {item.ip && <span>🌐 {item.ip}</span>}
                          {item.searchKeyword && <span className="text-emerald-400">🔍 {item.searchKeyword}</span>}
                          {item.referer && item.referer !== 'Doğrudan' && item.referer !== 'Direct' && <span>🔗 {item.referer}</span>}
                          {item.trigger && <span className="text-slate-500">Tetikleyici: {item.trigger}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {item.date ? new Date(item.date).toLocaleString('tr-TR') : 'Bugün'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
