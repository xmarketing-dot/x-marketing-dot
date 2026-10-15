'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Monitor,
  Bell,
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
  Info
} from 'lucide-react';

export default function PwaAndPushManagementPage() {
  const [loading, setLoading] = useState(true);
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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'installs' | 'uninstalls' | 'subscribers'>('all');

  // Push Dispatch Form
  const [pushTitle, setPushTitle] = useState('🔥 Yeni VIP İlanlar Yayında!');
  const [pushBody, setPushBody] = useState('Günün en popüler ilanları eklendi. Hemen tıkla ve incele.');
  const [pushUrl, setPushUrl] = useState('/');
  const [pushPlatform, setPushPlatform] = useState<'all' | 'android' | 'ios' | 'desktop'>('all');
  const [sendingPush, setSendingPush] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/push/subscribers', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          setStats(d.stats || stats);
          setSubscribers(d.subscribers || []);
          setCampaigns(d.campaigns || []);
          setPwaEvents(d.pwaEvents || []);
        }
      }
    } catch (err) {
      console.error('Veri çekilemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;

    if (!confirm(`Bildirim tüm aktif cihazlara gönderilecek. Onaylıyor musunuz?`)) {
      return;
    }

    setSendingPush(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushTitle,
          body: pushBody,
          url: pushUrl,
          targetPlatform: pushPlatform,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushResult({
          success: true,
          message: data.message || `${data.successCount} cihaza başarıyla iletildi.`,
        });
        fetchData();
      } else {
        setPushResult({
          success: false,
          message: data.error || data.message || 'Bildirim gönderilemedi.',
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: err.message || 'Bağlantı hatası oluştu.',
      });
    } finally {
      setSendingPush(false);
    }
  };

  // Unified list for detailed log
  const filteredEvents = useMemo(() => {
    let list: any[] = [];

    if (activeFilter === 'subscribers') {
      list = subscribers.map((s) => ({
        _id: s._id,
        type: 'subscriber',
        platform: s.platform,
        browser: s.browser,
        ip: s.ip,
        targetCity: 'Türkiye',
        title: s.active ? 'Aktif Bildirim Abonesi' : 'Abonelik Pasif',
        date: s.createdAt,
        active: s.active,
        visitorId: s.visitorId,
      }));
    } else {
      list = pwaEvents.map((ev) => {
        const meta = ev.metadata || {};
        const isUninstall = ev.eventType === 'pwa_uninstall';
        return {
          _id: ev._id,
          type: isUninstall ? 'uninstall' : 'install',
          platform: meta.platform || 'mobile',
          browser: meta.browser || 'Chrome',
          ip: ev.ip,
          targetCity: ev.targetCity || 'Türkiye',
          title: ev.targetTitle || (isUninstall ? 'PWA Kaldırıldı / Tarayıcıya Dönüldü' : 'PWA Kurulumu'),
          date: ev.createdAt,
          trigger: meta.method || meta.reason || 'Standalone',
          visitorId: ev.visitorId,
        };
      });

      if (activeFilter === 'installs') {
        list = list.filter((i) => i.type === 'install');
      } else if (activeFilter === 'uninstalls') {
        list = list.filter((i) => i.type === 'uninstall');
      }
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        (item.ip || '').toLowerCase().includes(q) ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.platform || '').toLowerCase().includes(q) ||
        (item.browser || '').toLowerCase().includes(q) ||
        (item.visitorId || '').toLowerCase().includes(q)
    );
  }, [pwaEvents, subscribers, activeFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-left font-sans pb-16">
      
      {/* ── 1. HEADER (BAŞLIK & YENİLE) ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/20">
            <Smartphone className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-black text-lg sm:text-2xl text-white font-heading tracking-tight">
                Uygulama (PWA) &amp; Web Push Bildirim
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black font-heading flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CANLI TAKİP &amp; KONSOL
              </span>
            </div>
            <p className="text-xs text-[#8b949e] mt-0.5 truncate">
              Masaüstü ve mobil uygulamayı yükleyen cihazlar, kaldıranlar ve anlık push bildirim gönderim merkezi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-heading font-black">Verileri Yenile</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRİK KARTLARI (4'LÜ KPI ÖZETİ) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Toplam Kurulum */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8b949e] uppercase tracking-wider font-heading">
              Toplam Kurulum
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {stats.pwaInstalls}
            </span>
            <span className="text-[11px] text-[#8b949e] block mt-0.5">Tüm zamanlar kurulum adedi</span>
          </div>
        </div>

        {/* Net Aktif PWA */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-emerald-500/40 flex flex-col justify-between shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-heading">
              Net Aktif Kullanıcı
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {stats.netActivePwa}
            </span>
            <span className="text-[11px] text-emerald-500/80 block mt-0.5">Fiilen cihazında yüklü olanlar</span>
          </div>
        </div>

        {/* Anlık Push Bildirim Abonesi */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-amber-500/40 flex flex-col justify-between shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-heading">
              Push Abone Cihaz
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {stats.totalSubscribers}
              </span>
              <span className="text-[11px] font-mono text-[#8b949e]">
                ({stats.androidSubscribers} Android • {stats.iosSubscribers} iOS • {stats.desktopSubscribers} PC)
              </span>
            </div>
            <span className="text-[11px] text-amber-500/80 block mt-0.5">Anında bildirim atılabilecek cihaz</span>
          </div>
        </div>

        {/* Kaldıran / Dönen */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-rose-500/30 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-heading">
              Kaldıran / Dönen
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              {stats.pwaUninstalls}
            </span>
            <span className="text-[11px] text-rose-500/80 block mt-0.5">Tarayıcıya geri dönüş yapanlar</span>
          </div>
        </div>

      </div>

      {/* ── 3. ANLIK PUSH BİLDİRİM GÖNDERME KONSOLU & CANLI ÖNİZLEME ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Sol Kolon: Gönderim Formu (7 Kolon) */}
        <div className="lg:col-span-7 bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              <h2 className="font-heading font-black text-base sm:text-lg text-white">
                Tüm Cihazlara Anlık Push Bildirim Gönder
              </h2>
            </div>
            <p className="text-xs text-[#8b949e]">
              Uygulamayı yükleyen ve bildirim izni veren tüm kullanıcıların telefon kilit ekranına ve masaüstüne anında sesli bildirim fırlatın.
            </p>
          </div>

          <form onSubmit={handleSendPush} className="flex flex-col gap-4 font-heading">
            {/* Bildirim Başlığı */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider flex items-center justify-between">
                <span>Bildirim Başlığı</span>
                <span className="text-[11px] font-mono text-amber-400/80 font-normal">{pushTitle.length}/50</span>
              </label>
              <input
                type="text"
                required
                maxLength={60}
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                placeholder="Örn: 🔥 İstanbul Yeni İlanlar Yayında!"
                className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Bildirim Mesajı */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider flex items-center justify-between">
                <span>Mesaj İçeriği</span>
                <span className="text-[11px] font-mono text-amber-400/80 font-normal">{pushBody.length}/140</span>
              </label>
              <textarea
                required
                rows={3}
                maxLength={160}
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value)}
                placeholder="Örn: Günün en popüler ilanları eklendi. Hemen tıkla ve güncel profilleri incele."
                className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>

            {/* Tıklanınca Açılacak Hedef Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                  Tıklanınca Açılacak Sayfa
                </label>
                <input
                  type="text"
                  value={pushUrl}
                  onChange={(e) => setPushUrl(e.target.value)}
                  placeholder="Örn: / (veya /istanbul)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Hedef Cihaz Seçimi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                  Hedef Kitle
                </label>
                <select
                  value={pushPlatform}
                  onChange={(e: any) => setPushPlatform(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="all">🌐 Tüm Cihazlar ({stats.totalSubscribers} Cihaz)</option>
                  <option value="android">📱 Sadece Android ({stats.androidSubscribers} Cihaz)</option>
                  <option value="ios">🍎 Sadece iOS / Safari ({stats.iosSubscribers} Cihaz)</option>
                  <option value="desktop">💻 Sadece Masaüstü ({stats.desktopSubscribers} Cihaz)</option>
                </select>
              </div>
            </div>

            {/* Sonuç Bildirimi */}
            {pushResult && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                  pushResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {pushResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{pushResult.message}</span>
              </div>
            )}

            {/* Gönder Butonu */}
            <button
              type="submit"
              disabled={sendingPush || stats.totalSubscribers === 0}
              className="mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {sendingPush ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Bildirimler Cihazlara Dağıtılıyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>🚀 TÜM KULLANICILARA BİLDİRİM GÖNDER ({stats.totalSubscribers} Cihaz)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sağ Kolon: Canlı Telefon Ekranı Simülatörü (5 Kolon) */}
        <div className="lg:col-span-5 bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8b949e] uppercase tracking-wider font-heading">
              Canlı Cihaz Önizlemesi
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
              Kilit Ekranı
            </span>
          </div>

          {/* Telefon Çerçevesi */}
          <div className="w-full max-w-[290px] h-[340px] rounded-[36px] bg-[#000000] border-4 border-[#30363d] p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Dinamik Ada / Çentik */}
            <div className="w-24 h-4 rounded-full bg-[#161b22] mx-auto mb-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>

            {/* Saat ve Tarih */}
            <div className="text-center my-auto flex flex-col items-center">
              <span className="text-3xl font-black text-white/90 font-mono tracking-tight">
                {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] text-white/50 font-heading">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>

              {/* Simüle Edilen Push Bildirimi Kartı */}
              <div className="w-full mt-5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left flex items-start gap-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 border border-amber-500/50 flex items-center justify-center shrink-0 text-amber-300 text-xs font-black">
                  💋
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-black text-white font-heading truncate">
                      {pushTitle || 'Bildirim Başlığı'}
                    </span>
                    <span className="text-[9px] text-white/50 shrink-0 font-mono">şimdi</span>
                  </div>
                  <p className="text-[10px] text-white/80 line-clamp-2 mt-0.5 font-sans leading-tight">
                    {pushBody || 'Mesaj içeriği burada görüntülenecek...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Alt Çizgi */}
            <div className="w-24 h-1 rounded-full bg-white/30 mx-auto" />
          </div>

          <p className="text-[11px] text-[#8b949e] text-center mt-3 font-mono">
            Kullanıcı tıkladığında doğrudan <span className="text-amber-400 font-bold">{pushUrl}</span> adresine aktarılır.
          </p>
        </div>

      </div>

      {/* ── 4. GEÇMİŞ GÖNDERİLEN BİLDİRİM KAMPANYALARI ─────────────────── */}
      {campaigns.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="font-heading font-black text-base text-white">
                Son Gönderilen Kampanyalar ({campaigns.length})
              </h2>
            </div>
          </div>

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
                      <div className="text-[11px] text-[#8b949e] truncate max-w-md font-sans">{c.body}</div>
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        Tamamlandı
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. CANLI CİHAZ & KURULUM GÜNLÜĞÜ (LİMİTSİZ LİSTE) ───────────── */}
      <div className="bg-[#161b22] border border-[#30363d] p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col gap-4">
        
        {/* Filtre ve Arama Çubuğu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="font-heading font-black text-base text-white">
              Cihaz Hareketleri &amp; Abonelik Kayıtları ({filteredEvents.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Arama Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="IP, Cihaz, ID ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
            </div>

            {/* Filtre Butonları */}
            <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-[#30363d] text-[11px] font-heading font-bold">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setActiveFilter('installs')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'installs' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
                }`}
              >
                Kurulumlar
              </button>
              <button
                onClick={() => setActiveFilter('subscribers')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'subscribers' ? 'bg-amber-400 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
                }`}
              >
                Push Aboneleri
              </button>
              <button
                onClick={() => setActiveFilter('uninstalls')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'uninstalls' ? 'bg-rose-500 text-white font-black' : 'text-[#8b949e] hover:text-white'
                }`}
              >
                Kaldıranlar
              </button>
            </div>
          </div>
        </div>

        {/* Liste */}
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-2xl flex flex-col items-center gap-2">
            <Smartphone className="w-8 h-8 text-[#30363d]" />
            <span>Henüz bu filtreye uyan bir kayıt bulunamadı.</span>
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

    </div>
  );
}
