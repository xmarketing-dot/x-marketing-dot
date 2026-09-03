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
  Timer
} from 'lucide-react';

export default function AdminBannerManagementPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [emptyClicks, setEmptyClicks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu' | 'reddedildi'>('all');
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editSureGun, setEditSureGun] = useState<number>(7);

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
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] p-4 sm:p-8 flex flex-col gap-6 max-w-7xl mx-auto text-left">
      {/* ── ÜST BAŞLIK VE NAVİGASYON ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/bms-secure-portal"
            className="p-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-400 hover:text-amber-300 transition-colors shrink-0 shadow-lg"
            title="Ana Yönetim Paneline Dön"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
                Sponsor Banner &amp; Reklam Masası
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black font-heading">
                CANLI TAKİP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-0.5">
              Anasayfa ve ilan detay sayfalarındaki sponsor banner'ların sürelerini, bitiş tarihlerini ve tıklama istatistiklerini canlı yönetin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reklam-ver"
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Yeni Banner Ekle</span>
          </Link>
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-amber-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── İSTATİSTİK KARTLARI ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-heading font-black uppercase">Yayındaki Reklamlar</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-heading font-black text-3xl text-emerald-400 mt-2">
            {banners.filter((b) => b.durum === 'yayinda').length}
          </span>
          <span className="text-[11px] text-[#8b949e]">Aktif olarak sitede gösterilen</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#161b22] border border-amber-500/40 flex flex-col gap-1 shadow-xl shadow-amber-500/5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-heading font-black uppercase">Onay Bekleyenler</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-heading font-black text-3xl text-amber-400 mt-2">
            {banners.filter((b) => b.durum === 'onay_bekliyor').length}
          </span>
          <span className="text-[11px] text-amber-300">Ödeme veya görsel teyidi bekleyen</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-heading font-black uppercase">Toplam Gösterim</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-heading font-black text-3xl text-white mt-2">
            {totalViews.toLocaleString('tr-TR')}
          </span>
          <span className="text-[11px] text-[#8b949e]">Tekil kullanıcı gösterim sayısı</span>
        </div>

        <div className="p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1 shadow-xl">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span className="text-xs font-heading font-black uppercase">Sponsor Tıklama</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-heading font-black text-3xl text-emerald-400">
              {totalClicks.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">%{averageCtr} CTR</span>
          </div>
          <span className="text-[11px] text-[#8b949e]">Reklamveren linklerine tıklayan</span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2a1b04] to-[#161b22] border-2 border-dashed border-amber-500/60 flex flex-col gap-1 shadow-xl shadow-amber-500/10">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-heading font-black uppercase">Boşken Tıklama</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <span className="font-heading font-black text-3xl text-amber-300 mt-2">
            {emptyClicks.toLocaleString('tr-TR')}
          </span>
          <span className="text-[11px] text-amber-200/80">"Buraya Reklam Ver"e basanlar</span>
        </div>
      </div>

      {/* ── FİLTRE BUTONLARI ──────────────── */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Tüm Kayıtlar', count: banners.length },
          { id: 'onay_bekliyor', label: 'Onay Bekleyenler', count: banners.filter((b) => b.durum === 'onay_bekliyor').length },
          { id: 'yayinda', label: 'Yayındakiler', count: banners.filter((b) => b.durum === 'yayinda').length },
          { id: 'suresi_doldu', label: 'Süresi Dolanlar', count: banners.filter((b) => b.durum === 'suresi_doldu').length },
          { id: 'reddedildi', label: 'Reddedilenler', count: banners.filter((b) => b.durum === 'reddedildi').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              statusFilter === tab.id ? 'bg-slate-950/30 text-slate-950' : 'bg-[#0d1117] text-amber-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── BANNER LİSTESİ VE DİNAMİK SÜRE YÖNETİMİ ──────────────── */}
      {filteredBanners.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#8b949e] bg-[#161b22] rounded-3xl border border-[#30363d]">
          Seçilen kriterde kayıtlı banner bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBanners.map((b) => {
            const timeInfo = getRemainingTime(b);
            const ctr = b.goruntulenmeSayisi > 0 ? ((b.tiklamaSayisi / b.goruntulenmeSayisi) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={b._id}
                className={`p-6 rounded-3xl bg-[#161b22] border transition-all flex flex-col gap-4 shadow-xl ${
                  b.durum === 'yayinda'
                    ? 'border-emerald-500/40 hover:border-emerald-500/60'
                    : b.durum === 'onay_bekliyor'
                    ? 'border-amber-500/40 hover:border-amber-500/60'
                    : 'border-[#30363d] opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Banner Görseli & Başlık Bilgileri */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="relative w-36 sm:w-44 h-20 sm:h-24 rounded-2xl overflow-hidden bg-[#0d1117] border border-[#30363d] shrink-0">
                      <Image src={b.gorselUrl} alt={b.baslik} fill className="object-cover" />
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-black text-base sm:text-lg text-white truncate">
                          {b.baslik}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-heading ${
                            b.durum === 'yayinda'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : b.durum === 'onay_bekliyor'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {b.durum === 'yayinda' ? 'YAYINDA' : b.durum === 'onay_bekliyor' ? 'ONAY BEKLİYOR' : 'SÜRESİ DOLDU'}
                        </span>
                        <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 font-bold">
                          {b.konum === 'anasayfa' ? 'Anasayfa' : b.konum === 'ilan_detay' ? 'İlan Detay' : 'Tüm Sayfalar'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#8b949e] flex-wrap">
                        <span>📱 Müşteri: <strong className="text-white">{b.musteriIletisim}</strong></span>
                        <span>💰 Paket: <strong className="text-amber-400">{b.fiyatTL?.toLocaleString('tr-TR')} ₺</strong> ({b.sureGun} Gün)</span>
                        <a
                          href={b.hedefUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>🔗 Hedef Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Başlangıç ve Bitiş Tarihleri */}
                      {b.baslangicTarihi && b.bitisTarihi && (
                        <div className="flex items-center gap-3 text-[11px] text-[#8b949e] font-mono mt-0.5">
                          <span>Başlangıç: {new Date(b.baslangicTarihi).toLocaleDateString('tr-TR')}</span>
                          <span>•</span>
                          <span className="text-amber-300">Bitiş: {new Date(b.bitisTarihi).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* İstatistik & Performans Masası */}
                  <div className="grid grid-cols-3 gap-3 bg-[#0d1117] px-5 py-3 rounded-2xl border border-[#30363d] text-center w-full lg:w-auto shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8b949e] uppercase font-bold">Gösterim</span>
                      <span className="font-mono font-black text-sm text-white mt-0.5">{b.goruntulenmeSayisi || 0}</span>
                    </div>
                    <div className="flex flex-col border-x border-[#30363d] px-4">
                      <span className="text-[10px] text-[#8b949e] uppercase font-bold">Tıklama</span>
                      <span className="font-mono font-black text-sm text-emerald-400 mt-0.5">{b.tiklamaSayisi || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8b949e] uppercase font-bold">CTR</span>
                      <span className="font-mono font-black text-sm text-amber-400 mt-0.5">%{ctr}</span>
                    </div>
                  </div>
                </div>

                {/* ── DİNAMİK KALAN SÜRE ÇUBUĞU (YAYINDAYSA) ──────────────── */}
                {timeInfo && (
                  <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-heading font-black">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Timer className="w-4 h-4" />
                        <span>Kalan Yayın Süresi: {timeInfo.text}</span>
                      </span>
                      <span className="text-[#8b949e] font-mono">%{timeInfo.progress} Tamamlandı</span>
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

                {/* ── AKSİYON VE SÜRE GÜNCELLEME BUTONLARI ──────────────── */}
                <div className="flex items-center justify-between border-t border-[#30363d]/60 pt-4 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* Süre Ekle / Düzenle Butonu */}
                    <button
                      onClick={() => setEditingBanner(editingBanner?._id === b._id ? null : b)}
                      className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 text-xs font-heading font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Süreyi Düzenle / Uzat</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.durum === 'onay_bekliyor' && (
                      <>
                        <button
                          onClick={() => handleAction(b._id, 'onayla', { sureGun: b.sureGun || 7 })}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-heading font-black flex items-center gap-1.5 shadow-lg transition-colors"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Onayla ve Yayına Al</span>
                        </button>
                        <button
                          onClick={() => {
                            const sebep = prompt('Reddetme nedeni:');
                            if (sebep) handleAction(b._id, 'reddet', { redNedeni: sebep });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-bold transition-colors"
                        >
                          Reddet
                        </button>
                      </>
                    )}

                    {b.durum === 'yayinda' && (
                      <button
                        onClick={() => handleAction(b._id, 'durdur')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold transition-colors"
                      >
                        Yayından Kaldır
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

                {/* ── AÇILIR SÜRE UZATMA / DÜZENLEME FORMU ──────────────── */}
                {editingBanner?._id === b._id && (
                  <div className="p-4 rounded-2xl bg-[#0d1117] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-heading font-black text-white">Yeni Süre Tanımla:</span>
                      <div className="flex items-center gap-1.5">
                        {[7, 15, 30, 60].map((gun) => (
                          <button
                            key={gun}
                            onClick={() => setEditSureGun(gun)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                              editSureGun === gun
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'
                            }`}
                          >
                            +{gun} Gün
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const now = new Date();
                        const newEnd = new Date(now.getTime() + editSureGun * 24 * 60 * 60 * 1000);
                        handleAction(b._id, 'onayla', { sureGun: editSureGun });
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-heading font-black text-xs shadow-lg hover:bg-amber-400 transition-colors"
                    >
                      Süreyi Kaydet ve Yayına Al
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
