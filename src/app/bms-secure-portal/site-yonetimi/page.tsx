'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Check,
  Loader2,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Globe,
  Sliders,
  Type,
  Megaphone,
  Radio,
  Zap,
  Flame,
  Sparkles,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { parsePhoneNumber, setClientAdminWhatsApp } from '@/lib/siteConfig';

export default function SiteYonetimiPage() {
  const [loading, setLoading] = useState(true);

  // 1. WhatsApp State
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [currentAdminWhatsApp, setCurrentAdminWhatsApp] = useState('');
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  // 2. Hero & Marka Metinleri State
  const [heroBaslik, setHeroBaslik] = useState('');
  const [heroAltBaslik, setHeroAltBaslik] = useState('');
  const [savingHero, setSavingHero] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState(false);

  // 3. Kayan Duyuru / Header Ticker State
  const [bannerAktif, setBannerAktif] = useState(true);
  const [bannerRozet, setBannerRozet] = useState('👑 VIP DUYURU');
  const [bannerMetin, setBannerMetin] = useState('');
  const [bannerLink, setBannerLink] = useState('/ilan-ver');
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);

  // 4. SEO & Sistem Hızlı Aksiyon State
  const [pingingSeo, setPingingSeo] = useState(false);
  const [pingResult, setPingResult] = useState<any | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/homepage-config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (data.config) {
        const c = data.config;
        if (c.adminWhatsApp) {
          setAdminWhatsApp(c.adminWhatsApp);
          setCurrentAdminWhatsApp(c.adminWhatsApp);
          setClientAdminWhatsApp(c.adminWhatsApp);
        }
        setHeroBaslik(c.hero?.baslik || "Türkiye'nin En Güvenilir VIP Eskort İlan Platformu");
        setHeroAltBaslik(c.hero?.altBaslik || "81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları.");
        setBannerAktif(c.aktifBanner?.aktif ?? true);
        setBannerRozet(c.aktifBanner?.rozet || '👑 VIP DUYURU');
        setBannerMetin(c.aktifBanner?.metin || '🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!');
        setBannerLink(c.aktifBanner?.link || '/ilan-ver');
      }
    } catch (e) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Numarasını Kaydet
  const handleSaveWhatsApp = async () => {
    const trimmed = adminWhatsApp.trim();
    if (!trimmed) {
      alert('Lütfen geçerli bir telefon numarası girin.');
      return;
    }
    setSavingWhatsApp(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminWhatsApp: trimmed }),
      });
      if (res.ok) {
        setCurrentAdminWhatsApp(trimmed);
        setClientAdminWhatsApp(trimmed);
        setWhatsAppSuccess(true);
        setTimeout(() => setWhatsAppSuccess(false), 5000);
      } else {
        alert('Numara kaydedilemedi.');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setSavingWhatsApp(false);
    }
  };

  // Hero Metinlerini Kaydet
  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroBaslik, heroAltBaslik }),
      });
      if (res.ok) {
        setHeroSuccess(true);
        setTimeout(() => setHeroSuccess(false), 4000);
      } else {
        alert('Hero metinleri kaydedilemedi.');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setSavingHero(false);
    }
  };

  // Kayan Duyuru Metnini Kaydet
  const handleSaveBanner = async () => {
    setSavingBanner(true);
    try {
      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerAktif,
          bannerRozet,
          bannerMetin,
          bannerLink
        }),
      });
      if (res.ok) {
        setBannerSuccess(true);
        setTimeout(() => setBannerSuccess(false), 4000);
      } else {
        alert('Duyuru ayarları kaydedilemedi.');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setSavingBanner(false);
    }
  };

  // Hızlı Google & Yandex IndexNow Ping
  const handlePingSeo = async () => {
    setPingingSeo(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/admin/seo/boost-and-ping', { method: 'POST' });
      const data = await res.json();
      setPingResult(data);
    } catch (e: any) {
      setPingResult({ error: e.message });
    } finally {
      setPingingSeo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <span className="text-xs font-mono text-[#8b949e]">Site ayarları yükleniyor...</span>
      </div>
    );
  }

  const phoneDetails = parsePhoneNumber(adminWhatsApp || currentAdminWhatsApp);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-left animate-fadeIn">
      
      {/* ── 1. ÜST BAŞLIK VE SAYFA KİMLİĞİ ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg sm:text-2xl text-white font-heading tracking-tight">
                Site &amp; Sistem Yönetimi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black font-mono">
                GENEL AYARLAR
              </span>
            </div>
            <p className="text-xs text-[#8b949e]">
              Canlı WhatsApp destek hattı, anasayfa başlıkları, kayan duyuru barı ve hızlı sistem aksiyonları.
            </p>
          </div>
        </div>

        <button
          onClick={fetchConfig}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white border border-[#30363d] text-xs font-bold font-heading transition-all shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ayarları Yenile</span>
        </button>
      </div>

      {/* ── 2. CANLI ADMİN WHATSAPP DESTEK HATTI (ÖNCELİKLİ & KRİTİK) ──────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#121c15] via-[#161b22] to-[#0f1712] border-2 border-emerald-500/40 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <OfficialWhatsAppIcon className="w-6 h-6 fill-[#25D366]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white font-heading">
                  Canlı Admin WhatsApp Destek Hattı
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>CANLIDA AKTİF</span>
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Sanal hat banlandığında yenisini yapıştırıp kaydedin. Deploy gerekmeden tüm sitede anında aktif olur.
              </p>
            </div>
          </div>

          {/* Aktif Numara Önizleme Rozeti */}
          <div className="flex items-center gap-2 bg-[#0d1117] border border-emerald-500/40 px-3.5 py-2 rounded-2xl text-xs font-mono self-start lg:self-auto shadow-inner">
            <span className="text-[#8b949e] text-[11px]">Sitedeki Hat:</span>
            <span className="text-emerald-400 font-black text-sm">
              {phoneDetails.formatted || '+62 838 2904 8050'}
            </span>
          </div>
        </div>

        {/* Input & Butonlar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#25D366]">
              <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
            </div>
            <input
              type="text"
              value={adminWhatsApp}
              onChange={(e) => setAdminWhatsApp(e.target.value)}
              placeholder="Yeni WhatsApp Numarası (Örn: +6283829048050 veya 0532...)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {/* WhatsApp Test Et Butonu */}
            <a
              href={`https://wa.me/${phoneDetails.raw}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-emerald-400 border border-emerald-500/30 text-xs font-bold font-heading flex items-center justify-center gap-1.5 transition-colors shadow-md"
              title="Numaranın WhatsApp hesabının açık olduğunu test et"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Et</span>
            </a>

            {/* Kaydet & Canlıya Al Butonu */}
            <button
              type="button"
              onClick={handleSaveWhatsApp}
              disabled={savingWhatsApp}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs uppercase font-heading flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {savingWhatsApp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4 stroke-[3]" />
              )}
              <span>{savingWhatsApp ? 'Kaydediliyor...' : 'Numarayı Kaydet & Canlıya Al'}</span>
            </button>
          </div>
        </div>

        {/* Canlı Kapsam Bildirimi */}
        <div className="p-3 rounded-2xl bg-[#0d1117]/80 border border-[#21262d] text-xs text-[#8b949e] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Bu numara kaydedildiği an <strong className="text-white">/chat</strong>, <strong className="text-white">/ilan-ver</strong>, <strong className="text-white">/reklam-ver</strong>, <strong className="text-white">/panelim</strong> ve ilan oluşturulduğunda gönderilen otomatik karşılama mesajlarında anında devreye girer.
          </span>
        </div>

        {whatsAppSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>✅ Yeni WhatsApp numarası başarıyla kaydedildi! Sitedeki tüm butonlar ve paket mesajları güncellendi.</span>
          </div>
        )}
      </div>

      {/* ── 3. ANASAYFA HERO & MARKA METİNLERİ ──────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <Type className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base sm:text-lg text-white font-heading">
              Anasayfa Hero &amp; Marka Başlıkları
            </h2>
          </div>
          <span className="text-[11px] text-[#8b949e]">Sitenin en üst vitrin metinleri</span>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-[#8b949e] mb-1 font-heading">
              Hero Ana Başlık (H1)
            </label>
            <input
              type="text"
              value={heroBaslik}
              onChange={(e) => setHeroBaslik(e.target.value)}
              placeholder="Örn: Türkiye'nin En Güvenilir VIP Eskort İlan Platformu"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8b949e] mb-1 font-heading">
              Hero Alt Başlık &amp; Açıklama
            </label>
            <textarea
              rows={2}
              value={heroAltBaslik}
              onChange={(e) => setHeroAltBaslik(e.target.value)}
              placeholder="Örn: 81 il ve tüm ilçelerde doğrulanmış eskort ilanları ve WhatsApp iletişim hatları."
              className="w-full px-4 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs sm:text-sm focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveHero}
              disabled={savingHero}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {savingHero ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>{savingHero ? 'Kaydediliyor...' : 'Başlıkları Kaydet'}</span>
            </button>
          </div>

          {heroSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>✅ Anasayfa başlıkları başarıyla kaydedildi!</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. KAYAN DUYURU & HEADER TICKER METİNLERİ ──────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base sm:text-lg text-white font-heading">
              Kayan Üst Duyuru &amp; Header Ticker
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-[#8b949e]">Duyuru Göster:</span>
            <input
              type="checkbox"
              checked={bannerAktif}
              onChange={(e) => setBannerAktif(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-[#0d1117] border-[#30363d] focus:ring-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#8b949e] mb-1 font-heading">
              Rozet Metni
            </label>
            <input
              type="text"
              value={bannerRozet}
              onChange={(e) => setBannerRozet(e.target.value)}
              placeholder="Örn: 👑 VIP DUYURU"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#8b949e] mb-1 font-heading">
              Duyuru Metni
            </label>
            <input
              type="text"
              value={bannerMetin}
              onChange={(e) => setBannerMetin(e.target.value)}
              placeholder="Örn: 🎉 İlan verin, WhatsApp ile müşterilere anında ulaşın!"
              className="w-full px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#8b949e] mb-1 font-heading">
            Tıklanınca Gidilecek Link
          </label>
          <input
            type="text"
            value={bannerLink}
            onChange={(e) => setBannerLink(e.target.value)}
            placeholder="Örn: /ilan-ver veya /reklam-ver"
            className="w-full px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:border-amber-400 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSaveBanner}
            disabled={savingBanner}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase font-heading flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {savingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{savingBanner ? 'Kaydediliyor...' : 'Duyuruyu Kaydet'}</span>
          </button>
        </div>

        {bannerSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>✅ Kayan duyuru ayarları başarıyla kaydedildi!</span>
          </div>
        )}
      </div>

      {/* ── 5. HIZLI SİSTEM & ARAMA MOTORU AKSİYONLARI ──────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-base sm:text-lg text-white font-heading">
              Hızlı Sistem &amp; Arama Motoru Aksiyonları
            </h2>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold">Otomatik API Senkronu</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d1117] border border-[#21262d]">
          <div className="flex flex-col gap-1">
            <span className="font-black text-sm text-white font-heading flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Google &amp; Yandex IndexNow Ping Gönder</span>
            </span>
            <p className="text-xs text-[#8b949e]">
              Yeni eklenen ilanları ve sitemap URL'lerini arama motorlarına tek tıkla anında bildirir.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePingSeo}
            disabled={pingingSeo}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-300 border border-amber-500/30 text-xs font-bold font-heading flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            {pingingSeo ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Radio className="w-4 h-4 text-amber-400" />}
            <span>{pingingSeo ? 'Gönderiliyor...' : 'Arama Motorlarına Ping At'}</span>
          </button>
        </div>

        {pingResult && (
          <div className="p-3 rounded-2xl bg-slate-900 border border-[#30363d] text-xs font-mono text-emerald-300">
            <pre className="whitespace-pre-wrap">{JSON.stringify(pingResult, null, 2)}</pre>
          </div>
        )}
      </div>

    </div>
  );
}
