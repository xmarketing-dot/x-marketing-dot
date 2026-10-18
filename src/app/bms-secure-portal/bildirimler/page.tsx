'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
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
  Smartphone,
  Eye,
  Trash2,
  Settings,
  Layers,
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
  type: 'admin_broadcast' | 'announcement_bar' | 'new_listing' | 'pwa_prompt' | 'system';
  badge: string;
  deliveredCount: number;
  readCount: number;
  unreadScore: number;
  readRate: number;
  isActive: boolean;
  createdAt: string;
}

export default function BmsNotificationsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'send' | 'list' | 'settings'>('send');

  // Form State
  const [title, setTitle] = useState('🔥 Yeni VIP İlanlar Yayında!');
  const [message, setMessage] = useState('Günün en popüler ilanları eklendi. Hemen tıkla ve incele.');
  const [url, setUrl] = useState('/');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('YÖNETİCİ');
  const [sendWebPush, setSendWebPush] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'announcement' | 'listing'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
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
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (!confirm('Bu bildirim tüm aktif kullanıcılara ve cihazlara anında fırlatılacak. Onaylıyor musunuz?')) {
      return;
    }

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
          sendWebPush,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          success: true,
          message: `Bildirim başarıyla oluşturuldu! ${
            data.pushSentCount ? `${data.pushSentCount} cihaza kilit ekranı push bildirimi ulaştırıldı.` : ''
          }`,
        });
        fetchNotifications();
        setActiveTab('list');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bildirimi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (_) {}
  };

  // Quick Templates
  const applyTemplate = (t: { title: string; message: string; url: string; badge: string }) => {
    setTitle(t.title);
    setMessage(t.message);
    setUrl(t.url);
    setBadge(t.badge);
    setSendResult(null);
  };

  // KPI Calculations
  const totalDelivered = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.deliveredCount || 0), 0),
    [notifications]
  );
  const totalRead = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.readCount || 0), 0),
    [notifications]
  );
  const totalUnreadScore = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.unreadScore || 0), 0),
    [notifications]
  );
  const avgReadRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  // Filtered Notifications
  const filteredList = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType === 'admin' && n.type !== 'admin_broadcast') return false;
      if (filterType === 'announcement' && n.type !== 'announcement_bar') return false;
      if (filterType === 'listing' && n.type !== 'new_listing') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.url.toLowerCase().includes(q) ||
          n.badge.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notifications, filterType, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full text-left">
      {/* ── ÜST BAŞLIK VE KONTROLLER ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              BMS Bildirim &amp; Skor Yönetim Merkezi
            </h1>
          </div>
          <p className="text-xs text-[#8b949e]">
            Kullanıcılara anlık bildirim fırlatın, duyuru barı entegrasyonunu yönetin ve kaç kişinin okuyup okumadığını canlı skorlayın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchNotifications}
            className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold flex items-center gap-2 border border-[#30363d] transition-all cursor-pointer font-heading"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Yenile</span>
          </button>
          <Link
            href="/bildirimler"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-2 border border-amber-500/30 transition-all font-heading"
          >
            <span>Kullanıcı Sayfası</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── KPI SKOR KARTLARI ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 font-heading">
        <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold text-[#8b949e] uppercase">Toplam Bildirim</span>
          <div className="text-2xl font-black text-white font-mono mt-2">{notifications.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-blue-500/30 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-400 uppercase">Ulaştırılan Cihaz</span>
          <div className="text-2xl font-black text-blue-400 font-mono mt-2">{totalDelivered}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-emerald-500/30 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-400 uppercase">Okuyan Kişi (Skor)</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">{totalRead}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-rose-500/30 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-bold text-rose-400 uppercase">Okumayan Skoru</span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-2">{totalUnreadScore}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-amber-500/30 shadow-md flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase">Ortalama Okunma (CTR)</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">%{avgReadRate}</div>
        </div>
      </div>

      {/* ── SEKME MENÜSÜ ──────────────── */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 font-heading text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'send'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Anlık Bildirim Fırlat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'list'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Canlı Bildirim Listesi &amp; Skorlar ({notifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Otomasyon &amp; Ayarlar</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SEKME 1: BİLDİRİM FIRLATMA KONSOLU & CANLI ÖNİZLEME
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Kolon: Gönderim Formu */}
          <div className="lg:col-span-7 bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-black text-base text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Yeni Canlı Bildirim Oluştur</span>
              </h2>
              <p className="text-xs text-[#8b949e] mt-1">
                Kullanıcıların zil ikonuna (+1 badge) ve telefon kilit ekranına doğrudan bildirim gönderin.
              </p>
            </div>

            {/* Hızlı Şablonlar */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono font-bold text-[#8b949e] uppercase">Hızlı Şablonlar:</span>
              <div className="flex flex-wrap gap-2 text-xs font-heading">
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: '🔥 Yeni VIP İlanlar Yayında!',
                      message: 'Günün en popüler doğrulanmış profilleri eklendi. Hemen inceleyin.',
                      url: '/',
                      badge: 'YENİ',
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] text-xs transition-colors"
                >
                  🔥 Yeni İlanlar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: '🌐 Kesintisiz Giriş Adresimiz Yayında!',
                      message: 'BTK engellerine takılmadan sitemize kesintisiz erişebilirsiniz.',
                      url: '/',
                      badge: 'DUYURU',
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] text-xs transition-colors"
                >
                  🌐 Giriş Adresi
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyTemplate({
                      title: '👑 Özel VIP Vitrin Fırsatı!',
                      message: 'Haftalık vitrin ilanlarında sınırlı kontenjan açıldı. Hemen ilan verin.',
                      url: '/ilan-ver',
                      badge: 'FIRSAT',
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] text-xs transition-colors"
                >
                  👑 Vitrin Fırsatı
                </button>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="flex flex-col gap-4 text-xs font-heading">
              {/* Başlık */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#8b949e] uppercase flex justify-between">
                  <span>Bildirim Başlığı</span>
                  <span className="font-mono text-amber-400">{title.length}/60</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 🔥 İstanbul Yeni İlanlar Yayında!"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Mesaj */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#8b949e] uppercase flex justify-between">
                  <span>Mesaj İçeriği</span>
                  <span className="font-mono text-amber-400">{message.length}/140</span>
                </label>
                <textarea
                  required
                  rows={3}
                  maxLength={140}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Örn: Günün en popüler ilanları eklendi. Hemen tıkla ve incele."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Hedef Link & Rozet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#8b949e] uppercase">Tıklanınca Açılacak URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Örn: / veya /ilan/model-adi"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#8b949e] uppercase">Rozet Metni</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:outline-none focus:border-amber-400"
                  >
                    <option value="YÖNETİCİ">YÖNETİCİ</option>
                    <option value="DUYURU">DUYURU</option>
                    <option value="FIRSAT">FIRSAT</option>
                    <option value="YENİ İLAN">YENİ İLAN</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              {/* Görsel URL (İsteğe Bağlı) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#8b949e] uppercase">Kapak / Görsel URL (Opsiyonel)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Örn: https://... (İlan görseli veya afiş)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Web Push Seçeneği */}
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white font-bold">
                    Web Push (Kilit ekranı sesli bildirim) olarak da fırlat
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={sendWebPush}
                  onChange={(e) => setSendWebPush(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Gönderim Sonucu */}
              {sendResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    sendResult.success
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {sendResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{sendResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer font-heading"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{sending ? 'Gönderiliyor...' : 'Bildirimi Tüm Kullanıcılara Fırlat ➔'}</span>
              </button>
            </form>
          </div>

          {/* Sağ Kolon: Canlı Telefon Mockup Önizlemesi */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#161b22] border border-[#30363d] p-5 rounded-3xl shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <span className="font-heading font-black text-xs text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Canlı Mobil Önizleme</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">KİLİT EKRANI</span>
              </div>

              {/* Telefon Ekran Çerçevesi */}
              <div className="w-full max-w-[280px] mx-auto rounded-3xl bg-[#090d16] border-2 border-[#30363d] p-3 shadow-2xl flex flex-col gap-3">
                <div className="w-16 h-1 rounded-full bg-white/20 mx-auto" />

                <div className="text-center text-white font-mono text-xl font-bold py-1">
                  14:30
                </div>

                {/* Bildirim Kartı Mockup */}
                <div className="p-3 rounded-2xl bg-[#1c2128]/95 border border-white/10 shadow-lg flex flex-col gap-1.5 text-left animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-black text-slate-950">
                        B
                      </div>
                      <span className="font-bold text-white">Best Eskort</span>
                    </div>
                    <span>şimdi</span>
                  </div>

                  <div className="text-xs font-bold text-white leading-tight font-heading">
                    {title || 'Bildirim Başlığı'}
                  </div>

                  <div className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {message || 'Bildirim mesaj içeriği burada yer alacak.'}
                  </div>
                </div>

                <div className="w-20 h-1 rounded-full bg-white/20 mx-auto mt-6" />
              </div>

              <div className="text-center text-[11px] text-[#8b949e]">
                Bu bildirim hem <strong className="text-white">/bildirimler</strong> sayfasında listelenir hem de telefon kilit ekranında gösterilir.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SEKME 2: CANLI BİLDİRİM LİSTESİ & SKORLAR
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'list' && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          {/* Arama & Filtre Çubuğu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Başlık, mesaj veya URL ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-heading font-bold overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                }`}
              >
                Tümü ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('admin')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'admin' ? 'bg-rose-500 text-white font-black' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                }`}
              >
                Yönetici
              </button>
              <button
                type="button"
                onClick={() => setFilterType('announcement')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'announcement' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                }`}
              >
                Duyuru Barı
              </button>
              <button
                type="button"
                onClick={() => setFilterType('listing')}
                className={`px-3 py-1.5 rounded-xl transition-colors ${
                  filterType === 'listing' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-[#0d1117] text-[#8b949e] hover:text-white'
                }`}
              >
                Yeni İlanlar
              </button>
            </div>
          </div>

          {/* Tablo */}
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b949e] flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-[#30363d]" />
              <span>Henüz bu filtreye uyan bildirim bulunamadı.</span>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0d1117] text-[#8b949e] uppercase text-[10px] tracking-wider font-heading">
                  <tr>
                    <th className="py-3 px-3">Rozet / Tür</th>
                    <th className="py-3 px-3">Başlık &amp; Mesaj</th>
                    <th className="py-3 px-3">Hedef URL</th>
                    <th className="py-3 px-3 text-center">Okuyan (Skor)</th>
                    <th className="py-3 px-3 text-center">Okumayan Skoru</th>
                    <th className="py-3 px-3 text-center">Okunma (CTR)</th>
                    <th className="py-3 px-3 text-right">Tarih</th>
                    <th className="py-3 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d] font-mono">
                  {filteredList.map((notif) => (
                    <tr key={notif._id} className="hover:bg-[#0d1117]/60 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {notif.badge}
                        </span>
                      </td>
                      <td className="py-3 px-3 min-w-[200px]">
                        <div className="font-heading font-black text-white text-xs">{notif.title}</div>
                        <div className="text-[11px] text-[#8b949e] line-clamp-1 font-sans">{notif.message}</div>
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-mono text-[11px] max-w-[120px] truncate">
                        {notif.url}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                          {notif.readCount} Okudu
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                          {notif.unreadScore} Okumadı
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="text-[11px] font-bold text-white">
                          %{notif.readRate}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#8b949e] whitespace-nowrap text-[11px]">
                        {new Date(notif.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDelete(notif._id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Bildirimi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ════════════════════════════════════════════════════════════
          SEKME 3: OTOMASYON & AYARLAR
      ════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-5">
          <div>
            <h2 className="font-heading font-black text-base text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Bildirim &amp; Duyuru Otomasyon Kuralları</span>
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Sistemdeki otomatik tetikleyicileri ve entegrasyon kurallarını buradan kontrol edebilirsiniz.
            </p>
          </div>

          <div className="flex flex-col gap-3 font-heading text-xs">
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white">Yeni İlan Otomatik Bildirimi</span>
                <span className="text-[#8b949e] text-[11px]">
                  Siteye yeni bir VIP ilan eklendiğinde otomatik olarak başlık ve kapak resmiyle bildirim akışına düşer.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                AKTİF
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white">Duyuru Barı Aktiflik Senkronizasyonu</span>
                <span className="text-[#8b949e] text-[11px]">
                  Site yönetimindeki duyuru barı pasife alındığında, bildirim listesindeki duyuru bildirimi de derhal otomatik gizlenir.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                AKTİF
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white">Tekil Kullanıcı Başına Okundu / Okunmadı Skorlama</span>
                <span className="text-[#8b949e] text-[11px]">
                  Her ziyaretçi için okunmamış bildirim adedi dinamik hesaplanır (+1, +2 rozeti) ve okuyan kişi sayısı veritabanında saklanır.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                AKTİF
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
