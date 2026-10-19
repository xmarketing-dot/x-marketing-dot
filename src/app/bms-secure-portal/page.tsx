'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BarChart3, Smartphone, Monitor, Globe, Search, RefreshCw, Eye, MessageSquare, 
  Zap, ArrowUpRight, Loader2, Sparkles, MapPin, Activity, Calendar, Share2,
  Clock, ShieldCheck, Flame, ExternalLink, Filter, ChevronDown, ChevronUp,
  Link2, TrendingUp, TrendingDown, Minus, Crown, Tag, MousePointerClick, Layers,
  Target, Plus, Trash2, Award, CheckCircle2, Megaphone, Check, Edit3, X, Copy,
  PhoneCall, ArrowRight, SlidersHorizontal, Users, Key, Route
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { resolveTargetFromHost } from '@/lib/domainHelper';
import CircularProgress from '@/components/common/CircularProgress';
import { parsePhoneNumber, setClientAdminWhatsApp } from '@/lib/siteConfig';

export default function BmsSecurePortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today'); // today, yesterday, week, month, all
  const [searchTermFilter, setSearchTermFilter] = useState('');
  const [listingSearchTerm, setListingSearchTerm] = useState('');
  const [listingSortBy, setListingSortBy] = useState<'views' | 'whatsapp' | 'ctr' | 'shares' | 'facebook' | 'google' | 'yandex' | 'x'>('views');
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'whatsapp_leads' | 'seo_rankings' | 'listings' | 'live_visitors' | 'pwa_installs'>('overview');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [whatsappLeadSearchTerm, setWhatsappLeadSearchTerm] = useState('');
  const [expandedVisitorKey, setExpandedVisitorKey] = useState<string | null>(null);
  const [promoFilterType, setPromoFilterType] = useState<'all' | 'listing' | 'banner'>('all');
  const [promoStatusFilter, setPromoStatusFilter] = useState<'all' | 'onay_bekliyor' | 'yayinda' | 'suresi_doldu'>('all');

  // Online Users State
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineUsersModal, setShowOnlineUsersModal] = useState(false);
  const [showActiveVisitorsModal, setShowActiveVisitorsModal] = useState(false);

  // Mobile Drawers
  const [showPagesDrawer, setShowPagesDrawer] = useState(false);
  const [showWaDrawer, setShowWaDrawer] = useState(false);
  const [pageDrawerSearch, setPageDrawerSearch] = useState('');
  const [waDrawerSearch, setWaDrawerSearch] = useState('');

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
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; keyword: string } | null>(null);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [testDomainInput, setTestDomainInput] = useState('');
  const [visitorDisplayLimit, setVisitorDisplayLimit] = useState<number>(100);
  const [onlySuspiciousFilter, setOnlySuspiciousFilter] = useState<boolean>(false);
  const [boostingPing, setBoostingPing] = useState(false);
  const [boostPingResult, setBoostPingResult] = useState<any | null>(null);
  const [gscUrls, setGscUrls] = useState<string[]>([]);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscCopied, setGscCopied] = useState(false);
  const [gscCityCopied, setGscCityCopied] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [serperApiKeyInput, setSerperApiKeyInput] = useState('');
  const [apiKeySaveMsg, setApiKeySaveMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('bms_serper_api_key');
      if (savedKey) setSerperApiKeyInput(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bms_serper_api_key', serperApiKeyInput.trim());
      setApiKeySaveMsg('✅ API Anahtarı Kaydedildi!');
      setTimeout(() => setApiKeySaveMsg(''), 3000);
    }
  };


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

  const handleUpdateListingStatus = async (listingId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/listings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
      } else {
        alert(data.error || 'İşlem başarısız');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Bu ilanı tamamen silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
      } else {
        alert(data.error || 'Silme başarısız');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    }
  };

  // SSE Real-time Lead & Chat Sync
  useEffect(() => {
    fetchKeywords();
    fetchBanners();
    fetchOnlineUsers();
    
    // Poll online users every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch('/api/admin/users-online');
      const json = await res.json();
      if (json.success) {
        setOnlineUsers(json.users || []);
      }
    } catch (e) {}
  };

  const fetchBanners = async () => {
    setBannerLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const json = await res.json();
      if (json.success && json.banners) {
        setBannerList(json.banners);
      }
    } catch (e) {
      // Silent
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
      // Silent
    } finally {
      setKeywordLoading(false);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;

    setKeywordLoading(true);
    const activeKey = serperApiKeyInput.trim() || (typeof window !== 'undefined' ? localStorage.getItem('bms_serper_api_key') || '' : '');
    try {
      const res = await fetch('/api/admin/seo/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeywordInput.trim(), serperApiKey: activeKey }),
      });
      const json = await res.json();
      if (json.success) {
        setNewKeywordInput('');
        fetchKeywords();
      } else {
        alert(json.error || 'Kelime eklenemedi');
      }
    } catch (e) {
      // Silent
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
      // Silent
    }
  };

  const handleScanRankings = async (id?: string) => {
    setScanningRankings(true);
    const activeKey = serperApiKeyInput.trim() || (typeof window !== 'undefined' ? localStorage.getItem('bms_serper_api_key') || '' : '');
    try {
      if (id) {
        // Tek bir kelimeyi tara
        const res = await fetch('/api/admin/seo/rank-check', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, serperApiKey: activeKey }),
        });
        const json = await res.json();
        if (json.keywords) {
          setKeywordList(json.keywords);
        }
      } else {
        // Akıllı Sıralı Kuyruk Sistemi: Kelimeleri 1'er 1'er insansı gecikmeyle tara
        const total = keywordList.length;
        const targetQueue = keywordList.map(k => ({ _id: k._id, keyword: k.keyword }));

        for (let i = 0; i < total; i++) {
          const target = targetQueue[i];
          setScanProgress({ current: i + 1, total, keyword: target.keyword });
          try {
            const res = await fetch('/api/admin/seo/rank-check', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: target._id, serperApiKey: activeKey }),
            });
            const json = await res.json();
            if (json.keywords) {
              setKeywordList(json.keywords);
            }
          } catch (e) { }

          // İnsansı rastgele bekleme (1.2 - 1.8 sn jitter)
          if (i < total - 1) {
            await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
          }
        }
      }
    } catch (e) {
      // Silent
    } finally {
      setScanningRankings(false);
      setScanProgress(null);
    }
  };

  const handleBoostAndPing = async () => {
    setBoostingPing(true);
    setBoostPingResult(null);
    try {
      const res = await fetch('/api/admin/seo/boost-and-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boostLikes: true, triggerPing: true }),
      });
      const data = await res.json();
      if (data.success) {
        setBoostPingResult(data);
      } else {
        alert(data.error || 'SEO motoru çalıştırılamadı');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setBoostingPing(false);
    }
  };

  const handleFetchGscUrls = async () => {
    setGscLoading(true);
    setGscCopied(false);
    try {
      const res = await fetch('/api/admin/seo/gsc-urls');
      const data = await res.json();
      if (data.success && data.urls) {
        setGscUrls(data.urls);
        const text = data.urls.join('\n');
        await navigator.clipboard.writeText(text);
        setGscCopied(true);
        setTimeout(() => setGscCopied(false), 4000);
      } else {
        alert(data.error || 'URL listesi alınamadı');
      }
    } catch (e: any) {
      alert('Hata: ' + e.message);
    } finally {
      setGscLoading(false);
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
      // Silent
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-5 w-full max-w-full text-left font-sans animate-pulse">
        {/* Top Command Bar Skeleton */}
        <div className="bg-[#0c1017] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/40 shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-44 rounded-md bg-slate-800/80" />
              <div className="h-3 w-64 rounded bg-slate-800/50" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded-xl bg-slate-800/60" />
            <div className="h-9 w-28 rounded-xl bg-slate-800/60" />
          </div>
        </div>

        {/* Tab Pills Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 no-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 w-28 rounded-xl bg-slate-800/50 shrink-0" />
          ))}
        </div>

        {/* Mobil 2x2 KPI Skeleton */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-xl bg-[#0e131f] border border-slate-800/80 flex flex-col items-center gap-1.5 text-center">
              <div className="w-6 h-6 rounded-md bg-slate-800/70" />
              <div className="h-5 w-16 rounded bg-slate-800/80 mt-1" />
              <div className="h-2.5 w-20 rounded bg-slate-800/50" />
            </div>
          ))}
        </div>

        {/* Masaüstü 4'lü KPI Strip Skeleton */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0e131f] border border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-slate-800/70" />
                <div className="w-5 h-5 rounded-md bg-slate-800/60" />
              </div>
              <div className="h-7 w-20 rounded bg-slate-800/90 mt-1" />
              <div className="h-3 w-32 rounded bg-slate-800/40" />
            </div>
          ))}
        </div>

        {/* Büyük İçerik Kartı Skeleton */}
        <div className="p-5 rounded-2xl bg-[#0c1017] border border-slate-800/80 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/70 pb-3">
            <div className="h-4 w-48 rounded bg-slate-800/80" />
            <div className="h-3 w-24 rounded bg-slate-800/50" />
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-slate-800/40" />
            ))}
          </div>
        </div>
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
    recentWhatsappClicks = [],
    recentPwaInstalls = [],
    pwaInstalls = 0,
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
      ua.includes('facebookexternalhit') ||
      ua.includes('meta-externalagent') ||
      ua.includes('meta-') ||
      ua.includes('facebook') ||
      ua.includes('instagram') ||
      ua.includes('twitterbot') ||
      ua.includes('xbot');

    if (isSearchEngine) {
      return { isSuspicious: false, isSearchEngine: true, badge: '✅ Arama Motoru / Sosyal Bot', reasons: [] };
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

    const isHighRisk = reasons.some((reason) =>
      reason.includes('Otomasyon') ||
      reason.includes('Saldırı') ||
      reason.includes('Tarama')
    );

    return {
      isSuspicious: reasons.length > 0 && isHighRisk,
      isSearchEngine: false,
      badge: reasons.length > 0 && isHighRisk ? '🚨 BOT / ATTACK' : null,
      reasons,
    };
  };

  const renderTrafficSourceBadge = (v: any) => {
    const src = (v.refererSource || 'direct').toLowerCase();
    const rawRef = v.referer || '';
    const isDirect = !rawRef || rawRef.toLowerCase() === 'direct' || src === 'direct';

    let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
    let label = src.toUpperCase();
    let icon = '🔗';

    if (src === 'google') {
      badgeStyle = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      icon = '🔍';
      label = 'Google';
    } else if (src === 'yandex') {
      badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40';
      icon = '🟡';
      label = 'Yandex';
    } else if (src === 'duckduckgo' || src === 'ddg') {
      badgeStyle = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      icon = '🦆';
      label = 'DuckDuckGo';
    } else if (src === 'bing') {
      badgeStyle = 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      icon = '🔵';
      label = 'Bing';
    } else if (src === 'yahoo') {
      badgeStyle = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      icon = '🟣';
      label = 'Yahoo';
    } else if (src === 'brave') {
      badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      icon = '🦁';
      label = 'Brave';
    } else if (src === 'whatsapp') {
      badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      icon = '🟢';
      label = 'WhatsApp';
    } else if (src === 'telegram') {
      badgeStyle = 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      icon = '💬';
      label = 'Telegram';
    } else if (src === 'tiktok') {
      badgeStyle = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      icon = '🎵';
      label = 'TikTok';
    } else if (src === 'instagram') {
      badgeStyle = 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40';
      icon = '📸';
      label = 'Instagram';
    } else if (src === 'x' || src === 'twitter') {
      badgeStyle = 'bg-slate-700 text-white border-white/20';
      icon = '🐦';
      label = 'X / Twitter';
    } else if (src === 'facebook') {
      badgeStyle = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      icon = '🟦';
      label = 'Facebook';
    } else if (src === 'reddit') {
      badgeStyle = 'bg-orange-600/20 text-orange-400 border-orange-600/40';
      icon = '🤖';
      label = 'Reddit';
    } else if (src === 'youtube') {
      badgeStyle = 'bg-red-600/20 text-red-400 border-red-600/40';
      icon = '▶️';
      label = 'YouTube';
    } else if (!isDirect) {
      badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      icon = '🌐';
      label = src;
    } else {
      badgeStyle = 'bg-slate-800/80 text-slate-400 border-white/5';
      icon = '🔗';
      label = 'Direkt Giriş';
    }

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black font-heading border ${badgeStyle}`}>
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        {!isDirect && rawRef.startsWith('http') && (
          <a
            href={rawRef}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5 truncate max-w-[130px] font-mono hover:underline"
            title={rawRef}
          >
            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{rawRef.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </a>
        )}
      </div>
    );
  };

  const renderDomainBadge = (rawHost?: string) => {
    const host = (rawHost || '').toLowerCase();
    if (host.includes('escturkiye') || host.includes('turkiyeescort')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-fuchsia-500/15 border border-fuchsia-500/40 text-fuchsia-300 font-mono font-bold text-[10px] shadow-sm shadow-fuchsia-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
          <span>🚀 escturkiye.space</span>
        </span>
      );
    }
    if (host.includes('besteskort') || !host || host === 'ana domain' || host === 'ana merkez') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px] shadow-sm shadow-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>🌟 besteskort.online</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px]">
        🌐 {host}
      </span>
    );
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
      (v.hostname || '').toLowerCase().includes(term) ||
      (v.searchKeyword || '').toLowerCase().includes(term)
    );
  });

  const groupedVisitors = useMemo(() => {
    const map = new Map<string, { latest: any; totalActions: number; history: any[]; pages: Set<string> }>();
    (filteredVisitors || []).forEach((v: any) => {
      const key = v.visitorId || v.ip || v._id || 'anon';
      const existing = map.get(key);
      if (!existing) {
        const pagesSet = new Set<string>();
        if (v.path) pagesSet.add(v.path);
        map.set(key, { latest: v, totalActions: 1, history: [v], pages: pagesSet });
      } else {
        existing.totalActions += 1;
        existing.history.push(v);
        if (v.path) existing.pages.add(v.path);
        if (new Date(v.createdAt).getTime() > new Date(existing.latest.createdAt).getTime()) {
          existing.latest = v;
        }
      }
    });

    return Array.from(map.values()).map(g => ({
      ...g.latest,
      sessionKey: g.latest.visitorId || g.latest.ip || g.latest._id,
      totalActions: g.totalActions,
      distinctPagesCount: g.pages.size,
      history: [...g.history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredVisitors]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-full text-left font-sans text-slate-200 relative">
      {/* Sleek Top Nano-Progress Bar when refetching */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 z-50 animate-pulse shadow-sm shadow-emerald-500/50" />
      )}
      
      {/* ── 1. UNIFIED EXECUTIVE COMMAND BAR ──────────────────────────────── */}
      <div className="bg-[#0c1017] border border-slate-800/80 rounded-2xl p-3 sm:p-5 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4">
        {/* Sol: Başlık + Canlı Ziyaretçi & Müşteri Durumu */}
        <div className="flex items-center justify-between xl:justify-start gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                  Trafik &amp; İstihbarat Portalı
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Canlı
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <button 
                  onClick={() => setShowActiveVisitorsModal(true)} 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                  title="Canlı gezinmeleri incele"
                >
                  <span className="font-semibold text-white">{activeUsers}</span> Ziyaretçi Aktif
                </button>
                <span className="text-slate-600">•</span>
                <button 
                  onClick={() => setShowOnlineUsersModal(true)}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                  title="Sistemde oturum açmış müşteriler"
                >
                  <span className="font-semibold text-white">{onlineUsers.length}</span> Müşteri Online
                </button>
              </div>
            </div>
          </div>

          {/* Mobilde Hızlı Yenile İkonu */}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 rounded-xl bg-[#06090e] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors xl:hidden shrink-0"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Sağ: Alan Adı Seçici + Tarih Seçici + Hızlı Araçlar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-0.5 xl:pb-0">
          {/* Domain Segmented Control */}
          <div className="flex items-center bg-[#06090e] p-0.5 sm:p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs shrink-0">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-all ${
                selectedDomain === 'all'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tüm Siteler
            </button>
            <button
              onClick={() => setSelectedDomain('besteskort.online')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-all ${
                selectedDomain === 'besteskort.online'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              besteskort.online
            </button>
            <button
              onClick={() => setSelectedDomain('escturkiye.space')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium transition-all ${
                selectedDomain === 'escturkiye.space'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              escturkiye.space
            </button>
          </div>

          {/* Tarih Filtresi */}
          <div className="flex items-center bg-[#06090e] p-0.5 sm:p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs shrink-0">
            {[
              { id: 'today', label: 'Bugün' },
              { id: 'yesterday', label: 'Dün' },
              { id: 'week', label: '7G' },
              { id: 'month', label: '30G' },
              { id: 'all', label: 'Tümü' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg font-medium transition-all ${
                  range === r.id
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Derin Analiz Linki */}
          <Link
            href="/bms-secure-portal/derin-analiz"
            title="Derin Ağ Analizi"
            className="p-1.5 sm:p-2 rounded-xl bg-[#06090e] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </Link>

          {/* Masaüstü Yenile Butonu */}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="hidden xl:flex p-2 rounded-xl bg-[#06090e] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 2. SEGMENTED TAB NAVIGATION ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 no-scrollbar">
        {[
          { id: 'overview', icon: BarChart3, label: 'Genel Bakış', count: null },
          { id: 'whatsapp_leads', icon: MessageSquare, label: 'WhatsApp Randevu', count: eventCounts.whatsappClicks || null },
          { id: 'live_visitors', icon: Activity, label: 'Canlı Radar & Güvenlik', count: groupedVisitors.length || recentVisitors.length },
          { id: 'listings', icon: Crown, label: 'İlan Performansı', count: filteredListings.length },
          { id: 'seo_rankings', icon: Search, label: 'SEO & Sıralama', count: keywordList.length > 0 ? keywordList.length : null },
          { id: 'pwa_installs', icon: Smartphone, label: 'PWA Kurulum', count: pwaInstalls || null },
        ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-semibold ${
                    isActive ? 'bg-slate-900 text-emerald-400' : 'bg-slate-800/70 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME 1: GENEL BAKIŞ & TRAFİK MERKEZİ ────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-5 animate-fadeIn">

          {/* ── 4'LÜ HERO KPI KARTLARI (MOBİLDE NATIVE COMPACT 2x2 / MASAÜSTÜNDE 4'LÜ STRIP) ──── */}
          
          {/* 1. MOBİL ÖZEL: Native 2x2 Kompakt ve Ortalanmış Kartlar (Revolut / Apple Health Havası) */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {/* Mobil Kart 1: Tekil Ziyaret */}
            <div className="p-2.5 rounded-xl bg-[#0e131f] border border-slate-800/80 flex flex-col items-center justify-center text-center gap-0.5 shadow-sm">
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-bold font-mono text-white tracking-tight leading-tight mt-0.5">
                {uniqueVisitors.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-tight">Tekil Ziyaret</span>
              <span className="text-[9px] text-slate-500 font-mono truncate max-w-full">
                {totalPageviews.toLocaleString()} Hit • {uniqueVisitors > 0 ? (totalPageviews / uniqueVisitors).toFixed(1) : '1.0'} s/k
              </span>
            </div>

            {/* Mobil Kart 2: WhatsApp Randevu */}
            <div 
              onClick={() => setActiveTab('whatsapp_leads')}
              className="p-2.5 rounded-xl bg-[#0e131f] border border-slate-800/80 flex flex-col items-center justify-center text-center gap-0.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
              </div>
              <span className="text-xl font-bold font-mono text-emerald-400 tracking-tight leading-tight mt-0.5">
                {eventCounts.whatsappClicks.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-tight">WhatsApp Hit</span>
              <span className="text-[9px] text-emerald-400/80 font-mono truncate max-w-full">
                %CTR: {uniqueVisitors > 0 ? ((eventCounts.whatsappClicks / uniqueVisitors) * 100).toFixed(1) : '0.0'} →
              </span>
            </div>

            {/* Mobil Kart 3: Organik Arama */}
            <div className="p-2.5 rounded-xl bg-[#0e131f] border border-slate-800/80 flex flex-col items-center justify-center text-center gap-0.5 shadow-sm">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-bold font-mono text-white tracking-tight leading-tight mt-0.5">
                {((sources.yandex || 0) + (sources.google || 0)).toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-tight">Organik Arama</span>
              <span className="text-[9px] text-slate-500 font-mono truncate max-w-full">
                {sources.yandex || 0} Yandex • {sources.google || 0} Google
              </span>
            </div>

            {/* Mobil Kart 4: Mobil Cihaz & PWA */}
            <div 
              onClick={() => setActiveTab('pwa_installs')}
              className="p-2.5 rounded-xl bg-[#0e131f] border border-slate-800/80 flex flex-col items-center justify-center text-center gap-0.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-bold font-mono text-white tracking-tight leading-tight mt-0.5">
                %{mobilePercentage}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-tight">Mobil Cihaz</span>
              <span className="text-[9px] text-slate-500 font-mono truncate max-w-full">
                {mobileCount.toLocaleString()} Hit • {pwaInstalls || recentPwaInstalls?.length || 0} PWA
              </span>
            </div>
          </div>

          {/* 2. MASAÜSTÜ ÖZEL: Geniş 4'lü Executive Hero Strip */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Tekil Ziyaret & Sayfa Hit */}
            <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-md hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tekil Ziyaret</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">{uniqueVisitors.toLocaleString()}</span>
                <span className="text-xs text-slate-400">kişi</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span>{totalPageviews.toLocaleString()} Sayfa Hit</span>
                <span className="font-mono text-emerald-400">Ort. {uniqueVisitors > 0 ? (totalPageviews / uniqueVisitors).toFixed(1) : '1.0'} s/k</span>
              </div>
            </div>

            {/* 2. WhatsApp & Randevu Dönüşümü */}
            <div 
              onClick={() => setActiveTab('whatsapp_leads')}
              className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-md hover:border-emerald-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">WhatsApp Randevu</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-emerald-400" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tracking-tight">{eventCounts.whatsappClicks.toLocaleString()}</span>
                <span className="text-xs text-emerald-400/80 font-medium">dönüşüm</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span>CTR: %{uniqueVisitors > 0 ? ((eventCounts.whatsappClicks / uniqueVisitors) * 100).toFixed(1) : '0.0'}</span>
                <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Randevular →
                </span>
              </div>
            </div>

            {/* 3. Organik Arama Trafiği (SEO) */}
            <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-md hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Organik Arama (SEO)</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">{((sources.yandex || 0) + (sources.google || 0)).toLocaleString()}</span>
                <span className="text-xs text-slate-400">arama hiti</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span className="text-red-400 font-mono">{sources.yandex || 0} Yandex</span>
                <span className="text-blue-400 font-mono">{sources.google || 0} Google</span>
              </div>
            </div>

            {/* 4. Mobil Cihaz & PWA */}
            <div 
              onClick={() => setActiveTab('pwa_installs')}
              className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-md hover:border-slate-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">Mobil &amp; Uygulama</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">%{mobilePercentage}</span>
                <span className="text-xs text-purple-400">mobil payı</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <span>{mobileCount.toLocaleString()} Mobil Hit</span>
                <span className="text-emerald-400 font-mono font-medium">{pwaInstalls || recentPwaInstalls?.length || 0} PWA Cihaz</span>
              </div>
            </div>
          </div>

          {/* ── 2 KOLONLU DENGELİ ANALİZ GÖVDESİ ───────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* ── SOL KOLON: TRAFİK KANALLARI & ALAN ADI DAĞILIMI ────────── */}
            <div className="flex flex-col gap-5">
              
              {/* Trafik Kaynakları (GA4 / Plausible Tarzı Temiz Liste) */}
              {(() => {
                const totalSourceSum = (sources.yandex || 0) + (sources.direct || 0) + (sources.google || 0) + (sources.x || 0) + (sources.whatsapp || 0) + (sources.instagram || 0) + (sources.telegram || 0) + (sources.facebook || 0);
                const baseCount = totalSourceSum > 0 ? totalSourceSum : (totalPageviews > 0 ? totalPageviews : 1);

                const sourceList = [
                  { id: 'yandex', name: 'Yandex Arama', icon: '🇷🇺', count: sources.yandex || 0, pct: Math.round(((sources.yandex || 0) / baseCount) * 100), barColor: 'bg-red-500' },
                  { id: 'direct', name: 'Direkt Giriş (Doğrudan)', icon: '🔗', count: sources.direct || 0, pct: Math.round(((sources.direct || 0) / baseCount) * 100), barColor: 'bg-emerald-500' },
                  { id: 'google', name: 'Google Arama', icon: '🌐', count: sources.google || 0, pct: Math.round(((sources.google || 0) / baseCount) * 100), barColor: 'bg-blue-500' },
                  { id: 'x', name: 'X (Twitter)', icon: '🐦', count: sources.x || 0, pct: Math.round(((sources.x || 0) / baseCount) * 100), barColor: 'bg-sky-500' },
                  { id: 'whatsapp', name: 'WhatsApp Yönlendirme', icon: '💬', count: sources.whatsapp || 0, pct: Math.round(((sources.whatsapp || 0) / baseCount) * 100), barColor: 'bg-emerald-400' },
                  { id: 'instagram', name: 'Instagram', icon: '📸', count: sources.instagram || 0, pct: Math.round(((sources.instagram || 0) / baseCount) * 100), barColor: 'bg-pink-500' },
                  { id: 'telegram', name: 'Telegram', icon: '✈️', count: sources.telegram || 0, pct: Math.round(((sources.telegram || 0) / baseCount) * 100), barColor: 'bg-cyan-500' },
                  { id: 'facebook', name: 'Facebook', icon: '👥', count: sources.facebook || 0, pct: Math.round(((sources.facebook || 0) / baseCount) * 100), barColor: 'bg-indigo-500' },
                ];

                return (
                  <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white">Trafik Kanalları &amp; Kaynaklar</h2>
                        <p className="text-[11px] text-slate-400">Kullanıcıların siteye giriş yaptığı ana mecralar</p>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        {totalSourceSum.toLocaleString()} Toplam Hit
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {sourceList.map((s) => (
                        <div key={s.id} className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-2">
                              <span>{s.icon}</span>
                              <span className="font-medium">{s.name}</span>
                            </span>
                            <div className="flex items-center gap-2.5 font-mono">
                              <span className="text-slate-400">{s.count.toLocaleString()}</span>
                              <span className="text-white font-semibold w-8 text-right">%{s.pct}</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${s.barColor} transition-all duration-500`}
                              style={{ width: `${Math.min(s.pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Gateway & Alan Adı Dağılımı Tablosu */}
              <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Gateway &amp; Alan Adı Dağılımı</h2>
                    <p className="text-[11px] text-slate-400">Çoklu domain ağının trafik ve dönüşüm performansı</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-medium">
                    {domainBreakdown.length} Aktif Alan Adı
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 uppercase font-semibold">
                        <th className="pb-2">Alan Adı</th>
                        <th className="pb-2 text-right">Tekil</th>
                        <th className="pb-2 text-right">Hit</th>
                        <th className="pb-2 text-right">WhatsApp</th>
                        <th className="pb-2 text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {domainBreakdown.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500 text-xs">
                            Kayıtlı domain verisi bekleniyor.
                          </td>
                        </tr>
                      ) : (
                        domainBreakdown.map((item: any) => {
                          const targetLoc = resolveTargetFromHost(item.domain);
                          const isMainPortal = !targetLoc;

                          return (
                            <tr key={item.domain} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 pr-2">
                                <span className="font-mono text-xs text-white font-medium block truncate max-w-[180px]">
                                  {item.domain}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  {isMainPortal ? 'Ana Merkez Vitrin' : `${targetLoc.ilSlug?.toUpperCase() || ''}`}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-300">
                                {item.uniqueVisitors.toLocaleString()}
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-400">
                                {item.totalPageviews.toLocaleString()}
                              </td>
                              <td className="py-2.5 text-right font-mono text-emerald-400 font-semibold">
                                {item.whatsappClicks}
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-300">
                                {item.conversionRate}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* ── SAĞ KOLON: POPÜLER SAYFALAR, ŞEHİRLER & VİTRİN ─────────── */}
            <div className="flex flex-col gap-5">
              
              {/* En Çok Ziyaret Edilen Sayfalar */}
              <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-white">En Çok Ziyaret Edilen Sayfalar</h2>
                      <p className="text-[11px] text-slate-400">Sayfa bazında tekil hit ve ortalama kalma süresi</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {popularPages.length} Sayfa
                    </span>
                  </div>

                  {/* Mobil Önizleme */}
                  <div className="flex flex-col gap-2 lg:hidden">
                    {popularPages.slice(0, 3).map((p: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-slate-200 font-medium truncate max-w-[200px]">{p._id}</span>
                          <span className="text-[10px] text-slate-500 truncate">{p.pageTitle || 'Sayfa'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono text-xs">{p.count} Hit</span>
                      </div>
                    ))}
                  </div>

                  {/* Masaüstü Tablo */}
                  <div className="hidden lg:block max-h-[280px] overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-[11px] text-slate-400 uppercase font-semibold">
                          <th className="pb-2">Sayfa</th>
                          <th className="pb-2 text-right">Hit</th>
                          <th className="pb-2 text-right">Süre</th>
                          <th className="pb-2 text-right">Aç</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {popularPages.slice(0, 10).map((p: any, idx: number) => {
                          const avgSec = Math.round(p.avgDuration || 0);
                          return (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-2 pr-2">
                                <span className="font-mono text-slate-300 font-medium block truncate max-w-[220px]">
                                  {p._id}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate max-w-[220px]">
                                  {p.pageTitle || 'Sayfa'}
                                </span>
                              </td>
                              <td className="py-2 text-right font-mono text-white font-semibold">
                                {p.count.toLocaleString()}
                              </td>
                              <td className="py-2 text-right font-mono text-emerald-400">
                                {avgSec}s
                              </td>
                              <td className="py-2 text-right">
                                <Link 
                                  href={p._id || '#'} 
                                  target="_blank"
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white inline-flex transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={() => setShowPagesDrawer(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700/60 lg:hidden"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tüm Sayfaları İncele ({popularPages.length}) →</span>
                </button>
              </div>

              {/* Ziyaretçi Şehir Dağılımı */}
              <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Ziyaretçi Şehir Dağılımı</h2>
                    <p className="text-[11px] text-slate-400">Coğrafi konuma göre kullanıcı yoğunluğu</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Top {topCities.length} Şehir
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {topCities.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">Şehir verisi kaydedilmedi.</div>
                  ) : (
                    (() => {
                      const maxCityCount = Math.max(...topCities.map((c: any) => c.count || 1), 1);
                      return topCities.slice(0, 7).map((c: any, idx: number) => {
                        const percent = Math.min(100, Math.round((c.count / maxCityCount) * 100));
                        return (
                          <div key={idx} className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="font-medium flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                                <span>{c._id}</span>
                              </span>
                              <span className="font-mono text-white font-semibold">{c.count.toLocaleString()} ziyaret</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              {/* Özel Vitrin Popup & Banner Özeti */}
              <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Özel Vitrin Popup &amp; Banner</h2>
                    <p className="text-[11px] text-slate-400">Öne çıkan vitrin ve popup reklam dönüşümleri</p>
                  </div>
                  <span className="text-xs font-mono font-medium text-emerald-400">
                    Dönüşüm: %{specialAdStats?.ctr || '0.0'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-400">Gösterim</span>
                    <span className="font-mono font-bold text-base text-white">{specialAdStats?.impressions || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-400">Tekil Kişi</span>
                    <span className="font-mono font-bold text-base text-slate-200">{specialAdStats?.uniqueVisitors || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-400">Tıklama</span>
                    <span className="font-mono font-bold text-base text-cyan-400">{specialAdStats?.clicks || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-400">WhatsApp Tık</span>
                    <span className="font-mono font-bold text-base text-emerald-400">{specialAdStats?.whatsappClicks || 0}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ── EN ÇOK WHATSAPP ETKİLEŞİMİ ALAN İLANLAR ───────────────────── */}
          <div className="bg-[#0e131f] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white">En Çok WhatsApp Etkileşimi Alan İlanlar</h2>
                <p className="text-[11px] text-slate-400">Kullanıcıların en fazla iletişim başlattığı popüler profiller</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {topContactedListings.length} İlan Kayıtlı
              </span>
            </div>

            {/* Masaüstü 4 Kolonlu Kartlar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topContactedListings.slice(0, 8).map((item: any, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setListingSearchTerm(item._id);
                    setActiveTab('listings');
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1 shrink-0">
                      <OfficialWhatsAppIcon className="w-3 h-3 fill-emerald-400" />
                      {item.whatsappClicks || 0} Tık
                    </span>
                  </div>

                  <span className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                    {item._id || 'İsimsiz İlan'}
                  </span>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Share2 className="w-3 h-3" /> {item.shares || 0} Paylaşım
                    </span>
                    <span className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                      <span>Rapor</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobilde Drawer Butonu */}
            <button
              onClick={() => setShowWaDrawer(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700/60 lg:hidden"
            >
              <OfficialWhatsAppIcon className="w-4 h-4 fill-emerald-400" />
              <span>Tüm WhatsApp &amp; İlan Etkileşim Raporunu Aç ({topContactedListings.length}) →</span>
            </button>
          </div>

        </div>
      )}


      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME: CANLI WHATSAPP RANDEVU & İLETİŞİM İSTİHBARATI (LEAD CENTER) ─ */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'whatsapp_leads' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* ── EXECUTIVE LEAD COMMAND CENTER BANNER & METRICS ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <OfficialWhatsAppIcon className="w-5 h-5 fill-emerald-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                      WhatsApp Randevu &amp; Lead İstihbarat Merkezi
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Canlı SSE Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                    İlanların WhatsApp butonuna basan ziyaretçilerin konumu, arama terimi, cihazı ve hedef ilanı anlık işlenir.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">Toplam Lead:</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {(recentWhatsappClicks as any[] || []).length} Tık
                  </span>
                </div>
              </div>
            </div>

            {/* 1. MOBİL: NATIVE APP 2x2 ORTALANMIŞ GRID (sm:hidden) */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Randevu Hit</span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{eventCounts.whatsappClicks}</span>
                <span className="text-[9px] text-slate-500 font-mono">Dönüşüm</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center min-w-0">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lider İlan</span>
                <span className="text-xs font-bold text-amber-300 truncate max-w-full mt-0.5">
                  {topContactedListings[0]?._id || 'Kayıt Yok'}
                </span>
                <span className="text-[9px] text-amber-400/80 font-mono">
                  {topContactedListings[0]?.whatsappClicks || 0} Randevu
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lider Şehir</span>
                <span className="text-xs font-bold text-blue-400 truncate max-w-full mt-0.5">
                  {topCities[0]?._id ? `📍 ${topCities[0]._id}` : 'Türkiye'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">En Yoğun Konum</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dönüşüm (CTR)</span>
                <span className="text-lg font-bold font-mono text-purple-300 mt-0.5">
                  %{uniqueVisitors > 0 ? ((eventCounts.whatsappClicks / uniqueVisitors) * 100).toFixed(1) : '0.0'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Ziyaretçi Başına</span>
              </div>
            </div>

            {/* 2. MASAÜSTÜ: 4 SÜTUNLU KURUMSAL KARTLAR (hidden sm:grid) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col justify-between gap-2 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Toplam Randevu Hit</span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold font-mono text-2xl text-white">{eventCounts.whatsappClicks}</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Dönüşüm</span>
                </div>
                <span className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                  Seçili dönemde doğrudan WhatsApp&apos;a basanlar
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col justify-between gap-2 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">En Çok Talep Alan İlan</span>
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-amber-300 truncate">
                    {topContactedListings[0]?._id || 'Kayıt Bekleniyor'}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-400 font-mono mt-0.5">
                    {topContactedListings[0]?.whatsappClicks || 0} Randevu Tıklaması
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                  Vitrin lideri dönüşüm şampiyonu
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col justify-between gap-2 hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Lider Şehir</span>
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-base text-blue-400">
                    {topCities[0]?._id ? `📍 ${topCities[0]._id}` : 'Türkiye'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                  En yüksek müşteri yoğunluğu
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col justify-between gap-2 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Lead Dönüşüm (CTR)</span>
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold font-mono text-2xl text-purple-300">
                    %{uniqueVisitors > 0 ? ((eventCounts.whatsappClicks / uniqueVisitors) * 100).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[11px] text-purple-400 font-medium">Ziyaretçi Başına</span>
                </div>
                <span className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                  Organik ziyaretçi randevu verimliliği
                </span>
              </div>
            </div>

            {/* Arama, Filtreleme ve Tablo Araç Çubuğu */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1 border-t border-slate-800/70">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="İlan, telefon, şehir, IP, kelime ara..."
                  value={whatsappLeadSearchTerm}
                  onChange={(e) => setWhatsappLeadSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                {whatsappLeadSearchTerm && (
                  <button
                    onClick={() => setWhatsappLeadSearchTerm('')}
                    className="absolute right-2.5 top-2 text-[11px] text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-[11px] text-slate-500 font-mono">
                <span>Otomatik SSE Canlı Eşzamanlama</span>
              </div>
            </div>
          </div>

          {/* ── ENTERPRISE VERİ TABLOSU (MASAÜSTÜNDE GENİŞ KURUMSAL TABLO, MOBİLDE KART) ── */}
          {(() => {
            const leads = (recentWhatsappClicks as any[] || []).filter((item: any) => {
              if (!whatsappLeadSearchTerm) return true;
              const term = whatsappLeadSearchTerm.toLowerCase();
              const m = item.metadata || {};
              return (
                (item.targetTitle || '').toLowerCase().includes(term) ||
                (item.targetCity || '').toLowerCase().includes(term) ||
                (m.city || '').toLowerCase().includes(term) ||
                (m.listingPhone || '').includes(term) ||
                (m.searchKeyword || '').toLowerCase().includes(term) ||
                (item.ip || '').includes(term) ||
                (item.path || '').toLowerCase().includes(term)
              );
            });

            if (leads.length === 0) {
              return (
                <div className="p-16 rounded-[32px] bg-[#161b22] border border-[#30363d] text-center flex flex-col items-center justify-center gap-4 shadow-xl">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <OfficialWhatsAppIcon className="w-8 h-8 fill-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white font-bold text-base">WhatsApp Lead Kaydı Bulunamadı</span>
                    <span className="text-xs text-[#8b949e] max-w-md">
                      Ziyaretçiler sitedeki ilanların WhatsApp butonuna bastıkça anlık istihbarat ve lead verileri bu kurumsal tabloda sıralanacaktır.
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-4">
                
                {/* 1. MASAÜSTÜ KURUMSAL DATA TABLE (hidden sm:block / lg:table) */}
                <div className="hidden lg:block rounded-2xl bg-[#0c1017] border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-[#070a0f] text-slate-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Zaman Damgası</th>
                          <th className="py-3 px-4">Hedef İlan &amp; Telefon</th>
                          <th className="py-3 px-4">Ziyaretçi Konumu &amp; IP</th>
                          <th className="py-3 px-4">Geliş Kaynağı &amp; Kelime</th>
                          <th className="py-3 px-4">Cihaz &amp; Tarayıcı</th>
                          <th className="py-3 px-4 text-right">Aksiyonlar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 text-xs">
                        {leads.map((lead: any, idx: number) => {
                          const m = lead.metadata || {};
                          const isMobile = m.device === 'mobile';
                          const refSrc = (m.refererSource || 'direct').toLowerCase();
                          const elapsedSec = Math.max(1, Math.round((Date.now() - new Date(lead.createdAt).getTime()) / 1000));
                          const timeStr = elapsedSec < 60 ? `${elapsedSec} sn önce` : elapsedSec < 3600 ? `${Math.floor(elapsedSec / 60)} dk önce` : `${Math.floor(elapsedSec / 3600)} sa önce`;
                          const isNew = lead.isNewLive || elapsedSec < 120;

                          let refIcon = '🔗';
                          let refName = 'Direkt Giriş';
                          let refBadge = 'bg-slate-800 text-slate-300 border-white/5';

                          if (refSrc === 'yandex' || (m.referer || '').includes('yandex')) {
                            refIcon = '🇷🇺';
                            refName = 'Yandex Arama';
                            refBadge = 'bg-red-500/15 text-red-300 border-red-500/30';
                          } else if (refSrc === 'google' || (m.referer || '').includes('google')) {
                            refIcon = '🌐';
                            refName = 'Google Arama';
                            refBadge = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                          } else if (refSrc === 'x' || (m.referer || '').includes('t.co')) {
                            refIcon = '🐦';
                            refName = 'X (Twitter)';
                            refBadge = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
                          } else if (refSrc === 'whatsapp') {
                            refIcon = '💬';
                            refName = 'WhatsApp';
                            refBadge = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                          }

                          return (
                            <tr 
                              key={lead._id || idx}
                              className={`transition-all duration-300 group ${
                                isNew 
                                  ? 'bg-gradient-to-r from-emerald-950/70 via-[#102a1e]/60 to-emerald-950/40 border-l-4 border-l-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)] animate-pulse' 
                                  : 'hover:bg-[#0d1117]/60'
                              }`}
                            >
                              {/* Zaman Damgası */}
                              <td className="py-4 px-5">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-black border flex items-center gap-1.5 w-fit ${
                                      isNew 
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/40' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-slate-950 animate-ping' : 'bg-emerald-400 animate-ping'}`}></span>
                                      {isNew ? `⚡ YENİ (${timeStr})` : timeStr}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-[#8b949e] font-mono">
                                    {new Date(lead.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </div>
                              </td>

                              {/* Hedef İlan & Telefon */}
                              <td className="py-4 px-5">
                                <div className="flex flex-col gap-1.5 max-w-xs">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <Crown className={`w-3.5 h-3.5 shrink-0 ${isNew ? 'text-emerald-300 animate-bounce' : 'text-amber-400'}`} />
                                    <span className={`font-black text-xs truncate transition-colors ${isNew ? 'text-emerald-200 text-sm' : 'text-white group-hover:text-amber-300'}`}>
                                      {lead.targetTitle || 'İlan'}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#8b949e] flex-wrap">
                                    {renderDomainBadge(lead.hostname || m.hostname)}
                                    {m.listingLocation && (
                                      <span className="font-bold text-slate-300">📍 {m.listingLocation.toUpperCase()}</span>
                                    )}
                                    {m.listingPhone && (
                                      <>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-black">📞 {m.listingPhone}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Ziyaretçi Konumu & IP */}
                              <td className="py-4 px-5">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-white flex items-center gap-1.5">
                                    <span className="text-sm">📍</span>
                                    <span>{m.city || lead.targetCity || 'İstanbul'}</span>
                                  </span>
                                  <span className="text-[11px] font-mono text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded-md border border-[#30363d] w-fit">
                                    {lead.ip || '127.0.0.1'}
                                  </span>
                                </div>
                              </td>

                              {/* Geliş Kaynağı & Kelime */}
                              <td className="py-4 px-5">
                                <div className="flex flex-col gap-1.5">
                                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border w-fit ${refBadge}`}>
                                    {refIcon} {refName}
                                  </span>

                                  {m.searchKeyword ? (
                                    <span className="text-[11px] text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md w-fit flex items-center gap-1">
                                      <Search className="w-3 h-3 text-cyan-400" />
                                      <span>&quot;{m.searchKeyword}&quot;</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#484f58] font-mono">Doğrudan Tıklama</span>
                                  )}
                                </div>
                              </td>

                              {/* Cihaz & Tarayıcı */}
                              <td className="py-4 px-5">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                                    {isMobile ? <Smartphone className="w-3.5 h-3.5 text-purple-400" /> : <Monitor className="w-3.5 h-3.5 text-blue-400" />}
                                    <span>{isMobile ? 'Mobil' : 'Masaüstü'}</span>
                                  </div>
                                  <span className="text-[11px] text-[#8b949e] font-mono">
                                    {m.browser || 'Browser'} • {m.os || 'OS'}
                                  </span>
                                </div>
                              </td>

                              {/* Aksiyonlar */}
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {m.listingPhone && (
                                    <a
                                      href={`https://wa.me/${m.listingPhone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`px-3 py-1.5 rounded-xl font-bold font-heading flex items-center gap-1.5 transition-all shadow-md ${
                                        isNew 
                                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs shadow-emerald-500/30' 
                                          : 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs'
                                      }`}
                                      title="WhatsApp Görüşmesi Başlat"
                                    >
                                      <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                                      <span>WhatsApp</span>
                                    </a>
                                  )}

                                  {m.listingSlug ? (
                                    <Link
                                      href={`/ilan/${m.listingSlug}`}
                                      target="_blank"
                                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-amber-500/30 text-xs font-bold font-heading flex items-center gap-1 transition-all"
                                      title="İlanı Görüntüle"
                                    >
                                      <span>İlan</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  ) : (
                                    <Link
                                      href={lead.path || '#'}
                                      target="_blank"
                                      className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-bold font-heading flex items-center gap-1 transition-all"
                                      title="Sayfayı Görüntüle"
                                    >
                                      <span>Sayfa</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. MOBİL GÖRÜNÜM (Kart Yapısı - lg:hidden) */}
                <div className="grid grid-cols-1 gap-3.5 lg:hidden">
                  {leads.map((lead: any, idx: number) => {
                    const m = lead.metadata || {};
                    const isMobile = m.device === 'mobile';
                    const refSrc = (m.refererSource || 'direct').toLowerCase();
                    const elapsedSec = Math.max(1, Math.round((Date.now() - new Date(lead.createdAt).getTime()) / 1000));
                    const timeStr = elapsedSec < 60 ? `${elapsedSec} sn önce` : elapsedSec < 3600 ? `${Math.floor(elapsedSec / 60)} dk önce` : `${Math.floor(elapsedSec / 3600)} sa önce`;
                    const isNew = lead.isNewLive || elapsedSec < 120;

                    let refIcon = '🔗';
                    let refName = 'Direkt Giriş';
                    let refBadge = 'bg-slate-800 text-slate-300 border-white/5';

                    if (refSrc === 'yandex' || (m.referer || '').includes('yandex')) {
                      refIcon = '🇷🇺';
                      refName = 'Yandex Arama';
                      refBadge = 'bg-red-500/15 text-red-300 border-red-500/30';
                    } else if (refSrc === 'google' || (m.referer || '').includes('google')) {
                      refIcon = '🌐';
                      refName = 'Google Arama';
                      refBadge = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                    } else if (refSrc === 'x' || (m.referer || '').includes('t.co')) {
                      refIcon = '🐦';
                      refName = 'X (Twitter)';
                      refBadge = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
                    } else if (refSrc === 'whatsapp') {
                      refIcon = '💬';
                      refName = 'WhatsApp';
                      refBadge = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                    }

                    return (
                      <div
                        key={lead._id || idx}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 shadow-sm ${
                          isNew 
                            ? 'bg-gradient-to-r from-emerald-950/80 via-[#0b1d16] to-emerald-950/80 border border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse' 
                            : 'bg-[#0c1017] border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-[#21262d] pb-2.5">
                          <span className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-black border flex items-center gap-1.5 ${
                            isNew 
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-slate-950 animate-ping' : 'bg-emerald-400 animate-ping'}`}></span>
                            {isNew ? `⚡ YENİ (${timeStr})` : timeStr}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-mono font-bold border ${refBadge}`}>
                            {refIcon} {refName}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs">{lead.targetTitle || 'İlan'}</span>
                            {renderDomainBadge(lead.hostname || m.hostname)}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-[#8b949e] font-mono">
                            <span>📍 {m.city || lead.targetCity || 'İstanbul'}</span>
                            <span className="text-emerald-400 font-bold">{m.listingPhone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
                          <span className="text-[10px] text-[#8b949e] font-mono">
                            {isMobile ? '📱 Mobil' : '💻 PC'} • {lead.ip || '127.0.0.1'}
                          </span>
                          {m.listingPhone && (
                            <a
                              href={`https://wa.me/${m.listingPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1"
                            >
                              <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                              <span>Yaz</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}


      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME: GOOGLE CANLI SIRALAMA (SERP) & WHATSAPP DÖNÜŞÜM TAKİBİ ───── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'seo_rankings' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* ── BÖLÜM 1: GOOGLE & YANDEX WHATSAPP DÖNÜŞÜM ANALİTİĞİ ────────────────── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                      Google &amp; Yandex Organik Arama &amp; WhatsApp Dönüşüm Analizi
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
                      CR: %{googleConversionStats.googleConversionRate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                    Arama motorlarından gelen organik ziyaretçilerin doğrudan WhatsApp randevularına dönüşme performansı.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. MOBİL: NATIVE 2x2 ORTALANMIŞ GRID (sm:hidden) */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Google Organik</span>
                <span className="text-xl font-bold font-mono text-white mt-0.5">
                  {sources.google || googleConversionStats.googleVisitors || 0}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Google TR Tekil</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Yandex Organik</span>
                <span className="text-xl font-bold font-mono text-white mt-0.5">
                  {sources.yandex || 0}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Yandex TR Tekil</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Arama WhatsApp</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {googleConversionStats.googleWhatsappClicks}
                </span>
                <span className="text-[9px] text-emerald-400/80 font-mono">Dönüşüm Tık</span>
              </div>

              <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">Net Dönüşüm (CR)</span>
                <span className="text-xl font-bold font-mono text-purple-300 mt-0.5">
                  %{googleConversionStats.googleConversionRate}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">100 Kişi Başına</span>
              </div>
            </div>

            {/* 2. MASAÜSTÜ: 4 SÜTUNLU KURUMSAL KARTLAR (hidden sm:grid) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 hover:border-blue-500/40 shadow-sm flex flex-col gap-1 transition-colors">
                <span className="text-xs text-blue-400 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Google Organik Ziyaretçi
                </span>
                <span className="font-bold text-2xl text-white font-mono mt-1">
                  {sources.google || googleConversionStats.googleVisitors || 0}
                </span>
                <span className="text-[10px] text-slate-500">Google TR&apos;den gelen tekil kişiler</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 hover:border-amber-500/40 shadow-sm flex flex-col gap-1 transition-colors">
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  Yandex Organik Ziyaretçi
                </span>
                <span className="font-bold text-2xl text-white font-mono mt-1">
                  {sources.yandex || 0}
                </span>
                <span className="text-[10px] text-slate-500">Yandex TR&apos;den gelen tekil kişiler</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 hover:border-emerald-500/40 shadow-sm flex flex-col gap-1 transition-colors">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Arama WhatsApp Tıklamaları
                </span>
                <span className="font-bold text-2xl text-emerald-400 font-mono mt-1">
                  {googleConversionStats.googleWhatsappClicks}
                </span>
                <span className="text-[10px] text-slate-500">Aramadan gelip WhatsApp&apos;a basanlar</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 hover:border-purple-500/40 shadow-sm flex flex-col gap-1 transition-colors">
                <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  Net Dönüşüm Oranı (CR)
                </span>
                <span className="font-bold text-2xl text-purple-300 font-mono mt-1">
                  %{googleConversionStats.googleConversionRate}
                </span>
                <span className="text-[10px] text-slate-500">Her 100 organik kişiden randevu oranı</span>
              </div>
            </div>

                      </div>

          {/* ── BÖLÜM 2: CANLI GOOGLE & YANDEX SIRALAMA TAKİP MOTORU (DUAL SERP TRACKER) ── */}
          {/* YANDEX CANLI SERP MOTORU */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-3.5">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    🟡
                  </div>
                  <h2 className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                    <span>Yandex TR &amp; Google Canlı SERP Sıralama &amp; Rakip Takip Motoru</span>
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                    {keywordList.length} Kelime Takipte
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hedef anahtar kelimelerde <strong>Yandex Türkiye</strong> ve <strong>Google</strong>'daki anlık pozisyonları, rakipleri ve sıralama değişimlerini canlı izleyin.
                </p>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(!showApiKeyModal)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs border transition-all shrink-0 ${
                    showApiKeyModal
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-[#070a0f] hover:bg-slate-800 text-blue-300 border-slate-800'
                  }`}
                  title="Google SERP Motoru ve Serper API Anahtarını Yönet"
                >
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google API / Motor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBoostAndPing()}
                  disabled={boostingPing}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  title="URL'leri anında IndexNow & Ping ile arama motorlarına iletir"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${boostingPing ? 'animate-spin' : ''}`} />
                  <span>{boostingPing ? 'Gönderiliyor...' : '1-Tıkla IndexNow & Ping'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScanRankings()}
                  disabled={scanningRankings}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Zap className={`w-3.5 h-3.5 ${scanningRankings ? 'animate-spin text-slate-950' : 'fill-slate-950'}`} />
                  <span>{scanningRankings ? 'Taranıyor...' : 'Tüm Sıralamaları Canlı Tara'}</span>
                </button>
              </div>
            </div>

            {/* Google API & Motor Ayar Paneli */}
            {showApiKeyModal && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#070a0f] border border-blue-500/30 flex flex-col gap-2.5 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Key className="w-3.5 h-3.5 shrink-0" />
                    <span>Google &amp; SERP Motoru Ayarları</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {serperApiKeyInput.trim() ? '🟢 Özel Serper API Aktif' : '🔵 Ücretsiz Organik Fallback (DDG) Aktif'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  🟡 <strong>Yandex TR:</strong> Direkt canlı taranır, API gerektirmez.<br />
                  🔍 <strong>Google TR:</strong> Serper API veya ücretsiz Organik Web Motoru ile taranır. Ücretsiz 2.500 kredi için <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold">serper.dev</a> adresinden key alabilirsiniz:
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="password"
                    placeholder="Serper API Key yapıştırın (örn: 8078961d0c92...)"
                    value={serperApiKeyInput}
                    onChange={(e) => setSerperApiKeyInput(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-1.5 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs font-mono focus:border-blue-400 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0"
                    >
                      Kaydet
                    </button>
                    {serperApiKeyInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSerperApiKeyInput('');
                          if (typeof window !== 'undefined') localStorage.removeItem('bms_serper_api_key');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-colors shrink-0"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                </div>
                {apiKeySaveMsg && (
                  <span className="text-xs font-semibold text-emerald-400 font-mono">{apiKeySaveMsg}</span>
                )}
              </div>
            )}

            {boostPingResult && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-white flex flex-col gap-2.5 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{boostPingResult.message || 'IndexNow & Ping Gönderimi Başarıyla Tamamlandı'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBoostPingResult(null)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-slate-800 transition-colors"
                  >
                    ✕ Kapat
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-emerald-500/20">
                  <div className="p-2 rounded-lg bg-[#070a0f] border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">⚡ Google Indexing API</span>
                    <span className="text-xs font-bold text-blue-400 font-mono mt-0.5">
                      {!boostPingResult.googleIndexingResult
                        ? '⚠️ Anahtar Bulunamadı'
                        : boostPingResult.googleIndexingResult.failCount > 0
                        ? `${boostPingResult.googleIndexingResult.successCount > 0 ? `✅ ${boostPingResult.googleIndexingResult.successCount} / ` : ''}⚠️ ${boostPingResult.googleIndexingResult.failCount} (Kota Dolu)`
                        : `✅ ${boostPingResult.googleIndexingResult.successCount} İletildi`}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#070a0f] border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">🟡 Yandex IndexNow</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      {boostPingResult.pingResult?.endpoints?.yandex ? '✅ HTTP 200 (İletildi)' : '⚠️ Kuyrukta'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#070a0f] border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">🔵 Bing IndexNow</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      {boostPingResult.pingResult?.endpoints?.bing || boostPingResult.pingResult?.endpoints?.indexnow ? '✅ HTTP 200 (İletildi)' : '⚠️ Kuyrukta'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#070a0f] border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">🔍 Google Sitemap Ping</span>
                    <span className="text-xs font-bold text-blue-400 font-mono mt-0.5">
                      {boostPingResult.pingResult?.endpoints?.googleSitemapPing ? '✅ Ping Gönderildi' : '⚠️ Kuyrukta'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#070a0f] border border-slate-800 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">🚀 Toplam Sayfa</span>
                    <span className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                      {boostPingResult.pingResult?.submittedCount || 0} Adet Sayfa
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Google Search Console Hızlı Gönderim */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#070a0f] border border-blue-500/20 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-blue-400">🔍 Google Search Console — Hızlı URL Gönderimi</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Aktif ilan URL'lerini kopyalayıp Search Console URL Denetimi aracına doğrudan yapıştırabilirsiniz.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleFetchGscUrls}
                    disabled={gscLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Copy className={`w-3.5 h-3.5 ${gscLoading ? 'animate-pulse' : ''}`} />
                    {gscLoading ? 'Yükleniyor...' : gscCopied ? '✅ Kopyalandı!' : 'Tüm URL\'leri Kopyala'}
                  </button>
                  <a
                    href="https://search.google.com/search-console/?resource_id=https%3A%2F%2Fwww.besteskort.online%2F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold text-xs border border-slate-700 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    GSC Aç
                  </a>
                </div>
              </div>
            </div>

            {/* Akıllı Sıralı Kuyruk Canlı İlerleme Çubuğu */}
            {scanProgress && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-semibold text-amber-300 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>Sıralı Canlı Tarama ({scanProgress.current}/{scanProgress.total})</span>
                  </span>
                  <span className="font-mono text-white bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[11px]">
                    Canlı: <strong className="text-amber-300">{scanProgress.keyword}</strong>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#0c1017] overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.round((scanProgress.current / scanProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Yeni Kelime Ekleme Formu */}
            <form onSubmit={handleAddKeyword} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="Takip edilecek kelime yazın... (örn: kadıköy eskort, beylikdüzü escort)"
                  value={newKeywordInput}
                  onChange={(e) => setNewKeywordInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-amber-400 focus:outline-none transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={keywordLoading || !newKeywordInput.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Kelime Ekle &amp; Tara</span>
              </button>
            </form>

            {/* 1. MOBİL: NATIVE EXECUTIVE KEYWORD KARTLARI (sm:hidden) */}
            <div className="flex flex-col gap-2.5 sm:hidden">
              {keywordList.map((item: any) => {
                const posY = item.yandexPosition || 0;
                const changeY = item.yandexChange || 0;
                const posG = item.currentPosition || 0;
                const changeG = item.change || 0;
                const isScanningThis = scanProgress && scanProgress.keyword.toLowerCase() === item.keyword.toLowerCase();

                const renderMiniRank = (pos: number, change: number, engine: 'google' | 'yandex') => {
                  const isY = engine === 'yandex';
                  const title = isY ? 'Yandex' : 'Google';
                  const searchUrl = isY
                    ? `https://yandex.com.tr/search/?text=${encodeURIComponent(item.keyword)}&lr=11508`
                    : `https://www.google.com.tr/search?q=${encodeURIComponent(item.keyword)}`;

                  return (
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col items-center justify-center text-center gap-0.5 hover:border-slate-700 transition-colors"
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isY ? 'text-amber-400' : 'text-blue-400'}`}>
                        {title}
                      </span>
                      <span className="text-base font-bold font-mono text-white">
                        {pos > 0 ? `#${pos}` : '100+'}
                      </span>
                      <span className="text-[9px] font-mono">
                        {change > 0 ? (
                          <span className="text-emerald-400 font-bold">+{change} ↗</span>
                        ) : change < 0 ? (
                          <span className="text-rose-400 font-bold">{change} ↘</span>
                        ) : (
                          <span className="text-slate-500">{pos > 0 ? 'Sabit' : 'Dışında'}</span>
                        )}
                      </span>
                    </a>
                  );
                };

                return (
                  <div
                    key={item._id}
                    className={`p-3.5 rounded-xl bg-[#070a0f] border transition-all flex flex-col gap-2.5 ${
                      isScanningThis ? 'border-amber-400 bg-amber-500/5' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-white capitalize truncate">
                          {item.keyword}
                        </span>
                        {isScanningThis ? (
                          <span className="text-[10px] text-amber-400 font-semibold animate-pulse">
                            Şu an taranıyor...
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.lastCheckedAt
                              ? new Date(item.lastCheckedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                              : 'Henüz taranmadı'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleScanRankings(item._id)}
                          disabled={scanningRankings}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Bu Kelimeyi Tara"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${scanningRankings ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteKeyword(item._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Yan Yana Google ve Yandex Sıralama Kutusu */}
                    <div className="grid grid-cols-2 gap-2">
                      {renderMiniRank(posG, changeG, 'google')}
                      {renderMiniRank(posY, changeY, 'yandex')}
                    </div>

                    {/* Rakipler */}
                    {((item.topCompetitors && item.topCompetitors.length > 0) || (item.yandexCompetitors && item.yandexCompetitors.length > 0)) && (
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                        <span className="text-slate-500">Rakipler:</span>
                        {(item.yandexCompetitors || item.topCompetitors || []).slice(0, 2).map((c: any, i: number) => (
                          <span key={i} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono truncate max-w-[120px]">
                            #{c.position} {c.domain}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 2. MASAÜSTÜ: KURUMSAL OBSIDIAN SIRALAMA TABLOSU (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Anahtar Kelime</th>
                    <th className="py-2.5 px-3 text-blue-400">Google Sırası</th>
                    <th className="py-2.5 px-3 text-amber-400">Yandex Sırası</th>
                    <th className="py-2.5 px-3 text-blue-400">Google Değişim</th>
                    <th className="py-2.5 px-3 text-amber-400">Yandex Değişim</th>
                    <th className="py-2.5 px-3">Rakipler (G/Y)</th>
                    <th className="py-2.5 px-3">Son Tarama</th>
                    <th className="py-2.5 px-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {keywordList.map((item: any) => {
                    const posY = item.yandexPosition || 0;
                    const changeY = item.yandexChange || 0;
                    const posG = item.currentPosition || 0;
                    const changeG = item.change || 0;

                    const renderPosBadge = (
                      pos: number,
                      keyword: string,
                      engine: 'google' | 'yandex',
                      foundDomain?: string,
                      foundUrl?: string,
                      foundEngine?: string
                    ) => {
                      const searchUrl = engine === 'yandex' 
                        ? `https://yandex.com.tr/search/?text=${encodeURIComponent(keyword)}&lr=11508`
                        : `https://www.google.com.tr/search?q=${encodeURIComponent(keyword)}`;

                      let badgeContent = null;
                      if (pos > 0 && pos <= 10) {
                        badgeContent = (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            {pos === 1 ? '👑 #1 (1. Sayfa)' : `🥇 #${pos} (1. Sayfa)`} ↗
                          </span>
                        );
                      } else if (pos > 10 && pos <= 20) {
                        badgeContent = (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            🥈 #{pos} (2. Sayfa) ↗
                          </span>
                        );
                      } else if (pos > 20 && pos <= 30) {
                        badgeContent = (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            🥉 #{pos} (3. Sayfa) ↗
                          </span>
                        );
                      } else if (pos > 30 && pos <= 100) {
                        const pageNum = Math.ceil(pos / 10);
                        badgeContent = (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono inline-flex items-center gap-1 group-hover:scale-105 transition-transform">
                            📄 #{pos} ({pageNum}. Sayfa) ↗
                          </span>
                        );
                      } else {
                        badgeContent = (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium font-mono inline-flex items-center gap-1 group-hover:text-white transition-colors">
                            100+ (Dışında) ↗
                          </span>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1">
                            <a
                              href={searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group inline-block"
                              title={`${engine === 'yandex' ? 'Yandex TR' : 'Google TR'} üzerinde canlı sonuçları gör`}
                            >
                              {badgeContent}
                            </a>
                            {engine === 'google' && foundEngine === 'ddg_organic' && pos > 0 && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                Organik
                              </span>
                            )}
                          </div>
                          {pos > 0 && (foundDomain || foundUrl) && (
                            <a
                              href={foundUrl || `https://${foundDomain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border max-w-[150px] truncate inline-flex items-center gap-1 transition-colors ${
                                engine === 'google'
                                  ? 'text-blue-400/90 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50'
                                  : 'text-amber-400/90 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50'
                              }`}
                              title={foundUrl || foundDomain}
                            >
                              <Globe className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{foundDomain || 'Site URL'}</span>
                            </a>
                          )}
                        </div>
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
                        return <span className="inline-flex items-center gap-1 text-slate-600 font-mono text-xs">—</span>;
                      }
                      return (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-xs font-mono">
                          <Minus className="w-3.5 h-3.5" />
                          Sabit
                        </span>
                      );
                    };

                    const isScanningThis = scanProgress && scanProgress.keyword.toLowerCase() === item.keyword.toLowerCase();

                    return (
                      <tr 
                        key={item._id} 
                        className={`transition-all ${
                          isScanningThis 
                            ? 'bg-amber-500/10 border-l-4 border-amber-400 shadow-inner' 
                            : 'hover:bg-slate-900/50'
                        }`}
                      >
                        {/* Kelime Adı */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-xs text-white capitalize block">
                            {item.keyword}
                          </span>
                          {isScanningThis ? (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                              <Zap className="w-3 h-3 text-amber-400 animate-spin" />
                              Canlı Taranıyor...
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Yandex / Google TR</span>
                          )}
                        </td>

                        {/* Google Sırası */}
                        <td className="py-3 px-3">
                          {renderPosBadge(posG, item.keyword, 'google', item.googleFoundDomain, item.googleFoundUrl, item.googleFoundEngine)}
                        </td>

                        {/* Yandex Sırası */}
                        <td className="py-3 px-3">
                          {renderPosBadge(posY, item.keyword, 'yandex', item.yandexFoundDomain, item.yandexFoundUrl)}
                        </td>

                        {/* Google Değişimi */}
                        <td className="py-3 px-3">
                          {renderChangeBadge(changeG, posG)}
                        </td>

                        {/* Yandex Değişimi */}
                        <td className="py-3 px-3">
                          {renderChangeBadge(changeY, posY)}
                        </td>

                        {/* Rakipler */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1.5">
                            {item.topCompetitors && item.topCompetitors.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                <span className="text-[10px] text-blue-400 font-bold mr-1">G:</span>
                                {item.topCompetitors.slice(0, 2).map((c: any, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono truncate max-w-[130px]"
                                    title={c.domain}
                                  >
                                    #{c.position} {c.domain}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.yandexCompetitors && item.yandexCompetitors.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                <span className="text-[10px] text-amber-400 font-bold mr-1">Y:</span>
                                {item.yandexCompetitors.slice(0, 2).map((c: any, cIdx: number) => (
                                  <span
                                    key={cIdx}
                                    className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono truncate max-w-[130px]"
                                    title={c.domain}
                                  >
                                    #{c.position} {c.domain}
                                  </span>
                                ))}
                              </div>
                            )}
                            {(!item.topCompetitors?.length && !item.yandexCompetitors?.length) && (
                              <span className="text-[10px] text-slate-600">Tespit edilmedi</span>
                            )}
                          </div>
                        </td>

                        {/* Son Kontrol */}
                        <td className="py-3 px-3 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {item.lastCheckedAt
                            ? new Date(item.lastCheckedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                            : 'Henüz taranmadı'}
                        </td>

                        {/* İşlemler */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleScanRankings(item._id)}
                              disabled={scanningRankings}
                              title="Bu Kelimeyi Tekrar Tara (Google + Yandex)"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-700 transition-colors"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${scanningRankings ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteKeyword(item._id)}
                              title="Kelimeyi Sil"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
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
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4 animate-fadeIn">
          
          {/* Başlık ve Arama Kutusu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                    İlan Performans, Tıklama &amp; Referrer Raporu
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono font-semibold">
                    {filteredListings.length} İlan
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Hangi ilan kaç kez görüntülendi, kaç kez WhatsApp&apos;a tıklandı, Google, Yandex ve sosyal medya referansları.
                </p>
              </div>
            </div>

            {/* Hızlı Arama Kutusu */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="İlan adı veya şehir ara..."
                value={listingSearchTerm}
                onChange={(e) => setListingSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-amber-500/60 focus:outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* İlan Detay Tablosu (Masaüstü) & Kartlar (Mobil) */}
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-[#070a0f] rounded-xl border border-slate-800">
              Arama kriterine uygun ilan bulunamadı.
            </div>
          ) : (
            <>
              {/* MOBİL GÖRÜNÜM: Her ilan ayrı şık kart (Yatay kaydırma sorunu olmadan rahatça okunur) */}
              <div className="flex flex-col gap-3 md:hidden">
                {filteredListings.map((item: any) => {
                  const isExpanded = expandedListingId === item.id;
                  return (
                    <div key={item.id} className="p-3.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
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
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Canlı Ziyaretçi Akış Günlüğü
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                {Math.min(groupedVisitors.length, visitorDisplayLimit)} / {groupedVisitors.length} Tekil Kişi ({filteredVisitors.length} İstek)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Gösterim Sınırı Seçici */}
              <div className="flex items-center bg-[#070a0f] border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
                {[100, 500, 1000, 9999].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => setVisitorDisplayLimit(limit)}
                    className={`px-2 py-1 rounded-lg transition-all font-semibold text-[11px] ${
                      visitorDisplayLimit === limit
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {limit === 9999 ? 'Tümü' : limit}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-52">
                <input
                  type="text"
                  placeholder="IP, Şehir, Sayfa ara..."
                  value={searchTermFilter}
                  onChange={(e) => setSearchTermFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              </div>
            </div>
          </div>

          {/* HIZLI FİLTRELER: GÜVENLİK & DOMAİN SEÇİCİ */}
          <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[#070a0f] border border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Güvenlik Filtresi */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setOnlySuspiciousFilter(false)}
                  className={`px-2.5 py-1.2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    !onlySuspiciousFilter
                      ? 'bg-slate-800 text-white border border-slate-700/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Tümü</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 font-mono">
                    {(recentVisitors as any[]).length}
                  </span>
                </button>

                <button
                  onClick={() => setOnlySuspiciousFilter(true)}
                  className={`px-2.5 py-1.2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    onlySuspiciousFilter
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20 font-bold'
                      : 'text-red-400 hover:text-red-300 bg-red-950/20 border border-red-500/30'
                  }`}
                >
                  <span>🚨 Şüpheli &amp; Bot</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-900/60 font-mono">
                    {suspiciousTotalCount}
                  </span>
                </button>
              </div>

              {/* Hızlı Domain Filtreleme Butonları */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-[#8b949e] font-mono mr-1">Domain:</span>
                <button
                  onClick={() => setSearchTermFilter('')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                    !searchTermFilter 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setSearchTermFilter('besteskort')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
                    searchTermFilter === 'besteskort'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#161b22] text-emerald-400 border-[#30363d] hover:text-emerald-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>besteskort.online</span>
                </button>
                <button
                  onClick={() => setSearchTermFilter('escturkiye')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
                    searchTermFilter === 'escturkiye'
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                      : 'bg-[#161b22] text-fuchsia-400 border-[#30363d] hover:text-fuchsia-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
                  <span>escturkiye.space</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8b949e] pt-1 border-t border-[#21262d]">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                ✅ Google / Yandex Korumalı
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                ⚠️ Otomasyon / AWS / Proxy İşaretli
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-fuchsia-400 font-medium">
                🚀 Multi-Domain Canlı Dinleme Aktif
              </span>
            </div>
          </div>

          {/* MOBİL GÖRÜNÜM: Canlı Ziyaretçi Akış Kartları */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {groupedVisitors.slice(0, visitorDisplayLimit).map((v: any) => {
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
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {renderDomainBadge(v.hostname)}
                      {renderTrafficSourceBadge(v)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8b949e] pt-1.5 border-t border-[#21262d]">
                    <span>{v.device === 'mobile' ? '📱 Mobil' : '💻 Masaüstü'} ({v.browser})</span>
                    <span className="text-emerald-400 font-mono font-bold">{v.durationSeconds > 0 ? `${v.durationSeconds}s` : '<15s'}</span>
                  </div>

                  {/* 3. YOLCULUK AKIŞI: SAĞDA BUTON & AÇILIR DROPDOWN */}
                  {v.totalActions > 1 && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Toplam <strong className="text-amber-400">{v.totalActions}</strong> hareket ({v.distinctPagesCount || 1} sayfa)
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedVisitorKey(expandedVisitorKey === v.sessionKey ? null : v.sessionKey)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border active:scale-95 shrink-0 ${
                            expandedVisitorKey === v.sessionKey
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          <Route className="w-3.5 h-3.5" />
                          <span>Yolculuk ({v.totalActions} Adım)</span>
                          {expandedVisitorKey === v.sessionKey ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {expandedVisitorKey === v.sessionKey && (
                        <div className="p-2.5 bg-[#070a0f] border border-amber-500/30 rounded-xl flex flex-col gap-1.5 animate-fadeIn">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                            <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                              <Route className="w-3 h-3" />
                              <span>Ziyaretçi Adım Geçmişi (İlk Girişten Güncele)</span>
                            </span>
                            <span>Saat</span>
                          </div>

                          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
                            {v.history.map((step: any, stepIdx: number) => {
                              const isFirst = stepIdx === 0;
                              const isLatest = stepIdx === v.history.length - 1;
                              return (
                                <div
                                  key={step._id || stepIdx}
                                  className={`flex items-center justify-between gap-1.5 text-xs font-mono py-1.5 px-2 rounded-lg border transition-all ${
                                    isLatest
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                                      : isFirst
                                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                      : 'bg-[#0c1017] border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 ${
                                      isLatest ? 'bg-emerald-500 text-slate-950' : isFirst ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                      #{stepIdx + 1}
                                    </span>
                                    <span className="text-white truncate max-w-[140px]" title={step.path}>
                                      {step.path || '/'}
                                    </span>
                                    {isFirst && <span className="text-[9px] text-amber-400 font-bold shrink-0">İlk</span>}
                                    {isLatest && <span className="text-[9px] text-emerald-400 font-bold shrink-0">Son 🟢</span>}
                                  </div>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {new Date(step.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                  <th className="py-2.5 px-3 text-right">ADIMLAR / YOLCULUK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {groupedVisitors.slice(0, visitorDisplayLimit).map((v: any) => {
                  const analysis = getSuspiciousAnalysis(v);

                  return (
                    <React.Fragment key={v._id || v.sessionKey}>
                    <tr className={`transition-colors ${
                      analysis.isSuspicious 
                        ? 'bg-red-950/30 hover:bg-red-950/40 border-l-4 border-red-500' 
                        : v.isBanned 
                        ? 'bg-red-950/20 hover:bg-red-950/30' 
                        : 'hover:bg-[#21262d]/50'
                    }`}>
                      
                      {/* IP & Şehir */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-white text-[11px]">{v.ip || 'Anonim'}</span>
                          <span className="text-[10px] text-amber-400 font-medium">📍 {v.city || 'İstanbul'}</span>
                        </div>
                      </td>

                      {/* GÜVENLİK / SPAM ANALİZİ */}
                      <td className="py-3 px-3">
                        {analysis.isSuspicious ? (
                          <div className="flex flex-col gap-1 max-w-[200px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                              🤖 OTOMASYON
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {analysis.reasons.map((r: string, idx: number) => (
                                <span key={idx} className="text-[8px] px-1 py-0.2 rounded bg-black/40 text-amber-300 border border-amber-500/30 font-mono font-medium">
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
                        {renderDomainBadge(v.hostname)}
                      </td>

                      {/* Gezilen Sayfa */}
                      <td className="py-3 px-3 font-mono text-white text-[11px] max-w-[160px] truncate">
                        {v.path}
                      </td>

                      {/* Trafik Kaynağı */}
                      <td className="py-3 px-3">
                        {renderTrafficSourceBadge(v)}
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
                      <td className="py-3 px-3 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(v.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      {/* Yolculuk Butonu (Sağ Sütun) */}
                      <td className="py-3 px-3 text-right">
                        {v.totalActions > 1 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedVisitorKey(expandedVisitorKey === v.sessionKey ? null : v.sessionKey)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all inline-flex items-center gap-1.5 border active:scale-95 ${
                              expandedVisitorKey === v.sessionKey
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                            }`}
                          >
                            <Route className="w-3.5 h-3.5" />
                            <span>Yolculuk ({v.totalActions} Adım)</span>
                            {expandedVisitorKey === v.sessionKey ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">1 Adım</span>
                        )}
                      </td>
                    </tr>

                    {/* Genişletilmiş Yolculuk Akordeon Satırı */}
                    {expandedVisitorKey === v.sessionKey && v.totalActions > 1 && (
                      <tr key={`${v._id || v.sessionKey}-journey`}>
                        <td colSpan={10} className="p-3 bg-[#070a0f] border-b border-slate-800">
                          <div className="p-3.5 bg-[#0c1017] border border-amber-500/30 rounded-xl flex flex-col gap-2">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
                              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Route className="w-4 h-4 text-amber-400" />
                                <span>Ziyaretçi Yolculuk Akışı (İlk Girişten Güncele • Toplam {v.totalActions} Hareket)</span>
                              </span>
                              <span>İlk Giriş: {new Date(v.history[0]?.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                              {v.history.map((step: any, stepIdx: number) => {
                                const isFirst = stepIdx === 0;
                                const isLatest = stepIdx === v.history.length - 1;
                                return (
                                  <div
                                    key={step._id || stepIdx}
                                    className={`flex items-center justify-between gap-2 text-xs font-mono py-1.5 px-3 rounded-lg border transition-all ${
                                      isLatest
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                                        : isFirst
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                                        isLatest
                                          ? 'bg-emerald-500 text-slate-950'
                                          : isFirst
                                          ? 'bg-amber-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-300'
                                      }`}>
                                        #{stepIdx + 1}
                                      </span>
                                      <span className="text-white truncate font-medium max-w-md" title={step.path}>
                                        {step.path || '/'}
                                      </span>
                                      {isFirst && <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/15">İlk Giriş</span>}
                                      {isLatest && <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/15">Şu An Burada 🟢</span>}
                                    </div>
                                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                                      {new Date(step.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
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

      {/* ── EN ÇOK ZİYARET EDİLEN SAYFALAR DRAWER (GENİŞLETİLMİŞ MOBİL BOTTOM SHEET / MODAL) ── */}
      {showPagesDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl h-full bg-[#161b22] border-l border-[#30363d] flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#30363d] flex items-center justify-between gap-3 bg-[#0d1117]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white font-heading">
                    Ziyaret Edilen Sayfalar ({popularPages.length})
                  </h3>
                  <p className="text-[11px] text-[#8b949e]">Tüm sayfa gösterimleri, kalma süreleri ve doğrudan bağlantılar</p>
                </div>
              </div>
              <button
                onClick={() => setShowPagesDrawer(false)}
                className="w-9 h-9 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search */}
            <div className="p-3.5 border-b border-[#30363d] bg-[#161b22]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pageDrawerSearch}
                  onChange={(e) => setPageDrawerSearch(e.target.value)}
                  placeholder="Sayfa URL veya başlık ara..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-white text-xs placeholder:text-[#8b949e] outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Drawer List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {popularPages.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8b949e]">Henüz sayfa verisi kaydedilmedi.</div>
              ) : (
                popularPages
                  .filter((p: any) => 
                    !pageDrawerSearch || 
                    (p._id || '').toLowerCase().includes(pageDrawerSearch.toLowerCase()) || 
                    (p.pageTitle || '').toLowerCase().includes(pageDrawerSearch.toLowerCase())
                  )
                  .map((p: any, idx: number) => {
                    const avgSec = Math.round(p.avgDuration || 0);
                    return (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-amber-500/40 transition-colors flex flex-col gap-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-amber-400 font-bold truncate max-w-[280px]">
                            {p._id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs font-mono shrink-0">
                            {p.count.toLocaleString()} Hit
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#8b949e] border-t border-[#21262d] pt-1.5">
                          <span className="truncate">{p.pageTitle || 'Sayfa'}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                              <Clock className="w-3 h-3" /> {avgSec}s
                            </span>
                            <Link 
                              href={p._id || '#'} 
                              target="_blank"
                              className="text-amber-400 hover:text-white flex items-center gap-0.5 font-bold"
                            >
                              <span>Aç</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      
      {/* ═══════════
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SEKME 7: PWA / UYGULAMA KURULUM & KALDIRMA İSTİHBARATI ──────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'pwa_installs' && (
        <div className="flex flex-col gap-5 sm:gap-6 animate-fadeIn">
          {/* Üst Bilgi & 3'lü Özet Kartı */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-sm sm:text-base text-white tracking-tight">
                    Uygulama Kurulum &amp; Kaldırma Canlı Takibi (PWA)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold">
                    Limitsiz Liste
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Kullanıcıların cihazlarına kurduğu veya kaldırdığı tüm gerçek cihaz kayıtları (BTK engelsiz kitle).
                </p>
              </div>
            </div>

            {/* 1. MOBİL: NATIVE 3'LÜ ORTALANMIŞ GRID (sm:hidden) */}
            <div className="grid grid-cols-3 gap-2 w-full sm:hidden">
              <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Kurulum</span>
                <span className="font-mono font-bold text-base text-emerald-400 mt-0.5">
                  {(pwaInstalls || recentPwaInstalls?.filter((x: any) => x.eventType === 'pwa_install')?.length || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-rose-400 font-medium uppercase tracking-wider">Kaldıran</span>
                <span className="font-mono font-bold text-base text-rose-400 mt-0.5">
                  {((data?.pwaUninstalls || 0) || recentPwaInstalls?.filter((x: any) => x.eventType === 'pwa_uninstall')?.length || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800/80 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-blue-400 font-medium uppercase tracking-wider">Net Aktif</span>
                <span className="font-mono font-bold text-base text-blue-400 mt-0.5">
                  {Math.max(0, (pwaInstalls || 0) - ((data?.pwaUninstalls || 0) || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 2. MASAÜSTÜ: 3'LÜ METRİK ÇUBUĞU (hidden sm:flex) */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="px-3.5 py-2 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col min-w-[100px]">
                <span className="text-[10px] text-slate-400 font-medium">Toplam Kurulum:</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {(pwaInstalls || recentPwaInstalls?.filter((x: any) => x.eventType === 'pwa_install')?.length || 0).toLocaleString()}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col min-w-[100px]">
                <span className="text-[10px] text-slate-400 font-medium">Kaldıran / Dönen:</span>
                <span className="font-mono font-bold text-sm text-rose-400">
                  {((data?.pwaUninstalls || 0) || recentPwaInstalls?.filter((x: any) => x.eventType === 'pwa_uninstall')?.length || 0).toLocaleString()}
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col min-w-[100px]">
                <span className="text-[10px] text-slate-400 font-medium">Net Aktif Kurulu:</span>
                <span className="font-mono font-bold text-sm text-blue-400">
                  {Math.max(0, (pwaInstalls || 0) - ((data?.pwaUninstalls || 0) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Limitsiz Kurulum & Kaldırma Akışı Listesi */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017] border border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-sm text-white flex items-center gap-2">
                <span>📱 Tüm Cihaz Olayları (Limitsiz)</span>
                <span className="text-xs text-[#8b949e] font-mono">({recentPwaInstalls?.length || 0} Olay Kaydedildi)</span>
              </h3>
            </div>

            {(!recentPwaInstalls || recentPwaInstalls.length === 0) ? (
              <div className="py-16 text-center text-xs text-[#8b949e] flex flex-col items-center justify-center gap-2 border border-dashed border-[#30363d] rounded-2xl">
                <Smartphone className="w-8 h-8 text-slate-600 animate-pulse" />
                <span>Seçili tarih aralığında henüz bir kurulum veya kaldırma olayı kaydedilmedi.</span>
                <span className="text-[11px] text-slate-500">Kullanıcılar masaüstüne veya telefonlarına ekledikçe limitsiz olarak burada listelenir.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recentPwaInstalls.map((ev: any, idx: number) => {
                  const meta = ev.metadata || {};
                  const isUninstall = ev.eventType === 'pwa_uninstall';
                  const isIos = meta.platform === 'ios';
                  const isMobileDev = meta.platform === 'android' || isIos;
                  
                  return (
                    <div 
                      key={ev._id || idx}
                      className={`p-3.5 sm:p-4 rounded-xl bg-[#070a0f] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                        isUninstall ? 'border-rose-500/40 hover:border-rose-400' : 'border-[#30363d] hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUninstall
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : isIos 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                            : isMobileDev 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        }`}>
                          {isUninstall ? <X className="w-5 h-5 text-rose-400" /> : (isMobileDev ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />)}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-black text-xs sm:text-sm text-white">
                              {ev.targetTitle || (isUninstall ? 'PWA Kaldırıldı / Tarayıcıya Dönüldü' : 'PWA Kurulumu')}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                              isUninstall
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : isIos 
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                                : isMobileDev 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}>
                              {(meta.platform || 'Cihaz').toUpperCase()} ({meta.browser || 'Tarayıcı'})
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                              isUninstall
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {isUninstall ? <X className="w-3 h-3 text-rose-400" /> : <Check className="w-3 h-3 text-emerald-400" />}
                              <span>{isUninstall ? 'Kaldırıldı / Tarayıcıya Dönüldü' : 'Kuruldu & Aktif'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-[#8b949e] mt-1 font-mono flex-wrap">
                            <span className="text-white font-bold">📍 {ev.targetCity && ev.targetCity !== 'Türkiye' ? ev.targetCity : (ev.city || 'İstanbul')}</span>
                            {ev.ip && <span>🌐 {ev.ip}</span>}
                            {ev.searchKeyword && <span className="text-amber-400">🔍 {ev.searchKeyword}</span>}
                            {ev.referer && ev.referer !== 'Direct' && <span>🔗 {ev.referer}</span>}
                            <span>Tetik: {meta.method || meta.reason || 'Standalone'}</span>
                            <span>ID: {ev.visitorId || 'Bilinmiyor'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-mono font-bold block ${isUninstall ? 'text-rose-400' : 'text-amber-400'}`}>
                          {ev.createdAt ? new Date(ev.createdAt).toLocaleString('tr-TR') : 'Bugün'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── EN ÇOK WHATSAPP ETKİLEŞİM DETAYLARI DRAWER (BOTTOM SHEET / MODAL) ── */}
      {showWaDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl h-full bg-[#161b22] border-l border-[#30363d] flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#30363d] flex items-center justify-between gap-3 bg-[#0d1117]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#25D366] flex items-center justify-center font-bold">
                  <OfficialWhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white font-heading">
                    WhatsApp Etkileşim Raporu ({topContactedListings.length})
                  </h3>
                  <p className="text-[11px] text-[#8b949e]">İlanların WhatsApp randevu dönüşümleri ve sosyal paylaşımları</p>
                </div>
              </div>
              <button
                onClick={() => setShowWaDrawer(false)}
                className="w-9 h-9 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search */}
            <div className="p-3.5 border-b border-[#30363d] bg-[#161b22]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={waDrawerSearch}
                  onChange={(e) => setWaDrawerSearch(e.target.value)}
                  placeholder="İlan başlığı ara..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-white text-xs placeholder:text-[#8b949e] outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
              {topContactedListings.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8b949e]">Bu aralıkta henüz WhatsApp tıklaması kaydedilmedi.</div>
              ) : (
                topContactedListings
                  .filter((item: any) => 
                    !waDrawerSearch || 
                    (item._id || '').toLowerCase().includes(waDrawerSearch.toLowerCase())
                  )
                  .map((item: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-emerald-500/40 transition-colors flex flex-col gap-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-black flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs text-white truncate font-heading">
                            {item._id || 'İsimsiz İlan'}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs font-mono flex items-center gap-1 shrink-0">
                          <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-emerald-300" />
                          {item.whatsappClicks || 0} Tık
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8b949e] border-t border-[#21262d] pt-2">
                        <span className="flex items-center gap-1 text-purple-300">
                          <Share2 className="w-3 h-3" /> {item.shares || 0} Paylaşım
                        </span>
                        <button
                          onClick={() => {
                            setListingSearchTerm(item._id);
                            setActiveTab('listings');
                            setShowWaDrawer(false);
                          }}
                          className="text-amber-400 hover:text-white font-bold flex items-center gap-1"
                        >
                          <span>İlan Detayını Gör</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ONLINE KULLANICILAR MODAL */}
      {showOnlineUsersModal && (
        <div 
          onClick={() => setShowOnlineUsersModal(false)}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-[32px] p-6 shadow-2xl flex flex-col gap-4 text-left animate-in zoom-in-95 duration-200 max-h-[80vh]"
          >
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-lg text-white font-heading">Online Müşteriler</h3>
                  <span className="text-xs text-[#8b949e]">Şuan panelde {onlineUsers.length} kişi aktif</span>
                </div>
              </div>
              <button onClick={() => setShowOnlineUsersModal(false)} className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-3 pr-1 custom-scrollbar">
              {onlineUsers.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#8b949e] flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#8b949e]" />
                  </div>
                  <span>Şuan içeride online olan kayıtlı müşteri bulunmuyor.</span>
                </div>
              ) : (
                onlineUsers.map((u: any) => {
                  const now = new Date();
                  const startedAt = u.sessionStartedAt ? new Date(u.sessionStartedAt) : (u.lastActiveAt ? new Date(u.lastActiveAt) : now);
                  const minsInside = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 60000));
                  const isActuallyOnline = !!(u.isOnline && u.lastActiveAt && (now.getTime() - new Date(u.lastActiveAt).getTime()) < 2 * 60000);
                  const entryTimeStr = startedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                  const lastActiveTimeStr = u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : null;

                  return (
                    <div key={u._id} className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between gap-3 hover:border-amber-500/40 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center text-sm font-black shadow-md">
                            {u.kullaniciAdi?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0d1117] ${
                            isActuallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                          }`}></span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-white truncate font-mono">@{u.kullaniciAdi}</span>
                            {u.ad && u.ad !== u.kullaniciAdi && (
                              <span className="text-[11px] text-[#8b949e] truncate">({u.ad})</span>
                            )}
                          </div>

                          {u.primaryListingTitle && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold truncate mt-0.5">
                              <span>👑 {u.primaryListingTitle}</span>
                              {u.primaryListingLocation && (
                                <span className="text-[10px] text-[#8b949e] font-mono">({u.primaryListingLocation})</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-mono mt-1 flex-wrap">
                            <span className="text-emerald-400 font-bold">
                              {isActuallyOnline ? `🟢 Giriş: ${entryTimeStr} (${minsInside > 0 ? `${minsInside} dk` : 'yeni'})` : `⚪ Çıkış: ${lastActiveTimeStr || 'Ayrıldı'}`}
                            </span>
                            {u.currentTab && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-400 font-bold">Sekme: {u.currentTab}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {u.telefon && (
                        <a 
                          href={`https://wa.me/${u.telefon.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-all shrink-0 flex items-center justify-center shadow-md"
                          title="WhatsApp'tan Yaz"
                        >
                          <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-[#30363d] flex justify-end shrink-0">
              <Link 
                href="/bms-secure-portal/kullanicilar" 
                className="text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline"
              >
                Tüm Kullanıcılara Git <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SİTEDEKİ AKTİF ZİYARETÇİLER VE İNCELENEN İLANLAR CANLI MODAL — SENIOR LEVEL PRO UI */}
      {showActiveVisitorsModal && (() => {
        const fiveMinAgoMs = Date.now() - 5 * 60 * 1000;
        const activeMap = new Map<string, any>();
        
        (recentVisitors as any[] || []).forEach((v: any) => {
          const vTime = new Date(v.createdAt).getTime();
          if (vTime >= fiveMinAgoMs && !activeMap.has(v.visitorId)) {
            activeMap.set(v.visitorId, v);
          }
        });

        const activeList = activeMap.size > 0 
          ? Array.from(activeMap.values())
          : (recentVisitors as any[] || []).slice(0, 30);

        const listingViewingCount = activeList.filter((v: any) => v.path && v.path.startsWith('/ilan/')).length;
        const searchCount = activeList.filter((v: any) => v.searchKeyword || (v.path && v.path.startsWith('/ara'))).length;
        const mobileViewers = activeList.filter((v: any) => v.device === 'mobile').length;

        return (
          <div 
            onClick={() => setShowActiveVisitorsModal(false)}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl bg-gradient-to-b from-[#161b22] via-[#0d1117] to-[#0d1117] border border-[#30363d] rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col gap-0 text-left animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
            >
              {/* Modal Başlığı & Canlı Radar Başlığı */}
              <div className="p-5 sm:p-7 border-b border-[#30363d] bg-gradient-to-r from-emerald-500/10 via-[#161b22] to-transparent shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
                        <Activity className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#161b22]"></span>
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-black text-lg sm:text-2xl text-white font-heading tracking-tight">
                          Canlı Ziyaretçi &amp; İlan İzleme Radarı
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          {activeList.length} Canlı Ziyaretçi
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-[#8b949e] mt-0.5">
                        Ziyaretçilerin şu an sitede hangi ilanı, kategoriyi veya aramayı gerçek zamanlı incelediğini izleyin.
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowActiveVisitorsModal(false)} 
                    className="p-2.5 rounded-2xl bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-all shrink-0 border border-[#30363d]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Hızlı Canlı Metrik Hapları */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="px-3.5 py-2 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center justify-between">
                    <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> İlan Bakan
                    </span>
                    <span className="text-sm font-black text-amber-400 font-mono">{listingViewingCount}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center justify-between">
                    <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-cyan-400" /> Arama Yapan
                    </span>
                    <span className="text-sm font-black text-cyan-400 font-mono">{searchCount}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center justify-between">
                    <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-purple-400" /> Mobil Cihaz
                    </span>
                    <span className="text-sm font-black text-purple-300 font-mono">
                      %{activeList.length > 0 ? Math.round((mobileViewers / activeList.length) * 100) : 100}
                    </span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center justify-between">
                    <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> Yenileme
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">Otomatik (15s)</span>
                  </div>
                </div>
              </div>

              {/* Ziyaretçi Kartları Listesi */}
              <div className="overflow-y-auto flex-1 p-5 sm:p-7 flex flex-col gap-3.5 custom-scrollbar bg-[#090d13]">
                {activeList.length === 0 ? (
                  <div className="py-20 text-center text-xs text-[#8b949e] flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-bold text-white">Canlı Ziyaretçi Bekleniyor</span>
                    <span className="text-xs text-[#8b949e] max-w-sm">Ziyaretçiler siteye girdiğinde anlık olarak burada listelenecektir.</span>
                  </div>
                ) : (
                  activeList.map((v: any, idx: number) => {
                    const isListing = v.path && v.path.startsWith('/ilan/');
                    const isSearch = v.searchKeyword || (v.path && v.path.startsWith('/ara'));
                    const isCity = v.path && !isListing && v.path !== '/' && !v.path.startsWith('/admin') && !v.path.startsWith('/bms');
                    const isHome = v.path === '/';

                    const refSrc = (v.refererSource || 'direct').toLowerCase();
                    let refIcon = '🔗';
                    let refName = 'Direkt Giriş';
                    let refBadge = 'bg-slate-800/80 text-slate-300 border-white/10';

                    if (refSrc === 'yandex' || (v.referer || '').includes('yandex')) {
                      refIcon = '🇷🇺';
                      refName = 'Yandex Arama';
                      refBadge = 'bg-red-500/20 text-red-300 border-red-500/30';
                    } else if (refSrc === 'google' || (v.referer || '').includes('google')) {
                      refIcon = '🌐';
                      refName = 'Google Arama';
                      refBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                    } else if (refSrc === 'x' || (v.referer || '').includes('t.co')) {
                      refIcon = '🐦';
                      refName = 'X (Twitter)';
                      refBadge = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
                    } else if (refSrc === 'whatsapp') {
                      refIcon = '💬';
                      refName = 'WhatsApp';
                      refBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    }

                    const elapsedSec = Math.max(1, Math.round((Date.now() - new Date(v.createdAt).getTime()) / 1000));
                    const timeStr = elapsedSec < 60 ? `${elapsedSec} sn önce` : `${Math.floor(elapsedSec / 60)} dk önce`;

                    return (
                      <div 
                        key={v._id || idx} 
                        className={`p-4 sm:p-5 rounded-3xl bg-[#161b22] border transition-all flex flex-col gap-3 shadow-lg hover:shadow-2xl group ${
                          isListing 
                            ? 'border-amber-500/30 hover:border-amber-400/80 bg-gradient-to-r from-amber-500/5 via-[#161b22] to-transparent' 
                            : 'border-[#30363d] hover:border-emerald-500/50 bg-[#161b22]'
                        }`}
                      >
                        {/* Üst Bar: Ziyaretçi Profili + Canlı Süre + Kaynak */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#21262d] border border-[#30363d] flex items-center justify-center shrink-0">
                              {v.device === 'mobile' ? (
                                <Smartphone className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Monitor className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-white flex items-center gap-1.5 font-heading">
                                <span>📍 {v.city || 'İstanbul'}</span>
                              </span>
                              <span className="text-[11px] text-[#8b949e] font-mono">
                                • {v.browser || 'Tarayıcı'} / {v.os || (v.device === 'mobile' ? 'Mobile OS' : 'Desktop')}
                              </span>
                              {v.ip && (
                                <span className="text-[10px] text-[#8b949e] font-mono px-2 py-0.5 rounded-lg bg-[#0d1117] border border-[#30363d]">
                                  {v.ip}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-black border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              {timeStr}
                            </span>
                            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border ${refBadge}`}>
                              {refIcon} {refName}
                            </span>
                          </div>
                        </div>

                        {/* Alt Bar: Ziyaret Edilen Sayfa & Detaylar */}
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1117] border border-[#21262d] flex items-center justify-between gap-3 group-hover:border-[#30363d] transition-colors">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {isListing ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black font-heading tracking-wider flex items-center gap-1">
                                  <Crown className="w-3 h-3" /> İLAN İNCELİYOR
                                </span>
                              ) : isSearch ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black font-heading tracking-wider flex items-center gap-1">
                                  <Search className="w-3 h-3" /> SİTE İÇİ ARAMA
                                </span>
                              ) : isCity ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black font-heading tracking-wider flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> ŞEHİR / İLÇE VİTRİNİ
                                </span>
                              ) : isHome ? (
                                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black font-heading tracking-wider">
                                  🏠 ANA SAYFA VİTRİNİ
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold">
                                  📄 SAYFA
                                </span>
                              )}

                              <span className="font-mono text-xs text-amber-400 font-bold truncate max-w-[280px] sm:max-w-md">
                                {v.path}
                              </span>
                            </div>

                            <span className="text-xs sm:text-sm text-white font-bold truncate">
                              {v.pageTitle || 'Best Eskort Vitrini'}
                            </span>

                            {v.searchKeyword && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-xl w-fit">
                                <Search className="w-3 h-3 text-cyan-400" />
                                <span>Aranan Anahtar Kelime: <strong>&quot;{v.searchKeyword}&quot;</strong></span>
                              </div>
                            )}
                          </div>

                          <Link 
                            href={v.path || '#'} 
                            target="_blank"
                            className="px-4 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 text-xs font-black font-heading shrink-0 flex items-center gap-1.5 transition-all shadow-md group-hover:scale-105"
                          >
                            <span>Sayfayı Aç</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Alt Footer Bar */}
              <div className="p-4 sm:p-5 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between shrink-0">
                <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sistem her 15 saniyede bir yeni ziyaretçi hareketlerini otomatik çeker.</span>
                </span>
                <button
                  onClick={() => {
                    setShowActiveVisitorsModal(false);
                    setActiveTab('live_visitors');
                  }}
                  className="px-4 py-2 rounded-2xl bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-xs font-black font-heading flex items-center gap-1.5 transition-all"
                >
                  <span>Tüm Canlı Akış Loglarına Git</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      </div>
  );
}
