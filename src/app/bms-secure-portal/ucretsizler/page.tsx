'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  Megaphone,
  Tag,
  Search,
  RefreshCw,
  Phone,
  Trash2,
  Check,
  Ban,
  Eye,
  MessageCircle,
  LayoutTemplate,
  Link2,
  Gift,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Copy,
  KeyRound,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

export default function AdminUcretsizlerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'listing' | 'banner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [inspectListing, setInspectListing] = useState<any | null>(null);
  const [inspectBanner, setInspectBanner] = useState<any | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const getListingPhotos = (item: any): string[] => {
    if (!item) return [];
    const photos: string[] = [];
    if (Array.isArray(item.fotograflar)) {
      item.fotograflar.forEach((p: any) => {
        const url = typeof p === 'string' ? p : p?.url;
        if (url && !photos.includes(url)) photos.push(url);
      });
    }
    if (item.fotoUrl && !photos.includes(item.fotoUrl)) photos.unshift(item.fotoUrl);
    if (item.anaFotografUrl && !photos.includes(item.anaFotografUrl)) photos.unshift(item.anaFotografUrl);
    if (item.anaFotograf?.url && !photos.includes(item.anaFotograf.url)) photos.unshift(item.anaFotograf.url);
    return photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=600'];
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (e) { }
  };

  const fetchPromos = async (showSpin = true) => {
    if (showSpin) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/promos', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Promos fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromos(false);
    const interval = setInterval(() => {
      fetchPromos(false);
    }, 15000); // 15 saniyede bir canlı otomatik yenileme
    return () => clearInterval(interval);
  }, []);

  // İlan Durum Güncelleme
  const handleUpdateListingStatus = async (listingId: string, status: string) => {
    setActionLoadingId(`listing_${listingId}`);
    try {
      const res = await fetch('/api/admin/listings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, status }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchPromos(false);
      } else {
        alert(json.error || 'İşlem başarısız.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // İlan Silme
  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Bu ücretsiz ilanı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    setActionLoadingId(`listing_${listingId}`);
    try {
      const res = await fetch(`/api/admin/listings?id=${listingId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        await fetchPromos(false);
      } else {
        alert(json.error || 'Silme işlemi başarısız.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Banner Aksiyonu (Onayla, Durdur, Sil)
  const handleBannerAction = async (id: string, action: 'onayla' | 'durdur' | 'delete') => {
    if (action === 'delete' && !confirm('Bu banner reklamı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    setActionLoadingId(`banner_${id}`);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, sureGun: 1 }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchPromos(false);
      } else {
        alert(json.error || json.message || 'İşlem başarısız.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const listings = (data?.listings || []) as any[];
  const banners = (data?.banners || []) as any[];
  const metrics = data?.metrics || {
    grandTotal: 0,
    totalPending: 0,
    totalActive: 0,
    totalExpired: 0,
    totalListings: 0,
    totalBanners: 0,
    pendingListings: 0,
    pendingBanners: 0,
    activeListings: 0,
    activeBanners: 0,
    expiredListings: 0,
    expiredBanners: 0,
  };

  // Filtrelenmiş İlanlar
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (l.baslik || '').toLowerCase().includes(term) ||
        (l.whatsappNumara || '').toLowerCase().includes(term) ||
        (l.ilSlug || '').toLowerCase().includes(term) ||
        (l.ilceSlug || '').toLowerCase().includes(term) ||
        (l.tamAd || '').toLowerCase().includes(term) ||
        (l.panelSifresi || '').toLowerCase().includes(term)
      );
    });
  }, [listings, statusFilter, searchTerm]);

  // Filtrelenmiş Bannerlar
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'onay_bekliyor' && b.durum !== 'onay_bekliyor' && b.durum !== 'beklemede') return false;
        if (statusFilter === 'yayinda' && b.durum !== 'yayinda') return false;
        if (statusFilter === 'suresi_doldu' && b.durum !== 'suresi_doldu' && b.durum !== 'pasif') return false;
      }
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (b.baslik || '').toLowerCase().includes(term) ||
        (b.musteriIletisim || '').toLowerCase().includes(term) ||
        (b.hedefUrl || '').toLowerCase().includes(term)
      );
    });
  }, [banners, statusFilter, searchTerm]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-left">

      {/* ── 1. ÜST BAŞLIK & CANLI DURUM ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] p-4 sm:p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FF6A3D] to-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-[#FF6A3D]/25">
            <Gift className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-2xl text-white font-heading tracking-tight">
                Ücretsiz Kampanyalar Masası
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black font-heading shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                24S CANLI TAKİP
              </span>
            </div>
            <p className="text-xs text-[#8b949e] truncate hidden sm:block">
              24 saatlik hediye vitrin ilanları ve 21:9 tepe banner başvurularını onaylayın, kalan süreyi izleyin ve WhatsApp ile VIP satış yapın.
            </p>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/ucretsiz-ilan"
            target="_blank"
            className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 border border-[#30363d] text-xs font-bold font-heading flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">İlan Formu</span>
          </Link>

          <Link
            href="/ucretsiz-reklam"
            target="_blank"
            className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#00E0A4] border border-[#30363d] text-xs font-bold font-heading flex items-center gap-1.5 transition-all shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Banner Formu</span>
          </Link>

          <button
            onClick={() => fetchPromos(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            title="Canlı Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-heading font-black hidden sm:inline">Yenile</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 KPI İSTATİSTİK KARTLARI ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Toplam Başvuru */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8b949e] text-xs font-heading font-black">
            <span>TOPLAM 24S PROMO</span>
            <Tag className="w-4 h-4 text-[#FF6A3D]" />
          </div>
          <div className="mt-3">
            <span className="font-black text-2xl sm:text-3xl text-white font-mono">{metrics.grandTotal}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8b949e]">
              <span>{metrics.totalListings} İlan</span>
              <span>•</span>
              <span>{metrics.totalBanners} Banner</span>
            </div>
          </div>
        </div>

        {/* Onay Bekleyenler */}
        <div className={`p-4 sm:p-5 rounded-2xl bg-[#161b22] border shadow-lg flex flex-col justify-between ${metrics.totalPending > 0 ? 'border-amber-500/60 bg-amber-950/15' : 'border-[#30363d]'
          }`}>
          <div className="flex items-center justify-between text-amber-400 text-xs font-heading font-black">
            <span>ONAY BEKLEYEN</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="font-black text-2xl sm:text-3xl text-amber-400 font-mono">{metrics.totalPending}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-400/80">
              <span>{metrics.pendingListings} İlan</span>
              <span>•</span>
              <span>{metrics.pendingBanners} Banner</span>
            </div>
          </div>
        </div>

        {/* Aktif Yayında (24S) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-emerald-500/30 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-heading font-black">
            <span>AKTİF YAYINDA (24S)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="font-black text-2xl sm:text-3xl text-emerald-400 font-mono">{metrics.totalActive}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400/80">
              <span>{metrics.activeListings} İlan</span>
              <span>•</span>
              <span>{metrics.activeBanners} Banner</span>
            </div>
          </div>
        </div>

        {/* Süresi Biten (Satış Fırsatı) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#161b22] border border-rose-500/30 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 text-xs font-heading font-black">
            <span>SÜRESİ DOLDU (SATIŞ)</span>
            <Megaphone className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="font-black text-2xl sm:text-3xl text-rose-400 font-mono">{metrics.totalExpired}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-rose-400/80">
              <span>{metrics.expiredListings} İlan</span>
              <span>•</span>
              <span>{metrics.expiredBanners} Banner</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FİLTRE VE ARAMA ÇUBUĞU ──────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] p-3.5 sm:p-4 rounded-2xl">

        {/* Arama Inputu */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Başlık, model adı, telefon (+44, 05..), şehir veya şifre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder:text-[#8b949e]/60 focus:outline-none focus:border-amber-400 transition-colors font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tür Filtreleri */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-[#30363d]">
            {[
              { id: 'all', label: 'Tümü', count: metrics.grandTotal },
              { id: 'listing', label: '🎁 24S İlanlar', count: metrics.totalListings },
              { id: 'banner', label: '🖼️ 24S Bannerlar', count: metrics.totalBanners },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black font-heading transition-all ${filterType === btn.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-[#8b949e] hover:text-white'
                  }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          {/* Durum Filtreleri */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-[#30363d]">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'onay_bekliyor', label: '🟡 Onay Bekliyor', count: metrics.totalPending },
              { id: 'yayinda', label: '🟢 Yayında', count: metrics.totalActive },
              { id: 'suresi_doldu', label: '🔴 Süresi Doldu', count: metrics.totalExpired },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-heading transition-all ${statusFilter === st.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-[#8b949e] hover:text-white'
                  }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. BÖLÜM: 24 SAATLİK ÜCRETSİZ VIP İLANLAR ──────────────── */}
      {(filterType === 'all' || filterType === 'listing') && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-sm sm:text-base text-white font-heading">
                24 Saatlik Ücretsiz VIP İlanlar ({filteredListings.length})
              </h2>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold">
              Anasayfa Sıralaması: 4. Sıradan Başlar
            </span>
          </div>

          {filteredListings.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b949e]">
              Filtreye uygun 24 saatlik ücretsiz ilan kaydı bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredListings.map((l: any) => {
                const now = Date.now();
                const expiryTime = l.paketBitisTarihi ? new Date(l.paketBitisTarihi).getTime() : 0;
                const remainingHours = expiryTime > now ? Math.round((expiryTime - now) / (1000 * 60 * 60)) : 0;
                const isExpired = l.status === 'suresi_doldu' || (expiryTime > 0 && expiryTime <= now);
                const isLive = l.status === 'yayinda' && !isExpired;
                const isPending = l.status === 'onay_bekliyor';
                const cleanPhone = (l.whatsappNumara || '').replace(/\D/g, '');

                // WhatsApp Satış & Tebrik Mesajları
                const salesMsg = encodeURIComponent(
                  `Merhaba ${l.baslik}! 👑\n\nwww.besteskort.online üzerindeki 24 saatlik ücretsiz VIP vitrin deneme süreniz tamamlandı.\n\nİlanınızın anasayfada ve ${(l.ilSlug || 'şehir').toUpperCase()} vitrininde kesintisiz yer alması, Google ve Yandex aramalarından gelen müşterileri kaçırmamak için avantajlı haftalık VIP paketlerimizi aktif edebiliriz.\n\n💎 Haftalık VIP Vitrin Paketlerimizi incelemek ve hemen yenilemek ister misiniz?\nPaneliniz: https://www.besteskort.online/panelim`
                );

                const liveNoticeMsg = encodeURIComponent(
                  `Merhaba ${l.baslik}! 🎉\n\n24 saatlik ücretsiz VIP vitrin ilanınız ONAYLANDI ve yayına alındı!\n\n🔗 Canlı İlan Linkiniz: https://www.besteskort.online/ilan/${l.slug}\n🔑 İlan Yönetim Paneliniz: https://www.besteskort.online/panelim\n\nBol kazançlar dileriz! 🚀`
                );

                const isLoadingAction = actionLoadingId === `listing_${l.id || l._id}`;

                return (
                  <div
                    key={l.id || l._id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg ${isPending
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : isLive
                        ? 'bg-[#0d1117] border-emerald-500/30'
                        : 'bg-[#0d1117]/80 border-[#30363d]'
                      }`}
                  >
                    {/* İlan Detayları */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="relative w-14 h-20 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                        <Image
                          src={l.fotoUrl || l.anaFotografUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                          alt={l.baslik}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-col min-w-0 gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/ilan/${l.slug}`}
                            target="_blank"
                            className="font-black text-xs sm:text-sm text-white truncate font-heading hover:text-amber-400 transition-colors"
                          >
                            {l.baslik}
                          </Link>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-black font-mono">
                            🎁 24S ÜCRETSİZ
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono flex-wrap">
                          <span className="text-slate-300 font-bold">📍 {(l.ilSlug || 'TR').toUpperCase()} {l.ilceSlug ? `/ ${l.ilceSlug.toUpperCase()}` : ''}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">📞 {l.whatsappNumara}</span>
                          <span>•</span>
                          <span>👁️ {l.totalViews || 0} İzlenme</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">💬 {l.whatsappClicks || 0} WA Tıklama</span>
                        </div>

                        {/* Kalan Süre & Durum Rozeti */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-black flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" /> Onay Bekliyor
                            </span>
                          )}
                          {isLive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Yayında ({remainingHours} Saat Kaldı)
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-black flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Süresi Doldu / Pasif
                            </span>
                          )}
                          {/* Panel Giriş Bilgisi Rozeti (Tel & Şifre Kopyalama) */}
                          <div className="flex items-center gap-1.5 bg-[#141824] border border-[#252B3B] px-2 py-1 rounded-lg text-[11px] font-mono">
                            <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[#8b949e]">Tel:</span>
                            <span className="text-emerald-400 font-bold">{l.whatsappNumara}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(l.whatsappNumara, `l_phone_${l.id || l._id}`)}
                              className="hover:text-white text-gray-400 p-0.5 transition-colors cursor-pointer"
                              title="Telefonu Kopyala"
                            >
                              {copiedKeyId === `l_phone_${l.id || l._id}` ? <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <span className="text-gray-600">|</span>
                            <span className="text-[#8b949e]">Şifre:</span>
                            <span className="text-amber-400 font-bold">{l.panelSifresi || 'Belirtilmedi'}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(l.panelSifresi || '', `l_pass_${l.id || l._id}`)}
                              className="hover:text-white text-gray-400 p-0.5 transition-colors cursor-pointer"
                              title="Şifreyi Kopyala"
                            >
                              {copiedKeyId === `l_pass_${l.id || l._id}` ? <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Eylem Butonları */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-[#21262d]">
                      {/* Detayları Gör Butonu */}
                      <button
                        type="button"
                        onClick={() => {
                          setInspectListing(l);
                          setActivePhotoIdx(0);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 border border-amber-500/30 text-xs font-black font-heading flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                        title="İlanın tüm fotoğraflarını, açıklamasını ve detaylarını incele"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Detaylar</span>
                      </button>

                      {/* WhatsApp Satış / Bilgi Butonu */}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${isExpired ? salesMsg : liveNoticeMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-2 rounded-xl text-xs font-black font-heading flex items-center gap-1.5 transition-all shadow-md ${isExpired
                            ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                            }`}
                        >
                          <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                          <span>{isExpired ? 'VIP Teklifi Gönder' : 'Onay Bildirimi'}</span>
                        </a>
                      )}

                      {/* Onayla / Yayına Al Butonu */}
                      {!isLive && (
                        <button
                          disabled={isLoadingAction}
                          onClick={() => handleUpdateListingStatus(l.id || l._id, 'yayinda')}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black font-heading flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isExpired ? 'Tekrar Yayına Al (24S)' : 'Onayla (24S)'}</span>
                        </button>
                      )}

                      {/* Süreyi Bitir Butonu */}
                      {isLive && (
                        <button
                          disabled={isLoadingAction}
                          onClick={() => handleUpdateListingStatus(l.id || l._id, 'suresi_doldu')}
                          className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-heading flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Süreyi Bitir</span>
                        </button>
                      )}

                      {/* Sil Butonu */}
                      <button
                        disabled={isLoadingAction}
                        onClick={() => handleDeleteListing(l.id || l._id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        title="İlanı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 5. BÖLÜM: 24 SAATLİK ÜCRETSİZ BANNER REKLAMLAR ──────────────── */}
      {(filterType === 'all' || filterType === 'banner') && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-400" />
              <h2 className="font-black text-sm sm:text-base text-white font-heading">
                24 Saatlik Ücretsiz Banner Reklamlar ({filteredBanners.length})
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              Konum: 21:9 Tepe Sabit Vitrin
            </span>
          </div>

          {filteredBanners.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8b949e]">
              Filtreye uygun 24 saatlik ücretsiz banner reklam kaydı bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredBanners.map((b: any) => {
                const now = Date.now();
                const expiryTime = b.bitisTarihi ? new Date(b.bitisTarihi).getTime() : 0;
                const remainingHours = expiryTime > now ? Math.round((expiryTime - now) / (1000 * 60 * 60)) : 0;
                const isExpired = b.durum === 'suresi_doldu' || b.durum === 'pasif' || (expiryTime > 0 && expiryTime <= now);
                const isLive = b.durum === 'yayinda' && !isExpired;
                const isPending = b.durum === 'onay_bekliyor' || b.durum === 'beklemede';
                const cleanPhone = (b.musteriIletisim || '').replace(/\D/g, '');

                const salesMsg = encodeURIComponent(
                  `Merhaba ${b.baslik}! 👑\n\nwww.besteskort.online üzerindeki 24 saatlik 21:9 tepe banner reklamınızın hediye yayın süresi tamamlandı.\n\nTüm sayfalarda en tepede sabit kalmaya devam etmek için avantajlı haftalık banner paketlerimizi hemen yenileyebilirsiniz.\nBilgi almak ister misiniz?`
                );

                const isLoadingAction = actionLoadingId === `banner_${b.id || b._id}`;

                return (
                  <div
                    key={b.id || b._id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg ${isPending
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : isLive
                        ? 'bg-[#0d1117] border-emerald-500/30'
                        : 'bg-[#0d1117]/80 border-[#30363d]'
                      }`}
                  >
                    {/* Banner Önizleme ve Detayları */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="relative w-28 h-12 sm:w-36 sm:h-16 rounded-xl overflow-hidden bg-black/60 border border-[#30363d] shrink-0">
                        {b.gorselUrl ? (
                          <Image
                            src={b.gorselUrl}
                            alt={b.baslik}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                            Görsel Yok
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs sm:text-sm text-white truncate font-heading">
                            {b.baslik}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black font-mono">
                            🖼️ 24S BANNER
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#21262d] text-[#8b949e] text-[10px] font-mono">
                            {b.konum === 'anasayfa' ? 'Sadece Anasayfa' : b.konum === 'ilan_detay' ? 'İlan Detayları' : 'Tüm Sayfalar'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono flex-wrap">
                          <span className="text-emerald-400 font-bold">📞 {b.musteriIletisim}</span>
                          <span>•</span>
                          <a href={b.hedefUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 truncate max-w-xs">
                            <Link2 className="w-3 h-3" />
                            <span className="truncate">{b.hedefUrl}</span>
                          </a>
                          <span>•</span>
                          <span>👁️ {b.goruntulenmeSayisi || 0} Gösterim</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">🎯 {b.tiklamaSayisi || 0} Tıklama</span>
                        </div>

                        {/* Durum Rozeti */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {isPending && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-black flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3" /> Onay Bekliyor
                            </span>
                          )}
                          {isLive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Yayında ({remainingHours} Saat Kaldı)
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-black flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Süresi Bitti / Pasif
                            </span>
                          )}

                          {/* Banner Panel Giriş Bilgisi Rozeti (Tel & Şifre Kopyalama) */}
                          <div className="flex items-center gap-1.5 bg-[#141824] border border-[#252B3B] px-2 py-1 rounded-lg text-[11px] font-mono">
                            <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-[#8b949e]">Tel:</span>
                            <span className="text-emerald-400 font-bold">{b.musteriIletisim}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.musteriIletisim, `b_phone_${b.id || b._id}`)}
                              className="hover:text-white text-gray-400 p-0.5 transition-colors cursor-pointer"
                              title="Telefonu Kopyala"
                            >
                              {copiedKeyId === `b_phone_${b.id || b._id}` ? <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <span className="text-gray-600">|</span>
                            <span className="text-[#8b949e]">Şifre:</span>
                            <span className="text-amber-400 font-bold">{b.panelSifresi || '123456'}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.panelSifresi || '123456', `b_pass_${b.id || b._id}`)}
                              className="hover:text-white text-gray-400 p-0.5 transition-colors cursor-pointer"
                              title="Şifreyi Kopyala"
                            >
                              {copiedKeyId === `b_pass_${b.id || b._id}` ? <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap pt-2 lg:pt-0 border-t lg:border-t-0 border-[#21262d]">
                      {/* Banner Detay Butonu */}
                      <button
                        type="button"
                        onClick={() => setInspectBanner(b)}
                        className="px-3 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-emerald-300 border border-emerald-500/30 text-xs font-black font-heading flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                        title="Banner görselini, hedef linkini ve detaylarını incele"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Detaylar</span>
                      </button>

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${salesMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 text-xs font-black font-heading flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                          <span>WhatsApp İletişim</span>
                        </a>
                      )}

                      {!isLive && (
                        <button
                          disabled={isLoadingAction}
                          onClick={() => handleBannerAction(b.id || b._id, 'onayla')}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black font-heading flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isExpired ? 'Tekrar Yayına Al (24S)' : 'Onayla (24S)'}</span>
                        </button>
                      )}

                      {isLive && (
                        <button
                          disabled={isLoadingAction}
                          onClick={() => handleBannerAction(b.id || b._id, 'durdur')}
                          className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-heading flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Durdur</span>
                        </button>
                      )}

                      <button
                        disabled={isLoadingAction}
                        onClick={() => handleBannerAction(b.id || b._id, 'delete')}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Bannerı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* ══════════════════════════════════════════════════════════════════
          6. İLAN DETAYLI İNCELEME MODALI (FOTOĞRAFLAR, METİNLER, GİRİŞ BİLGİLERİ)
          ══════════════════════════════════════════════════════════════════ */}
          {inspectListing && (() => {
            const photos = getListingPhotos(inspectListing);
            const safeIdx = Math.min(activePhotoIdx, photos.length - 1);
            const cleanPhone = (inspectListing.whatsappNumara || '').replace(/\D/g, '');
            const now = Date.now();
            const expiryTime = inspectListing.paketBitisTarihi ? new Date(inspectListing.paketBitisTarihi).getTime() : 0;
            const remainingHours = expiryTime > now ? Math.round((expiryTime - now) / (1000 * 60 * 60)) : 0;
            const isExpired = inspectListing.status === 'suresi_doldu' || inspectListing.status === 'pasif' || (expiryTime > 0 && expiryTime <= now);
            const isLive = inspectListing.status === 'yayinda' && !isExpired;
            const isPending = inspectListing.status === 'onay_bekliyor';

            return (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
                <div className="w-full max-w-4xl bg-[#141824] border border-[#252B3B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">

                  {/* Modal Sticky Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#252B3B] bg-[#0d1117]/95 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading font-black text-sm sm:text-base text-white truncate max-w-md">
                            {inspectListing.baslik}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black font-mono">
                            🎁 24S ÜCRETSİZ İLAN
                          </span>
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                              🟡 Onay Bekliyor
                            </span>
                          )}
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                              🟢 Yayında ({remainingHours} Saat Kaldı)
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                              🔴 Süresi Doldu
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8b949e]">
                          İlan ID: {inspectListing.id || inspectListing._id} • Slug: /{inspectListing.slug}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectListing(null)}
                      className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scrollable Content */}
                  <div className="overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 text-left">

                    {/* 1. Fotoğraf Galerisi & Büyük Önizleme */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-black uppercase text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Yüklenen Fotoğraflar ({photos.length} Adet)
                        </span>
                        <span className="text-[11px] text-[#8b949e]">
                          Fotoğrafa tıklayarak büyük inceleyin
                        </span>
                      </div>

                      {/* Büyük Önizleme Alanı */}
                      <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-black/70 border border-[#252B3B] flex items-center justify-center">
                        <Image
                          src={photos[safeIdx]}
                          alt={inspectListing.baslik}
                          fill
                          unoptimized
                          className="object-contain"
                        />

                        {/* Önceki / Sonraki Butonları */}
                        {photos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Fotoğraf Sırası & Orijinal Görsel Linki */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white font-mono font-bold text-xs border border-white/10">
                            {safeIdx + 1} / {photos.length}
                          </span>
                          <a
                            href={photos[safeIdx]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-[#21262d]/90 hover:bg-[#30363d] text-amber-400 font-bold text-xs flex items-center gap-1 border border-amber-500/30 transition-all"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Orijinal</span>
                          </a>
                        </div>
                      </div>

                      {/* Fotoğraf Şeridi (Thumbnails) */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {photos.map((pUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${safeIdx === idx ? 'border-amber-400 ring-2 ring-amber-400/30 scale-95' : 'border-[#252B3B] opacity-70 hover:opacity-100'
                              }`}
                          >
                            <Image src={pUrl} alt="" fill unoptimized className="object-cover" />
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-slate-950 font-black text-[9px] text-center uppercase">
                                Kapak
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Müşteri Giriş Bilgileri & WhatsApp İletişim (Öne Çıkan Kart) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border-2 border-amber-500/40 flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-[#252B3B] pb-2.5">
                        <div className="flex items-center gap-2 text-amber-400 font-heading font-black text-xs sm:text-sm">
                          <KeyRound className="w-4 h-4" />
                          <span>Müşteri Panelim Giriş Bilgileri</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                          Giriş Kimliği
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {/* Telefon */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-[#252B3B]">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-[#8b949e] uppercase font-bold">Kullanıcı Adı / Tel</span>
                            <span className="text-sm font-mono font-bold text-emerald-400 truncate">{inspectListing.whatsappNumara}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inspectListing.whatsappNumara, 'modal_l_phone')}
                            className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
                            title="Telefonu Kopyala"
                          >
                            {copiedKeyId === 'modal_l_phone' ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Şifre */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-[#252B3B]">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-[#8b949e] uppercase font-bold">Panel Şifresi</span>
                            <span className="text-base font-mono font-black text-amber-400">{inspectListing.panelSifresi || 'Belirtilmedi'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inspectListing.panelSifresi || '', 'modal_l_pass')}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
                            title="Şifreyi Kopyala"
                          >
                            {copiedKeyId === 'modal_l_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* WhatsApp Doğrudan Mesaj */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-heading font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                          >
                            <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                            <span>WhatsApp'tan Yaz</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3. Profil ve Fiziksel Özellikler Grid */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-heading font-black uppercase text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        Profil ve Fiziksel Özellikler
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Profil / İsim:</span>
                          <strong className="text-white font-heading mt-0.5 truncate">{inspectListing.tamAd || inspectListing.baslik}</strong>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Konum / Şehir:</span>
                          <strong className="text-emerald-400 mt-0.5 font-bold truncate">
                            {(inspectListing.ilSlug || 'TR').toUpperCase()} {inspectListing.ilceSlug ? `/ ${inspectListing.ilceSlug.toUpperCase()}` : ''}
                          </strong>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Seans Ücreti:</span>
                          <strong className="text-amber-400 font-mono font-bold mt-0.5">
                            {inspectListing.fiyat ? `${inspectListing.fiyat.toLocaleString('tr-TR')} ${inspectListing.paraBirimi || 'TL'}` : 'Belirtilmedi'}
                          </strong>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Yaş / Boy / Kilo:</span>
                          <strong className="text-white mt-0.5">
                            {inspectListing.yas || '-'} Yaş • {inspectListing.boy ? `${inspectListing.boy}cm` : '-'} • {inspectListing.kilo ? `${inspectListing.kilo}kg` : '-'}
                          </strong>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Göğüs / Saç / Göz:</span>
                          <strong className="text-white mt-0.5 truncate">
                            {inspectListing.gogusOlcusu || '-'} • {inspectListing.sacRengi || '-'} • {inspectListing.gozRengi || '-'}
                          </strong>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Uyruk & Diller:</span>
                          <strong className="text-white mt-0.5 truncate">
                            {inspectListing.uyruk || 'Türkiye'} ({Array.isArray(inspectListing.diller) ? inspectListing.diller.join(', ') : (inspectListing.diller || 'Türkçe')})
                          </strong>
                        </div>

                        <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col col-span-2">
                          <span className="text-[10px] text-[#8b949e]">Hizmet Mekanları:</span>
                          <strong className="text-white mt-0.5 truncate">
                            {Array.isArray(inspectListing.hizmetMekanlari) ? inspectListing.hizmetMekanlari.join(', ') : (inspectListing.hizmetMekanlari || 'Kendi Evi, Lüks Otel, Rezidans')}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* 4. İlan Açıklaması ve Biyografi */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-heading font-black uppercase text-white">İlan Açıklaması</span>
                      <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#252B3B] text-xs sm:text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
                        {inspectListing.aciklama || 'Açıklama girilmemiş.'}
                      </div>
                    </div>

                    {inspectListing.hakkindaBiyografi && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-heading font-black uppercase text-white">Hakkında & Biyografi</span>
                        <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#252B3B] text-xs sm:text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
                          {inspectListing.hakkindaBiyografi}
                        </div>
                      </div>
                    )}

                    {/* 5. Sistem & Analytics Detayları */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                        <span className="text-[10px] text-[#8b949e]">Kayıt Tarihi:</span>
                        <strong className="text-white font-mono text-[11px] mt-0.5">
                          {new Date(inspectListing.createdAt).toLocaleString('tr-TR')}
                        </strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                        <span className="text-[10px] text-[#8b949e]">Bitiş Tarihi:</span>
                        <strong className="text-amber-400 font-mono text-[11px] mt-0.5">
                          {inspectListing.paketBitisTarihi ? new Date(inspectListing.paketBitisTarihi).toLocaleString('tr-TR') : '-'}
                        </strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                        <span className="text-[10px] text-[#8b949e]">Kullanıcı IP / ID:</span>
                        <strong className="text-[#8b949e] font-mono text-[11px] mt-0.5 truncate">
                          {inspectListing.creatorIp || 'IP Kaydı Yok'}
                        </strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col">
                        <span className="text-[10px] text-[#8b949e]">Performans:</span>
                        <strong className="text-emerald-400 font-mono text-[11px] mt-0.5">
                          👁️ {inspectListing.totalViews || 0} • 💬 {inspectListing.whatsappClicks || 0}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Modal Footer Aksiyonları */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#252B3B] bg-[#0d1117] shrink-0">
                    <Link
                      href={`/ilan/${inspectListing.slug}`}
                      target="_blank"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 font-bold text-xs border border-[#30363d] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>Canlı Sayfada Aç</span>
                    </Link>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {!isLive && (
                        <button
                          disabled={actionLoadingId === `listing_${inspectListing.id || inspectListing._id}`}
                          onClick={async () => {
                            await handleUpdateListingStatus(inspectListing.id || inspectListing._id, 'yayinda');
                            setInspectListing(null);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{isExpired ? 'Tekrar Yayına Al (24S)' : 'Onayla (24S Yayına Al)'}</span>
                        </button>
                      )}

                      {isLive && (
                        <button
                          disabled={actionLoadingId === `listing_${inspectListing.id || inspectListing._id}`}
                          onClick={async () => {
                            await handleUpdateListingStatus(inspectListing.id || inspectListing._id, 'suresi_doldu');
                            setInspectListing(null);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs font-heading flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Süreyi Bitir (Pasif Yap)</span>
                        </button>
                      )}

                      <button
                        disabled={actionLoadingId === `listing_${inspectListing.id || inspectListing._id}`}
                        onClick={async () => {
                          await handleDeleteListing(inspectListing.id || inspectListing._id);
                          setInspectListing(null);
                        }}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all active:scale-95 cursor-pointer"
                        title="İlanı Kalıcı Olarak Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════════
          7. BANNER REKLAM DETAYLI İNCELEME MODALI
          ══════════════════════════════════════════════════════════════════ */}
          {inspectBanner && (() => {
            const cleanPhone = (inspectBanner.musteriIletisim || '').replace(/\D/g, '');
            const now = Date.now();
            const expiryTime = inspectBanner.bitisTarihi ? new Date(inspectBanner.bitisTarihi).getTime() : 0;
            const remainingHours = expiryTime > now ? Math.round((expiryTime - now) / (1000 * 60 * 60)) : 0;
            const isExpired = inspectBanner.durum === 'suresi_doldu' || inspectBanner.durum === 'pasif' || (expiryTime > 0 && expiryTime <= now);
            const isLive = inspectBanner.durum === 'yayinda' && !isExpired;
            const isPending = inspectBanner.durum === 'onay_bekliyor' || inspectBanner.durum === 'beklemede';
            const views = inspectBanner.goruntulenmeSayisi || 0;
            const clicks = inspectBanner.tiklamaSayisi || 0;
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

            return (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
                <div className="w-full max-w-4xl bg-[#141824] border border-[#252B3B] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">

                  {/* Modal Sticky Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#252B3B] bg-[#0d1117]/95 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading font-black text-sm sm:text-base text-white truncate max-w-md">
                            {inspectBanner.baslik}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black font-mono">
                            🖼️ 24S BANNER REKLAM
                          </span>
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                              🟡 Onay Bekliyor
                            </span>
                          )}
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                              🟢 Yayında ({remainingHours} Saat Kaldı)
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                              🔴 Süresi Doldu
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8b949e]">
                          Banner ID: {inspectBanner.id || inspectBanner._id}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectBanner(null)}
                      className="p-2 rounded-xl bg-[#21262d] text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Scrollable Content */}
                  <div className="overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 text-left">

                    {/* 1. 21:9 Ultra Geniş Canlı Görsel Önizleme */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-black uppercase text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          21:9 Ultra Geniş Banner Görseli / GIF Önizleme
                        </span>
                        <span className="text-[11px] text-[#8b949e] font-mono">
                          Uyum Modu: {inspectBanner.fitMode === 'cover' ? 'Tam Kapla (Cover)' : 'Tamamı Görünsün (Contain)'}
                        </span>
                      </div>

                      <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/30 shadow-xl flex items-center justify-center">
                        {inspectBanner.gorselUrl ? (
                          <Image
                            src={inspectBanner.gorselUrl}
                            alt={inspectBanner.baslik}
                            fill
                            unoptimized
                            className={inspectBanner.fitMode === 'cover' ? 'object-cover' : 'object-contain'}
                          />
                        ) : (
                          <div className="text-xs text-gray-500">Görsel Bulunamadı</div>
                        )}

                        {inspectBanner.gorselUrl && (
                          <a
                            href={inspectBanner.gorselUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-all shadow-lg"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tam Boyut Aç</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 2. Müşteri Giriş Bilgileri & WhatsApp */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border-2 border-emerald-500/40 flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-[#252B3B] pb-2.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-heading font-black text-xs sm:text-sm">
                          <KeyRound className="w-4 h-4" />
                          <span>Müşteri Paneli Giriş Bilgileri</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          Giriş Kimliği
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {/* Telefon */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-[#252B3B]">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-[#8b949e] uppercase font-bold">Kullanıcı Adı / Tel</span>
                            <span className="text-sm font-mono font-bold text-emerald-400 truncate">{inspectBanner.musteriIletisim}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inspectBanner.musteriIletisim, 'modal_b_phone')}
                            className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
                            title="Telefonu Kopyala"
                          >
                            {copiedKeyId === 'modal_b_phone' ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Şifre */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-[#252B3B]">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-[#8b949e] uppercase font-bold">Panel Şifresi</span>
                            <span className="text-base font-mono font-black text-amber-400">{inspectBanner.panelSifresi || '123456'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inspectBanner.panelSifresi || '123456', 'modal_b_pass')}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
                            title="Şifreyi Kopyala"
                          >
                            {copiedKeyId === 'modal_b_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* WhatsApp Doğrudan Mesaj */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 font-heading font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                          >
                            <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                            <span>WhatsApp'tan Yaz</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3. Banner Ayarları ve Hedef Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Hedef Yönlendirme Linki */}
                      <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col gap-1.5">
                        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Tıklayan Müşterinin Gideceği Link</span>
                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#141824] border border-[#252B3B]">
                          <a
                            href={inspectBanner.hedefUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline font-mono truncate max-w-[240px] sm:max-w-xs flex items-center gap-1"
                          >
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{inspectBanner.hedefUrl}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(inspectBanner.hedefUrl, 'modal_b_url')}
                            className="p-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                            title="Linki Kopyala"
                          >
                            {copiedKeyId === 'modal_b_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Yayın Konumu */}
                      <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col gap-1.5">
                        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Yayın Konumu</span>
                        <div className="p-2 rounded-lg bg-[#141824] border border-[#252B3B] font-bold text-white">
                          {inspectBanner.konum === 'anasayfa'
                            ? 'Sadece Anasayfa Tepe Vitrin'
                            : inspectBanner.konum === 'ilan_detay'
                              ? 'Sadece İlan Detay Sayfaları'
                              : 'Tüm Sayfalar (Anasayfa + İlan Detayları)'}
                        </div>
                      </div>
                    </div>

                    {/* 4. Canlı İstatistikler & Tarihler */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col text-center">
                        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Gösterim Sayısı</span>
                        <strong className="text-white font-mono font-black text-lg mt-0.5">{views.toLocaleString()}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col text-center">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Tıklama Sayısı</span>
                        <strong className="text-emerald-400 font-mono font-black text-lg mt-0.5">{clicks.toLocaleString()}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col text-center">
                        <span className="text-[10px] text-amber-400 uppercase font-bold">CTR (Tıklama Oranı)</span>
                        <strong className="text-amber-400 font-mono font-black text-lg mt-0.5">%{ctr}</strong>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0d1117] border border-[#252B3B] flex flex-col text-center">
                        <span className="text-[10px] text-[#8b949e] uppercase font-bold">Kalan Süre</span>
                        <strong className="text-white font-mono font-bold text-sm mt-1">
                          {isLive ? `${remainingHours} Saat` : isExpired ? 'Süresi Doldu' : 'Onay Bekliyor'}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Modal Footer Aksiyonları */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-[#252B3B] bg-[#0d1117] shrink-0">
                    <a
                      href={inspectBanner.hedefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-blue-300 font-bold text-xs border border-[#30363d] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Hedef Linki Test Et</span>
                    </a>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {!isLive && (
                        <button
                          disabled={actionLoadingId === `banner_${inspectBanner.id || inspectBanner._id}`}
                          onClick={async () => {
                            await handleBannerAction(inspectBanner.id || inspectBanner._id, 'onayla');
                            setInspectBanner(null);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{isExpired ? 'Tekrar Yayına Al (24S)' : 'Onayla (24S Yayına Al)'}</span>
                        </button>
                      )}

                      {isLive && (
                        <button
                          disabled={actionLoadingId === `banner_${inspectBanner.id || inspectBanner._id}`}
                          onClick={async () => {
                            await handleBannerAction(inspectBanner.id || inspectBanner._id, 'durdur');
                            setInspectBanner(null);
                          }}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold text-xs font-heading flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Durdur</span>
                        </button>
                      )}

                      <button
                        disabled={actionLoadingId === `banner_${inspectBanner.id || inspectBanner._id}`}
                        onClick={async () => {
                          await handleBannerAction(inspectBanner.id || inspectBanner._id, 'delete');
                          setInspectBanner(null);
                        }}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all active:scale-95 cursor-pointer"
                        title="Bannerı Kalıcı Olarak Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
}
