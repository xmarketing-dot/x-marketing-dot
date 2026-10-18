'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Filter,
  Check,
  X,
  ExternalLink,
  Loader2,
  Users,
  Radio,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Clock,
  ChevronRight,
  Flame,
  Crown,
  Megaphone,
  Eye,
  Trash2,
  Settings,
  Sliders,
  TrendingUp,
  Info
} from 'lucide-react';

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

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [notifRes, pushRes] = await Promise.all([
        fetch('/api/admin/notifications', { cache: 'no-store' }),
        fetch('/api/admin/push/subscribers', { cache: 'no-store' }),
      ]);

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success) {
          setNotifications(notifData.notifications || []);
        }
      }

      if (pushRes.ok) {
        const pushData = await pushRes.json();
        if (pushData.success) {
          setStats(pushData.stats || stats);
          setSubscribers(pushData.subscribers || []);
          setCampaigns(pushData.campaigns || []);
          setPwaEvents(pushData.pwaEvents || []);
        }
      }
    } catch (err) {
      console.error('Veriler yüklenirken hata oluştu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
        fetchAllData();
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
        setNotifications((prev) => prev.filter((n) => n._id !== id));
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

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* ── 1. HEADER & CANLI YENİLE ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d]/80 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <BellRing className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
                Bildirim &amp; Uygulama Masası
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  CANLI MERKEZ
                </span>
              </h1>
              <span className="text-xs text-[#8b949e]">
                Tek formdan hem sitedeki çan bildirimlerini hem de telefon kilit ekranı Web Push bildirimlerini yönetin.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-heading font-bold border border-[#30363d] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRİK KARTLARI (KPIS) ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Kilit Ekranı Push Aboneleri */}
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-2xl shadow-md flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider font-heading">
              Kilit Ekranı Push
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.totalSubscribers}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">Aktif Cihaz</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-mono border-t border-[#30363d]/50 pt-2">
            <span>📱 Android: {stats.androidSubscribers}</span>
            <span>•</span>
            <span>💻 Masaüstü: {stats.desktopSubscribers}</span>
          </div>
        </div>

        {/* Net PWA Kurulumları */}
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-2xl shadow-md flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider font-heading">
              Net PWA Kurulum
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.netActivePwa}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">Uygulama</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-mono border-t border-[#30363d]/50 pt-2">
            <span className="text-emerald-400">+{stats.pwaInstalls} Kuruldu</span>
            <span>•</span>
            <span className="text-rose-400">-{stats.pwaUninstalls} Silindi</span>
          </div>
        </div>

        {/* Site İçi Çan Bildirimleri */}
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-2xl shadow-md flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider font-heading">
              Site Çan Bildirimleri
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {notifications.filter((n) => n.isActive).length}
            </span>
            <span className="text-[11px] text-blue-400 font-mono font-bold">Yayında</span>
          </div>
          <div className="text-[10px] text-[#8b949e] font-mono border-t border-[#30363d]/50 pt-2">
            <span>Toplam {notifications.length} bildirim kaydı</span>
          </div>
        </div>

        {/* Kampanya Gönderimleri */}
        <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-2xl shadow-md flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider font-heading">
              Push Kampanyaları
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {campaigns.length}
            </span>
            <span className="text-[11px] text-purple-400 font-mono font-bold">Sefer Yapıldı</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono border-t border-[#30363d]/50 pt-2">
            <span>%100 Güvenli İletim Oranı</span>
          </div>
        </div>

      </div>

      {/* ── 3. ANA SEKME SEÇİCİ ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-[#161b22] border border-[#30363d] rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('send')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-black transition-all shrink-0 ${
            activeTab === 'send'
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md'
              : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>🚀 Hızlı Gönderim Masası (Omni-Channel)</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-black transition-all shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#21262d] text-white border border-[#30363d] shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Site Bildirimleri ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-black transition-all shrink-0 ${
            activeTab === 'campaigns'
              ? 'bg-[#21262d] text-white border border-[#30363d] shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>Push Kampanyaları ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-black transition-all shrink-0 ${
            activeTab === 'devices'
              ? 'bg-[#21262d] text-white border border-[#30363d] shadow-sm'
              : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cihazlar &amp; Kurulum Akışı ({filteredEvents.length})</span>
        </button>
      </div>

      {/* ── 4. SEKME 1: HIZLI GÖNDERİM MASASI (OMNI-CHANNEL) ────────────────── */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sol Kolon: Birleşik Form (7 Kolon) */}
          <div className="lg:col-span-7 bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-5">
            <div className="flex flex-col gap-1 border-b border-[#30363d]/60 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="font-heading font-black text-base sm:text-lg text-white">
                  Tek Formdan Çift Kanallı Bildirim Ateşle
                </h2>
              </div>
              <p className="text-xs text-[#8b949e]">
                Aşağıdaki formu doldurup gönderdiğinizde, seçtiğiniz kanallara (kilit ekranı push ve site çan bildirimi) sıfır gecikmeyle anında iletilir.
              </p>
            </div>

            <form onSubmit={handleUnifiedSend} className="flex flex-col gap-4 font-heading">
              
              {/* Hedef Kanallar (Toggle Kutuları) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                  Hedef Gönderim Kanalları
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Kanal 1: Web Push */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      sendWebPush
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                        : 'bg-[#0d1117] border-[#30363d] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendWebPush}
                      onChange={(e) => setSendWebPush(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span className="font-black text-xs text-white">Telefon Kilit Ekranı (Push)</span>
                      </div>
                      <span className="text-[11px] text-[#8b949e] mt-0.5">
                        {stats.totalSubscribers} abonenin telefonunu titretir
                      </span>
                    </div>
                  </label>

                  {/* Kanal 2: Site İçi Bildirim */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      sendSiteNotification
                        ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/5'
                        : 'bg-[#0d1117] border-[#30363d] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendSiteNotification}
                      onChange={(e) => setSendSiteNotification(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <span className="font-black text-xs text-white">Site Çan &amp; /bildirimler</span>
                      </div>
                      <span className="text-[11px] text-[#8b949e] mt-0.5">
                        Sitedeki tüm ziyaretçilerin çanına eklenir
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Bildirim Başlığı */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider flex items-center justify-between">
                  <span>Bildirim Başlığı</span>
                  <span className="text-[11px] font-mono text-amber-400/80 font-normal">{title.length}/60</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 🔥 İstanbul Yeni İlanlar Yayında!"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Bildirim Mesajı */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider flex items-center justify-between">
                  <span>Mesaj İçeriği</span>
                  <span className="text-[11px] font-mono text-amber-400/80 font-normal">{message.length}/160</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={160}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Örn: Günün en popüler VIP ilanları eklendi. Hemen tıkla ve güncel profilleri incele."
                  className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              {/* Tıklanınca Açılacak Hedef Link & Rozet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                    Tıklanınca Açılacak Sayfa (URL)
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Örn: / veya /ilan/buca-izmir-197my"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                    Site Çan Rozeti Metni
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Örn: VIP İLAN, YÖNETİCİ, DUYURU"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Görsel URL & Hedef Cihaz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                    Görsel / Resim URL (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (boş bırakılabilir)"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                    Push Hedef Cihaz
                  </label>
                  <select
                    disabled={!sendWebPush}
                    value={pushPlatform}
                    onChange={(e: any) => setPushPlatform(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-40"
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
                  className={`p-4 rounded-2xl text-xs font-mono flex items-start gap-3 border ${
                    sendResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{sendResult.message}</span>
                </div>
              )}

              {/* Gönder Butonu */}
              <button
                type="submit"
                disabled={sending || (!sendSiteNotification && !sendWebPush)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Bildirimler Kanallara Ateşleniyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 stroke-[2.5]" />
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

          {/* Sağ Kolon: Canlı Çift Önizleme (5 Kolon) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            <div className="flex items-center justify-between bg-[#161b22] border border-[#30363d] p-1.5 rounded-2xl">
              <span className="text-xs font-black uppercase text-[#8b949e] px-2 font-heading">
                Canlı Görünüm Simülatörü
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewMode('push')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black transition-all ${
                    previewMode === 'push'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  📱 Telefon Kilit Ekranı
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('site')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black transition-all ${
                    previewMode === 'site'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  🔔 Site Çan Kartı
                </button>
              </div>
            </div>

            {/* Önizleme 1: Telefon Kilit Ekranı (Push) */}
            {previewMode === 'push' && (
              <div className="bg-[#0d1117] border-2 border-amber-500/30 rounded-[36px] p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-[#8b949e] font-mono border-b border-[#30363d]/50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Android / iOS Kilit Ekranı</span>
                  </div>
                  <span>Şimdi</span>
                </div>

                {/* Telefon Ekranı Simülasyonu */}
                <div className="flex flex-col items-center gap-2 py-4">
                  <span className="text-4xl font-black text-white/90 font-mono tracking-tight">14:52</span>
                  <span className="text-xs text-[#8b949e] font-mono">Çarşamba, Bugün</span>
                </div>

                {/* Kilit Ekranı Bildirim Kartı */}
                <div className="p-4 rounded-2xl bg-[#161b22]/90 backdrop-blur border border-[#30363d] shadow-2xl flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
                        E
                      </div>
                      <span className="text-[11px] font-bold text-white font-heading">Best Eskort</span>
                    </div>
                    <span className="text-[10px] text-[#8b949e] font-mono">Şimdi</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-white font-heading leading-snug">
                      {title || 'Bildirim Başlığı'}
                    </span>
                    <span className="text-[11px] text-[#c9d1d9] font-sans leading-relaxed">
                      {message || 'Bildirim mesaj içeriği burada görünecektir.'}
                    </span>
                  </div>

                  {imageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mt-1 border border-[#30363d]">
                      <Image
                        src={imageUrl}
                        alt="Önizleme"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-[#30363d]/60 pt-2 mt-1 text-[10px] text-[#8b949e] font-mono">
                    <span>Dokunarak Aç</span>
                    <span className="text-amber-400 font-bold">{url}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-[#8b949e] font-mono">
                  ● Kilit ekranı bildirimleri ekran kapalıyken bile ses ve titreşimle belirir.
                </div>
              </div>
            )}

            {/* Önizleme 2: Site Çan / Bildirim Kartı */}
            {previewMode === 'site' && (
              <div className="bg-[#0d1117] border-2 border-blue-500/30 rounded-[36px] p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-[#8b949e] font-mono border-b border-[#30363d]/50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sitedeki /bildirimler Kartı</span>
                  </div>
                  <span className="text-blue-400 font-bold">Aktif Rozet: +1</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider font-mono">
                      {badge || 'YÖNETİCİ'}
                    </span>
                    <span className="text-[10px] text-[#8b949e] font-mono">1 dk önce</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm font-black text-white font-heading">
                      {title || 'Bildirim Başlığı'}
                    </span>
                    <span className="text-xs text-[#8b949e] leading-relaxed">
                      {message || 'Mesaj metni burada görünecektir.'}
                    </span>
                  </div>

                  {imageUrl && (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden mt-1 border border-[#30363d]">
                      <Image
                        src={imageUrl}
                        alt="Önizleme"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#30363d]/60 text-xs font-heading font-bold text-amber-400">
                    <span>Hemen İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-center text-[10px] text-[#8b949e] font-mono">
                  ● Kullanıcı sitede gezinirken sağ üstteki kırmızı çan rozetine tıklandığında bu kart gösterilir.
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── 5. SEKME 2: SİTE BİLDİRİMLERİ GEÇMİŞİ ───────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h2 className="font-heading font-black text-base text-white">
                Yayındaki Site İçi Çan Bildirimleri ({notifications.length})
              </h2>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Başlık veya mesaj ara..."
                value={notifSearch}
                onChange={(e) => setNotifSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-2xl flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-[#30363d]" />
              <span>Henüz bir site içi bildirim bulunmuyor.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#30363d] text-[#8b949e] font-heading uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Rozet</th>
                    <th className="py-2.5 px-3">Başlık &amp; Mesaj</th>
                    <th className="py-2.5 px-3">Hedef Link</th>
                    <th className="py-2.5 px-3 text-center">Okunma / Tıklanma</th>
                    <th className="py-2.5 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d] font-mono">
                  {filteredNotifications.map((n) => (
                    <tr key={n._id} className="hover:bg-[#0d1117]/50 transition-colors">
                      <td className="py-3 px-3 text-[#8b949e] whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          {n.badge}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-heading font-black text-white text-xs">{n.title}</div>
                        <div className="text-[11px] text-[#8b949e] truncate max-w-sm font-sans">{n.message}</div>
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-mono text-[11px]">
                        {n.url}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {n.readCount} Kez Okundu
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSiteNotification(n._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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
          )}
        </div>
      )}

      {/* ── 6. SEKME 3: PUSH KAMPANYALARI GEÇMİŞİ ───────────────────────────── */}
      {activeTab === 'campaigns' && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="font-heading font-black text-base text-white">
                Web Push Kampanyaları ({campaigns.length})
              </h2>
            </div>
          </div>

          {campaigns.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-2xl flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8 text-[#30363d]" />
              <span>Henüz bir push kampanyası fırlatılmadı.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#30363d] text-[#8b949e] font-heading uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Başlık &amp; Mesaj</th>
                    <th className="py-2.5 px-3">Hedef Link</th>
                    <th className="py-2.5 px-3 text-center">İletilen Cihaz</th>
                    <th className="py-2.5 px-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d] font-mono">
                  {campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-[#0d1117]/50 transition-colors">
                      <td className="py-3 px-3 text-[#8b949e] whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-heading font-black text-white text-xs">{c.title}</div>
                        <div className="text-[11px] text-[#8b949e] truncate max-w-sm font-sans">{c.body}</div>
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-mono text-[11px]">
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
          )}
        </div>
      )}

      {/* ── 7. SEKME 4: CİHAZLAR & KURULUM AKIŞI (PWA & ABONE) ───────────────── */}
      {activeTab === 'devices' && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="font-heading font-black text-base text-white">
                Cihaz Hareketleri &amp; Abonelik Kayıtları ({filteredEvents.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="IP, Cihaz, ID, Şehir..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400"
                />
                <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-[#30363d]">
                <button
                  onClick={() => setDeviceFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold transition-all ${
                    deviceFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setDeviceFilter('installs')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold transition-all ${
                    deviceFilter === 'installs' ? 'bg-emerald-500 text-slate-950' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  Kurulumlar
                </button>
                <button
                  onClick={() => setDeviceFilter('uninstalls')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold transition-all ${
                    deviceFilter === 'uninstalls' ? 'bg-rose-500 text-white' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  Kaldırılanlar
                </button>
                <button
                  onClick={() => setDeviceFilter('subscribers')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-heading font-bold transition-all ${
                    deviceFilter === 'subscribers' ? 'bg-amber-500 text-slate-950' : 'text-[#8b949e] hover:text-white'
                  }`}
                >
                  Push Aboneleri
                </button>
              </div>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-2xl flex flex-col items-center gap-2">
              <Smartphone className="w-8 h-8 text-[#30363d]" />
              <span>Henüz bu filtreye uyan bir cihaz kaydı bulunamadı.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredEvents.map((item, idx) => {
                const isUninstall = item.type === 'uninstall';
                const isSub = item.type === 'subscriber';
                const isIos = item.platform === 'ios';
                const isMobile = item.platform === 'android' || isIos;

                return (
                  <div
                    key={item._id || idx}
                    className={`p-3.5 sm:p-4 rounded-2xl bg-[#0d1117] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                      isUninstall
                        ? 'border-rose-500/30 hover:border-rose-400'
                        : isSub
                        ? 'border-amber-500/30 hover:border-amber-400'
                        : 'border-[#30363d] hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUninstall
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : isSub
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : isIos
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            : isMobile
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        }`}
                      >
                        {isUninstall ? (
                          <X className="w-5 h-5 text-rose-400" />
                        ) : isSub ? (
                          <Bell className="w-5 h-5 text-amber-400" />
                        ) : isMobile ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Monitor className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-black text-xs sm:text-sm text-white">
                            {item.title}
                          </span>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                              isUninstall
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : isSub
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : isIos
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : isMobile
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {(item.platform || 'Cihaz').toUpperCase()} ({item.browser || 'Tarayıcı'})
                          </span>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                              isUninstall
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : isSub
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {isUninstall ? (
                              <X className="w-3 h-3 text-rose-400" />
                            ) : isSub ? (
                              <Bell className="w-3 h-3 text-amber-400" />
                            ) : (
                              <Check className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>
                              {isUninstall
                                ? 'Kaldırıldı / Tarayıcıya Dönüldü'
                                : isSub
                                ? 'Push Bildirim Aktif'
                                : 'Kuruldu & Aktif'}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#8b949e] mt-1 font-mono flex-wrap">
                          <span className="text-white font-bold">📍 {item.targetCity && item.targetCity !== 'Türkiye' ? item.targetCity : (item.city || 'İstanbul')}</span>
                          {item.ip && <span>🌐 {item.ip}</span>}
                          {item.searchKeyword && <span className="text-amber-400">🔍 {item.searchKeyword}</span>}
                          {item.referer && item.referer !== 'Doğrudan' && item.referer !== 'Direct' && <span>🔗 {item.referer}</span>}
                          {item.trigger && <span>Tetikleyici: {item.trigger}</span>}
                          {item.visitorId && <span>ID: {item.visitorId}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[11px] font-mono font-bold block ${
                          isUninstall ? 'text-rose-400' : isSub ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
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
