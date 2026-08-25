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
  ShieldCheck 
} from 'lucide-react';

export default function AdminHomepageConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [heroBaslik, setHeroBaslik] = useState('');
  const [heroAltBaslik, setHeroAltBaslik] = useState('');
  const [bannerMetin, setBannerMetin] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerAktif, setBannerAktif] = useState(true);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage-config');
      const data = await res.json();
      if (data.config) {
        setHeroBaslik(data.config.hero?.baslik || 'Best Eskort — Bölgesel İlan Platformu');
        setHeroAltBaslik(data.config.hero?.altBaslik || '81 il ve tüm ilçelerde güncel hizmet rehberi');
        setBannerMetin(data.config.aktifBanner?.metin || '🎉 İlan verin, binlerce kullanıcıya hemen ulaşın!');
        setBannerLink(data.config.aktifBanner?.link || '/ilan-ver');
        setBannerAktif(data.config.aktifBanner?.aktif ?? true);
        setSelectedListingIds(data.config.sliderIlanIds || []);
      }
      if (data.allListings) {
        setAllListings(data.allListings);
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

  const handleSelectAllUltraVip = () => {
    const ultraVipIds = allListings
      .filter((l) => l.rozet === 'ultravip')
      .map((l) => l._id.toString());
    setSelectedListingIds(ultraVipIds);
  };

  const handleClearAll = () => {
    setSelectedListingIds([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroBaslik,
          heroAltBaslik,
          bannerMetin,
          bannerLink,
          bannerAktif,
          sliderIlanIds: selectedListingIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Anasayfa vitrini ve ayarları başarıyla kaydedildi! (${selectedListingIds.length} İlan vitrinde dönecek)` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Ayarlar kaydedilemedi.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredListings = allListings.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.baslik || '').toLowerCase().includes(term) ||
      (l.ilSlug || '').toLowerCase().includes(term) ||
      (l.ilceSlug || '').toLowerCase().includes(term) ||
      (l.rozet || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Anasayfa &amp; Vitrin Yönetimi</h1>
            <p className="text-xs text-[#8b949e]">Header altındaki Ultra VIP slider vitrininde dönecek ilanları dinamik olarak seçin.</p>
          </div>
        </div>

        <button
          onClick={fetchConfig}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-5xl">
          
          {/* ── 1. ULTRA VIP VİTRİN SLIDER İLAN SEÇİMİ ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-amber-500/60 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Crown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="font-black text-base sm:text-lg text-white font-heading">
                    Header Altı Ultra VIP Vitrin İlanları
                  </h2>
                  <span className="text-xs text-amber-400 font-bold">
                    Seçilen ilanların hepsi (4, 5, 8 adet vs.) anasayfa tepesinde sırayla döner.
                  </span>
                </div>
              </div>

              {/* Hızlı Seçim Aksiyonları */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllUltraVip}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all"
                >
                  Tüm Ultra VIP'leri Seç
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] font-bold text-xs transition-all"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* İlan Arama & Seçilen Sayaç */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="text"
                  placeholder="İlan başlığı, il, ilçe veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3" />
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/30 font-heading">
                {selectedListingIds.length} İlan Vitrinde Dönecek
              </span>
            </div>

            {/* İlan Seçim Kartları Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredListings.map((item) => {
                const isSelected = selectedListingIds.includes(item._id.toString());
                const isUltraVip = item.rozet === 'ultravip';

                return (
                  <div
                    key={item._id}
                    onClick={() => handleToggleListing(item._id.toString())}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58] opacity-75 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0 transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-[#161b22] border border-[#30363d] text-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    {/* Resim */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                      <Image
                        src={item.anaFotograf?.url || item.fotograflar?.[0]?.url || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                        alt={item.baslik}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>

                    {/* Başlık & Detay */}
                    <div className="flex flex-col min-w-0 flex-1 text-left">
                      <span className="font-bold text-xs text-white truncate font-heading">
                        {item.baslik}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className="text-amber-400 font-bold capitalize">
                          {item.ilSlug}/{item.ilceSlug}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-black uppercase ${
                          isUltraVip ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.rozet || 'silver'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2. DUYURU BANNER & SLOGAN AYARLARI ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <h2 className="font-black text-base text-white font-heading border-b border-[#30363d] pb-3">
              Üst Kayan Duyuru Bandı (Ticker)
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bannerAktif"
                checked={bannerAktif}
                onChange={(e) => setBannerAktif(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="bannerAktif" className="text-xs text-[#c9d1d9] font-bold cursor-pointer">
                Üst kayan duyuru bandını anasayfada aktif et
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#8b949e] font-black uppercase font-heading">Duyuru Metni</label>
              <input
                type="text"
                value={bannerMetin}
                onChange={(e) => setBannerMetin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Kaydet Butonu */}
          <button
            type="submit"
            disabled={saving}
            className="py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm font-heading uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Vitrini &amp; Ayarları Kaydet</span>
              </>
            )}
          </button>

        </form>
      )}
    </div>
  );
}

