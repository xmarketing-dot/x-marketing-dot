'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Megaphone, 
  Crown, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Phone, 
  Layers, 
  Copy, 
  KeyRound, 
  SlidersHorizontal, 
  PauseCircle, 
  PlayCircle 
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { adminPortalCache } from '@/lib/adminPortalCache';

function MetricCircle({ percent, color = '#10b981', size = 38, strokeWidth = 3.5 }: { percent: number; color?: string; size?: number; strokeWidth?: number }) {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100);
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

export default function AdminBannerManagementPage() {
  const [banners, setBanners] = useState<any[]>(() => adminPortalCache.get<any[]>('bms_admin_banners') || []);
  const [emptyClicks, setEmptyClicks] = useState<number>(() => adminPortalCache.get<number>('bms_admin_empty_clicks') || 0);
  const [loading, setLoading] = useState(() => !adminPortalCache.has('bms_admin_banners'));
  const [statusFilter, setStatusFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu' | 'reddedildi'>('all');
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editSureGun, setEditSureGun] = useState<number>(7);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners(!adminPortalCache.has('bms_admin_banners'));
  }, []);

  const fetchBanners = async (forceRefresh: boolean | any = false) => {
    const isManual = forceRefresh === true || (forceRefresh && typeof forceRefresh === 'object');
    if (isManual || !adminPortalCache.has('bms_admin_banners')) {
      setLoading(true);
    }
    try {
      const res = await fetch(`/api/admin/banners?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setBanners(data.banners);
        setEmptyClicks(data.emptyClicksCount || 0);
        adminPortalCache.set('bms_admin_banners', data.banners);
        adminPortalCache.set('bms_admin_empty_clicks', data.emptyClicksCount || 0);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string, extraData?: any) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extraData }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingBanner(null);
        fetchBanners();
      } else {
        alert(data.error || 'İşlem başarısız');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dinamik Kalan Süre Hesaplayıcı
  const getRemainingTime = (banner: any) => {
    if (banner.durum !== 'yayinda' || !banner.bitisTarihi) {
      return null;
    }
    const now = new Date().getTime();
    const end = new Date(banner.bitisTarihi).getTime();
    const diff = end - now;

    if (diff <= 0) {
      return { expired: true, text: 'Süresi Doldu', progress: 100 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const start = banner.baslangicTarihi ? new Date(banner.baslangicTarihi).getTime() : end - banner.sureGun * 86400000;
    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

    return {
      expired: false,
      text: `${days} gün ${hours} saat`,
      progress,
    };
  };

  const totalViews = useMemo(() => banners.reduce((acc, b) => acc + (b.goruntulenmeSayisi || 0), 0), [banners]);
  const totalClicks = useMemo(() => banners.reduce((acc, b) => acc + (b.tiklamaSayisi || 0), 0), [banners]);
  const averageCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const filteredBanners = useMemo(() => {
    if (statusFilter === 'all') return banners;
    return banners.filter((b) => b.durum === statusFilter);
  }, [banners, statusFilter]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full text-left font-sans animate-fadeIn pb-20 md:pb-12">
      
      {/* ── 1. ÜST HEADER BAR & SAYFA KİMLİĞİ ──────────────── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-lg mt-0.5 sm:mt-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base sm:text-xl text-white tracking-tight">
                Sponsorlu Banner Yönetimi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-mono font-bold">
                {banners.filter((b) => b.durum === 'yayinda').length} AKTİF SPONSOR
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Sponsor banner yayın süreleri, tıklama oranları ve rezervasyon yönetimi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Link
            href="/reklam-ver"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Yeni Banner Ekle</span>
          </Link>

          <button
            type="button"
            onClick={() => fetchBanners(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer active:scale-90 touch-manipulation shadow-sm"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI ŞERİDİ ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Yayında</span>
            <span className="font-mono font-bold text-lg text-emerald-400 mt-0.5">
              {banners.filter((b) => b.durum === 'yayinda').length}
            </span>
            <span className="text-[10px] text-slate-500">Aktif sponsor</span>
          </div>
          <MetricCircle percent={banners.length ? (banners.filter((b) => b.durum === 'yayinda').length / banners.length) * 100 : 0} color="#10b981" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Onay Bekleyen</span>
            <span className="font-mono font-bold text-lg text-amber-400 mt-0.5">
              {banners.filter((b) => b.durum === 'onay_bekliyor').length}
            </span>
            <span className="text-[10px] text-slate-500">Teyit bekleyen</span>
          </div>
          <MetricCircle percent={banners.length ? (banners.filter((b) => b.durum === 'onay_bekliyor').length / banners.length) * 100 : 0} color="#f59e0b" size={38} />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Gösterim</span>
            <span className="font-mono font-bold text-lg text-white mt-0.5">
              {totalViews.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-slate-500">Tekil izlenme</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Tıklama</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-bold text-lg text-cyan-400">{totalClicks.toLocaleString('tr-TR')}</span>
              <span className="text-[10px] font-mono font-bold text-amber-400">%{averageCtr}</span>
            </div>
            <span className="text-[10px] text-slate-500">Hedefe yönlendirme</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4" />
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider">"Reklam Ver" Tık</span>
            <span className="font-mono font-bold text-lg text-emerald-300 mt-0.5">
              {emptyClicks.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] text-slate-500">Potansiyel müşteri</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── 3. SEGMENTED FİLTRE ÇUBUĞU ──────────────── */}
      <div className="p-1 rounded-xl bg-[#0c1017] border border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'all', label: 'Tüm Bannerlar', count: banners.length },
          { id: 'onay_bekliyor', label: 'Onay Bekleyen', count: banners.filter((b) => b.durum === 'onay_bekliyor').length },
          { id: 'yayinda', label: 'Yayındakiler', count: banners.filter((b) => b.durum === 'yayinda').length },
          { id: 'suresi_doldu', label: 'Süresi Dolan', count: banners.filter((b) => b.durum === 'suresi_doldu').length },
          { id: 'reddedildi', label: 'Reddedilen', count: banners.filter((b) => b.durum === 'reddedildi').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              statusFilter === tab.id ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-900 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── 4. BANNER LİSTESİ ──────────────── */}
      {filteredBanners.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-500 bg-[#0e131f] rounded-2xl border border-slate-800/90 flex flex-col items-center gap-2 shadow-sm">
          <Megaphone className="w-8 h-8 opacity-40" />
          <span className="font-bold text-sm text-slate-300">Bu filtrede kayıtlı banner bulunamadı.</span>
          <p className="text-[11px] text-slate-500">Yeni bir sponsor banner ekleyebilir veya diğer sekmeleri kontrol edebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
          {filteredBanners.map((b) => {
            const timeInfo = getRemainingTime(b);
            const ctr = b.goruntulenmeSayisi > 0 ? ((b.tiklamaSayisi / b.goruntulenmeSayisi) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={b._id}
                className={`p-4 rounded-2xl bg-[#0e131f] border transition-all flex flex-col gap-3 shadow-md ${
                  b.durum === 'yayinda'
                    ? 'border-slate-800/90 hover:border-emerald-500/50'
                    : b.durum === 'onay_bekliyor'
                    ? 'border-amber-500/40 hover:border-amber-400'
                    : 'border-slate-800/80 opacity-90'
                }`}
              >
                {/* ── 1. BANNER GÖRSELİ ──────────────── */}
                <div className="relative w-full aspect-[21/9] sm:aspect-[3.5/1] max-h-48 rounded-xl overflow-hidden bg-[#070a0f] border border-slate-800 shrink-0 group">
                  <Image src={b.gorselUrl} alt={b.baslik} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold backdrop-blur-md border flex items-center gap-1 ${
                        b.durum === 'yayinda'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : b.durum === 'onay_bekliyor'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        b.durum === 'yayinda' ? 'bg-emerald-400 animate-pulse' : b.durum === 'onay_bekliyor' ? 'bg-amber-400 animate-ping' : 'bg-rose-400'
                      }`}></span>
                      <span>{b.durum === 'yayinda' ? 'YAYINDA' : b.durum === 'onay_bekliyor' ? 'ONAY BEKLİYOR' : 'SÜRESİ DOLDU'}</span>
                    </span>

                    <span className="text-[10px] text-white px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md font-mono border border-white/10">
                      {b.konum === 'anasayfa' ? 'Anasayfa Vitrini' : b.konum === 'ilan_detay' ? 'İlan Detay Vitrini' : 'Tüm Sayfalar'}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    <a
                      href={b.hedefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-emerald-600 backdrop-blur-md font-semibold border border-white/20 shadow-md flex items-center gap-1 transition-all active:scale-95"
                    >
                      <span>Siteyi Aç</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* ── 2. BAŞLIK VE FİYAT ──────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2.5">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-white truncate">
                      {b.baslik}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">Sponsor Kaydı #{b._id.slice(-6)}</span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                      <span>{b.fiyatTL?.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-[10px] text-slate-400 font-sans">({b.sureGun} Günlük)</span>
                    </span>
                  </div>
                </div>

                {/* ── 3. DETAY KARTLARI ──────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#070a0f] border border-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Phone className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-slate-400">Telefon:</span>
                        <strong className="text-emerald-300 font-mono text-[11px] truncate">{b.musteriIletisim}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(b.musteriIletisim, `${b._id}_phone`)}
                        className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
                        title="Telefonu Kopyala"
                      >
                        {copiedId === `${b._id}_phone` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center p-2 rounded-xl bg-[#070a0f] border border-slate-800 col-span-2">
                    <div className="flex items-center gap-2 min-w-0 w-full justify-between">
                      <span className="text-[11px] text-slate-400 truncate">Hedef: <span className="font-mono text-cyan-300 font-medium">{b.hedefUrl}</span></span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(b.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                {/* ── 4. PERFORMANS İSTATİSTİĞİ ──────────────── */}
                <div className="grid grid-cols-3 gap-2 bg-[#070a0f] p-2 rounded-xl border border-slate-800 text-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Gösterim</span>
                    <span className="font-mono font-bold text-sm text-white mt-0.5">{(b.goruntulenmeSayisi || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col border-x border-slate-800 px-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-mono">Tıklama</span>
                    <span className="font-mono font-bold text-sm text-emerald-400 mt-0.5">{(b.tiklamaSayisi || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-cyan-400 uppercase font-mono">CTR</span>
                    <span className="font-mono font-bold text-sm text-cyan-400 mt-0.5">%{ctr}</span>
                  </div>
                </div>

                {/* ── 5. KALAN SÜRE ──────────────── */}
                {timeInfo && (
                  <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Kalan Süre: {timeInfo.text}</span>
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">%{timeInfo.progress} Doldu</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          timeInfo.progress > 85 ? 'bg-rose-500' : timeInfo.progress > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${timeInfo.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ── 6. AKSİYON BUTONLARI ──────────────── */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 flex-wrap">
                  <button
                    onClick={() => setEditingBanner(editingBanner?._id === b._id ? null : b)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{editingBanner?._id === b._id ? 'Paneli Kapat' : 'Süre Uzat / Düzenle'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {b.durum === 'onay_bekliyor' && (
                      <>
                        <button
                          onClick={() => handleAction(b._id, 'onayla', { sureGun: b.sureGun || 7 })}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Onayla</span>
                        </button>
                        <button
                          onClick={() => {
                            const sebep = prompt('Reddetme nedeni:');
                            if (sebep) handleAction(b._id, 'reddet', { redNedeni: sebep });
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all"
                        >
                          Reddet
                        </button>
                      </>
                    )}

                    {b.durum === 'yayinda' && (
                      <button
                        onClick={() => handleAction(b._id, 'durdur')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Durdur</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Bu banner kaydını silmek istediğinize emin misiniz?')) {
                          handleAction(b._id, 'delete');
                        }
                      }}
                      className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── 7. SÜRE UZATMA PANELİ ──────────────── */}
                {editingBanner?._id === b._id && (
                  <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span>Süreyi Uzat:</span>
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{editSureGun} Gün
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[7, 15, 30, 60].map((gun) => (
                        <button
                          key={gun}
                          onClick={() => setEditSureGun(gun)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                            editSureGun === gun
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          +{gun} Gün
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        handleAction(b._id, 'onayla', { sureGun: editSureGun });
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Süreyi Kaydet ve Yayına Al</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
