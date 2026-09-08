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
  SlidersHorizontal,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function AdminBannerManagementPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [emptyClicks, setEmptyClicks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu' | 'reddedildi'>('all');
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editSureGun, setEditSureGun] = useState<number>(7);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      
      {/* ── 1. ÜST HEADER KONTROL KARTI ──────────────── */}
      <div className="flex flex-col gap-3.5 p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/bms-secure-portal"
              className="w-11 h-11 rounded-2xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-amber-400 hover:text-amber-300 flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md"
              title="Ana Yönetim Paneline Dön"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-lg sm:text-2xl text-white tracking-tight truncate">
                  Banner &amp; Reklam Masası
                </h1>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black font-heading shrink-0">
                  CANLI
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] truncate hidden sm:block">
                Sponsor banner yayın süreleri, tıklama oranları ve rezervasyon yönetimi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/reklam-ver"
              target="_blank"
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Yeni Banner Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </Link>
            <button
              onClick={fetchBanners}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-amber-400 hover:text-white transition-all active:scale-95"
              title="Verileri Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. İSTATİSTİK KARTLARI (2x2 + ÖZEL KART) ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* 1. Yayındakiler */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-emerald-500/30 flex flex-col justify-between gap-1 shadow-lg hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase text-emerald-400">Yayında</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400 mt-1">
            {banners.filter((b) => b.durum === 'yayinda').length}
          </span>
          <span className="text-[10px] text-[#8b949e] truncate">Aktif sponsor banner</span>
        </div>

        {/* 2. Onay Bekleyenler */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-amber-500/40 flex flex-col justify-between gap-1 shadow-lg shadow-amber-500/5 hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">Onay Bekleyen</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-amber-400 mt-1">
            {banners.filter((b) => b.durum === 'onay_bekliyor').length}
          </span>
          <span className="text-[10px] text-amber-300/80 truncate">Teyit bekleyen talep</span>
        </div>

        {/* 3. Toplam Gösterim */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between gap-1 shadow-lg hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">Gösterim</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
            {totalViews.toLocaleString('tr-TR')}
          </span>
          <span className="text-[10px] text-[#8b949e] truncate">Kullanıcı gösterimi</span>
        </div>

        {/* 4. Sponsor Tıklama */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between gap-1 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">Tıklama</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
              {totalClicks.toLocaleString('tr-TR')}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400">%{averageCtr} CTR</span>
          </div>
          <span className="text-[10px] text-[#8b949e] truncate">Hedef link tıklandı</span>
        </div>

        {/* 5. Boşken Tıklama (Mobilde 2 sütun) */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r lg:bg-gradient-to-br from-[#2a1b04] via-[#1c1917] to-[#161b22] border-2 border-dashed border-amber-500/60 flex flex-col justify-between gap-1 shadow-lg shadow-amber-500/10">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[10px] sm:text-xs font-heading font-black uppercase">"Reklam Ver"e Basan</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-amber-300 mt-1">
            {emptyClicks.toLocaleString('tr-TR')} Kişi
          </span>
          <span className="text-[10px] text-amber-200/80 truncate">Potansiyel müşteri ilgisi</span>
        </div>
      </div>

      {/* ── 3. MODERN TOGGLE / SEGMENTED FİLTRE ÇUBUĞU ──────────────── */}
      <div className="p-1.5 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-md">
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
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center gap-2 shrink-0 whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              statusFilter === tab.id ? 'bg-slate-950/30 text-slate-950' : 'bg-[#0d1117] text-amber-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── 4. BANNER LİSTESİ (TAM BOY PREVIEW & ALT KONTROL MASASI) ──────────────── */}
      {filteredBanners.length === 0 ? (
        <div className="p-12 sm:p-16 text-center text-xs text-[#8b949e] bg-[#161b22] rounded-3xl border border-[#30363d] flex flex-col items-center gap-3 shadow-xl">
          <Megaphone className="w-10 h-10 text-[#8b949e]/40" />
          <span className="font-heading font-bold text-sm text-white">Bu filtrede kayıtlı banner bulunamadı.</span>
          <p className="text-[11px] text-[#8b949e]">Yeni bir sponsor banner ekleyebilir veya diğer sekmeleri kontrol edebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredBanners.map((b) => {
            const timeInfo = getRemainingTime(b);
            const ctr = b.goruntulenmeSayisi > 0 ? ((b.tiklamaSayisi / b.goruntulenmeSayisi) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={b._id}
                className={`p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#181f2a] via-[#161b22] to-[#12161c] border transition-all flex flex-col gap-4 shadow-2xl ${
                  b.durum === 'yayinda'
                    ? 'border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-500/5'
                    : b.durum === 'onay_bekliyor'
                    ? 'border-amber-500/50 hover:border-amber-400 shadow-amber-500/5'
                    : 'border-[#30363d] opacity-85'
                }`}
              >
                {/* ── 1. ÜSTTE TAM GENİŞLİK BANNER GÖRSELİ (PREVIEW) ──────────────── */}
                <div className="relative w-full aspect-[21/9] sm:aspect-[3.5/1] max-h-56 rounded-2xl overflow-hidden bg-[#0d1117] border border-[#30363d] shrink-0 group shadow-inner">
                  <Image src={b.gorselUrl} alt={b.baslik} fill className="object-cover" />
                  
                  {/* Karartma degrade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                  {/* Sol Üst Rozetler */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <span
                      className={`px-3 py-1 rounded-xl text-[10px] font-black font-heading backdrop-blur-md shadow-lg border flex items-center gap-1.5 ${
                        b.durum === 'yayinda'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                          : b.durum === 'onay_bekliyor'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-red-500 text-white border-red-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        b.durum === 'yayinda' ? 'bg-slate-950 animate-pulse' : b.durum === 'onay_bekliyor' ? 'bg-slate-950 animate-ping' : 'bg-white'
                      }`}></span>
                      <span>{b.durum === 'yayinda' ? 'YAYINDA' : b.durum === 'onay_bekliyor' ? 'ONAY BEKLİYOR' : 'SÜRESİ DOLDU'}</span>
                    </span>

                    <span className="text-[10px] text-white px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md font-bold border border-white/15 shadow-lg">
                      {b.konum === 'anasayfa' ? 'Anasayfa Vitrini' : b.konum === 'ilan_detay' ? 'İlan Detay Vitrini' : 'Tüm Sayfalar'}
                    </span>
                  </div>

                  {/* Sağ Alt Hızlı Bağlantı */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
                    <a
                      href={b.hedefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white px-3.5 py-1.5 rounded-xl bg-slate-950/90 hover:bg-blue-600 backdrop-blur-md font-bold border border-white/20 shadow-xl flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>Siteyi Aç</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* ── 2. BAŞLIK VE FİYAT SATIRI ──────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363d]/60 pb-3">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-heading font-black text-base sm:text-xl text-white truncate">
                      {b.baslik}
                    </h3>
                    <span className="text-[11px] text-[#8b949e]">Sponsor Reklam Kaydı #{b._id.slice(-6)}</span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
                      <span>{b.fiyatTL?.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-[10px] text-[#8b949e] font-sans">({b.sureGun} Günlük Paket)</span>
                    </span>
                  </div>
                </div>

                {/* ── 3. DETAYLI MÜŞTERİ & HEDEF BİLGİ KARTLARI ──────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Müşteri İletişim */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0d1117] border border-[#21262d]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#8b949e]">Müşteri Telefonu:</span>
                        <strong className="text-emerald-300 font-mono truncate">{b.musteriIletisim}</strong>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${(b.musteriIletisim || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold font-heading flex items-center gap-1 transition-colors shrink-0"
                    >
                      <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Hedef URL */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0d1117] border border-[#21262d]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-[#8b949e]">Hedef Tıklama Linki:</span>
                        <span className="text-blue-300 font-mono truncate max-w-[180px]">{b.hedefUrl}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(b.hedefUrl, b._id)}
                      className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                      title="Linki Kopyala"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId === b._id ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>

                {/* Başlangıç ve Bitiş Tarihleri */}
                {b.baslangicTarihi && b.bitisTarihi && (
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0d1117] border border-[#21262d] text-xs text-[#8b949e] font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Başlangıç: <strong className="text-white">{new Date(b.baslangicTarihi).toLocaleDateString('tr-TR')}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Bitiş: <strong className="text-amber-300 font-bold">{new Date(b.bitisTarihi).toLocaleDateString('tr-TR')}</strong></span>
                    </div>
                  </div>
                )}

                {/* ── 4. 3'LÜ PERFORMANS İSTATİSTİK SAYACI ──────────────── */}
                <div className="grid grid-cols-3 gap-2 bg-[#0d1117] p-3 rounded-2xl border border-[#30363d] text-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#8b949e] uppercase font-bold">Toplam Gösterim</span>
                    <span className="font-mono font-black text-base sm:text-lg text-white mt-0.5">{(b.goruntulenmeSayisi || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col border-x border-[#30363d] px-2">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold">Sponsor Tıklama</span>
                    <span className="font-mono font-black text-base sm:text-lg text-emerald-400 mt-0.5">{(b.tiklamaSayisi || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Dönüşüm (CTR)</span>
                    <span className="font-mono font-black text-base sm:text-lg text-amber-400 mt-0.5">%{ctr}</span>
                  </div>
                </div>

                {/* ── 5. DİNAMİK KALAN SÜRE PROGRESS BAR ──────────────── */}
                {timeInfo && (
                  <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-heading font-black">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Timer className="w-4 h-4" />
                        <span>Kalan Yayın Süresi: {timeInfo.text}</span>
                      </span>
                      <span className="text-[#8b949e] font-mono text-[11px]">%{timeInfo.progress} Tamamlandı</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#161b22] overflow-hidden border border-white/5">
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

                {/* ── 6. AKSİYON BUTONLARI SATIRI ──────────────── */}
                <div className="flex items-center justify-between border-t border-[#30363d]/60 pt-3 gap-2 flex-wrap">
                  {/* Süreyi Uzat / Düzenle Butonu */}
                  <button
                    onClick={() => setEditingBanner(editingBanner?._id === b._id ? null : b)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 transition-all active:scale-95 border ${
                      editingBanner?._id === b._id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-[#21262d] hover:bg-[#30363d] text-amber-300 border-[#30363d]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Süreyi Uzat / Düzenle</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Onay Bekleyen Durumu Butonları */}
                    {b.durum === 'onay_bekliyor' && (
                      <>
                        <button
                          onClick={() => handleAction(b._id, 'onayla', { sureGun: b.sureGun || 7 })}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-heading font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Onayla &amp; Yayına Al</span>
                        </button>
                        <button
                          onClick={() => {
                            const sebep = prompt('Reddetme nedeni:');
                            if (sebep) handleAction(b._id, 'reddet', { redNedeni: sebep });
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold transition-all border border-red-500/30"
                        >
                          Reddet
                        </button>
                      </>
                    )}

                    {/* Yayında Durumu Butonları */}
                    {b.durum === 'yayinda' && (
                      <button
                        onClick={() => handleAction(b._id, 'durdur')}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <PauseCircle className="w-4 h-4 text-amber-400" />
                        <span>Yayından Kaldır</span>
                      </button>
                    )}

                    {/* Silme Butonu */}
                    <button
                      onClick={() => {
                        if (confirm('Bu banner kaydını tamamen silmek istediğinize emin misiniz?')) {
                          handleAction(b._id, 'delete');
                        }
                      }}
                      className="p-2.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 border border-[#30363d] transition-all"
                      title="Bannerı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── 7. AÇILIR SÜRE UZATMA PANELİ (TOUCH SEGMENTED) ──────────────── */}
                {editingBanner?._id === b._id && (
                  <div className="p-4 rounded-2xl bg-[#0d1117] border-2 border-amber-500/50 flex flex-col gap-3.5 animate-fadeIn shadow-2xl">
                    <div className="flex items-center justify-between gap-2 border-b border-[#21262d] pb-2">
                      <span className="text-xs font-heading font-black text-white flex items-center gap-1.5">
                        <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                        Yayın Süresini Uzat:
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                        +{editSureGun} Gün
                      </span>
                    </div>

                    {/* Gün Seçenekleri */}
                    <div className="grid grid-cols-4 gap-2">
                      {[7, 15, 30, 60].map((gun) => (
                        <button
                          key={gun}
                          onClick={() => setEditSureGun(gun)}
                          className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                            editSureGun === gun
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                              : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white'
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
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
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
