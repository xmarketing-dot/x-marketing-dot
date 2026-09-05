'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Globe, 
  Users, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  Server, 
  MessageSquare, 
  BarChart3, 
  Award, 
  LayoutDashboard, 
  KeyRound 
} from 'lucide-react';
import CorporateLogo from '@/components/common/CorporateLogo';
import HeaderTicker from '@/components/common/HeaderTicker';
import SeoBacklinkFooter from '@/components/common/SeoBacklinkFooter';
import GlobalChatNotification from '@/components/common/GlobalChatNotification';
import SpecialAdPopup from '@/components/common/SpecialAdPopup';
import AdsterraBanner320x50 from '@/components/ads/AdsterraBanner320x50';
import AdsterraNativeBanner from '@/components/ads/AdsterraNativeBanner';

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const isSecurePortal = pathname?.startsWith('/bms-secure-portal');
  const isChatPage = pathname === '/chat';
  const isPanelimPage = pathname === '/panelim';
  const [activeRegion, setActiveRegion] = useState<string>('marmara');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUserStatus = () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('currentUser');
        const pwd = localStorage.getItem('my_listing_panel_password');
        const hasChat = localStorage.getItem('best_eskort_chat_thread_id');
        const hasListing = localStorage.getItem('last_created_listing_id');
        setIsLoggedIn(!!user || !!pwd || !!hasChat || !!hasListing);
      }
    };

    checkUserStatus();
    window.addEventListener('storage', checkUserStatus);
    return () => window.removeEventListener('storage', checkUserStatus);
  }, [pathname]);

  // Secure portal routes render standard full-screen desktop dashboard layout
  if (isSecurePortal) {
    return <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans overflow-x-hidden">{children}</div>;
  }

  // Standalone Fullscreen Native Chat Layout (No outer headers or dual scrolls)
  if (isChatPage) {
    return (
      <div className="h-[100dvh] w-full bg-[#0d1117] text-[#f0f6fc] font-sans overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  // Reklam Ver & İlan Ver gibi özel form sayfaları desktopta ajans ana sayfası yerine kendi form içeriklerini gösterir
  const isDedicatedFormPage = pathname === '/reklam-ver' || pathname === '/ilan-ver' || pathname?.startsWith('/ilan-duzenle');
  if (isDedicatedFormPage) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans overflow-x-hidden flex flex-col">
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <SeoBacklinkFooter />
        <GlobalChatNotification />
      </div>
    );
  }

  // Panelim route renders dedicated clean dashboard without public website header/ticker
  if (isPanelimPage) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans overflow-x-hidden">
        {children}
        <GlobalChatNotification />
      </div>
    );
  }

  const regionsData: Record<string, { title: string; cities: { name: string; slug: string; listings: string }[] }> = {
    marmara: {
      title: 'Marmara Bölgesi Kurumsal Pazarlama Ağı',
      cities: [
        { name: 'İstanbul', slug: 'istanbul', listings: '4.850+ Aktif Bölgesel İlan' },
        { name: 'Bursa', slug: 'bursa', listings: '1.240+ Aktif Bölgesel İlan' },
        { name: 'Tekirdağ', slug: 'tekirdag', listings: '820+ Aktif Bölgesel İlan' },
        { name: 'Kocaeli', slug: 'kocaeli', listings: '960+ Aktif Bölgesel İlan' },
        { name: 'Balıkesir', slug: 'balikesir', listings: '540+ Aktif Bölgesel İlan' },
        { name: 'Çanakkale', slug: 'canakkale', listings: '430+ Aktif Bölgesel İlan' },
      ],
    },
    ege: {
      title: 'Ege Bölgesi Kurumsal Pazarlama Ağı',
      cities: [
        { name: 'İzmir', slug: 'izmir', listings: '2.450+ Aktif Bölgesel İlan' },
        { name: 'Muğla', slug: 'mugla', listings: '1.180+ Aktif Bölgesel İlan' },
        { name: 'Aydın', slug: 'aydin', listings: '760+ Aktif Bölgesel İlan' },
        { name: 'Denizli', slug: 'denizli', listings: '620+ Aktif Bölgesel İlan' },
        { name: 'Manisa', slug: 'manisa', listings: '490+ Aktif Bölgesel İlan' },
      ],
    },
    akdeniz: {
      title: 'Akdeniz Bölgesi Kurumsal Pazarlama Ağı',
      cities: [
        { name: 'Antalya', slug: 'antalya', listings: '2.100+ Aktif Bölgesel İlan' },
        { name: 'Adana', slug: 'adana', listings: '890+ Aktif Bölgesel İlan' },
        { name: 'Mersin', slug: 'mersin', listings: '740+ Aktif Bölgesel İlan' },
        { name: 'Hatay', slug: 'hatay', listings: '410+ Aktif Bölgesel İlan' },
      ],
    },
    icanadolu: {
      title: 'İç Anadolu Bölgesi Kurumsal Pazarlama Ağı',
      cities: [
        { name: 'Ankara', slug: 'ankara', listings: '3.150+ Aktif Bölgesel İlan' },
        { name: 'Konya', slug: 'konya', listings: '820+ Aktif Bölgesel İlan' },
        { name: 'Kayseri', slug: 'kayseri', listings: '610+ Aktif Bölgesel İlan' },
        { name: 'Eskişehir', slug: 'eskisehir', listings: '580+ Aktif Bölgesel İlan' },
      ],
    },
    karadeniz: {
      title: 'Karadeniz Bölgesi Kurumsal Pazarlama Ağı',
      cities: [
        { name: 'Samsun', slug: 'samsun', listings: '710+ Aktif Bölgesel İlan' },
        { name: 'Trabzon', slug: 'trabzon', listings: '590+ Aktif Bölgesel İlan' },
        { name: 'Ordu', slug: 'ordu', listings: '380+ Aktif Bölgesel İlan' },
        { name: 'Rize', slug: 'rize', listings: '320+ Aktif Bölgesel İlan' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#080b0f] text-[#f0f6fc] font-sans selection:bg-amber-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      
      {/* ── 1. FULL-WIDTH DESKTOP KURUMSAL AJANS & BÖLGESEL PAZARLAMA GÖRÜNÜMÜ ──────────────── */}
      <div className="hidden md:flex flex-col min-h-screen bg-[#080b0f] w-full max-w-full overflow-x-hidden relative">
        
        {/* TOP DESKTOP SPONSOR BANNER ŞERİDİ */}
        <div className="w-full bg-[#0d1117] border-b border-[#30363d]/80 py-2 px-8 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <AdsterraBanner320x50 />
          </div>
        </div>

        {/* MASAÜSTÜ SOL VE SAĞ SABİT YAN KULE (STICKY SKYSCRAPERS / TOWER REKLAMLAR) */}
        <aside aria-label="Sponsor Reklam Alanı" className="hidden 2xl:flex flex-col fixed left-4 top-28 z-30 w-[140px] pointer-events-auto">
          <div className="p-3 rounded-2xl bg-[#161b22]/90 border border-amber-500/30 backdrop-blur-md shadow-2xl flex flex-col items-center text-center gap-2">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider font-heading">VIP SPONSOR</span>
            <div className="scale-90 origin-top">
              <AdsterraBanner320x50 />
            </div>
            <Link href="/reklam-ver" className="text-[9px] text-gray-400 hover:text-white underline">Reklam Ver</Link>
          </div>
        </aside>

        <aside aria-label="Sponsor Reklam Alanı" className="hidden 2xl:flex flex-col fixed right-4 top-28 z-30 w-[140px] pointer-events-auto">
          <div className="p-3 rounded-2xl bg-[#161b22]/90 border border-pink-500/30 backdrop-blur-md shadow-2xl flex flex-col items-center text-center gap-2">
            <span className="text-[9px] font-black text-pink-400 uppercase tracking-wider font-heading">ÖZEL VİTRİN</span>
            <div className="scale-90 origin-top">
              <AdsterraBanner320x50 />
            </div>
            <Link href="/reklam-ver" className="text-[9px] text-gray-400 hover:text-white underline">Reklam Ver</Link>
          </div>
        </aside>
        
        {/* Full-Width Corporate Main Body */}
        <main className="flex-1 flex flex-col gap-14 w-full px-8 lg:px-16 py-8 max-w-full overflow-x-hidden">
          
          {/* Embedded Corporate Brand Hero Banner with Slogan */}
          <section className="p-10 lg:p-14 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
            
            <div className="flex flex-col gap-6 flex-1 max-w-3xl z-10 text-left">
              
              {/* EMBEDDED BRAND EMBLEM & TITLE */}
              <div className="flex items-center gap-3.5 group">
                <CorporateLogo className="w-12 h-12" />
                <div className="flex flex-col">
                  <span className="font-black text-2xl text-white tracking-tight font-heading group-hover:text-amber-400 transition-colors">
                    Best Marketing Services
                  </span>
                  <span className="text-xs text-amber-400 font-bold tracking-wider flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Türkiye Kurumsal Bölgesel Pazarlama &amp; Dijital Medya A.Ş.
                  </span>
                </div>
              </div>

              <div className="font-black text-3xl lg:text-5xl text-white font-heading leading-tight tracking-tight">
                Bölgesel Dijital Pazarlama ve <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200">VIP İlan Çözümleri</span>
              </div>

              <p className="text-base text-[#8b949e] leading-relaxed max-w-2xl">
                81 İlde Kesintisiz İletişim, Doğrulanmış Profil Vitrinleri ve Anında Müşteri Dönüşümü. Türkiye'nin en gelişmiş bölgesel pazarlama altyapısı ile hedef kitlenize anında ulaşın.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/ilan-ver"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider font-heading shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Hemen İlan Verin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/chat"
                  className="px-8 py-4 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white font-black text-sm uppercase tracking-wider font-heading border border-[#30363d] active:scale-95 transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Canlı Destek Hattı</span>
                </Link>
              </div>

            </div>

            {/* Quick Metrics Badge Container */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-96 shrink-0 z-10">
              <div className="p-6 rounded-2xl bg-[#0d1117]/80 border border-[#30363d] backdrop-blur-md flex flex-col gap-1">
                <span className="text-3xl font-black text-amber-400 font-heading">81 İl</span>
                <span className="text-xs text-[#8b949e]">Tam Kapsamlı Ağ</span>
              </div>
              <div className="p-6 rounded-2xl bg-[#0d1117]/80 border border-[#30363d] backdrop-blur-md flex flex-col gap-1">
                <span className="text-3xl font-black text-emerald-400 font-heading">%100</span>
                <span className="text-xs text-[#8b949e]">Doğrulanmış Profil</span>
              </div>
              <div className="p-6 rounded-2xl bg-[#0d1117]/80 border border-[#30363d] backdrop-blur-md flex flex-col gap-1">
                <span className="text-3xl font-black text-blue-400 font-heading">0ms</span>
                <span className="text-xs text-[#8b949e]">Anlık SSE Canlı Sohbet</span>
              </div>
              <div className="p-6 rounded-2xl bg-[#0d1117]/80 border border-[#30363d] backdrop-blur-md flex flex-col gap-1">
                <span className="text-3xl font-black text-purple-400 font-heading">24/7</span>
                <span className="text-xs text-[#8b949e]">Kesintisiz Yayın</span>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </section>

          {/* Desktop İçerik Arası 4:1 Sponsor Vitrini */}
          <div className="w-full max-w-5xl mx-auto">
            <AdsterraNativeBanner />
          </div>

          {/* Corporate Ecosystem Features */}
          <section className="flex flex-col lg:flex-row items-center gap-12 text-left">
            <div className="flex-1 flex flex-col gap-6">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-heading">
                Kurumsal Standartlar
              </span>
              
              <h2 className="font-black text-2xl lg:text-4xl text-white font-heading leading-tight">
                Dijital Pazarlamada <span className="text-amber-400">Güven ve Hız</span> Esaslı Kurumsal Yönetim
              </h2>

              <p className="text-sm text-[#8b949e] leading-relaxed">
                Yüksek çözünürlüklü Sharp WebP görsel sıkıştırma motorumuz, Server-Sent Events (SSE) ile 0ms gecikmeli canlı sohbetimiz ve kripto şifreli ödeme altyapımızla Türkiye'nin en modern pazarlama ekosistemini sunuyoruz.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1">
                  <span className="font-bold text-sm text-white">Anlık Google İndeksi</span>
                  <span className="text-xs text-[#8b949e]">Her gün otomatik SSG/ISR güncellemesi.</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d] flex flex-col gap-1">
                  <span className="font-bold text-sm text-white">Kesintisiz Güvenlik</span>
                  <span className="text-xs text-[#8b949e]">KVKK veri koruma standartları.</span>
                </div>
              </div>
            </div>

            {/* Boardroom Analytics Corporate Image */}
            <div className="flex-1 max-w-2xl w-full relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#30363d] shadow-2xl group bg-[#161b22]">
              <Image
                src="/images/corporate_services.jpg"
                alt="Best Marketing Services Boardroom Analytics"
                fill
                sizes="(max-width: 1024px) 100vw, 672px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-50"></div>
            </div>
          </section>

          {/* Desktop Sponsorlu Banner Alanı */}
          <div className="w-full max-w-3xl mx-auto">
            <AdsterraBanner320x50 />
          </div>

          {/* Full-Width Interactive Türkiye Regional Network Hub */}
          <section className="p-10 lg:p-14 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-10 shadow-xl text-left">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-6 flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-black text-2xl lg:text-3xl text-white font-heading">Türkiye İnteraktif Bölgesel İlan Haritası</h2>
                <p className="text-sm text-[#8b949e]">81 ildeki kurumsal bölgesel pazarlama ağlarına erişin.</p>
              </div>

              {/* Region Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'marmara', label: 'Marmara' },
                  { id: 'ege', label: 'Ege' },
                  { id: 'akdeniz', label: 'Akdeniz' },
                  { id: 'icanadolu', label: 'İç Anadolu' },
                  { id: 'karadeniz', label: 'Karadeniz' },
                ].map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region.id)}
                    className={`px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all ${
                      activeRegion === region.id
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-[#0d1117] text-[#8b949e] hover:text-white border border-[#30363d]'
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Region Cities Grid */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-heading">
                {regionsData[activeRegion]?.title}
              </span>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {regionsData[activeRegion]?.cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-amber-500/50 flex flex-col gap-2 transition-all hover:scale-[1.02] group text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg text-white group-hover:text-amber-400 transition-colors font-heading">
                        {city.name} Bölgesi
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#8b949e] group-hover:text-amber-400 transition-colors" />
                    </div>
                    <span className="text-xs text-amber-400 font-bold">{city.listings}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Desktop Alt 4:1 Native Sponsor Vitrini */}
          <div className="w-full max-w-5xl mx-auto">
            <AdsterraNativeBanner />
          </div>
        </main>

        {/* SEO DOFOLLOW & NOFOLLOW BACKLINK NETWORK ALANI */}
        <SeoBacklinkFooter />

        {/* Full-Width Corporate Desktop Footer */}
        <footer className="px-8 lg:px-16 py-10 bg-[#090d13] border-t border-[#30363d] text-xs text-[#8b949e]">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <CorporateLogo className="w-8 h-8" />
              <span className="font-extrabold text-white text-sm font-heading">Best Marketing Services Kurumsal Bölgesel Pazarlama A.Ş.</span>
            </div>
            <span className="text-slate-400 font-medium">© 2026 Best Marketing Services. Tüm Hakları Saklıdır.</span>
          </div>
        </footer>
      </div>

      {/* ── 2. MOBİL UYGULAMA GÖRÜNÜMÜ (MOBILE-FIRST APP SHELL) ──────────────── */}
      <div className="md:hidden min-h-[100dvh] bg-[#0d1117] flex flex-col relative w-full max-w-full overflow-x-clip">

        {/* STICKY TOP HEADER BAR (Always visible, never disappears during page transitions) */}
        <div id="app-sticky-header" className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md">
          {/* TOP ANNOUNCEMENT TICKER */}
          <HeaderTicker />

          {/* MOBILE APP HEADER — Premium Global Brand Bar */}
          <header className="px-3.5 py-3 border-b border-[#30363d]/60 flex items-center justify-between w-full shadow-md">
            <Link href="/" className="flex items-center gap-2 group">
              <CorporateLogo className="text-2xl shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col leading-none text-left">
                <span className="font-black text-[14px] text-white font-heading tracking-tight group-hover:text-amber-400 transition-colors">
                  Best Eskort
                </span>
                <span className="text-[9px] text-amber-400/80 font-bold tracking-wider">
                  #1 İlan Platformu 👑
                </span>
              </div>
            </Link>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/sehirler"
                className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-white font-extrabold text-xs transition-all font-heading"
              >
                Şehirler
              </Link>

              {isLoggedIn ? (
                <Link
                  href="/panelim"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Panelim</span>
                </Link>
              ) : (
                <Link
                  href="/ilan-ver"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  İlan Ver
                </Link>
              )}
            </div>
          </header>
        </div>

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto pb-8 no-scrollbar w-full">
          {children}
          {/* Mobil Backlink Footer */}
          <SeoBacklinkFooter />
        </main>

        {/* Mobile-Only Sponsored VIP Ad Popup */}
        <SpecialAdPopup />
      </div>

      {/* Global Real-Time Chat Notifications */}
      <GlobalChatNotification />

    </div>
  );
}
