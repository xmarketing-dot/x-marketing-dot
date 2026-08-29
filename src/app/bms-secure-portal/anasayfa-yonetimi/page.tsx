'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Sliders, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  Crown, 
  Check, 
  X, 
  Search, 
  MapPin, 
  ShieldCheck,
  Plus,
  Trash2,
  Megaphone,
  Layers,
  ArrowRight,
  Flame,
  ExternalLink,
  ChevronRight,
  Globe,
  Radio,
  Clock
} from 'lucide-react';

interface TickerItem {
  badge: string;
  text: string;
  link: string;
}

interface SpecialAdEntry {
  _id?: string;
  aktif: boolean;
  ilanId: string | null;
  hedefIlSlug: string;
  gecikmeSaniye: number;
  rozet: string;
}

const POPULAR_CITIES = [
  { slug: 'tum_turkiye', ad: '🇹🇷 TÜRKİYE GENELİ (Tüm Şehirler)' },
  { slug: 'istanbul', ad: '📍 İSTANBUL (Tüm İlçeler)' },
  { slug: 'ankara', ad: '📍 ANKARA' },
  { slug: 'izmir', ad: '📍 İZMİR' },
  { slug: 'antalya', ad: '📍 ANTALYA' },
  { slug: 'bursa', ad: '📍 BURSA' },
  { slug: 'adana', ad: '📍 ADANA' },
  { slug: 'eskisehir', ad: '📍 ESKİŞEHİR' },
  { slug: 'gaziantep', ad: '📍 GAZİANTEP' },
  { slug: 'kocaeli', ad: '📍 KOCAELİ' },
  { slug: 'mugla', ad: '📍 MUĞLA (Bodrum/Marmaris/Fethiye)' },
];

