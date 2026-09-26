'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  ChevronLeft, 
  RefreshCw, 
  Users, 
  ShieldCheck, 
  Bot, 
  Globe, 
  Calendar, 
  Sparkles, 
  Clock, 
  Activity, 
  Flame, 
  Eye, 
  Search, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Layers, 
  TrendingUp, 
  Compass, 
  MapPin, 
  Filter,
  ShieldAlert,
  Smartphone,
  Monitor
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import CircularProgress from '@/components/common/CircularProgress';
import PullToRefresh from '@/components/common/PullToRefresh';

export default function DeepAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>('all'); // all, today, yesterday, week, month, custom
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchDeepAnalytics = async (customRange?: string) => {
    setLoading(true);
    const targetRange = customRange || range;
    let url = `/api/admin/deep-analytics?range=${targetRange}`;
    if (targetRange === 'custom') {
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
    }

    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeepAnalytics('all');
  }, []);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    if (newRange !== 'custom') {
      fetchDeepAnalytics(newRange);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return alert('Lütfen başlangıç tarihi seçin.');
    fetchDeepAnalytics('custom');
  };

  const handleCopySummary = () => {
    if (!data) return;
    const { overview, userLoyalty, conversions } = data;
    const summaryText = `📊 BMS DERİN ANALİTİK RAPORU (${range.toUpperCase()}):
- Toplam Ham Hit: ${overview?.rawTotalPageviews?.toLocaleString('tr-TR')}
- Gerçek İnsan Ziyareti: ${overview?.humanPageviews?.toLocaleString('tr-TR')} (%${overview?.humanPercentOfTotal})
- Bot / Crawler Hit: ${overview?.botTotalPageviews?.toLocaleString('tr-TR')} (%${overview?.botPercentOfTotal})
- Tekil Gerçek Ziyaretçi: ${userLoyalty?.totalUniqueHumans?.toLocaleString('tr-TR')}
- Tekrar Eden Ziyaretçi Oranı (Retention): %${userLoyalty?.repeatRatePercent}
- Çoklu Oturum Ziyaretçileri: ${userLoyalty?.multiSessionUsers?.toLocaleString('tr-TR')} (%${userLoyalty?.multiSessionRatePercent})
- Toplam WhatsApp Tıklaması: ${conversions?.totalWhatsappClicks?.toLocaleString('tr-TR')}
- WhatsApp Dönüşüm Oranı (CR): %${conversions?.overallConversionRatePercent}
Oluşturulma Zamanı: ${new Date().toLocaleString('tr-TR')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const overview = data?.overview || {};
  const loyalty = data?.userLoyalty || {};
  const breakdowns = data?.breakdowns || {};
  const conversions = data?.conversions || {};

  const filteredUsers = (loyalty.topActiveUsers || []).filter((u: any) => {
    if (!userSearchTerm) return true;
    const term = userSearchTerm.toLowerCase();
    return (
      (u.visitorId || '').toLowerCase().includes(term) ||
      (u.city || '').toLowerCase().includes(term) ||
      (u.device || '').toLowerCase().includes(term) ||
      (u.os || '').toLowerCase().includes(term)
    );
  });

  const sourceTotal = Object.values(breakdowns.sources || {}).reduce((a: number, b: any) => a + Number(b), 0) || 1;

  return (
    <PullToRefresh onRefresh={() => fetchDeepAnalytics()} isRefreshing={loading}>
      <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-full text-left">
        
        {/* ── 1. ÜST KURUMSAL HEADER & KONTROL MASASI (100% RESPONSIVE) ──────────────── */}
        <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              href="/bms-secure-portal"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-amber-400 hover:text-amber-300 flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md"
              title="Ana Yönetim Paneline Dön"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <h1 className="font-heading font-black text-base sm:text-2xl text-white tracking-tight truncate">
                  Derin Analitik &amp; Müdavim Ziyaretçi Masası
                </h1>
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black font-heading shrink-0 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  KURUMSAL RAPORLAMA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8b949e] truncate mt-0.5">
                Bot filtreleme, kullanıcı sadakat piramidi, müdavimlerin oturum süreleri ve WhatsApp dönüşüm analizi.
              </p>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
            <button
              onClick={handleCopySummary}
              disabled={!data || loading}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-white border border-[#30363d] font-bold text-xs transition-all active:scale-95 shadow-sm"
              title="Rapor Özetini Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span className="font-heading font-black">{copied ? 'Kopyalandı!' : 'Özeti Kopyala'}</span>
            </button>

            <button
              onClick={() => fetchDeepAnalytics()}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-xs transition-all active:scale-95 shadow-sm shrink-0"
              title="Verileri Yeniden Hesapla"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-heading font-black">Yeniden Hesapla</span>
            </button>
          </div>
        </div>

        {/* ── TARİH FİLTRESİ BUTONLARI & ÖZEL TARİH SEÇİCİ ──────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#21262d]">
          {/* Preset Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 bg-[#0d1117] p-1 rounded-2xl border border-[#21262d] gap-1 w-full lg:w-auto">
            {[
              { id: 'all', label: 'Tüm Zamanlar' },
              { id: 'today', label: 'Bugün' },
              { id: 'yesterday', label: 'Dün' },
              { id: 'week', label: 'Son 7 Gün' },
              { id: 'month', label: 'Son 30 Gün' },
              { id: 'custom', label: 'Özel Tarih 📅' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => handleRangeChange(r.id)}
                className={`py-2 px-3 text-center text-[11px] sm:text-xs font-black rounded-xl transition-all truncate font-heading ${
                  range === r.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black scale-[1.02]'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Custom Date Form */}
          {range === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 flex-wrap sm:flex-nowrap bg-[#0d1117] p-2 rounded-2xl border border-amber-500/30 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                <span>Başlangıç:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                <span>Bitiş:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-heading font-black transition-all"
              >
                Uygula
              </button>
            </form>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div className="min-h-[55vh] flex flex-col items-center justify-center bg-[#161b22] border border-[#30363d] rounded-3xl p-6 sm:p-12 shadow-2xl w-full">
          <CircularProgress
            size="xl"
            title="Derin Analitik Modelleri Hesaplanıyor..."
            subtitle="Canlı veritabanı taranıyor ve filtreleme matrisleri çalıştırılıyor"
            steps={[
              'Ziyaretçi veritabanı taranıyor...',
              'Arama motorları ve bot filtreleri ayrıştırılıyor...',
              'Kullanıcı oturumları ve sadakat piramidi oluşturuluyor...',
              'WhatsApp randevu dönüşümleri ve şehir istatistikleri birleştiriliyor...',
            ]}
          />
        </div>
      ) : (
        <div className="relative flex flex-col gap-5 sm:gap-6 w-full">
          {/* Recalculating Overlay */}
          {loading && data && (
            <div className="absolute inset-0 z-30 bg-[#0d1117]/80 backdrop-blur-md rounded-3xl flex items-center justify-center animate-fadeIn">
              <div className="p-6 rounded-3xl bg-[#161b22] border border-[#30363d] shadow-2xl">
                <CircularProgress
                  size="md"
                  title="Tarih Aralığı Güncelleniyor..."
                  steps={[
                    'Seçili tarih aralığı filtreleniyor...',
                    'Sadakat metrikleri güncelleniyor...',
                  ]}
                />
              </div>
            </div>
          )}

          {/* ── 2. ANA METRİKLER (HAM VS TEMİZ İNSAN HIT) ──────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 w-full">
            
            {/* Toplam Ham Hit vs Temiz Hit */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-heading font-bold text-[#8b949e] uppercase tracking-wider">
                  Sayfa Görüntüleme
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                  %{overview.humanPercentOfTotal || 0} İnsan
                </span>
              </div>
              <div className="my-2.5 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
                    {overview.humanPageviews?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-xs text-[#8b949e]">Temiz Hit</span>
                </div>
                <span className="text-[11px] text-[#8b949e] mt-0.5">
                  Ham Toplam: <strong className="text-white font-mono">{overview.rawTotalPageviews?.toLocaleString('tr-TR') || 0}</strong> ({overview.botTotalPageviews?.toLocaleString('tr-TR') || 0} bot elendi)
                </span>
              </div>
              <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-1000" 
                  style={{ width: `${overview.humanPercentOfTotal || 90}%` }}
                />
                <div 
                  className="bg-red-500/70 h-full transition-all duration-1000" 
                  style={{ width: `${overview.botPercentOfTotal || 10}%` }}
                />
              </div>
            </div>

            {/* Gerçek Tekil Ziyaretçi */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-heading font-bold text-[#8b949e] uppercase tracking-wider">
                  Gerçek Tekil Kişi
                </span>
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2.5 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-white">
                    {loyalty.totalUniqueHumans?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-xs text-blue-400">Tekil İnsan</span>
                </div>
                <span className="text-[11px] text-[#8b949e] mt-0.5">
                  Toplam Oturum: <strong className="text-white font-mono">{overview.humanTotalSessions?.toLocaleString('tr-TR') || 0}</strong>
                </span>
              </div>
              <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Tekil cihaz &amp; parmak izi filtrelenmiş</span>
              </span>
            </div>

            {/* Tekrar Giriş / Sadakat Oranı (Retention) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-heading font-bold text-[#8b949e] uppercase tracking-wider">
                  Müdavim &amp; Sadakat
                </span>
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2.5 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-amber-400">
                    %{loyalty.repeatRatePercent || 0}
                  </span>
                  <span className="text-xs text-[#8b949e]">Geri Dönüş</span>
                </div>
                <span className="text-[11px] text-[#8b949e] mt-0.5">
                  Çoklu Oturum: <strong className="text-white font-mono">{loyalty.multiSessionUsers?.toLocaleString('tr-TR') || 0}</strong> (%{loyalty.multiSessionRatePercent})
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Siteyi 2+ kez ziyaret eden kitle</span>
              </span>
            </div>

            {/* WhatsApp Randevu Dönüşümü */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-heading font-bold text-[#8b949e] uppercase tracking-wider">
                  WhatsApp Randevu (CR)
                </span>
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-current" />
                </div>
              </div>
              <div className="my-2.5 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
                    {conversions.totalWhatsappClicks?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-xs text-[#8b949e]">Tıklama</span>
                </div>
                <span className="text-[11px] text-[#8b949e] mt-0.5">
                  Dönüşüm Oranı: <strong className="text-emerald-400 font-mono">%{conversions.overallConversionRatePercent || 0}</strong>
                </span>
              </div>
              <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>İlan sahibine direkt yazanlar</span>
              </span>
            </div>
          </div>

          {/* ── 3. BOT ANALİZİ & ZİYARETÇİ RETENTION PİRAMİDİ (FULL WIDTH GRID) ──────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
            
            {/* Ziyaretçi Sadakat & Gezinme Derinliği Piramidi (7 Cols) */}
            <div className="lg:col-span-7 p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h2 className="font-heading font-black text-sm sm:text-base text-white">
                    Ziyaretçi Gezinme &amp; Sadakat Dağılımı
                  </h2>
                </div>
                <span className="text-xs text-[#8b949e] font-mono">
                  {loyalty.totalUniqueHumans?.toLocaleString('tr-TR')} Tekil Kullanıcı
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  {
                    label: '1 Giriş / Sayfa (Hemen Çıkan)',
                    count: loyalty.singleVisitUsers || 0,
                    color: 'bg-slate-700',
                    textColor: 'text-slate-400',
                    desc: 'Siteye tek sayfa bakıp çıkanlar',
                  },
                  {
                    label: '2 - 3 Sayfa Gezenler',
                    count: loyalty.repeat2to3Users || 0,
                    color: 'bg-blue-500',
                    textColor: 'text-blue-400',
                    desc: 'İlanları yüzeysel inceleyenler',
                  },
                  {
                    label: '4 - 10 Sayfa Gezenler',
                    count: loyalty.repeat4to10Users || 0,
                    color: 'bg-emerald-500',
                    textColor: 'text-emerald-400',
                    desc: 'Aktif ilan karşılaştıran kullanıcılar',
                  },
                  {
                    label: '11 - 50 Sayfa (Ciddi Müdavimler)',
                    count: loyalty.repeat11to50Users || 0,
                    color: 'bg-amber-500',
                    textColor: 'text-amber-400',
                    desc: 'Sürekli girip ilan arayan kitle',
                  },
                  {
                    label: '50+ Sayfa (Super Loyals 🔥)',
                    count: loyalty.superLoyal50PlusUsers || 0,
                    color: 'bg-rose-500',
                    textColor: 'text-rose-400',
                    desc: 'Düzenli bağımlı / müdavim ziyaretçiler',
                  },
                ].map((item, idx) => {
                  const percent = Math.round(((item.count / (loyalty.totalUniqueHumans || 1)) * 100));
                  return (
                    <div key={idx} className="flex flex-col gap-1 p-3 rounded-2xl bg-[#0d1117] border border-[#21262d]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-heading font-bold text-white flex items-center gap-1.5">
                          <span>{item.label}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{item.count?.toLocaleString('tr-TR')}</span>
                          <span className={`font-mono text-[11px] font-bold ${item.textColor}`}>%{percent}</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] text-[#8b949e]">{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Elenen Botlar & Güvenlik Özeti (5 Cols) */}
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-heading font-black text-sm sm:text-base text-white">
                    Bot Filtreleme Raporu
                  </h2>
                </div>
                <span className="text-xs text-red-400 font-mono font-bold">
                  {overview.botTotalPageviews?.toLocaleString('tr-TR')} Bot Hit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-blue-400">Arama Motorları</span>
                    <Globe className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {overview.botBreakdown?.search_engine?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">Googlebot, YandexBot, Bing</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-purple-400">Veri Merkezi IP</span>
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {overview.botBreakdown?.datacenter_bot?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">Hetzner, OVH, AWS IPleri</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-amber-400">Otomasyon Bot</span>
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {overview.botBreakdown?.automation_scraper?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">Puppeteer, Scrapy, Headless</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-emerald-400">Atak / Tarama</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-mono font-black text-white">
                    {overview.botBreakdown?.scanner_attack?.toLocaleString('tr-TR') || 0}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">.env, wp-admin taramaları</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Filtreleme aktiftir; aşağıdaki tüm tablolar <strong>%100 saf insan verisidir</strong>.
                </span>
              </div>
            </div>
          </div>

          {/* ── 4. 👑 EN ÇOK GİREN MÜDAVİM KULLANICILAR TABLOSU (WIDE VIEW) ──────────────── */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-4 shadow-xl w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                  👑
                </div>
                <div>
                  <h2 className="font-heading font-black text-sm sm:text-base text-white">
                    En Aktif Müdavim Ziyaretçiler (Top Loyal Visitors)
                  </h2>
                  <p className="text-[11px] text-[#8b949e]">
                    Sitede en çok sayfa gezen, en çok oturum açan ve en uzun süre kalan gerçek ziyaretçiler.
                  </p>
                </div>
              </div>

              {/* Kullanıcı Arama Inputu */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Şehir, cihaz, IP veya ID ara..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 w-full sm:w-72"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#21262d] w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0d1117] text-[#8b949e] border-b border-[#21262d]">
                    <th className="p-3.5 font-heading font-bold">Ziyaretçi ID</th>
                    <th className="p-3.5 font-heading font-bold">Şehir / Konum</th>
                    <th className="p-3.5 font-heading font-bold">Cihaz &amp; OS</th>
                    <th className="p-3.5 font-heading font-bold text-center">Gezilen Sayfa</th>
                    <th className="p-3.5 font-heading font-bold text-center">Oturum</th>
                    <th className="p-3.5 font-heading font-bold text-center">Farklı Sayfa</th>
                    <th className="p-3.5 font-heading font-bold text-center">Süre</th>
                    <th className="p-3.5 font-heading font-bold">İlk &amp; Son Görülme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262d]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#8b949e]">
                        Aramaya uygun müdavim ziyaretçi bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u: any, idx: number) => {
                      const isSuper = u.pageviews >= 50;
                      const isMulti = u.sessionsCount > 1;

                      return (
                        <tr key={idx} className="hover:bg-[#1f242c] transition-colors">
                          <td className="p-3.5 font-mono font-bold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#21262d] text-[#8b949e] text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[140px]">{u.visitorId}</span>
                            {isSuper && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black shrink-0">
                                SADIK 🔥
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1.5 font-heading font-bold text-[#f0f6fc]">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{u.city}</span>
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col">
                              <span className="text-white font-medium capitalize">
                                {u.device === 'desktop' ? '💻 Masaüstü' : '📱 Mobil'}
                              </span>
                              <span className="text-[10px] text-[#8b949e]">{u.os} {u.browser !== 'Unknown' ? `(${u.browser})` : ''}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-black">
                              {u.pageviews}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold ${isMulti ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-[#8b949e]'}`}>
                              {u.sessionsCount}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300 font-bold">
                            {u.distinctPathsCount}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                            {u.totalDurationMinutes > 0 ? `${u.totalDurationMinutes} dk` : `${u.totalDurationSeconds}s`}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col text-[10px] text-[#8b949e] font-mono">
                              <span>İlk: {new Date(u.firstSeen).toLocaleDateString('tr-TR')} {new Date(u.firstSeen).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-slate-300">Son: {new Date(u.lastSeen).toLocaleDateString('tr-TR')} {new Date(u.lastSeen).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 5. TRAFİK KAYNAKLARI, ŞEHİRLER & WHATSAPP LİSTELERİ ──────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            
            {/* Trafik Kaynakları */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-sm text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Trafik Kaynakları</span>
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {Object.entries(breakdowns.sources || {})
                  .sort((a: any, b: any) => b[1] - a[1])
                  .map(([src, count]: any, idx: number) => {
                    const percent = Math.round((count / sourceTotal) * 100);
                    return (
                      <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-xl bg-[#0d1117] border border-[#21262d]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white capitalize">{src}</span>
                          <span className="font-mono text-amber-400">{count?.toLocaleString('tr-TR')} (%{percent})</span>
                        </div>
                        <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* En Çok Trafik Gelen Şehirler */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-sm text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>En Çok Ziyaret Alan Şehirler</span>
                </h3>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {(breakdowns.topCities || []).map(([city, count]: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1117] border border-[#21262d] text-xs">
                    <span className="font-heading font-bold text-white flex items-center gap-1.5">
                      <span className="text-[#8b949e] font-mono text-[10px]">#{idx + 1}</span>
                      <span>{city}</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">{count?.toLocaleString('tr-TR')} Hit</span>
                  </div>
                ))}
              </div>
            </div>

            {/* En Çok WhatsApp Tıklaması Alan İlanlar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-sm text-white flex items-center gap-2">
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-current text-emerald-400" />
                  <span>En Çok WhatsApp Alan İlanlar</span>
                </h3>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                {(conversions.topWhatsappListings || []).map(([title, count]: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1117] border border-[#21262d] text-xs">
                    <span className="font-heading font-bold text-white truncate max-w-[200px] flex items-center gap-1.5">
                      <span className="text-[#8b949e] font-mono text-[10px]">#{idx + 1}</span>
                      <span className="truncate">{title}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-black shrink-0">
                      {count} Tık
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
    </PullToRefresh>
  );
}
