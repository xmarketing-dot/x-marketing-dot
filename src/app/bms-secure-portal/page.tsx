'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart3, Smartphone, Monitor, Globe, Search, RefreshCw, Eye, MessageSquare, 
  Zap, ArrowUpRight, Loader2, Sparkles, MapPin, Activity, Calendar, Share2,
  Clock, ShieldCheck, Flame, ExternalLink, Filter, ChevronDown, ChevronUp,
  Link2, TrendingUp, TrendingDown, Minus, Crown, Tag, MousePointerClick, Layers,
  Target, Plus, Trash2, Award, CheckCircle2, Megaphone, Check, Edit3
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { resolveTargetFromHost } from '@/lib/domainHelper';

export default function BmsSecurePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today'); // today, yesterday, week, month, all
  const [searchTermFilter, setSearchTermFilter] = useState('');
  const [listingSearchTerm, setListingSearchTerm] = useState('');
  const [listingSortBy, setListingSortBy] = useState<'views' | 'whatsapp' | 'ctr' | 'shares' | 'facebook' | 'google' | 'yandex' | 'x'>('views');
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'seo_rankings' | 'listings' | 'live_visitors'>('overview');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Admin Direct Listing Edit States
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [savingListingEdit, setSavingListingEdit] = useState(false);

  // Banner Ads States
  const [bannerList, setBannerList] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);

  // Google & Yandex SEO Rank Tracking States
  const [keywordList, setKeywordList] = useState<any[]>([]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [scanningRankings, setScanningRankings] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [testDomainInput, setTestDomainInput] = useState('');
  const [seoEngineTab, setSeoEngineTab] = useState<'both' | 'google' | 'yandex'>('both');
  const [visitorDisplayLimit, setVisitorDisplayLimit] = useState<number>(9999);
  const [onlySuspiciousFilter, setOnlySuspiciousFilter] = useState<boolean>(false);

  const handleAdminListingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setSavingListingEdit(true);
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingListing.id || editingListing._id,
          baslik: editingListing.baslik,
          aciklama: editingListing.aciklama,
          whatsappNumara: editingListing.whatsappNumara,
          ilSlug: editingListing.ilSlug,
          ilceSlug: editingListing.ilceSlug,
          rozet: editingListing.rozet,
          status: editingListing.status,
          panelSifresi: editingListing.panelSifresi,
        }),
      });

      const data = await res.json();
      if (data.success || res.ok) {
        alert('İlan başarıyla güncellendi!');
        setEditingListing(null);
        fetchAnalytics();
      } else {
        alert(data.error || 'Güncelleme başarısız.');
      }
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setSavingListingEdit(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setBannerLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const json = await res.json();
      if (json.success && json.banners) {
        setBannerList(json.banners);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBannerLoading(false);
    }
  };

  const handleBannerAction = async (id: string, action: string, redNedeni?: string) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, redNedeni }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBanners();
      } else {
        alert(data.error || 'İşlem başarısız');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const fetchKeywords = async () => {
    setKeywordLoading(true);
    try {
      const res = await fetch('/api/admin/seo/rank-check');
      const json = await res.json();
      if (json.keywords) {
        setKeywordList(json.keywords);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKeywordLoading(false);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;

    setKeywordLoading(true);
    try {
      const res = await fetch('/api/admin/seo/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeywordInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewKeywordInput('');
        fetchKeywords();
      } else {
        alert(json.error || 'Kelime eklenemedi');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKeywordLoading(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm('Bu anahtar kelime takibini silmek istediğinize emin misiniz?')) return;
    try {
      await fetch('/api/admin/seo/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      setKeywordList(prev => prev.filter(k => k._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanRankings = async (id?: string) => {
    setScanningRankings(true);
    try {
      const res = await fetch('/api/admin/seo/rank-check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : { all: true }),
      });
      const json = await res.json();
      if (json.keywords) {
        setKeywordList(json.keywords);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningRankings(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, selectedDomain]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const domainQuery = selectedDomain !== 'all' ? `&domain=${encodeURIComponent(selectedDomain)}` : '';
      const res = await fetch(`/api/admin/analytics?range=${range}${domainQuery}`);
      const json = await res.json();
      if (json.analytics) {
        setData(json.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const {
    totalPageviews = 0,
    uniqueVisitors = 0,
    activeUsers = 0,
    mobileCount = 0,
    desktopCount = 0,
    mobilePercentage = 80,
    desktopPercentage = 20,
    sources = { google: 0, yandex: 0, whatsapp: 0, direct: 0, instagram: 0, x: 0, facebook: 0, telegram: 0 },
    searchTerms = [],
    popularPages = [],
    topCities = [],
    eventCounts = { whatsappClicks: 0, shares: 0, categoryClicks: 0, cityFilters: 0, searches: 0 },
    topContactedListings = [],
    detailedListingReports = [],
    totalListingViews = 0,
    totalWhatsappClicks = 0,
    totalShares = 0,
    specialAdStats = { impressions: 0, uniqueVisitors: 0, clicks: 0, whatsappClicks: 0, ctr: '0.0' },
    googleConversionStats = {
      googleVisitors: 0,
      googleWhatsappClicks: 0,
      googleConversionRate: '0.0',
      topGoogleDistricts: [],
    },
    recentVisitors = [],
    domainBreakdown = [],
  } = data || {};

  const filteredListings = (detailedListingReports as any[])
    .filter((item: any) => {
      if (!listingSearchTerm) return true;
      const term = listingSearchTerm.toLowerCase();
      return (
        (item.baslik || '').toLowerCase().includes(term) ||
        (item.ilSlug || '').toLowerCase().includes(term) ||
        (item.ilceSlug || '').toLowerCase().includes(term) ||
        (item.rozet || '').toLowerCase().includes(term)
      );
    })
    .sort((a: any, b: any) => {
      if (listingSortBy === 'whatsapp') {
        return (b.whatsappClicks || 0) - (a.whatsappClicks || 0);
      }
      if (listingSortBy === 'ctr') {
        return parseFloat(b.conversionRate || '0') - parseFloat(a.conversionRate || '0');
      }
      if (listingSortBy === 'shares') {
        return (b.shares || 0) - (a.shares || 0);
      }
      if (listingSortBy === 'facebook') {
        return (b.referrers?.facebook || 0) - (a.referrers?.facebook || 0);
      }
      if (listingSortBy === 'google') {
        return (b.referrers?.google || 0) - (a.referrers?.google || 0);
      }
      if (listingSortBy === 'yandex') {
        return (b.referrers?.yandex || 0) - (a.referrers?.yandex || 0);
      }
      if (listingSortBy === 'x') {
        return (b.referrers?.x || 0) - (a.referrers?.x || 0);
      }
      return (b.totalViews || 0) - (a.totalViews || 0);
    });

  let fb = 0, google = 0, yandex = 0, x = 0, waClicks = 0, shares = 0;
  (detailedListingReports as any[]).forEach((item: any) => {
    fb += item.referrers?.facebook || 0;
    google += item.referrers?.google || 0;
    yandex += item.referrers?.yandex || 0;
    x += item.referrers?.x || 0;
    waClicks += item.whatsappClicks || 0;
    shares += item.shares || 0;
  });
  const totals = { fb, google, yandex, x, waClicks, shares };

  // ── ŞÜPHELİ TRAFİK, BOT VE SALDIRI TESPİT ANALİZİ ──
  // City/IP tek başına "bot" değildir; daha yüksek riskli sinyal kombinasyonları alarm üretir.
  const getSuspiciousAnalysis = (v: any) => {
    const ua = (v.userAgent || '').toLowerCase();
    const isSearchEngine =
      ua.includes('google') ||
      ua.includes('yandex') ||
      ua.includes('bing') ||
      ua.includes('duckduck') ||
      ua.includes('applebot') ||
      ua.includes('whatsapp') ||
      ua.includes('telegrambot') ||
      ua.includes('facebookexternalhit');

    if (isSearchEngine) {
      return { isSuspicious: false, isSearchEngine: true, badge: '✅ Arama Motoru (Google/Yandex)', reasons: [] };
    }

    const reasons: string[] = [];
    const path = (v.path || '').toLowerCase();
    const host = (v.hostname || '').toLowerCase();
    const ip = v.ip || '';
    const city = (v.city || '').toLowerCase();

    const isAutomationSignature =
      ua.includes('headless') ||
      ua.includes('puppeteer') ||
      ua.includes('playwright') ||
      ua.includes('selenium') ||
      ua.includes('webdriver') ||
      ua.includes('python') ||
      ua.includes('scrapy') ||
      ua.includes('curl') ||
      ua.includes('wget') ||
      ua.includes('go-http-client') ||
      ua.includes('semrush') ||
      ua.includes('ahrefs') ||
      ua.includes('bytespider') ||
      ua.includes('dotbot') ||
      ua.includes('mj12bot') ||
      ua.includes('petalbot') ||
      ua === '' ||
      ua.length < 15;

    if (isAutomationSignature) {
      reasons.push('🤖 Otomasyon / Bot Tarayıcı');
    }

    const isAttackPath =
      path.includes('.env') ||
      path.includes('wp-admin') ||
      path.includes('/phpmyadmin') ||
      path.includes('php') ||
      path.includes('eval') ||
      path.includes('select') ||
      path.includes('<script') ||
      path.includes('/api/admin') ||
      path.includes('/api/auth') ||
      path.includes('cmd=');

    if (isAttackPath) {
      reasons.push('⚠️ Saldırı / Tarama Denemesi');
    }

    const isProxyOrDatacenter =
      ip.startsWith('54.183.') ||
      ip.startsWith('13.57.') ||
      ip.startsWith('193.108.') ||
      ip.startsWith('57.141.') ||
      city.includes('san jose') ||
      city.includes('frankfurt') ||
      city.includes('ashburn') ||
      city.includes('dallas') ||
      city.includes('boardman');

    if (isProxyOrDatacenter && (isAutomationSignature || isAttackPath)) {
      reasons.push('🌐 Veri Merkezi / VPN / Proxy IP');
    }

    if (host.includes('.vercel.app')) {
      reasons.push('🕵️ Dahili Vercel Link Taraması');
    }

    if (v.isBanned) {
      reasons.push('🚫 Sistemce Yasaklanmış');
    }

    const isHighRisk = reasons.some((reason) =>
      reason.includes('Otomasyon') ||
      reason.includes('Saldırı') ||
      reason.includes('Yasaklanmış') ||
      reason.includes('Tarama')
    );

    return {
      isSuspicious: reasons.length > 0 && isHighRisk,
      isSearchEngine: false,
      badge: reasons.length > 0 && isHighRisk ? '🚨 BOT / ATTACK' : null,
      reasons,
    };
  };

  const suspiciousTotalCount = (recentVisitors as any[]).filter(
    (v: any) => getSuspiciousAnalysis(v).isSuspicious
  ).length;

  const filteredVisitors = (recentVisitors as any[]).filter((v: any) => {
    if (onlySuspiciousFilter) {
      const analysis = getSuspiciousAnalysis(v);
      if (!analysis.isSuspicious) return false;
    }
    if (!searchTermFilter) return true;
    const term = searchTermFilter.toLowerCase();
    return (
      (v.ip || '').toLowerCase().includes(term) ||
      (v.city || '').toLowerCase().includes(term) ||
      (v.path || '').toLowerCase().includes(term) ||
      (v.referer || '').toLowerCase().includes(term) ||
      (v.searchKeyword || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full text-left">
      
      {/* ── 1. HEADER BAR & ZAMAN FİLTRELERİ ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-2xl text-white font-heading tracking-tight">
              Trafik &amp; Ziyaretçi Analizleri
            </h1>
            <p className="text-xs text-[#8b949e]">
              Tekil ziyaretçiler, Google arama kelimeleri, Facebook referansları ve detaylı tıklama haritası.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tarih Filtresi Butonları */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-xl p-1 shrink-0 overflow-x-auto">
            {[
              { id: 'today', label: 'Bugün' },
              { id: 'yesterday', label: 'Dün' },
              { id: 'week', label: 'Son 1 Hafta' },
              { id: 'month', label: 'Son 30 Gün' },
              { id: 'all', label: 'Tüm Zamanlar' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  range === r.id 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Yenile Butonu */}
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg shrink-0"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
        </div>
      </div>

      {/* ── ÇOKLU DOMAİN FİLTRESİ ÇUBUĞU ──────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mt-2">
        <span className="text-[11px] font-bold text-[#8b949e] flex items-center gap-1.5 shrink-0">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          Domain Filtresi:
        </span>
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 flex items-center gap-1.5 ${
            selectedDomain === 'all'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20'
              : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58]'
          }`}
        >
          <span>🌐 Tüm Domainler</span>
        </button>
        {domainBreakdown.map((dItem: any) => (
          <button
            key={dItem.domain}
            onClick={() => setSelectedDomain(dItem.domain)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 flex items-center gap-1.5 font-mono ${
              selectedDomain === dItem.domain
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58]'
            }`}
          >
            <span>{dItem.domain}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#21262d] text-white">
              {dItem.uniqueVisitors} tekil
            </span>
          </button>
        ))}
      </div>

      {/* ── AKTİF FİLTRE & ZAMAN DİLİMİ BİLGİLENDİRME ÇUBUĞU ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-2 text-amber-300">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Şu an gösterilen veriler: <strong className="text-white uppercase">{
              range === 'today' ? 'Bugün (Son 24 Saat)' :
              range === 'yesterday' ? 'Dün' :
              range === 'week' ? 'Son 7 Gün' :
              range === 'month' ? 'Son 30 Gün' : 'Tüm Zamanlar (Genel Kümülatif)'
            }</strong>
            {range === 'today' && ' — İlan görüntülenmeleri ve WhatsApp tıklamaları sadece bugünün net rakamlarıdır.'}
          </span>
        </div>
        {range !== 'all' && (
          <button
            onClick={() => setRange('all')}
            className="text-[11px] text-amber-400 hover:text-amber-200 underline font-bold shrink-0"
          >
            Tüm Zamanların İstatistiklerini Gör →
          </button>
        )}
      </div>

      {/* ── 2. TAB NAVİGASYON ÇUBUĞU (MOBİLDE KAYDIRILABİLİR, DÜZENLİ SEKMELER) ──────────────── */}
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 overflow-x-auto no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        {[
          { id: 'overview', label: '📊 Genel Bakış', count: null },
          { id: 'seo_rankings', label: '🎯 Google Sıralama & Dönüşüm', count: keywordList.length > 0 ? keywordList.length : null },
          { id: 'listings', label: '👑 İlan Performans & Referrer', count: filteredListings.length },
          { id: 'live_visitors', label: '⚡ Canlı Ziyaretçi Günlüğü', count: recentVisitors.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs font-heading transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]'
                : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d] hover:border-amber-400/40'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === tab.id ? 'bg-slate-950/30 text-slate-950' : 'bg-[#21262d] text-amber-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME 1: GENEL BAKIŞ & TRAFİK KAYNAKLARI ────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Canlı Kullanıcı Bannerı */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-[#161b22] to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-10 h-10">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping"></div>
                <div className="relative bg-emerald-500 text-slate-950 w-8 h-8 rounded-full flex items-center justify-center font-black">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-emerald-400 text-base sm:text-lg uppercase tracking-wider font-heading flex items-center gap-2">
                  <span>Şu An Sitede {activeUsers} Tekil Ziyaretçi Aktif</span>
                </span>
                <span className="text-xs text-[#8b949e]">Son 5 dakika içerisinde sayfaları gezen gerçek kullanıcılar</span>
              </div>
            </div>

            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black font-heading">
              CANLI AKIŞ
            </span>
          </div>

          {/* 4 Ana Metrik Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {/* Tekil Ziyaretçi */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Tekil Ziyaretçi</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-3xl text-white font-heading">{uniqueVisitors.toLocaleString()}</span>
                <span className="text-xs text-amber-400 font-bold">Tekil Kişi</span>
              </div>
              <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
                Toplam {totalPageviews.toLocaleString()} sayfa görüntülendi
              </span>
            </div>

            {/* WhatsApp İletişim Tıklamaları */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">WhatsApp Tıklamaları</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center">
                  <OfficialWhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-3xl text-[#25D366] font-heading">{eventCounts.whatsappClicks.toLocaleString()}</span>
                <span className="text-xs text-emerald-400 font-bold">Dönüşüm</span>
              </div>
              <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
                Genel toplam: {totalWhatsappClicks.toLocaleString()} WhatsApp iletişimi
              </span>
            </div>

            {/* Google Organik Arama Trafiği */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Google Arama</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-3xl text-blue-400 font-heading">{sources.google.toLocaleString()}</span>
                <span className="text-xs text-blue-300 font-bold">Google Girişi</span>
              </div>
              <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
                {searchTerms.length} Farklı arama kelimesi tespit edildi
              </span>
            </div>

            {/* Yandex Arama Trafiği (YENİ) */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-red-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Yandex Arama</span>
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-3xl text-red-400 font-heading">{sources.yandex.toLocaleString()}</span>
                <span className="text-xs text-red-300 font-bold">Yandex Girişi</span>
              </div>
              <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
                Yandex Search Engine trafiği 🇷🇺
              </span>
            </div>

            {/* Sosyal & Facebook Trafiği */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#8b949e] uppercase tracking-wider font-heading">Facebook &amp; Sosyal</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-3xl text-indigo-400 font-heading">
                  {((sources.facebook || 0) + (sources.x || 0) + (sources.instagram || 0)).toLocaleString()}
                </span>
                <span className="text-xs text-indigo-300 font-bold">Sosyal Hit</span>
              </div>
              <span className="text-[11px] text-[#8b949e] flex items-center gap-1 border-t border-[#30363d] pt-2">
                FB: {sources.facebook || 0} • X: {sources.x || 0} • IG: {sources.instagram || 0}
              </span>
            </div>
          </div>

          {/* ── ÇOKLU DOMAİN GATEWAY İSTİHBARAT & PERFORMANS MASASI ── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-amber-400" />
                <div className="flex flex-col">
                  <h2 className="font-black text-base text-white font-heading">
                    Çoklu Domain Gateway Ağı — Canlı Performans &amp; WhatsApp ROI
                  </h2>
                  <span className="text-[11px] text-[#8b949e]">
                    Hangi domain kaç tekil müşteri getirdi, kaç kişi WhatsApp'tan yazdı ve dönüşüm oranları (CTR).
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Dinamik Domain Router Aktif
              </span>
            </div>

            {/* Domain Kartları / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domainBreakdown.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#21262d] text-xs text-[#8b949e] col-span-full">
                  İlk domain istekleri kaydedildiğinde burada canlı olarak karşılaştırılacak.
                </div>
              ) : (
                domainBreakdown.map((item: any) => {
                  const targetLoc = resolveTargetFromHost(item.domain);
                  const isMainPortal = !targetLoc;

                  return (
                    <div 
                      key={item.domain}
                      className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-black text-white flex items-center gap-1.5">
                            {isMainPortal ? <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            {item.domain}
                          </span>
                          <span className="text-[10px] text-[#8b949e] mt-0.5">
                            {isMainPortal ? 'Türkiye Geneli Ana Merkez' : `${targetLoc.ilSlug?.toUpperCase()} / ${(targetLoc.ilceSlug || 'Tüm İlçe')?.toUpperCase()}`}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                          isMainPortal 
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {isMainPortal ? 'GENEL MERKEZ' : 'BÖLGESEL GATEWAY'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#21262d] text-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Tekil Kişi</span>
                          <span className="text-sm font-black text-white font-mono">{item.uniqueVisitors.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Sayfa Hit</span>
                          <span className="text-sm font-black text-slate-300 font-mono">{item.totalPageviews.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-emerald-400 font-bold">WhatsApp</span>
                          <span className="text-sm font-black text-emerald-400 font-mono">{item.whatsappClicks} Tık</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b949e]">WhatsApp Dönüşüm (CTR):</span>
                        <span className="font-bold text-amber-400 font-mono">{item.conversionRate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Özel İlan Vitrin Bannerı */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#161b22] to-amber-500/5 border border-amber-500/30 flex flex-col gap-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">
                  Özel Vitrin Popup &amp; Banner İstatistikleri
                </h2>
              </div>
              <span className="text-xs text-amber-400 font-bold font-mono">
                Dönüşüm Oranı: %{specialAdStats?.ctr || '0.0'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col">
                <span className="text-[11px] text-[#8b949e]">Popup Gösterimi</span>
                <span className="font-black text-xl text-white font-heading">{specialAdStats?.impressions || 0} Kez</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col">
                <span className="text-[11px] text-[#8b949e]">Tekil Gösterim</span>
                <span className="font-black text-xl text-amber-300 font-heading">{specialAdStats?.uniqueVisitors || 0} Kişi</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col">
                <span className="text-[11px] text-[#8b949e]">İlan Detayına Tıklama</span>
                <span className="font-black text-xl text-cyan-400 font-heading">{specialAdStats?.clicks || 0}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col">
                <span className="text-[11px] text-[#8b949e]">Direkt WhatsApp Butonu</span>
                <span className="font-black text-xl text-emerald-400 font-heading">{specialAdStats?.whatsappClicks || 0}</span>
              </div>
            </div>
          </div>

          {/* Cihaz ve Trafik Kaynakları */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cihaz Dağılımı */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h2 className="font-black text-base text-white font-heading">Cihaz Türleri</h2>
                </div>
                <span className="text-xs text-[#8b949e] font-mono">%{mobilePercentage} Mobil</span>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">Mobil Cihazlar</span>
                      <span className="text-[10px] text-[#8b949e]">{mobileCount.toLocaleString()} Sayfa İsteği</span>
                    </div>
                  </div>
                  <span className="font-black text-xl text-amber-400 font-heading">%{mobilePercentage}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">Masaüstü &amp; Laptop</span>
                      <span className="text-[10px] text-[#8b949e]">{desktopCount.toLocaleString()} Sayfa İsteği</span>
                    </div>
                  </div>
                  <span className="font-black text-xl text-blue-400 font-heading">%{desktopPercentage}</span>
                </div>
              </div>
            </div>

            {/* Trafik Kaynakları 7'li Grid */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] lg:col-span-2 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h2 className="font-black text-base text-white font-heading">Trafik Kaynakları (Referrer Kanalları)</h2>
                </div>
                <span className="text-xs text-[#8b949e]">Geliş Yolları</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8b949e]">Google Arama</span>
                  <span className="font-black text-xl text-blue-400 font-heading">{sources.google}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-indigo-500/30 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8b949e]">Facebook</span>
                  <span className="font-black text-xl text-indigo-400 font-heading">{sources.facebook}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-emerald-500/30 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8b949e]">WhatsApp</span>
                  <span className="font-black text-xl text-[#25D366] font-heading">{sources.whatsapp}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-cyan-500/30 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8b949e]">X (Twitter)</span>
                  <span className="font-black text-xl text-cyan-400 font-heading">{sources.x}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-pink-500/30 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8b949e]">Instagram</span>
                  <span className="font-black text-xl text-pink-400 font-heading">{sources.instagram}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-sky-500/30 flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#8b949e]">Telegram</span>
                  <span className="font-black text-xl text-sky-400 font-heading">{sources.telegram || 0}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-1 col-span-2 sm:col-span-2">
                  <span className="text-[11px] font-bold text-[#8b949e]">Doğrudan / Direkt Giriş</span>
                  <span className="font-black text-xl text-white font-heading">{sources.direct}</span>
                </div>
              </div>
            </div>
          </div>

          {/* En Çok Gezilen Sayfalar & Şehir Dağılımı */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Popüler Sayfalar */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] lg:col-span-2 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <h2 className="font-black text-base text-white font-heading">
                    En Çok Ziyaret Edilen Sayfalar
                  </h2>
                </div>
                <span className="text-xs text-[#8b949e]">Görüntülenme &amp; Kalma Süresi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {popularPages.map((p: any, idx: number) => {
                  const avgSec = Math.round(p.avgDuration || 0);
                  return (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-amber-400 font-bold truncate max-w-[200px]">
                          {p._id}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-[#21262d] text-white font-black text-xs font-heading">
                          {p.count} Hit
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
                        <span className="truncate">{p.pageTitle || 'Sayfa'}</span>
                        <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                          <Clock className="w-3 h-3" /> {avgSec}s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* En Çok Ziyaretçi Alan Şehirler */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <h2 className="font-black text-base text-white font-heading">
                    Ziyaretçi Şehirleri
                  </h2>
                </div>
                <span className="text-xs text-amber-400 font-bold">Top 10</span>
              </div>

              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {topCities.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8b949e]">Henüz şehir verisi kaydedilmedi.</div>
                ) : (
                  topCities.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#21262d] text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-white truncate">
                          📍 {c._id}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs shrink-0 font-heading">
                        {c.count} Ziyaret
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* En Çok WhatsApp & Etkileşim Alan İlanlar (Top İlanlar) */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">
                  En Çok WhatsApp &amp; Etkileşim Alan İlanlar
                </h2>
              </div>
              <span className="text-xs text-emerald-400 font-bold">Top İlanlar</span>
            </div>

            {topContactedListings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8b949e]">
                Bu tarih aralığında henüz ilan etkileşim verisi bulunmuyor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topContactedListings.map((item: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-xs text-white truncate font-heading">
                        {item._id || 'İsimsiz İlan'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-black font-heading flex items-center gap-1">
                        <OfficialWhatsAppIcon className="w-3 h-3 fill-emerald-300" />
                        {item.whatsappClicks || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[11px] font-black font-heading flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {item.shares || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME: GOOGLE CANLI SIRALAMA (SERP) & WHATSAPP DÖNÜŞÜM TAKİBİ ───── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'seo_rankings' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* ── BÖLÜM 1: GOOGLE & YANDEX WHATSAPP DÖNÜŞÜM ANALİTİĞİ ────────────────── */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161b22] via-[#1c1917] to-[#161b22] border-2 border-amber-500/40 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-black text-lg sm:text-xl text-white font-heading">
                    Google &amp; Yandex Organik Arama &amp; WhatsApp Dönüşüm Analizi
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    Arama motorlarından (Google &amp; Yandex) gelen ziyaretçilerin doğrudan WhatsApp randevularına dönüşme performansı.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono">
                  Dönüşüm Oranı: %{googleConversionStats.googleConversionRate}
                </span>
              </div>
            </div>

            {/* 4 KPI Kartı (Google + Yandex Organik Trafik) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#0d1117] border border-blue-500/30 flex flex-col gap-1">
                <span className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Google Organik Ziyaretçi
                </span>
                <span className="font-black text-2xl text-white font-heading">
                  {sources.google || googleConversionStats.googleVisitors || 0}
                </span>
                <span className="text-[10px] text-[#8b949e]">Google TR'den gelen tekil kişiler</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-1">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-400" />
                  Yandex Organik Ziyaretçi
                </span>
                <span className="font-black text-2xl text-white font-heading">
                  {sources.yandex || 0}
                </span>
                <span className="text-[10px] text-[#8b949e]">Yandex TR'den gelen tekil kişiler</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1117] border border-emerald-500/30 flex flex-col gap-1">
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Arama WhatsApp Tıklamaları
                </span>
                <span className="font-black text-2xl text-emerald-400 font-heading">
                  {googleConversionStats.googleWhatsappClicks}
                </span>
                <span className="text-[10px] text-[#8b949e]">Aramadan gelip WhatsApp'a basanlar</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0d1117] border border-amber-500/30 flex flex-col gap-1">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Net Dönüşüm Oranı (CR)
                </span>
                <span className="font-black text-2xl text-amber-400 font-heading">
                  %{googleConversionStats.googleConversionRate}
                </span>
                <span className="text-[10px] text-[#8b949e]">Her 100 organik kişiden randevu oranı</span>
              </div>
            </div>

            {/* Arama Motorlarından En Çok WhatsApp Getiren İlanlar / İlçeler */}
            {googleConversionStats.topGoogleDistricts && googleConversionStats.topGoogleDistricts.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs font-black text-white font-heading uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Organik Aramalardan En Çok WhatsApp Müşterisi Getiren Sayfalar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {googleConversionStats.topGoogleDistricts.map((item: any) => (
                    <div key={item.id} className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{item.baslik}</span>
                        <span className="text-[10px] text-amber-400 capitalize">{item.ilSlug} / {item.ilceSlug}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1">
                          <OfficialWhatsAppIcon className="w-3 h-3" />
                          {item.whatsappClicks} Tık
                        </span>
                        <span className="text-[10px] text-[#8b949e] font-mono">{item.googleViews} Organik Hit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── BÖLÜM 1.5: ÇOKLU DOMAIN & SEO GATEWAY AĞI ── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
              <div>
                <h2 className="font-black text-lg sm:text-xl text-white font-heading flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <span>Çoklu Domain &amp; SEO Gateway Ağı</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Dinamik Yönlendirme Aktif
                  </span>
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">
                  Vercel'e eklediğiniz tüm domainler otomatik olarak algılanır, WhatsApp mesajları ve vitrinler o domaine özel üretilir.
                </p>
              </div>
            </div>

            {/* Bağlı ve Aktif Domainler Listesi (Dinamik Canlı Gateway Ağı) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(domainBreakdown && domainBreakdown.length > 0 ? domainBreakdown : [
                { domain: 'besteskort.devs.surf', resolvedTarget: 'TÜRKİYE / ANA VİTRİN', uniqueVisitors: 0, totalPageviews: 0, whatsappClicks: 0 },
                { domain: 'istanbuleskort.devs.surf', resolvedTarget: 'İSTANBUL / GENEL', uniqueVisitors: 0, totalPageviews: 0, whatsappClicks: 0 },
                { domain: 'izmireskort.devs.surf', resolvedTarget: 'İZMİR / GENEL', uniqueVisitors: 0, totalPageviews: 0, whatsappClicks: 0 },
                { domain: 'beylikduzueskort.devs.surf', resolvedTarget: 'İSTANBUL / BEYLİKDÜZÜ', uniqueVisitors: 0, totalPageviews: 0, whatsappClicks: 0 },
                { domain: 'beylikduzuescort.devs.surf', resolvedTarget: 'İSTANBUL / BEYLİKDÜZÜ', uniqueVisitors: 0, totalPageviews: 0, whatsappClicks: 0 },
              ]).map((d: any, idx: number) => {
                const target = d.resolvedTarget || resolveTargetFromHost(d.domain);
                const targetLabel = typeof target === 'string' ? target : (target ? `${target.ilSlug?.toUpperCase()} ${target.ilceSlug ? '/ ' + target.ilceSlug?.toUpperCase() : ''}` : 'TÜRKİYE / ANA VİTRİN');
                const isMain = d.domain.includes('besteskort') || d.domain.includes('bestescort');

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-2xl bg-[#0d1117] border flex flex-col justify-between gap-3 transition-all hover:border-amber-500/50 ${
                      isMain ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold uppercase tracking-wider font-heading flex items-center gap-1.5 ${
                          isMain ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {isMain ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Target className="w-3.5 h-3.5 text-emerald-400" />}
                          {isMain ? 'Ana Platform' : 'Bölgesel Gateway (EMD)'}
                        </span>
                        <span className="text-sm font-black text-white font-mono mt-0.5 break-all">
                          {d.domain}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono shrink-0">
                        {targetLabel}
                      </span>
                    </div>

                    {/* Metrikler */}
                    <div className="grid grid-cols-3 gap-2 bg-[#161b22] p-2 rounded-xl border border-[#21262d] text-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[#8b949e]">Tekil</span>
                        <span className="font-black text-white font-mono">{d.uniqueVisitors || 0}</span>
                      </div>
                      <div className="flex flex-col border-x border-[#21262d]">
                        <span className="text-[9px] text-[#8b949e]">Görüntüleme</span>
                        <span className="font-black text-white font-mono">{d.totalPageviews || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[#8b949e]">WhatsApp</span>
                        <span className="font-black text-emerald-400 font-mono">{d.whatsappClicks || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SSL &amp; Gateway Aktif
                      </span>
                      <a
                        href={d.domain.startsWith('http') ? d.domain : `https://${d.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        <span>Ziyaret Et</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Yeni Domain Yönlendirme Simülatörü */}
            <div className="p-4 rounded-2xl bg-[#0d1117]/80 border border-[#30363d] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Yeni Domain Simülatörü &amp; Eşleştirme Testi
                </span>
                <span className="text-[10px] text-[#8b949e]">Yeni ekleyeceğiniz domainin nereye açılacağını anında görün</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Ekleyeceğiniz domain adını yazın... (örn: kadikoyescort.devs.surf, istanbulescort.devs.surf)"
                  value={testDomainInput}
                  onChange={(e) => setTestDomainInput(e.target.value)}
                  className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
              {testDomainInput && (
                <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between text-xs">
                  {(() => {
                    const resolved = resolveTargetFromHost(testDomainInput);
                    if (resolved) {
                      return (
                        <div className="flex items-center gap-2 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Hedef Bölge: <strong className="text-white capitalize">{resolved.ilSlug} {resolved.ilceSlug ? `/ ${resolved.ilceSlug}` : ''}</strong>. Bu domain Vercel'e eklendiği an otomatik olarak o bölgenin eskort vitrini olarak açılacaktır!
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2 text-amber-400 font-medium">
                        <span>Domain isminde il/ilçe kelimesi bulunamadı. Bu domain doğrudan Türkiye Ana Platformu (Tüm İller) olarak çalışacaktır.</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* ── BÖLÜM 2: CANLI GOOGLE & YANDEX SIRALAMA TAKİP MOTORU (DUAL SERP TRACKER) ── */}
          <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#30363d] pb-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-black text-lg sm:text-xl text-white font-heading flex items-center gap-2">
                    <span>Google &amp; Yandex Canlı SERP Sıralama &amp; Rakip Takip Motoru</span>
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                    {keywordList.length} Kelime Takipte
                  </span>
                </div>
                <p className="text-xs text-[#8b949e] mt-1">
                  Hedef kelimelerinizde <strong>Google Türkiye</strong> ve <strong>Yandex Türkiye</strong>'deki anlık sıranızı, değişimleri ve rakipleri canlı izleyin.
                </p>
              </div>

              {/* Arama Motoru Filtresi & Canlı Tara Butonu */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSeoEngineTab('both')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      seoEngineTab === 'both' ? 'bg-amber-500 text-slate-950 font-black' : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    Tüm Motorlar (Çift Görünüm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoEngineTab('google')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      seoEngineTab === 'google' ? 'bg-blue-600 text-white font-black' : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    Google TR 🔴
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoEngineTab('yandex')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      seoEngineTab === 'yandex' ? 'bg-red-600 text-white font-black' : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    Yandex TR 🟡
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleScanRankings()}
                  disabled={scanningRankings}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider font-heading shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Zap className={`w-4 h-4 ${scanningRankings ? 'animate-spin text-slate-950' : 'fill-slate-950'}`} />
                  <span>{scanningRankings ? 'Google & Yandex Taranıyor...' : '⚡ Tüm Sıralamaları Canlı Tara'}</span>
                </button>
              </div>
            </div>

            {/* Yeni Kelime Ekleme Formu */}
            <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="Takip edilecek kelime yazın... (örn: kadıköy eskort, beylikdüzü escort)"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                disabled={keywordLoading || !newKeywordInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Kelime Ekle &amp; Tara</span>
              </button>
            </form>

            {/* Sıralama Tablosu */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30363d] text-[11px] font-black text-[#8b949e] uppercase tracking-wider">
                    <th className="py-3 px-3">Anahtar Kelime</th>
                    {(seoEngineTab === 'both' || seoEngineTab === 'google') && (
                      <>
                        <th className="py-3 px-3 text-blue-400">Google TR Sırası</th>
                        <th className="py-3 px-3 text-blue-400">Google Değişim</th>
                      </>
                    )}
                    {(seoEngineTab === 'both' || seoEngineTab === 'yandex') && (
                      <>
                        <th className="py-3 px-3 text-amber-400">Yandex TR Sırası</th>
                        <th className="py-3 px-3 text-amber-400">Yandex Değişim</th>
                      </>
                    )}
                    <th className="py-3 px-3">Önümüzdeki Rakipler</th>
                    <th className="py-3 px-3">Son Tarama</th>
                    <th className="py-3 px-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {keywordList.map((item: any) => {
                    const posG = item.currentPosition || 0;
                    const changeG = item.change || 0;
                    const posY = item.yandexPosition || 0;
                    const changeY = item.yandexChange || 0;

                    const renderPosBadge = (pos: number, engine: 'google' | 'yandex', keyword: string) => {
                      const searchUrl = engine === 'google'
                        ? `https://www.google.com.tr/search?q=${encodeURIComponent(keyword)}`
                        : `https://yandex.com.tr/search/?text=${encodeURIComponent(keyword)}&lr=11508`;

                      let badgeContent = null;
                      if (pos > 0 && pos <= 3) {
                        badgeContent = (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            🥇 #{pos} (Zirve) ↗
                          </span>
                        );
                      } else if (pos > 3 && pos <= 10) {
                        badgeContent = (
                          <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 text-xs font-black font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            🥈 #{pos} (1. Sayfa) ↗
                          </span>
                        );
                      } else if (pos > 10 && pos <= 30) {
                        badgeContent = (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            🥉 #{pos} (Sayfa 2-3) ↗
                          </span>
                        );
                      } else if (pos > 30) {
                        badgeContent = (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-black font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            #{pos} ↗
                          </span>
                        );
                      } else {
                        badgeContent = (
                          <span className="px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d] text-xs font-bold font-mono inline-flex items-center gap-1 group-hover:text-white transition-colors">
                            100+ (Dışında) ↗
                          </span>
                        );
                      }

                      return (
                        <a
                          href={searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-block"
                          title={`${engine === 'google' ? 'Google TR' : 'Yandex TR'} üzerinde canlı sonuçları yeni sekmede gör`}
                        >
                          {badgeContent}
                        </a>
                      );
                    };

                    const renderChangeBadge = (change: number, pos: number) => {
                      if (change > 0) {
                        return (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs font-mono">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{change}
                          </span>
                        );
                      } else if (change < 0) {
                        return (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs font-mono">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {change}
                          </span>
                        );
                      }
                      if (pos === 0) {
                        return (
                          <span className="inline-flex items-center gap-1 text-[#484f58] font-mono text-xs">
                            —
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-[#8b949e] font-bold text-xs font-mono">
                          <Minus className="w-3.5 h-3.5" />
                          Sabit
                        </span>
                      );
                    };

                    return (
                      <tr key={item._id} className="hover:bg-[#21262d]/40 transition-colors">
                        {/* Kelime Adı */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-xs text-white capitalize font-heading block">
                            {item.keyword}
                          </span>
                          <span className="text-[10px] text-[#8b949e]">Türkiye Arama Ağı</span>
                        </td>

                        {/* Google Sırası ve Değişimi */}
                        {(seoEngineTab === 'both' || seoEngineTab === 'google') && (
                          <>
                            <td className="py-3.5 px-3">
                              {renderPosBadge(posG, 'google', item.keyword)}
                            </td>
                            <td className="py-3.5 px-3">
                              {renderChangeBadge(changeG, posG)}
                            </td>
                          </>
                        )}

                        {/* Yandex Sırası ve Değişimi */}
                        {(seoEngineTab === 'both' || seoEngineTab === 'yandex') && (
                          <>
                            <td className="py-3.5 px-3">
                              {renderPosBadge(posY, 'yandex', item.keyword)}
                            </td>
                            <td className="py-3.5 px-3">
                              {renderChangeBadge(changeY, posY)}
                            </td>
                          </>
                        )}

                        {/* Rakipler */}
                        <td className="py-3.5 px-3">
                          {item.topCompetitors && item.topCompetitors.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.topCompetitors.slice(0, 2).map((c: any, cIdx: number) => (
                                <span
                                  key={cIdx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e] font-mono truncate max-w-[140px]"
                                  title={c.domain}
                                >
                                  #{c.position} {c.domain}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#484f58]">Tespit edilmedi</span>
                          )}
                        </td>

                        {/* Son Kontrol */}
                        <td className="py-3.5 px-3 text-[10px] text-[#8b949e] font-mono whitespace-nowrap">
                          {item.lastCheckedAt
                            ? new Date(item.lastCheckedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                            : 'Henüz taranmadı'}
                        </td>

                        {/* İşlemler */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleScanRankings(item._id)}
                              disabled={scanningRankings}
                              title="Bu Kelimeyi Tekrar Tara (Google + Yandex)"
                              className="p-1.5 rounded-lg bg-[#21262d] hover:bg-amber-500/20 text-[#8b949e] hover:text-amber-400 border border-[#30363d] transition-colors"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${scanningRankings ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteKeyword(item._id)}
                              title="Kelimeyi Sil"
                              className="p-1.5 rounded-lg bg-[#21262d] hover:bg-rose-500/20 text-[#8b949e] hover:text-rose-400 border border-[#30363d] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME 2: HER İLAN İÇİN DETAYLI ANALİZ & REFERRER (NEREDEN GELDİ) ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'listings' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#161b22] border border-amber-500/40 shadow-2xl flex flex-col gap-6 animate-fadeIn">
          
          {/* Başlık ve Arama Kutusu */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-black text-lg sm:text-xl text-white font-heading tracking-tight flex items-center gap-2">
                  <span>İlan Performans, Tıklama &amp; Referrer Raporu</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {filteredListings.length} İlan
                  </span>
                </h2>
                <p className="text-xs text-[#8b949e]">
                  Hangi ilan kaç kez görüntülendi, kaç kez WhatsApp'a tıklandı, Facebook, Google, Twitter referansları ve gelen linkler.
                </p>
              </div>
            </div>

            {/* Hızlı Arama Kutusu */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="İlan adı veya şehir ara..."
                value={listingSearchTerm}
                onChange={(e) => setListingSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none shadow-inner"
              />
              <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
            </div>
          </div>

          {/* İlan Detay Tablosu (Masaüstü) & Kartlar (Mobil) */}
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8b949e] bg-[#0d1117] rounded-2xl border border-[#30363d]">
              Arama kriterine uygun ilan bulunamadı.
            </div>
          ) : (
            <>
              {/* MOBİL GÖRÜNÜM: Her ilan ayrı şık kart (Yatay kaydırma sorunu olmadan rahatça okunur) */}
              <div className="flex flex-col gap-3.5 md:hidden">
                {filteredListings.map((item: any) => {
                  const isExpanded = expandedListingId === item.id;
                  return (
                    <div key={item.id} className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                          <Image src={item.fotoUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'} alt={item.baslik} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-black text-xs text-white truncate font-heading">{item.baslik}</span>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold font-mono">
                              {item.ilSlug?.toUpperCase() || 'TR'} {item.ilceSlug ? `• ${item.ilceSlug?.toUpperCase()}` : ''}
                            </span>
                            {item.rozet && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                                {item.rozet?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#161b22] p-2.5 rounded-xl border border-[#21262d] text-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">
                            {range === 'today' ? 'Bugün Görüntülenme' : range === 'yesterday' ? 'Dün Görüntülenme' : 'Görüntülenme'}
                          </span>
                          <span className="font-black text-xs text-white font-heading">{item.totalViews} Kez</span>
                          {range !== 'all' && (
                            <span className="text-[9px] text-[#8b949e]">
                              Toplam: {item.lifetimeViews || 0}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col border-x border-[#21262d]">
                          <span className="text-[10px] text-[#8b949e]">
                            {range === 'today' ? 'Bugün WhatsApp' : range === 'yesterday' ? 'Dün WhatsApp' : 'WhatsApp'}
                          </span>
                          <span className="font-black text-xs text-emerald-400 font-heading flex items-center justify-center gap-1">
                            <OfficialWhatsAppIcon className="w-3 h-3 fill-emerald-400" />
                            {item.whatsappClicks}
                          </span>
                          {range !== 'all' && (
                            <span className="text-[9px] text-[#8b949e]">
                              Toplam: {item.lifetimeWhatsapp || 0}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#8b949e]">Dönüşüm</span>
                          <span className="font-black text-xs text-amber-400 font-mono">%{item.conversionRate}</span>
                        </div>
                      </div>

                      {/* Referans Rozetleri */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.referrers?.google > 0 && <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold font-mono">🔍 Google: {item.referrers.google}</span>}
                        {item.referrers?.yandex > 0 && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">🟡 Yandex: {item.referrers.yandex}</span>}
                        {item.referrers?.facebook > 0 && <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono">🟦 FB: {item.referrers.facebook}</span>}
                        {item.referrers?.x > 0 && <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono">🐦 X: {item.referrers.x}</span>}
                        {item.referrers?.whatsapp > 0 && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">🟢 WA: {item.referrers.whatsapp}</span>}
                        {item.referrers?.instagram > 0 && <span className="px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold font-mono">📸 IG: {item.referrers.instagram}</span>}
                        {item.referrers?.direct > 0 && <span className="px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e] text-[10px] font-bold font-mono">🔗 Direkt: {item.referrers.direct}</span>}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#21262d]">
                        <button
                          type="button"
                          onClick={() => setExpandedListingId(isExpanded ? null : item.id)}
                          className="text-xs font-bold text-amber-400 flex items-center gap-1 py-1"
                        >
                          <span>{isExpanded ? 'Referrer Gizle' : 'Gelen Linkleri Gör'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <Link href={`/ilan/${item.slug}`} target="_blank" className="text-xs text-[#8b949e] hover:text-white flex items-center gap-1">
                          <span>İlana Git</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      {isExpanded && (
                        <div className="p-3 rounded-xl bg-[#161b22] border border-amber-500/30 flex flex-col gap-2 mt-1">
                          <span className="text-[11px] font-bold text-amber-400">Bu İlana Gelen Dış Linkler:</span>
                          {item.rawReferrers && item.rawReferrers.length > 0 ? (
                            item.rawReferrers.map((r: string, rIdx: number) => (
                              <span key={rIdx} className="text-[10px] text-amber-200 font-mono break-all bg-[#0d1117] p-1.5 rounded border border-[#30363d]">
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#8b949e] italic">Dış referans linki bulunmuyor.</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MASAÜSTÜ GÖRÜNÜM: Tam Tablo */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#30363d] bg-[#0d1117]">
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#30363d] bg-[#161b22] text-[#8b949e] font-heading font-black text-[11px]">
                      <th className="py-3 px-4">İLAN BİLGİSİ</th>
                      
                      <th 
                        className="py-3 px-3 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => setListingSortBy('views')}
                        title="Görüntülenmeye göre sırala"
                      >
                        <div className="flex items-center gap-1">
                          <span>GÖRÜNTÜLENME</span>
                          {listingSortBy === 'views' && <span className="text-amber-400 font-black">▼</span>}
                        </div>
                      </th>

                      <th 
                        className="py-3 px-3 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => setListingSortBy(listingSortBy === 'whatsapp' ? 'ctr' : 'whatsapp')}
                        title="WhatsApp ve Dönüşüm oranına göre sırala"
                      >
                        <div className="flex items-center gap-1">
                          <span>WHATSAPP &amp; DÖNÜŞÜM</span>
                          {listingSortBy === 'whatsapp' && <span className="text-amber-400 font-black">▼ (TIKLAMA)</span>}
                          {listingSortBy === 'ctr' && <span className="text-amber-400 font-black">▼ (% CTR)</span>}
                        </div>
                      </th>

                      <th 
                        className="py-3 px-3 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => setListingSortBy('shares')}
                        title="Paylaşıma göre sırala"
                      >
                        <div className="flex items-center gap-1">
                          <span>PAYLAŞIM</span>
                          {listingSortBy === 'shares' && <span className="text-amber-400 font-black">▼</span>}
                        </div>
                      </th>

                      <th 
                        className="py-3 px-3 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => {
                          if (listingSortBy === 'google') setListingSortBy('yandex');
                          else if (listingSortBy === 'yandex') setListingSortBy('facebook');
                          else if (listingSortBy === 'facebook') setListingSortBy('x');
                          else setListingSortBy('google');
                        }}
                        title="Trafik kaynaklarına göre sırala"
                      >
                        <div className="flex items-center gap-1">
                          <span>TRAFİK KAYNAKLARI (REFERRER)</span>
                          {listingSortBy === 'google' && <span className="text-blue-400 font-black">▼ (GOOGLE)</span>}
                          {listingSortBy === 'yandex' && <span className="text-amber-400 font-black">▼ (YANDEX)</span>}
                          {listingSortBy === 'facebook' && <span className="text-indigo-400 font-black">▼ (FB)</span>}
                          {listingSortBy === 'x' && <span className="text-cyan-400 font-black">▼ (X)</span>}
                        </div>
                      </th>

                      <th className="py-3 px-4 text-right">DETAY &amp; LİNK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {filteredListings.map((item: any) => {
                      const isExpanded = expandedListingId === item.id;
                      const totalReferralTraffic = 
                        (item.referrers?.google || 0) +
                        (item.referrers?.yandex || 0) +
                        (item.referrers?.facebook || 0) +
                        (item.referrers?.x || 0) +
                        (item.referrers?.whatsapp || 0) +
                        (item.referrers?.instagram || 0) +
                        (item.referrers?.direct || 0);

                      return (
                        <React.Fragment key={item.id}>
                          <tr className="hover:bg-[#21262d]/50 transition-colors">
                            
                            {/* İlan Bilgisi */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] shrink-0">
                                  <Image
                                    src={item.fotoUrl || 'https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=100'}
                                    alt={item.baslik}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0 max-w-[240px]">
                                  <span className="font-black text-xs text-white truncate font-heading hover:text-amber-400 transition-colors">
                                    {item.baslik}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                                      {item.ilSlug?.toUpperCase() || 'TR'} {item.ilceSlug ? `• ${item.ilceSlug?.toUpperCase()}` : ''}
                                    </span>
                                    {item.rozet && (
                                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                                        {item.rozet?.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Görüntülenme */}
                            <td className="py-3.5 px-3">
                              <div className="flex flex-col">
                                <span className="font-black text-sm text-white font-heading">
                                  {(item.totalViews || 0).toLocaleString()} Kez
                                </span>
                                <span className="text-[10px] text-[#8b949e]">
                                  {range !== 'all' 
                                    ? `Dönem: ${item.totalViews} • Toplam: ${(item.lifetimeViews || 0).toLocaleString()}`
                                    : (item.uniqueVisitors > 0 ? `${item.uniqueVisitors} tekil ziyaretçi` : 'Tüm zamanlar')}
                                </span>
                              </div>
                            </td>

                            {/* WhatsApp Tıklama & CTR */}
                            <td className="py-3.5 px-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-black text-sm text-emerald-400 font-heading flex items-center gap-1">
                                  <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                                  {(item.whatsappClicks || 0).toLocaleString()} Tıklama
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-black text-[10px] w-fit font-mono">
                                    %{item.conversionRate} Dönüşüm
                                  </span>
                                  {range !== 'all' && (
                                    <span className="text-[9px] text-[#8b949e]">
                                      Toplam: {(item.lifetimeWhatsapp || 0).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Paylaşım */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1 text-slate-300 font-bold">
                                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{item.shares || 0}</span>
                              </div>
                            </td>

                            {/* Referrer Rozetleri */}
                            <td className="py-3.5 px-3">
                              <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
                                {item.referrers?.google > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold font-mono" title="Google aramalarından gelenler">
                                    🔍 Google: {item.referrers.google}
                                  </span>
                                )}
                                {item.referrers?.yandex > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono" title="Yandex aramalarından gelenler">
                                    🟡 Yandex: {item.referrers.yandex}
                                  </span>
                                )}
                                {item.referrers?.facebook > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono" title="Facebook'tan gelen ziyaretçiler">
                                    🟦 FB: {item.referrers.facebook}
                                  </span>
                                )}
                                {item.referrers?.x > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono" title="X / Twitter'dan gelenler">
                                    🐦 X: {item.referrers.x}
                                  </span>
                                )}
                                {item.referrers?.whatsapp > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono" title="WhatsApp bağlantılarından gelenler">
                                    🟢 WA: {item.referrers.whatsapp}
                                  </span>
                                )}
                                {item.referrers?.instagram > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-[10px] font-bold font-mono" title="Instagram'dan gelenler">
                                    📸 IG: {item.referrers.instagram}
                                  </span>
                                )}
                                {item.referrers?.direct > 0 && (
                                  <span className="px-2 py-0.5 rounded-lg bg-[#21262d] text-[#8b949e] border border-[#30363d] text-[10px] font-bold font-mono" title="Doğrudan veya yer imlerinden girenler">
                                    🔗 Doğrudan: {item.referrers.direct}
                                  </span>
                                )}
                                {totalReferralTraffic === 0 && (
                                  <span className="text-[10px] text-[#484f58] italic font-mono">
                                    Henüz referans trafiği yok
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Detay & Link */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedListingId(isExpanded ? null : item.id)}
                                  className={`p-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                                    isExpanded
                                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                                      : 'bg-[#21262d] text-[#8b949e] hover:text-white border-[#30363d]'
                                  }`}
                                  title="Trafik ve Referrer Linklerini Gör"
                                >
                                  <span>Referrer</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>

                                 <button
                                  type="button"
                                  onClick={() => setEditingListing(item)}
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs transition-colors flex items-center gap-1 shadow-md"
                                  title="İlanı Yönetici Olarak Düzenle"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Düzenle</span>
                                </button>

                                <Link
                                  href={`/ilan/${item.slug}`}
                                  target="_blank"
                                  className="p-2 rounded-xl bg-[#21262d] hover:bg-amber-500 text-[#8b949e] hover:text-slate-950 transition-colors"
                                  title="İlanı Sitede Aç"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </td>

                          </tr>

                          {/* Akordeon Çekmece: Gelen Tam Referrer Linkleri */}
                          {isExpanded && (
                            <tr className="bg-[#0d1117] border-b border-[#30363d]">
                              <td colSpan={6} className="p-4 sm:p-5">
                                <div className="p-4 rounded-2xl bg-[#161b22] border border-amber-500/30 flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                                      <Link2 className="w-4 h-4" />
                                      <span>"{item.baslik}" — Gerçek Referrer (Gelen Bağlantı) Günlüğü</span>
                                    </span>
                                    <span className="text-[11px] text-[#8b949e] font-mono">
                                      Son Ziyaret: {item.lastVisitedAt ? new Date(item.lastVisitedAt).toLocaleString('tr-TR') : 'Kayıtlı veri yok'}
                                    </span>
                                  </div>

                                  {item.rawReferrers && item.rawReferrers.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[11px] text-[#8b949e]">Bu ilana dışarıdan yönlendiren tam web adresleri (Referrer Headers):</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {item.rawReferrers.map((refUrl: string, refIdx: number) => (
                                          <div key={refIdx} className="p-2 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-2">
                                            <span className="font-mono text-[11px] text-amber-300 truncate max-w-[320px]">
                                              {refUrl}
                                            </span>
                                            <span className="text-[10px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 font-mono shrink-0">
                                              Kaynak
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-[#8b949e] italic">
                                      Bu ilan için henüz dış kaynaklı HTTP referer adresi kaydedilmedi (kullanıcılar doğrudan linke veya site içi aramadan girmiş).
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME 4: CANLI VE DETAYLI ZİYARETÇİ LOGLARI (SON 100 İSTEK) ─────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'live_visitors' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="font-black text-base text-white font-heading">
                  Canlı Ziyaretçi Akış Günlüğü
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {Math.min(filteredVisitors.length, visitorDisplayLimit)} / {filteredVisitors.length} İstek
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Gösterim Sınırı Seçici */}
              <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-xl p-0.5 text-xs font-mono">
                {[100, 500, 1000, 9999].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => setVisitorDisplayLimit(limit)}
                    className={`px-2.5 py-1 rounded-lg transition-all font-bold ${
                      visitorDisplayLimit === limit
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    {limit === 9999 ? '🔥 Hepsini Gör (Tümü)' : limit}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="IP, Şehir, Sayfa ara..."
                  value={searchTermFilter}
                  onChange={(e) => setSearchTermFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:border-amber-400 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* HIZLI GÜVENLİK FİLTRESİ (TÜMÜ VS ŞÜPHELİ / BOT / SALDIRI) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0d1117] border border-[#30363d]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlySuspiciousFilter(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !onlySuspiciousFilter
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-[#8b949e] hover:text-white bg-[#161b22]'
                }`}
              >
                <span>🔘 Tümü</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono font-bold">
                  {(recentVisitors as any[]).length}
                </span>
              </button>

              <button
                onClick={() => setOnlySuspiciousFilter(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  onlySuspiciousFilter
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/30 font-black animate-pulse'
                    : 'text-red-400 hover:text-red-300 bg-red-950/30 border border-red-500/40'
                }`}
              >
                <span>🚨 Sadece Şüpheli &amp; Bot / Saldırı</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-900/80 font-mono font-black">
                  {suspiciousTotalCount}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8b949e]">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                ✅ Google / Yandex Korumalı
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                ⚠️ Otomasyon / AWS / Proxy İşaretli
              </span>
            </div>
          </div>

          {/* MOBİL GÖRÜNÜM: Canlı Ziyaretçi Akış Kartları */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {filteredVisitors.slice(0, visitorDisplayLimit).map((v: any) => {
              const isGoogle = v.refererSource === 'google';
              const isWa = v.refererSource === 'whatsapp';
              const isFb = v.refererSource === 'facebook';
              const analysis = getSuspiciousAnalysis(v);

              return (
                <div key={v._id} className={`p-3.5 rounded-2xl bg-[#0d1117] border flex flex-col gap-2 transition-all ${
                  analysis.isSuspicious 
                    ? 'border-red-500/60 bg-red-950/15 shadow-sm shadow-red-900/20' 
                    : 'border-[#30363d]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-white">{v.ip || 'Anonim'}</span>
                      <span className="text-[10px] text-amber-400 font-medium">📍 {v.city || 'İstanbul'}</span>
                    </div>
                    <span className="text-[10px] text-[#8b949e] font-mono">
                      {new Date(v.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  {/* Şüpheli / Arama Motoru Rozeti */}
                  {analysis.isSuspicious && (
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/25 text-red-300 border border-red-500/50 animate-pulse">
                        🚨 ŞÜPHELİ / BOT
                      </span>
                      {analysis.reasons.map((r: string, idx: number) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-[#161b22] text-amber-300 border border-[#30363d] font-mono">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  {analysis.isSearchEngine && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ✅ Arama Motoru (Google/Yandex)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                      <span className="font-mono text-[11px] text-white truncate">{v.path}</span>
                      {v.isBanned && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-red-500/20 text-red-400 border border-red-500/40 shrink-0 animate-pulse">
                          🚫 ŞUTLANDI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {v.hostname && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
                          {v.hostname}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-heading ${
                        v.isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        isGoogle ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                        isWa ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        isFb ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {v.isBanned ? 'BANLI' : (v.refererSource?.toUpperCase() || 'DIRECT')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8b949e] pt-1.5 border-t border-[#21262d]">
                    <span>{v.device === 'mobile' ? '📱 Mobil' : '💻 Masaüstü'} ({v.browser})</span>
                    <span className="text-emerald-400 font-mono font-bold">{v.durationSeconds > 0 ? `${v.durationSeconds}s` : '<15s'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MASAÜSTÜ GÖRÜNÜM: Tam Tablo */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#30363d] text-[#8b949e] font-heading font-black">
                  <th className="py-2.5 px-3">IP / ŞEHİR</th>
                  <th className="py-2.5 px-3">GÜVENLİK / SPAM ANALİZİ</th>
                  <th className="py-2.5 px-3">GİRİLEN DOMAİN</th>
                  <th className="py-2.5 px-3">GEZİLEN SAYFA</th>
                  <th className="py-2.5 px-3">TRAFİK KAYNAĞI</th>
                  <th className="py-2.5 px-3">ARAMA KELİMESİ</th>
                  <th className="py-2.5 px-3">CİHAZ / TARAYICI</th>
                  <th className="py-2.5 px-3">SÜRE</th>
                  <th className="py-2.5 px-3">ZAMAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {filteredVisitors.slice(0, visitorDisplayLimit).map((v: any) => {
                  const isGoogle = v.refererSource === 'google';
                  const isWa = v.refererSource === 'whatsapp';
                  const analysis = getSuspiciousAnalysis(v);

                  return (
                    <tr key={v._id} className={`transition-colors ${
                      analysis.isSuspicious 
                        ? 'bg-red-950/30 hover:bg-red-950/40 border-l-4 border-red-500' 
                        : v.isBanned 
                        ? 'bg-red-950/20 hover:bg-red-950/30' 
                        : 'hover:bg-[#21262d]/50'
                    }`}>
                      
                      {/* IP & Şehir */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-white text-[11px]">{v.ip || 'Anonim'}</span>
                            {v.isBanned && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                                🚫 ŞUTLANDI
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-amber-400 font-medium">📍 {v.city || 'İstanbul'}</span>
                        </div>
                      </td>

                      {/* GÜVENLİK / SPAM ANALİZİ */}
                      <td className="py-3 px-3">
                        {analysis.isSuspicious ? (
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse w-fit">
                              🚨 ŞÜPHELİ / BOT
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {analysis.reasons.map((r: string, idx: number) => (
                                <span key={idx} className="text-[8px] px-1 py-0.2 rounded bg-black/40 text-amber-300 border border-red-500/30 font-mono font-medium">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : analysis.isSearchEngine ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            ✅ Arama Motoru
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8b949e] font-medium">
                            👤 Normal Ziyaretçi
                          </span>
                        )}
                      </td>

                      {/* Girilen Domain */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                          {v.hostname || 'Ana Merkez'}
                        </span>
                      </td>

                      {/* Gezilen Sayfa */}
                      <td className="py-3 px-3 font-mono text-white text-[11px] max-w-[160px] truncate">
                        {v.path}
                      </td>

                      {/* Trafik Kaynağı */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-heading ${
                          v.isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          isGoogle ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                          isWa ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {v.isBanned ? 'BANLI' : (v.refererSource?.toUpperCase() || 'DIRECT')}
                        </span>
                      </td>

                      {/* Arama Kelimesi */}
                      <td className="py-3 px-3 text-[11px]">
                        {v.searchKeyword ? (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                            "{v.searchKeyword}"
                          </span>
                        ) : (
                          <span className="text-[#484f58]">—</span>
                        )}
                      </td>

                      {/* Cihaz & Tarayıcı */}
                      <td className="py-3 px-3 text-[11px] text-[#8b949e]">
                        <span>{v.device === 'mobile' ? '📱 Mobil' : '💻 Masaüstü'}</span>
                        <span className="text-[10px] block text-[#484f58] truncate max-w-[140px]">{v.browser} / {v.os}</span>
                      </td>

                      {/* Sayfada Kalma Süresi */}
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold text-[11px]">
                        {v.durationSeconds > 0 ? `${v.durationSeconds}s` : '<15s'}
                      </td>

                      {/* Zaman */}
                      <td className="py-3 px-3 text-[10px] text-[#8b949e] font-mono whitespace-nowrap">
                        {new Date(v.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── YÖNETİCİ İLAN DÜZENLEME MODALI ──────────────── */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#161b22] border border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left animate-fadeIn my-auto">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading font-black text-base text-white">
                    İlanı Düzenle (Admin Yetkisi)
                  </h3>
                  <span className="text-xs text-[#8b949e] font-mono">
                    ID: {editingListing.id || editingListing._id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingListing(null)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminListingSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-black text-white">İlan Başlığı</label>
                <input
                  type="text"
                  value={editingListing.baslik || ''}
                  onChange={(e) => setEditingListing({ ...editingListing, baslik: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-black text-white">WhatsApp Numarası</label>
                <input
                  type="text"
                  value={editingListing.whatsappNumara || ''}
                  onChange={(e) => setEditingListing({ ...editingListing, whatsappNumara: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-black text-white">Vitrin Rozeti</label>
                  <select
                    value={editingListing.rozet || 'vip'}
                    onChange={(e) => setEditingListing({ ...editingListing, rozet: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                  >
                    <option value="ultravip">Ultra VIP 👑</option>
                    <option value="vip">VIP 💎</option>
                    <option value="gold">Gold 🥇</option>
                    <option value="silver">Silver 🥈</option>
                    <option value="standart">Standart</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-heading font-black text-white">Yayın Durumu</label>
                  <select
                    value={editingListing.status || 'yayinda'}
                    onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none"
                  >
                    <option value="yayinda">Yayında ✓</option>
                    <option value="onay_bekliyor">Onay Bekliyor ⏳</option>
                    <option value="reddedildi">Reddedildi ✕</option>
                    <option value="suresi_doldu">Süresi Doldu</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-black text-white">İlan Düzenleme Şifresi (Kullanıcı İçin)</label>
                <input
                  type="text"
                  value={editingListing.panelSifresi || ''}
                  onChange={(e) => setEditingListing({ ...editingListing, panelSifresi: e.target.value })}
                  placeholder="Örn: 849201"
                  className="w-full px-4 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-amber-300 font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-heading font-black text-white">İlan Açıklaması</label>
                <textarea
                  rows={4}
                  value={editingListing.aciklama || ''}
                  onChange={(e) => setEditingListing({ ...editingListing, aciklama: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingListingEdit}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-heading font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {savingListingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Değişiklikleri Kaydet</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