export default function AdminHomepageConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAd, setSavingAd] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [heroBaslik, setHeroBaslik] = useState('');
  const [heroAltBaslik, setHeroAltBaslik] = useState('');
  const [bannerMetin, setBannerMetin] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerRozet, setBannerRozet] = useState('👑 VIP DUYURU');
  const [bannerAktif, setBannerAktif] = useState(true);
  
  // Rotating Ticker Announcements
  const [duyurular, setDuyurular] = useState<TickerItem[]>([
    { badge: '👑 LİDER REHBER', text: '81 İl ve İlçede Türkiye\'nin En Büyük İlan Platformu', link: '/ilan-ver' },
    { badge: '🔥 ANINDA MÜŞTERİ', text: 'İlan Verin, WhatsApp ile Müşterilere Ulaşın!', link: '/ilan-ver' },
    { badge: '💎 VIP VİTRİN', text: 'Google Aramalarında En Üst Sırada Yer Alın', link: '/ilan-ver' },
    { badge: '⚡ CANLI DESTEK', text: '%100 Güvenli & 7/24 Canlı Müşteri Desteği', link: '/chat' },
  ]);

  // Multiple Special Ads State (Çoklu Sponsorlu Popup Reklamları)
  const [ozelIlanReklamlar, setOzelIlanReklamlar] = useState<SpecialAdEntry[]>([]);

  // New Ad Form State
  const [newAdIlanId, setNewAdIlanId] = useState<string>('');
  const [newAdHedefIl, setNewAdHedefIl] = useState<string>('tum_turkiye');
  const [newAdRozet, setNewAdRozet] = useState<string>('🔥 GÜNÜN ÖZEL VIP İLANI');
  const [newAdGecikme, setNewAdGecikme] = useState<number>(4);

  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedListingForAd = allListings.find((l) => l._id === newAdIlanId);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-config');
      const data = await res.json();
      if (data.config) {
        setHeroBaslik(data.config.hero?.baslik || 'Türkiye\'nin En Güvenilir VIP Eskort İlan Platformu');
        setHeroAltBaslik(data.config.hero?.altBaslik || '81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.');
        setBannerMetin(data.config.aktifBanner?.metin || '🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!');
        setBannerLink(data.config.aktifBanner?.link || '/ilan-ver');
        setBannerRozet(data.config.aktifBanner?.rozet || '👑 VIP DUYURU');
        setBannerAktif(data.config.aktifBanner?.aktif ?? true);
        
        // Multi-ad array loading
        if (Array.isArray(data.config.ozelIlanReklamlar) && data.config.ozelIlanReklamlar.length > 0) {
          setOzelIlanReklamlar(data.config.ozelIlanReklamlar);
        } else if (data.config.ozelIlanReklam?.ilanId) {
          // Migrate legacy single ad into array
          setOzelIlanReklamlar([
            {
              _id: 'ad_legacy',
              aktif: data.config.ozelIlanReklam.aktif ?? true,
              ilanId: data.config.ozelIlanReklam.ilanId.toString(),
              hedefIlSlug: data.config.ozelIlanReklam.hedefIlSlug || 'tum_turkiye',
              gecikmeSaniye: data.config.ozelIlanReklam.gecikmeSaniye || 4,
              rozet: data.config.ozelIlanReklam.rozet || '🔥 GÜNÜN ÖZEL VIP İLANI',
            }
          ]);
        }

        if (Array.isArray(data.config.duyurular) && data.config.duyurular.length > 0) {
          setDuyurular(data.config.duyurular);
        }

        const rawIds = data.config.sliderIlanIds || [];
        setSelectedListingIds(rawIds.map((id: any) => (id?._id ? id._id.toString() : (id?.toString ? id.toString() : String(id)))));
      }
      if (data.allListings) {
        setAllListings(data.allListings);
      }
      if (data.allLocations) {
        setAllLocations(data.allLocations);
      }
    } catch (e) {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const handleToggleListing = (id: string) => {
    setSelectedListingIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVip = () => {
    const vipIds = allListings
      .filter((l) => l.rozet === 'vip' || l.rozet === 'ultravip')
      .map((l) => l._id.toString());
    setSelectedListingIds(vipIds);
  };

  const handleAddAnnouncement = () => {
    setDuyurular([...duyurular, { badge: '⭐ DUYURU', text: 'Yeni kampanya duyurusu...', link: '/ilan-ver' }]);
  };

  const handleRemoveAnnouncement = (index: number) => {
    setDuyurular(duyurular.filter((_, i) => i !== index));
  };

  const handleUpdateAnnouncement = (index: number, field: keyof TickerItem, value: string) => {
    const updated = [...duyurular];
    updated[index] = { ...updated[index], [field]: value };
    setDuyurular(updated);
  };

  // ── ÇOKLU ÖZEL REKLAM YÖNETİMİ FONKSİYONLARI ──
  const handleAddNewSpecialAd = () => {
    if (!newAdIlanId) {
      alert('Lütfen popup olarak gösterilecek bir ilan seçin.');
      return;
    }

    const newAd: SpecialAdEntry = {
      _id: 'ad_' + Date.now(),
      aktif: true,
      ilanId: newAdIlanId,
      hedefIlSlug: newAdHedefIl,
      gecikmeSaniye: newAdGecikme,
      rozet: newAdRozet,
    };

    setOzelIlanReklamlar([newAd, ...ozelIlanReklamlar]);
    setNewAdIlanId('');
  };

  const handleToggleAdActive = (index: number) => {
    const updated = [...ozelIlanReklamlar];
    updated[index].aktif = !updated[index].aktif;
    setOzelIlanReklamlar(updated);
  };

  const handleRemoveSpecialAd = (index: number) => {
    setOzelIlanReklamlar(ozelIlanReklamlar.filter((_, i) => i !== index));
  };

  const handleSaveSpecialAdsOnly = async () => {
    setSavingAd(true);
    setMessage(null);
    try {
      const topActive = ozelIlanReklamlar.find((a) => a.aktif) || ozelIlanReklamlar[0] || null;

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBaslik,
          heroAltBaslik,
          bannerMetin,
          bannerLink,
          bannerAktif,
          bannerRozet,
          duyurular,
          sliderIlanIds: selectedListingIds,
          ozelIlanReklamlar,
          ozelIlanReklam: topActive ? {
            aktif: topActive.aktif,
            ilanId: topActive.ilanId,
            hedefIlSlug: topActive.hedefIlSlug,
            gecikmeSaniye: topActive.gecikmeSaniye,
            rozet: topActive.rozet,
          } : { aktif: false },
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Tüm özel reklamlar (${ozelIlanReklamlar.length} Adet) başarıyla kaydedildi ve yayına alındı!` });
        fetchConfig();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Özel reklamlar kaydedilemedi.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Bağlantı hatası' });
    } finally {
      setSavingAd(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const topActive = ozelIlanReklamlar.find((a) => a.aktif) || ozelIlanReklamlar[0] || null;

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBaslik,
          heroAltBaslik,
          bannerMetin,
          bannerLink,
          bannerAktif,
          bannerRozet,
          duyurular,
          sliderIlanIds: selectedListingIds,
          ozelIlanReklamlar,
          ozelIlanReklam: topActive ? {
            aktif: topActive.aktif,
            ilanId: topActive.ilanId,
            hedefIlSlug: topActive.hedefIlSlug,
            gecikmeSaniye: topActive.gecikmeSaniye,
            rozet: topActive.rozet,
          } : { aktif: false },
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Tüm anasayfa ve reklam ayarları başarıyla güncellendi!' });
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Ayarlar güncellenirken bir hata oluştu.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Bağlantı hatası.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredListings = allListings.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.baslik?.toLowerCase().includes(term) ||
      l.ilSlug?.toLowerCase().includes(term) ||
      l.ilceSlug?.toLowerCase().includes(term)
    );
  });

  const getListingById = (id: string | null) => {
    if (!id) return null;
    return allListings.find((l) => l._id.toString() === id.toString()) || null;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-full text-left">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Anasayfa &amp; Reklam Yönetimi</h1>
            <p className="text-xs text-[#8b949e]">Çoklu popup reklamları, konum bazlı hedefleme (İstanbul/İzmir/vb.), vitrin sliderları ve duyuruları yönetin.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchConfig}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="flex flex-col gap-8">
        
        {/* ── 1. ÇOKLU SPONSORLU POPUP REKLAM YÖNETİMİ (KONUM & SIRALI ROTASYON) ──────────────── */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black">
                <Crown className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-lg text-white font-heading">Çoklu Sponsorlu Popup Reklamları</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] uppercase font-mono">
                    {ozelIlanReklamlar.filter((a) => a.aktif).length} Aktif / {ozelIlanReklamlar.length} Toplam
                  </span>
                </div>
                <p className="text-xs text-[#8b949e]">
                  İstediğiniz kadar reklam ekleyin. Konum eşleşmesine göre (İstanbul/İzmir/vb.) veya sırayla kullanıcılara gösterilir.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSpecialAdsOnly}
              disabled={savingAd}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all font-heading shrink-0 self-start sm:self-auto"
            >
              {savingAd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{savingAd ? 'Kaydediliyor...' : 'Reklamları Anında Kaydet'}</span>
            </button>
          </div>

          {/* Yeni Reklam Ekleme Kartı */}
          <div className="p-5 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Yeni Popup Reklamı Oluştur</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* İlan Seçimi */}
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#8b949e]">Yayınlanacak İlan *</label>
                  {selectedListingForAd && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedListingForAd.ilSlug?.toUpperCase()}{selectedListingForAd.ilceSlug ? ` / ${selectedListingForAd.ilceSlug?.toUpperCase()}` : ''}</span>
                    </span>
                  )}
                </div>
                <select
                  value={newAdIlanId}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    setNewAdIlanId(chosenId);
                    if (chosenId) {
                      const matched = allListings.find((l) => l._id === chosenId);
                      if (matched?.ilSlug) {
                        setNewAdHedefIl(matched.ilSlug);
                      }
                      if (matched?.rozet) {
                        setNewAdRozet(`👑 ${matched.ilSlug?.toUpperCase() || ''} VIP VİTRİN İLANI`);
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  <option value="">-- Listeden Bir İlan Seçin --</option>
                  {allListings.map((l) => (
                    <option key={l._id} value={l._id}>
                      [{l.ilSlug?.toUpperCase()}{l.ilceSlug ? ` / ${l.ilceSlug?.toUpperCase()}` : ''}] {l.baslik} ({l.rozet?.toUpperCase() || 'STANDART'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hedef Şehir / Konum */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8b949e]">Hedef Gösterim Şehri</label>
                <select
                  value={newAdHedefIl}
                  onChange={(e) => setNewAdHedefIl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-medium"
                >
                  <option value="tum_turkiye">🇹🇷 TÜRKİYE GENELİ (Tüm Şehirler & Anasayfa)</option>

                  {selectedListingForAd && selectedListingForAd.ilSlug && (
                    <optgroup label="── SEÇİLİ İLANIN KONUMU (ÖNERİLEN) ──">
                      <option value={selectedListingForAd.ilSlug}>
                        🎯 SADECE {selectedListingForAd.ilSlug.toUpperCase()} (İlanın Kendi Şehri)
                      </option>
                    </optgroup>
                  )}

                  {allLocations.length > 0 ? (
                    <optgroup label="── 81 İL (DİNAMİK LİSTE) ──">
                      {allLocations.map((loc: any) => (
                        <option key={loc.ilSlug} value={loc.ilSlug}>
                          📍 {loc.il.toUpperCase()} ({loc.ilceler?.length || 0} İlçe)
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <optgroup label="── POPÜLER ŞEHİRLER ──">
                      {POPULAR_CITIES.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.ad}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Rozet Başlığı */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8b949e]">Rozet Metni</label>
                <input
                  type="text"
                  value={newAdRozet}
                  onChange={(e) => setNewAdRozet(e.target.value)}
                  placeholder="🔥 GÜNÜN ÖZEL VIP İLANI"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Açılma Gecikmesi: </span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newAdGecikme}
                  onChange={(e) => setNewAdGecikme(Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-white text-xs font-mono text-center"
                />
                <span>saniye</span>
              </div>

              <button
                type="button"
                onClick={handleAddNewSpecialAd}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs uppercase tracking-wider font-heading flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Listeye Ekle</span>
              </button>
            </div>
          </div>

          {/* Tanımlı Reklamlar Listesi */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-white uppercase tracking-wider font-heading flex items-center justify-between">
              <span>Tanımlı Reklam Havuzu ({ozelIlanReklamlar.length})</span>
              <span className="text-[11px] text-[#8b949e] font-normal">
                Birden fazla reklam aktifse sistem otomatik sırayla döndürür.
              </span>
            </span>

            {ozelIlanReklamlar.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8b949e] bg-[#0d1117] rounded-2xl border border-[#30363d]">
                Henüz özel popup reklamı eklenmedi. Yukarıdaki formdan ekleyebilirsiniz.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ozelIlanReklamlar.map((ad, idx) => {
                  const listing = getListingById(ad.ilanId);
                  const foundLoc = allLocations.find((l) => l.ilSlug === ad.hedefIlSlug);
                  const cityName = ad.hedefIlSlug === 'tum_turkiye'
                    ? '🇹🇷 TÜRKİYE GENELİ'
                    : (foundLoc ? `📍 ${foundLoc.il.toUpperCase()}` : (POPULAR_CITIES.find((c) => c.slug === ad.hedefIlSlug)?.ad || ad.hedefIlSlug?.toUpperCase() || 'TÜRKİYE GENELİ'));

                  return (
                    <div
                      key={ad._id || idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                        ad.aktif
                          ? 'bg-[#0d1117] border-amber-500/50 shadow-md'
                          : 'bg-[#0d1117]/60 border-[#30363d] opacity-60'
                      }`}
                    >
                      {/* Üst Başlık & Aktif Switch */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] uppercase font-mono flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          <span>{ad.rozet || '🔥 ÖZEL İLAN'}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAdActive(idx)}
                            className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase font-heading transition-all ${
                              ad.aktif
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : 'bg-[#21262d] text-[#8b949e] hover:text-white'
                            }`}
                          >
                            {ad.aktif ? '● AKTİF (YAYINDA)' : '○ PASİF'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialAd(idx)}
                            className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                            title="Reklamı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* İlan Detay Bilgisi */}
                      {listing ? (
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                            <Image
                              src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                              alt={listing.baslik}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-xs text-white truncate font-heading">
                              {listing.baslik}
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>Hedef: {cityName}</span>
                              </span>
                              {listing.ilSlug && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                                  İlan: {listing.ilSlug.toUpperCase()}{listing.ilceSlug ? ` / ${listing.ilceSlug.toUpperCase()}` : ''}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8b949e] mt-0.5">
                              ⏱️ {ad.gecikmeSaniye || 4} sn gecikme
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-red-400 font-mono">
                          ⚠️ Bağlı ilan bulunamadı veya silinmiş (ID: {ad.ilanId})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── 2. HERO BAŞLIKLARI ──────────────── */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#30363d] pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base text-white font-heading">Anasayfa Hero &amp; Karşılama Metinleri</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
              Ana Başlık (H1)
              <input
                type="text"
                value={heroBaslik}
                onChange={(e) => setHeroBaslik(e.target.value)}
                placeholder="Örn: Türkiye'nin En Güvenilir VIP Eskort İlan Platformu"
                className="w-full px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold text-[#f0f6fc]">
              Alt Açıklama Spotu
              <textarea
                rows={2}
                value={heroAltBaslik}
                onChange={(e) => setHeroAltBaslik(e.target.value)}
                placeholder="Örn: 81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları."
                className="w-full px-4 py-3 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs focus:border-amber-400 focus:outline-none resize-none"
              />
            </label>
          </div>
        </div>

        {/* ── 3. VİTRİN SLIDER İLANLARI SEÇİMİ ──────────────── */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-base text-white font-heading">
                Anasayfa Üst Vitrin Slider İlanları ({selectedListingIds.length} Seçili)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllVip}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold"
              >
                Tüm VIP'leri Seç
              </button>
              <button
                type="button"
                onClick={() => setSelectedListingIds([])}
                className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] text-xs font-bold"
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="İlan başlığı veya il/ilçe ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredListings.map((listing) => {
              const isSelected = selectedListingIds.includes(listing._id.toString());
              return (
                <div
                  key={listing._id}
                  onClick={() => handleToggleListing(listing._id.toString())}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-md'
                      : 'bg-[#21262d] border-[#363b42] hover:border-amber-500/40'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                    <Image
                      src={listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                      alt={listing.baslik}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-xs text-white truncate font-heading">
                      {listing.baslik}
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold uppercase mt-0.5">
                      {listing.ilSlug} / {listing.ilceSlug}
                    </span>
                  </div>

                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'border border-[#30363d] text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. KAYAN DUYURU ŞERİDİ ──────────────── */}
        <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <h2 className="font-black text-base text-white font-heading">Kayan Duyuru Şeridi (Ticker)</h2>
            </div>
            <button
              type="button"
              onClick={handleAddAnnouncement}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase font-heading shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Yeni Duyuru Ekle</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {duyurular.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#21262d] border border-[#363b42] flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={item.badge}
                  onChange={(e) => handleUpdateAnnouncement(idx, 'badge', e.target.value)}
                  placeholder="👑 VIP DUYURU"
                  className="w-full sm:w-36 px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-amber-300 font-bold text-xs"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleUpdateAnnouncement(idx, 'text', e.target.value)}
                  placeholder="Duyuru metni..."
                  className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs"
                />
                <input
                  type="text"
                  value={item.link}
                  onChange={(e) => handleUpdateAnnouncement(idx, 'link', e.target.value)}
                  placeholder="/ilan-ver"
                  className="w-full sm:w-32 px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAnnouncement(idx)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-colors self-end sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Alt Kaydet Butonu */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all font-heading"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 stroke-[2.5]" />}
            <span>{saving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet & Yayına Al'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
