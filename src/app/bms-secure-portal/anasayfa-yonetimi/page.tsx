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
  ArrowRight
} from 'lucide-react';

interface TickerItem {
  badge: string;
  text: string;
  link: string;
}

export default function AdminHomepageConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        setHeroBaslik(data.config.hero?.baslik || 'Türkiye\'nin En Güvenilir VIP Eskort İlan Platformu');
        setHeroAltBaslik(data.config.hero?.altBaslik || '81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.');
        setBannerMetin(data.config.aktifBanner?.metin || '🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!');
        setBannerLink(data.config.aktifBanner?.link || '/ilan-ver');
        setBannerRozet(data.config.aktifBanner?.rozet || '👑 VIP DUYURU');
        setBannerAktif(data.config.aktifBanner?.aktif ?? true);
        
        if (Array.isArray(data.config.duyurular) && data.config.duyurular.length > 0) {
          setDuyurular(data.config.duyurular);
        }

        const rawIds = data.config.sliderIlanIds || [];
        setSelectedListingIds(rawIds.map((id: any) => (id?._id ? id._id.toString() : (id?.toString ? id.toString() : String(id)))));
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

  const handleSelectAllVip = () => {
    const vipIds = allListings
      .filter((l) => l.rozet === 'vip' || l.rozet === 'ultravip')
      .map((l) => l._id.toString());
    setSelectedListingIds(vipIds);
  };

  const handleClearAll = () => {
    setSelectedListingIds([]);
  };

  // Duyuru Listesi İşlemleri
  const handleAddDuyuru = () => {
    setDuyurular((prev) => [
      ...prev,
      { badge: '👑 YENİ DUYURU', text: 'Duyuru metnini buraya yazın...', link: '/ilan-ver' }
    ]);
  };

  const handleUpdateDuyuru = (index: number, field: keyof TickerItem, value: string) => {
    setDuyurular((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteDuyuru = (index: number) => {
    setDuyurular((prev) => prev.filter((_, idx) => idx !== index));
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
          bannerRozet,
          bannerAktif,
          duyurular,
          sliderIlanIds: selectedListingIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Anasayfa vitrini ve üst duyuru bandı başarıyla kaydedildi! (${selectedListingIds.length} İlan vitrinde dönecek, ${duyurular.length} Duyuru yayında)` });
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
          <div className="flex flex-col text-left">
            <h1 className="font-black text-2xl text-white font-heading">Anasayfa &amp; Vitrin Yönetimi</h1>
            <p className="text-xs text-[#8b949e]">Üst kayan duyuru bandı, anasayfa sloganı ve en üstte dönecek VIP vitrin ilanlarını yönetin.</p>
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
        <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-5xl text-left">
          
          {/* ── 1. ÜST KAYAN DUYURU BANDI (TICKER) YÖNETİMİ ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-amber-500/60 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Megaphone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-black text-base sm:text-lg text-white font-heading">
                    Üst Kayan Duyuru Bandı (Header Ticker)
                  </h2>
                  <span className="text-xs text-amber-400 font-bold">
                    Tüm mobil sayfaların en tepesinde sırayla dönen dinamik duyuru mesajları.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddDuyuru}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Yeni Duyuru Ekle</span>
              </button>
            </div>

            {/* Duyuru Satırları */}
            <div className="flex flex-col gap-3">
              {duyurular.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center gap-3 flex-wrap sm:flex-nowrap"
                >
                  <span className="w-7 h-7 rounded-xl bg-[#21262d] text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#363b42]">
                    #{idx + 1}
                  </span>

                  {/* Rozet */}
                  <input
                    type="text"
                    value={item.badge}
                    placeholder="👑 ROZET"
                    onChange={(e) => handleUpdateDuyuru(idx, 'badge', e.target.value)}
                    className="w-full sm:w-36 px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-amber-400 text-xs font-black uppercase placeholder-[#484f58] focus:border-amber-400 focus:outline-none shrink-0"
                  />

                  {/* Duyuru Metni */}
                  <input
                    type="text"
                    value={item.text}
                    placeholder="Duyuru metnini yazın..."
                    onChange={(e) => handleUpdateDuyuru(idx, 'text', e.target.value)}
                    className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
                  />

                  {/* Yönlendirme Linki */}
                  <input
                    type="text"
                    value={item.link}
                    placeholder="/ilan-ver veya /chat"
                    onChange={(e) => handleUpdateDuyuru(idx, 'link', e.target.value)}
                    className="w-full sm:w-32 px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] text-xs font-mono placeholder-[#484f58] focus:border-amber-400 focus:outline-none shrink-0"
                  />

                  {/* Sil Butonu */}
                  <button
                    type="button"
                    onClick={() => handleDeleteDuyuru(idx)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors shrink-0"
                    title="Bu duyuruyu kaldır"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── 2. VİTRİN SLIDER İLAN SEÇİMİ ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border-2 border-amber-500/60 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Crown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-black text-base sm:text-lg text-white font-heading">
                    Header Altı VIP Vitrin Slider İlanları
                  </h2>
                  <span className="text-xs text-amber-400 font-bold">
                    Seçtiğiniz ilanlar anasayfa tepesindeki büyük görsel kayan vitrinde sırayla döner.
                  </span>
                </div>
              </div>

              {/* Hızlı Seçim Aksiyonları */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllVip}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all"
                >
                  Tüm VIP İlanları Seç
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
                  placeholder="İlan başlığı, il, ilçe veya rozet ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3" />
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/30 font-heading">
                {selectedListingIds.length} İlan Vitrinde Dönecek
              </span>
            </div>

            {/* İlan Seçim Kartları Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredListings.map((item) => {
                const isSelected = selectedListingIds.includes(item._id.toString());
                const isVip = item.rozet === 'vip' || item.rozet === 'ultravip';

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
                          isVip ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
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

          {/* ── 3. HERO BAŞLIK & SEO SLOGANI ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <h2 className="font-black text-base text-white font-heading border-b border-[#30363d] pb-3">
              Anasayfa Başlık &amp; Slogan
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8b949e]">Anasayfa Ana Başlığı (H1)</label>
                <input
                  type="text"
                  value={heroBaslik}
                  onChange={(e) => setHeroBaslik(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8b949e]">Anasayfa Alt Açıklaması</label>
                <textarea
                  rows={2}
                  value={heroAltBaslik}
                  onChange={(e) => setHeroAltBaslik(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* KAYDET BUTONU */}
          <button
            type="submit"
            disabled={saving}
            className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 font-heading sticky bottom-6 z-20"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 stroke-[2.5]" />
                <span>Tüm Anasayfa &amp; Vitrin Değişikliklerini Kaydet</span>
              </>
            )}
          </button>

        </form>
      )}
    </div>
  );
}
