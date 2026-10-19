'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  LogOut, 
  Sliders,
  Settings, 
  List, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Globe,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Crown,
  Menu,
  X,
  Megaphone,
  Link2,
  Smartphone,
  Bell,
  BellRing,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import CorporateLogo from '@/components/common/CorporateLogo';
import AdminFloatingChat from './AdminFloatingChat';

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bms_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('bms_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const [badgeCounts, setBadgeCounts] = useState<{
    pendingListings: number;
    expiredListings: number;
    vitrinRequests: number;
    unreadChats: number;
    pendingBanners: number;
    activeBans: number;
    recentUsers: number;
    activeBacklinks: number;
    ilanlarBadge: number;
    anasayfaBadge: number;
    chatBadge: number;
    bannersBadge: number;
    guvenlikBadge: number;
    kullanicilarBadge: number;
  }>({
    pendingListings: 0,
    expiredListings: 0,
    vitrinRequests: 0,
    unreadChats: 0,
    pendingBanners: 0,
    activeBans: 0,
    recentUsers: 0,
    activeBacklinks: 0,
    ilanlarBadge: 0,
    anasayfaBadge: 0,
    chatBadge: 0,
    bannersBadge: 0,
    guvenlikBadge: 0,
    kullanicilarBadge: 0,
  });

  const pathname = usePathname();

  // Fetch badge counts
  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/admin/badge-counts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.counts) {
          setBadgeCounts(data.counts);
        }
      }
    } catch {
      // ignore
    }
  };

  // Check existing session and poll badges
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
        if (data.authenticated) {
          fetchBadges();
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Poll badges periodically if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBadges();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchBadges();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sifre }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setErrorMsg(data.error || 'Geçersiz e-posta veya şifre.');
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setEmail('');
      setSifre('');
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Loading state while checking session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center animate-spin text-amber-400">
            <Loader2 className="w-6 h-6" />
          </div>
          <span className="text-xs text-[#8b949e] font-mono">Güvenlik Doğrulanıyor...</span>
        </div>
      </div>
    );
  }

  // 2. UN-AUTHENTICATED: Show Secret Admin Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
        <div className="w-full max-w-md bg-[#161b22] border-2 border-amber-500/60 rounded-[36px] p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.2)] flex flex-col gap-6 text-center">
          
          {/* Logo & Gate Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/30">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-[#161b22] animate-pulse" />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-white font-heading tracking-tight">
                BMS Secure Gate
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                ● Yetkili Yönetici Giriş Portalı
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left font-heading">
            
            {/* E-Posta Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                Yönetici E-Posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@yonetim.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                />
                <Mail className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Şifre Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase text-[#8b949e] tracking-wider">
                Yönetici Şifresi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#0d1117] border border-[#30363d] text-white text-xs font-mono placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
                />
                <KeyRound className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#8b949e] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[3]" />
                  <span>Güvenli Giriş Yap ➔</span>
                </>
              )}
            </button>

          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-[#8b949e]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>256-Bit SHA-256 Korumalı Yönetim Altyapısı</span>
          </div>

        </div>
      </div>
    );
  }

  const getNavClass = (path: string) => {
    const isActive = pathname === path || (path === '/bms-secure-portal/bildirimler' && pathname === '/bms-secure-portal/uygulama');
    return `flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2 xl:py-2.5'} rounded-xl transition-all text-xs font-semibold ${
      isActive 
        ? 'bg-slate-800 text-white border border-slate-700/60 shadow-sm' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
    }`;
  };

  // 3. AUTHENTICATED: Render Full Admin Portal Layout
  return (
    <div className="min-h-screen md:h-screen md:max-h-screen md:overflow-hidden bg-[#070a0f] text-[#f0f6fc] flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-[#0c1017] border-b border-slate-800/80 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <CorporateLogo className="w-7 h-7" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white tracking-tight">BMS Portal</span>
            <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Yönetici Aktif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Siteye Git</span>
          </Link>
        </div>
      </div>

      {/* Desktop Admin Sidebar (Collapsible & Expandable with Independent Scroll) */}
      <aside className={`hidden md:flex ${
        isSidebarCollapsed ? 'w-[72px] px-2 py-3' : 'w-64 xl:w-72 p-3.5 xl:p-4'
      } bg-[#0c1017] border-r border-slate-800/80 flex-col justify-between shrink-0 shadow-2xl h-full max-h-screen overflow-y-auto overscroll-contain select-none transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-track]:bg-transparent`}>
        <div className="flex flex-col gap-3.5">
          
          {/* Logo, Gate Badge & Collapse Toggle */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-2' : 'justify-between'} pb-3 border-b border-slate-800/70`}>
            {isSidebarCollapsed ? (
              <>
                <CorporateLogo className="w-8 h-8 shrink-0" />
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Menüyü Genişlet"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <CorporateLogo className="w-8 h-8 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white tracking-tight truncate">
                      BMS System Gate
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Süper Yönetici Aktif
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Menüyü Daralt (Icon Modu)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Links Grouped by Categories */}
          <nav className="flex flex-col gap-3 text-xs font-medium">
            
            {/* GRUP 1: CANLI AKIŞ & ANALİZ */}
            <div className="flex flex-col gap-1">
              {!isSidebarCollapsed ? (
                <span className="text-[10px] font-mono text-slate-500 px-2 font-bold tracking-wider uppercase">
                  Canlı Akış &amp; Analiz
                </span>
              ) : (
                <div className="h-px bg-slate-800/60 my-1 mx-1" />
              )}

              <Link
                href="/bms-secure-portal"
                prefetch={false}
                title="Trafik & Analizler"
                className={`${getNavClass('/bms-secure-portal')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 relative">
                  <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Trafik &amp; Analizler</span>}
                  {isSidebarCollapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Canlı İzleme Aktif" />
                )}
              </Link>

              <Link
                href="/bms-secure-portal/bildirimler"
                prefetch={false}
                title="Bildirim & Push Masası"
                className={`${getNavClass('/bms-secure-portal/bildirimler')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
                  {!isSidebarCollapsed && <span className="text-amber-300 truncate">Bildirim &amp; Push Masası</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 whitespace-nowrap">
                    PUSH
                  </span>
                )}
              </Link>
            </div>

            {/* GRUP 2: İÇERİK & MÜŞTERİ */}
            <div className="flex flex-col gap-1">
              {!isSidebarCollapsed ? (
                <span className="text-[10px] font-mono text-slate-500 px-2 font-bold tracking-wider uppercase">
                  İçerik &amp; Müşteri
                </span>
              ) : (
                <div className="h-px bg-slate-800/60 my-1 mx-1" />
              )}

              <Link
                href="/bms-secure-portal/ilanlar"
                prefetch={false}
                title="İlan Moderasyonu"
                className={`${getNavClass('/bms-secure-portal/ilanlar')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 relative">
                  <List className="w-4 h-4 text-slate-300 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">İlan Moderasyonu</span>}
                  {isSidebarCollapsed && badgeCounts.pendingListings > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                    {badgeCounts.pendingListings > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white shadow-sm shrink-0 whitespace-nowrap">
                        +{badgeCounts.pendingListings}
                      </span>
                    )}
                    {badgeCounts.expiredListings > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 whitespace-nowrap">
                        {badgeCounts.expiredListings} doldu
                      </span>
                    )}
                  </div>
                )}
              </Link>

              <Link
                href="/bms-secure-portal/kullanicilar"
                prefetch={false}
                title="Kullanıcı Hesapları"
                className={`${getNavClass('/bms-secure-portal/kullanicilar')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 relative">
                  <Users className="w-4 h-4 text-slate-300 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Kullanıcı Hesapları</span>}
                  {isSidebarCollapsed && badgeCounts.kullanicilarBadge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                {!isSidebarCollapsed && badgeCounts.kullanicilarBadge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0 whitespace-nowrap">
                    +{badgeCounts.kullanicilarBadge} yeni
                  </span>
                )}
              </Link>

              <Link
                href="/bms-secure-portal/chat"
                prefetch={false}
                title="Canlı Müşteri Chat"
                className={`${getNavClass('/bms-secure-portal/chat')} ${isSidebarCollapsed ? '' : 'justify-between'} group`}
              >
                <div className="flex items-center gap-2.5 min-w-0 relative">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Canlı Müşteri Chat</span>}
                  {isSidebarCollapsed && badgeCounts.chatBadge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  badgeCounts.chatBadge > 0 ? (
                    <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950 shadow-sm shrink-0 whitespace-nowrap">
                      +{badgeCounts.chatBadge}
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  )
                )}
              </Link>
            </div>

            {/* GRUP 3: TİCARİ & REKLAM MASASI */}
            <div className="flex flex-col gap-1">
              {!isSidebarCollapsed ? (
                <span className="text-[10px] font-mono text-slate-500 px-2 font-bold tracking-wider uppercase">
                  Ticari &amp; Reklam Masası
                </span>
              ) : (
                <div className="h-px bg-slate-800/60 my-1 mx-1" />
              )}

              <Link
                href="/bms-secure-portal/anasayfa-yonetimi"
                prefetch={false}
                title="Anasayfa & Vitrin"
                className={`${getNavClass('/bms-secure-portal/anasayfa-yonetimi')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 relative">
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Anasayfa &amp; Vitrin</span>}
                  {isSidebarCollapsed && badgeCounts.anasayfaBadge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                {!isSidebarCollapsed && badgeCounts.anasayfaBadge > 0 && (
                  <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 shadow-sm shrink-0 whitespace-nowrap">
                    +{badgeCounts.anasayfaBadge}
                  </span>
                )}
              </Link>

              <Link
                href="/bms-secure-portal/banners"
                prefetch={false}
                title="Banner Reklam Masası"
                className={`${getNavClass('/bms-secure-portal/banners')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 relative">
                  <Megaphone className="w-4 h-4 text-slate-300 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Banner Reklam Masası</span>}
                  {isSidebarCollapsed && badgeCounts.bannersBadge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                {!isSidebarCollapsed && badgeCounts.bannersBadge > 0 && (
                  <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 shadow-sm shrink-0 whitespace-nowrap">
                    +{badgeCounts.bannersBadge}
                  </span>
                )}
              </Link>

              <Link
                href="/bms-secure-portal/backlinks"
                prefetch={false}
                title="SEO Backlink Ağı"
                className={`${getNavClass('/bms-secure-portal/backlinks')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">SEO Backlink Ağı</span>}
                </div>
              </Link>
            </div>

            {/* GRUP 4: SİSTEM & GÜVENLİK */}
            <div className="flex flex-col gap-1">
              {!isSidebarCollapsed ? (
                <span className="text-[10px] font-mono text-slate-500 px-2 font-bold tracking-wider uppercase">
                  Sistem &amp; Güvenlik
                </span>
              ) : (
                <div className="h-px bg-slate-800/60 my-1 mx-1" />
              )}

              <Link
                href="/bms-secure-portal/site-yonetimi"
                prefetch={false}
                title="Site Yönetimi"
                className={`${getNavClass('/bms-secure-portal/site-yonetimi')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Settings className="w-4 h-4 text-slate-300 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">Site Yönetimi</span>}
                </div>
              </Link>

              <Link
                href="/bms-secure-portal/guvenlik"
                prefetch={false}
                title="Güvenlik & IP Ban"
                className={`${getNavClass('/bms-secure-portal/guvenlik')} ${isSidebarCollapsed ? '' : 'justify-between'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate text-rose-300">Güvenlik &amp; IP Ban</span>}
                </div>
              </Link>
            </div>

          </nav>
        </div>

        {/* Bottom Actions: Logout & Back to Public Site */}
        <div className="pt-3 mt-4 border-t border-slate-800/70 flex flex-col gap-1.5 shrink-0">
          <Link
            href="/"
            title="Ana Siteye Git"
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} rounded-xl bg-slate-900/60 text-slate-400 hover:text-white text-xs font-semibold transition-all border border-slate-800 hover:border-slate-700`}
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Ana Siteye Git</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title="Güvenli Çıkış"
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all border border-rose-500/20 hover:border-rose-500/30`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Güvenli Çıkış</span>}
          </button>
        </div>
      </aside>

      {/* Secret Admin Content Viewport */}
      <main className={`flex-1 w-full max-w-full min-w-0 ${
        pathname === '/bms-secure-portal/chat' 
          ? 'p-0 pb-16 md:p-3 xl:p-4 md:pb-3 xl:pb-4 md:h-screen md:max-h-screen min-h-0 flex flex-col overflow-hidden' 
          : 'p-3 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto'
      }`}>
        {children}
      </main>

      {/* ── MOBİL SABİT ALT GEZİNME ÇUBUĞU (MOBILE BOTTOM BAR) ──────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1017]/95 backdrop-blur-xl border-t border-slate-800 px-1 py-1.5 flex items-center justify-around shadow-2xl">
        <Link
          href="/bms-secure-portal/ilanlar"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            pathname === '/bms-secure-portal/ilanlar'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <List className="w-5 h-5" />
            {badgeCounts.ilanlarBadge > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse border border-[#0c1017]">
                {badgeCounts.ilanlarBadge}
              </span>
            )}
          </div>
          <span className="text-[10px]">İlanlar</span>
        </Link>

        <Link
          href="/bms-secure-portal/kullanicilar"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            pathname === '/bms-secure-portal/kullanicilar'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {badgeCounts.kullanicilarBadge > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center border border-[#0c1017]">
                {badgeCounts.kullanicilarBadge}
              </span>
            )}
          </div>
          <span className="text-[10px]">Kullanıcılar</span>
        </Link>

        <Link
          href="/bms-secure-portal/chat"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            pathname === '/bms-secure-portal/chat'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {badgeCounts.chatBadge > 0 ? (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center animate-pulse border border-[#0c1017]">
                {badgeCounts.chatBadge}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px]">Chat</span>
        </Link>

        <Link
          href="/bms-secure-portal"
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/bms-secure-portal'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Canlı</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            isMobileMenuOpen ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Sliders className="w-5 h-5" />
            {(badgeCounts.anasayfaBadge > 0 || badgeCounts.bannersBadge > 0) && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center animate-pulse border border-[#0c1017]">
                {badgeCounts.anasayfaBadge + badgeCounts.bannersBadge}
              </span>
            )}
          </div>
          <span className="text-[10px]">Tüm Menü</span>
        </button>
      </div>

      {/* ── MOBİL DİĞER MODÜLLER ÇEKMECESİ (BOTTOM SHEET) ──────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="flex-1 w-full"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="w-full bg-[#0c1017] border-t border-slate-800 rounded-t-3xl p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CorporateLogo className="w-7 h-7" />
                <span className="font-bold text-sm text-white">BMS Yönetim Masaları</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-semibold">
              
              {/* GRUP 1: CANLI AKIŞ & ANALİZ */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  Canlı Akış &amp; Analiz
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/bms-secure-portal"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col items-center text-center gap-1.5 border border-slate-800 relative"
                  >
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span className="text-[11px] truncate w-full">Canlı Trafik</span>
                  </Link>

                  

                  <Link
                    href="/bms-secure-portal/bildirimler"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-amber-300 flex flex-col items-center text-center gap-1.5 border border-slate-800 relative"
                  >
                    <BellRing className="w-5 h-5 text-amber-400" />
                    <span className="text-[11px] truncate w-full">Bildirim &amp; Push</span>
                  </Link>
                </div>
              </div>

              {/* GRUP 2: İÇERİK & MÜŞTERİ */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  İçerik &amp; Müşteri
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/bms-secure-portal/ilanlar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative"
                  >
                    <div className="flex items-center justify-between">
                      <List className="w-5 h-5 text-slate-300" />
                      <div className="flex items-center gap-1">
                        {badgeCounts.pendingListings > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                            +{badgeCounts.pendingListings}
                          </span>
                        )}
                        {badgeCounts.expiredListings > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[9px] font-bold">
                            {badgeCounts.expiredListings}
                          </span>
                        )}
                      </div>
                    </div>
                    <span>İlan Moderasyonu</span>
                  </Link>

                  <Link
                    href="/bms-secure-portal/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative"
                  >
                    <div className="flex items-center justify-between">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      {badgeCounts.chatBadge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold animate-pulse">
                          +{badgeCounts.chatBadge}
                        </span>
                      )}
                    </div>
                    <span>Canlı Chat</span>
                  </Link>

                  <Link
                    href="/bms-secure-portal/kullanicilar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative col-span-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-300" />
                        <span>Kullanıcı Hesapları</span>
                      </div>
                      {badgeCounts.kullanicilarBadge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-bold">
                          +{badgeCounts.kullanicilarBadge} yeni
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>

              {/* GRUP 3: TİCARİ & REKLAM MASASI */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  Ticari &amp; Reklam Masası
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/bms-secure-portal/anasayfa-yonetimi"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative"
                  >
                    <div className="flex items-center justify-between">
                      <Sliders className="w-5 h-5 text-amber-400" />
                      {badgeCounts.anasayfaBadge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold animate-pulse">
                          +{badgeCounts.anasayfaBadge}
                        </span>
                      )}
                    </div>
                    <span>Anasayfa &amp; Vitrin</span>
                  </Link>

                  <Link
                    href="/bms-secure-portal/banners"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative"
                  >
                    <div className="flex items-center justify-between">
                      <Megaphone className="w-5 h-5 text-slate-300" />
                      {badgeCounts.bannersBadge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold animate-pulse">
                          +{badgeCounts.bannersBadge}
                        </span>
                      )}
                    </div>
                    <span>Banner Masası</span>
                  </Link>

                  <Link
                    href="/bms-secure-portal/backlinks"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative"
                  >
                    <div className="flex items-center justify-between">
                      <Link2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span>SEO Backlink</span>
                  </Link>
                </div>
              </div>

              {/* GRUP 4: SİSTEM & GÜVENLİK */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                  Sistem &amp; Güvenlik
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/bms-secure-portal/site-yonetimi"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-[#070a0f] hover:bg-slate-900 text-white flex flex-col gap-1 border border-slate-800 relative"
                  >
                    <div className="flex items-center justify-between">
                      <Settings className="w-5 h-5 text-slate-300" />
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-bold">
                        GENEL
                      </span>
                    </div>
                    <span>Site Yönetimi</span>
                  </Link>

                  <Link
                    href="/bms-secure-portal/guvenlik"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 flex flex-col gap-1 border border-red-500/20 relative"
                  >
                    <div className="flex items-center justify-between">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    </div>
                    <span>Güvenlik &amp; IP Ban</span>
                  </Link>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-wider border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Güvenli Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Messenger Style Floating Live Chat */}
      <AdminFloatingChat />
    </div>
  );
}
