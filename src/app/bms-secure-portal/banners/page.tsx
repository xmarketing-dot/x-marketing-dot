'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
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
  SlidersHorizontal
} from 'lucide-react';

export default function AdminBannerManagementPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [emptyClicks, setEmptyClicks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu' | 'reddedildi'>('all');
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editSureGun, setEditSureGun] = useState<number>(7);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.success && data.banners) {
        setBanners(data.banners);
        setEmptyClicks(data.emptyClicksCount || 0);
      }
    } catch (e) {
      console.error(e);
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
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
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

    // Progress hesaplama
    const start = banner.baslangicTarihi ? new Date(banner.baslangicTarihi).getTime() : end - banner.sureGun * 86400000;
    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

    return {
      expired: false,
      text: days > 0 ? `${days} Gün ${hours} Saat Kaldı` : `${hours} Saat Kaldı`,
      days,
      hours,
      progress,
    };
  };

  const filteredBanners = banners.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.durum === statusFilter;
  });

  const totalViews = banners.reduce((acc, b) => acc + (b.goruntulenmeSayisi || 0), 0);
  const totalClicks = banners.reduce((acc, b) => acc + (b.tiklamaSayisi || 0), 0);
  const averageCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] p-3 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto text-left pb-24 sm:pb-8">
      
      {/* ── 1. KOMPAKT RESPONSIVE ÜST BAŞLIK ──────────────── */}
      <div className="flex flex-col gap-3 p-3.5 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Link
              href="/bms-secure-portal"
              className="w-10 h-10 rounded-2xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-amber-400 flex items-center justify-center shrink-0 transition-colors shadow-sm"
              title="Ana Yönetim Paneline Dön"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-lg sm:text-2xl text-white tracking-tight truncate">
                  Banner &amp; Reklam Masası
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black font-heading shrink-0">
                  CANLI
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] truncate hidden sm:block">
                Sponsor banner yayın süreleri, tıklama oranları ve rezervasyonlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/reklam-ver"
              target="_blank"
              className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Yeni Banner Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </Link>
            <button
              onClick={fetchBanners}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-amber-400 transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. İSTATİSTİK KARTLARI (MOBİLDE 2x2 + 1 GRID) ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* 1. Yayındakiler */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-emerald-500/30 flex flex-col justify-between gap-1 shadow-lg">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase text-emerald-400">Yayında</span>
            <Crown className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400 mt-1">
            {banners.filter((b) => b.durum === 'yayinda').length}
          </span>
          <span className="text-[10px] text-[#8b949e] truncate">Aktif gösterilen banner</span>
        </div>

        {/* 2. Onay Bekleyenler */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-amber-500/40 flex flex-col justify-between gap-1 shadow-lg shadow-amber-500/5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">Onay Bekleyen</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-amber-400 mt-1">
            {banners.filter((b) => b.durum === 'onay_bekliyor').length}
          </span>
          <span className="text-[10px] text-amber-300/80 truncate">Teyit bekleyen talep</span>
        </div>

        {/* 3. Toplam Gösterim */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between gap-1 shadow-lg">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">Gösterim</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
            {totalViews.toLocaleString('tr-TR')}
          </span>
          <span className="text-[10px] text-[#8b949e] truncate">Kullanıcı gösterimi</span>
        </div>

        {/* 4. Sponsor Tıklama */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between gap-1 shadow-lg">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">Tıklama</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
              {totalClicks.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400">%{averageCtr}</span>
          </div>
          <span className="text-[10px] text-[#8b949e] truncate">Hedef link tıklandı</span>
        </div>

        {/* 5. Boşken Tıklama (Mobilde 2 sütunu kaplar) */}
        <div className="col-span-2 lg:col-span-1 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r lg:bg-gradient-to-br from-[#2a1b04] to-[#161b22] border-2 border-dashed border-amber-500/60 flex flex-col justify-between gap-1 shadow-lg shadow-amber-500/10">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">"Reklam Ver" Basan</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-amber-300 mt-1">
            {emptyClicks.toLocaleString('tr-TR')} Kişi
          </span>
          <span className="text-[10px] text-amber-200/80 truncate">Potansiyel reklamveren ilgisi</span>
        </div>
      </div>

      {/* ── 3. MOBİL FİLTRE BUTONLARI (KAYDIRILABİLİR SEGMENTED BAR) ──────────────── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#161b22] border border-[#30363d] overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Tümü', count: banners.length },
          { id: 'onay_bekliyor', label: 'Onay Bekleyen', count: banners.filter((b) => b.durum === 'onay_bekliyor').length },
          { id: 'yayinda', label: 'Yayında', count: banners.filter((b) => b.durum === 'yayinda').length },
          { id: 'suresi_doldu', label: 'Süresi Dolan', count: banners.filter((b) => b.durum === 'suresi_doldu').length },
          { id: 'reddedildi', label: 'Reddedilen', count: banners.filter((b) => b.durum === 'reddedildi').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              statusFilter === tab.id ? 'bg-slate-950/30 text-slate-950' : 'bg-[#0d1117] text-amber-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── 4. BANNER LİSTESİ (MOBİL-ÖNCELİKLİ KARTLAR) ──────────────── */}
      {filteredBanners.length === 0 ? (
        <div className="p-12 sm:p-16 text-center text-xs text-[#8b949e] bg-[#161b22] rounded-3xl border border-[#30363d] flex flex-col items-center gap-3">
          <Megaphone className="w-8 h-8 text-[#8b949e]/40" />
          <span>Seçilen kriterde kayıtlı banner bulunamadı.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBanners.map((b) => {
            const timeInfo = getRemainingTime(b);
            const ctr = b.goruntulenmeSayisi > 0 ? ((b.tiklamaSayisi / b.goruntulenmeSayisi) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={b._id}
                className={`p-4 sm:p-6 rounded-3xl bg-[#161b22] border transition-all flex flex-col gap-3.5 shadow-xl ${
                  b.durum === 'yayinda'
                    ? 'border-emerald-500/40 hover:border-emerald-500/60'
                    : b.durum === 'onay_bekliyor'
                    ? 'border-amber-500/40 hover:border-amber-500/60'
                    : 'border-[#30363d] opacity-85'
                }`}
              >
                {/* Banner Görseli & Başlık Alanı */}
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  
                  {/* Görsel Container */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-28 rounded-2xl overflow-hidden bg-[#0d1117] border border-[#30363d] shrink-0 group">
                    <Image src={b.gorselUrl} alt={b.baslik} fill className="object-cover" />
                    
                    {/* Görsel Üzeri Rozetler */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black font-heading backdrop-blur-md shadow-md ${
                          b.durum === 'yayinda'
                            ? 'bg-emerald-500 text-slate-950'
                            : b.durum === 'onay_bekliyor'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {b.durum === 'yayinda' ? 'YAYINDA' : b.durum === 'onay_bekliyor' ? 'ONAY BEKLİYOR' : 'SÜRESİ DOLDU'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <span className="text-[9px] text-white px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md font-bold border border-white/10">
                        {b.konum === 'anasayfa' ? 'Anasayfa' : b.konum === 'ilan_detay' ? 'İlan Detay' : 'Tüm Sayfalar'}
                      </span>
                    </div>
                  </div>

                  {/* Detay Bilgileri */}
                  <div className="flex flex-col gap-2 min-w-0 flex-1 w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-black text-base sm:text-lg text-white truncate">
                        {b.baslik}
                      </h3>
                      <span className="text-xs font-black text-amber-400 font-mono shrink-0">
                        {b.fiyatTL?.toLocaleString('tr-TR')} ₺ <span className="text-[10px] text-[#8b949e]">({b.sureGun}G)</span>
                      </span>
                    </div>

                    {/* Müşteri & İletişim */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b949e]">
                      <span className="flex items-center gap-1 text-white bg-[#0d1117] px-2.5 py-1 rounded-xl border border-[#21262d]">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <strong>{b.musteriIletisim}</strong>
                      </span>
                      
                      <div className="flex items-center gap-1 bg-[#0d1117] px-2.5 py-1 rounded-xl border border-[#21262d] max-w-[200px] truncate">
                        <a
                          href={b.hedefUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-bold truncate text-[11px]"
                        >
                          <span className="truncate">{b.hedefUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    {/* Başlangıç / Bitiş Tarihleri */}
                    {b.baslangicTarihi && b.bitisTarihi && (
                      <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>{new Date(b.baslangicTarihi).toLocaleDateString('tr-TR')}</span>
                        <span>→</span>
                        <span className="text-amber-300 font-bold">{new Date(b.bitisTarihi).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── İSTATİSTİK BAR (MOBİLDE 3'LÜ KOMPAKT SAYAÇ) ──────────────── */}
                <div className="grid grid-cols-3 gap-2 bg-[#0d1117] p-2.5 rounded-2xl border border-[#30363d] text-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#8b949e] uppercase font-bold">Gösterim</span>
                    <span className="font-mono font-black text-sm text-white">{b.goruntulenmeSayisi || 0}</span>
                  </div>
                  <div className="flex flex-col border-x border-[#30363d] px-2">
                    <span className="text-[9px] text-[#8b949e] uppercase font-bold">Tıklama</span>
                    <span className="font-mono font-black text-sm text-emerald-400">{b.tiklamaSayisi || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#8b949e] uppercase font-bold">CTR</span>
                    <span className="font-mono font-black text-sm text-amber-400">%{ctr}</span>
                  </div>
                </div>

                {/* ── DİNAMİK KALAN SÜRE BAR (YAYINDAYSA) ──────────────── */}
                {timeInfo && (
                  <div className="p-3 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-heading font-black">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{timeInfo.text}</span>
                      </span>
                      <span className="text-[#8b949e] font-mono text-[11px]">%{timeInfo.progress}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#161b22] overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          timeInfo.progress > 85
                            ? 'bg-red-500'
                            : timeInfo.progress > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${timeInfo.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ── AKSİYON BUTONLARI ──────────────── */}
                <div className="flex items-center justify-between border-t border-[#30363d]/60 pt-3 gap-2 flex-wrap">
                  <button
                    onClick={() => setEditingBanner(editingBanner?._id === b._id ? null : b)}
                    className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Süreyi Uzat / Düzenle</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {b.durum === 'onay_bekliyor' && (
                      <>
                        <button
                          onClick={() => handleAction(b._id, 'onayla', { sureGun: b.sureGun || 7 })}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-heading font-black flex items-center gap-1 shadow-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Onayla</span>
                        </button>
                        <button
                          onClick={() => {
                            const sebep = prompt('Reddetme nedeni:');
                            if (sebep) handleAction(b._id, 'reddet', { redNedeni: sebep });
                          }}
                          className="px-3 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold transition-colors"
                        >
                          Reddet
                        </button>
                      </>
                    )}

                    {b.durum === 'yayinda' && (
                      <button
                        onClick={() => handleAction(b._id, 'durdur')}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-colors"
                      >
                        Durdur
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Bu banner kaydını tamamen silmek istediğinize emin misiniz?')) {
                          handleAction(b._id, 'delete');
                        }
                      }}
                      className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── AÇILIR SÜRE UZATMA / DÜZENLEME PANELİ ──────────────── */}
                {editingBanner?._id === b._id && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1117] border border-amber-500/40 flex flex-col gap-3 animate-fadeIn">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-heading font-black text-white">Yayın Süresini Seç:</span>
                      <span className="text-xs font-mono font-bold text-amber-400">+{editSureGun} Gün</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[7, 15, 30, 60].map((gun) => (
                        <button
                          key={gun}
                          onClick={() => setEditSureGun(gun)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            editSureGun === gun
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                              : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'
                          }`}
                        >
                          +{gun}G
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        handleAction(b._id, 'onayla', { sureGun: editSureGun });
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-heading font-black text-xs shadow-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
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
