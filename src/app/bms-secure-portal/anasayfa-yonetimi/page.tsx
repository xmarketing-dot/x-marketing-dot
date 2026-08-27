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
  ChevronRight
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

  // Special Sponsored Ad Popup State
  const [ozelAdAktif, setOzelAdAktif] = useState(false);
  const [ozelAdBaslik, setOzelAdBaslik] = useState('👑 GÜNÜN ÖZEL VIP İLANI');
  const [ozelAdSpotMetin, setOzelAdSpotMetin] = useState('Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı');
  const [ozelAdRozet, setOzelAdRozet] = useState('🔥 SPONSORLU ÖZEL İLAN');
  const [ozelAdResimUrl, setOzelAdResimUrl] = useState('https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=800');
  const [ozelAdHedefUrl, setOzelAdHedefUrl] = useState('/ilan-ver');
  const [ozelAdGecikmeSaniye, setOzelAdGecikmeSaniye] = useState(4);

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
        
        if (data.config.ozelIlanReklam) {
          setOzelAdAktif(data.config.ozelIlanReklam.aktif ?? false);
          setOzelAdBaslik(data.config.ozelIlanReklam.baslik || '👑 GÜNÜN ÖZEL VIP İLANI');
          setOzelAdSpotMetin(data.config.ozelIlanReklam.spotMetin || 'Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı');
          setOzelAdRozet(data.config.ozelIlanReklam.rozet || '🔥 SPONSORLU ÖZEL İLAN');
          setOzelAdResimUrl(data.config.ozelIlanReklam.resimUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=800');
          setOzelAdHedefUrl(data.config.ozelIlanReklam.hedefUrl || '/ilan-ver');
          setOzelAdGecikmeSaniye(data.config.ozelIlanReklam.gecikmeSaniye || 4);
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

  // 1-Click Pick Listing for Special Ad Popup
  const handleSelectForSpecialAd = (listing: any) => {
    setOzelAdAktif(true);
    setOzelAdBaslik(`👑 ${listing.baslik}`);
    setOzelAdSpotMetin(`${listing.ilSlug?.toUpperCase()} / ${listing.ilceSlug?.toUpperCase()} Doğrulanmış VIP Profil & WhatsApp`);
    setOzelAdRozet('🔥 GÜNÜN ÖZEL SPONSORU');
    setOzelAdResimUrl(listing.anaFotograf?.url || listing.fotograflar?.[0]?.url || ozelAdResimUrl);
    setOzelAdHedefUrl(`/ilan/${listing.slug}`);
    setMessage({ type: 'success', text: `"${listing.baslik}" Özel İlan Popup olarak seçildi! Kaydetmeyi unutmayın.` });
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
          ozelIlanReklam: {
            aktif: ozelAdAktif,
            baslik: ozelAdBaslik,
            spotMetin: ozelAdSpotMetin,
            rozet: ozelAdRozet,
            resimUrl: ozelAdResimUrl,
            hedefUrl: ozelAdHedefUrl,
            gecikmeSaniye: Number(ozelAdGecikmeSaniye) || 4,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Anasayfa vitrini, üst duyurular ve Özel İlan Reklam Popup başarıyla kaydedildi!` });
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
    <div className="flex flex-col gap-8 w-full max-w-full text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading">Anasayfa &amp; Reklam Yönetimi</h1>
            <p className="text-xs text-[#8b949e]">Özel sponsorlu popup reklam, vitrin ilanları, duyuru bandı ve sloganlar.</p>
          </div>
        </div>

        <button
          onClick={fetchConfig}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-bold font-heading">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-8">

          {/* ── 1. ÖZEL İLAN POPUP REKLAM YÖNETİMİ (SPONSORED VIP POPUP) ──────────────── */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#1c1813] to-[#161b22] border-2 border-amber-500/60 shadow-2xl flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
                  <Flame className="w-6 h-6 fill-slate-950" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-black text-lg text-white font-heading flex items-center gap-2">
                    <span>👑 Özel Sponsorlu İlan &amp; Popup Reklam</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                      YÜKSEK DÖNÜŞÜM
                    </span>
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    Kullanıcı siteye girdikten 3-5 saniye sonra veya kaydırdığında dikkat çekici lüks popup reklam olarak açılır.
                  </p>
                </div>
              </div>

              {/* Aktif / Pasif Toggle */}
              <div className="flex items-center gap-3 bg-[#0d1117] p-2 px-3 rounded-2xl border border-[#30363d]">
                <span className="text-xs font-bold text-white">Popup Durumu:</span>
                <button
                  type="button"
                  onClick={() => setOzelAdAktif(!ozelAdAktif)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    ozelAdAktif ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                </button>
                <span className={`text-xs font-black uppercase ${ozelAdAktif ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {ozelAdAktif ? 'YAYINDA' : 'KAPALI'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form Alanları */}
              <div className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#8b949e]">Reklam Başlığı (Göz Alıcı Renk ve Font ile Çıkar)</label>
                  <input
                    type="text"
                    value={ozelAdBaslik}
                    onChange={(e) => setOzelAdBaslik(e.target.value)}
                    placeholder="👑 GÜNÜN ÖZEL VIP İLANI"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#8b949e]">Spot Açıklama / Slogan</label>
                  <input
                    type="text"
                    value={ozelAdSpotMetin}
                    onChange={(e) => setOzelAdSpotMetin(e.target.value)}
                    placeholder="Bu Geceye Özel Seçkin Hizmet & Anında WhatsApp İletişim Hattı"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#8b949e]">Üst Rozet Metni</label>
                    <input
                      type="text"
                      value={ozelAdRozet}
                      onChange={(e) => setOzelAdRozet(e.target.value)}
                      placeholder="🔥 SPONSORLU ÖZEL İLAN"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#8b949e]">Gecikme Süresi (Saniye)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={ozelAdGecikmeSaniye}
                      onChange={(e) => setOzelAdGecikmeSaniye(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#8b949e]">Görsel URL'si (Fotoğraf)</label>
                  <input
                    type="text"
                    value={ozelAdResimUrl}
                    onChange={(e) => setOzelAdResimUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#8b949e]">Tıklanınca Gidilecek Hedef URL</label>
                  <input
                    type="text"
                    value={ozelAdHedefUrl}
                    onChange={(e) => setOzelAdHedefUrl(e.target.value)}
                    placeholder="/ilan/ornek-ilan veya /ilan-ver"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

              </div>

              {/* Canlı Önizleme Kartı */}
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#0d1117] border border-[#30363d]">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading mb-3">
                  📱 Ziyaretçiye Açılacak Popup Önizlemesi
                </span>

                <div className="w-full max-w-[280px] rounded-3xl overflow-hidden bg-[#161b22] border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex flex-col text-center">
                  <div className="relative aspect-[4/3] w-full bg-[#0d1117]">
                    <Image
                      src={ozelAdResimUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=800'}
                      alt="Reklam Önizleme"
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
                        {ozelAdRozet}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col gap-2">
                    <h3 className="font-extrabold text-xs text-amber-300 font-heading leading-tight">
                      {ozelAdBaslik}
                    </h3>
                    <p className="text-[10px] text-[#8b949e] line-clamp-2">
                      {ozelAdSpotMetin}
                    </p>
                    <div className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black text-[10px] font-heading shadow-md flex items-center justify-center gap-1">
                      <span>Özel İlanı İncele &amp; Ulaş</span>
                      <ChevronRight className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ── 2. DÖNEN ÜST DUYURU BANDI LİSTESİ ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">
                  En Üstte Kayan Duyuru Bandı (Ticker)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddDuyuru}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 font-heading"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Yeni Duyuru Ekle</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {duyurular.map((d, index) => (
                <div key={index} className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-44">
                    <input
                      type="text"
                      value={d.badge}
                      onChange={(e) => handleUpdateDuyuru(index, 'badge', e.target.value)}
                      placeholder="Rozet (Örn: 👑 VIP)"
                      className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-amber-400 font-bold text-xs focus:border-amber-400 focus:outline-none font-heading"
                    />
                  </div>

                  <div className="w-full flex-1">
                    <input
                      type="text"
                      value={d.text}
                      onChange={(e) => handleUpdateDuyuru(index, 'text', e.target.value)}
                      placeholder="Duyuru metni..."
                      className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <input
                      type="text"
                      value={d.link}
                      onChange={(e) => handleUpdateDuyuru(index, 'link', e.target.value)}
                      placeholder="Link (/ilan-ver)"
                      className="w-full px-3 py-2 rounded-xl bg-[#161b22] border border-[#30363d] text-[#8b949e] text-xs focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteDuyuru(index)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. ANASAYFA VİTRİNİNDE DÖNECEK İLANLAR ──────────────── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">
                  Anasayfa Hero Vitrininde Dönecek İlanlar
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllVip}
                  className="px-3 py-1.5 rounded-xl bg-[#21262d] text-amber-400 hover:bg-[#30363d] text-xs font-bold border border-amber-500/30"
                >
                  Tüm VIP İlanları Seç
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedListingIds([])}
                  className="px-3 py-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:bg-[#30363d] text-xs font-bold"
                >
                  Temizle
                </button>
              </div>
            </div>

            {/* Arama ve İstatistik */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="İlan başlığı, şehir ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
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
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 select-none ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58]'
                    }`}
                  >
                    <div 
                      onClick={() => handleToggleListing(item._id.toString())}
                      className="flex items-center gap-3 cursor-pointer"
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

                    {/* Tek Tıkla Özel Popup Reklam Yap Butonu */}
                    <button
                      type="button"
                      onClick={() => handleSelectForSpecialAd(item)}
                      className="w-full py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 font-bold text-[10px] border border-amber-500/20 flex items-center justify-center gap-1 active:scale-95 transition-all font-heading"
                    >
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Bu İlanı Özel Popup Reklam Yap</span>
                    </button>

                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4. HERO BAŞLIK & SEO SLOGANI ──────────────── */}
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
                <span>Tüm Değişiklikleri &amp; Reklamı Kaydet</span>
              </>
            )}
          </button>

        </form>
      )}
    </div>
  );
}
