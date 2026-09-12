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
  Link2
} from 'lucide-react';
import CorporateLogo from '@/components/common/CorporateLogo';

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
  const [badgeCounts, setBadgeCounts] = useState<{
    pendingListings: number;
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

  const getNavClass = (path: string) => `flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-colors ${
    pathname === path 
      ? 'bg-[#21262d] text-white border border-[#363b42]' 
      : 'hover:bg-[#21262d] text-[#8b949e] hover:text-white border border-transparent'
  }`;

  // 3. AUTHENTICATED: Render Full Admin Portal Layout
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <CorporateLogo className="w-7 h-7" />
          <div className="flex flex-col">
            <span className="font-black text-xs text-white font-heading tracking-tight">BMS Portal</span>
            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Yönetici Aktif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#21262d] text-amber-400 border border-[#30363d] text-[11px] font-bold font-heading"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Siteye Git</span>
          </Link>
        </div>
      </div>

      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#161b22] border-r border-[#30363d] p-5 flex-col justify-between shrink-0 shadow-2xl overflow-y-auto">
        <div className="flex flex-col gap-6">
          
          {/* Logo & Secret Gate Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CorporateLogo className="w-9 h-9" />
              <div className="flex flex-col">
                <span className="font-black text-base text-white font-heading">BMS System Gate</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Süper Yönetici Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 text-xs font-extrabold uppercase tracking-wider font-heading">
            <Link
              href="/bms-secure-portal"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal')} justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Trafik &amp; Analizler</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Canlı İzleme Aktif" />
            </Link>

            <Link
              href="/bms-secure-portal/ilanlar"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal/ilanlar')} justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <List className="w-4 h-4 text-amber-400" />
                <span>İlan Moderasyonu</span>
              </div>
              {badgeCounts.ilanlarBadge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse border border-rose-400 shrink-0">
                  +{badgeCounts.ilanlarBadge}
                </span>
              )}
            </Link>

            <Link
              href="/bms-secure-portal/kullanicilar"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal/kullanicilar')} justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Kullanıcı Hesapları</span>
              </div>
              {badgeCounts.kullanicilarBadge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0">
                  +{badgeCounts.kullanicilarBadge} yeni
                </span>
              )}
            </Link>

            <Link
              href="/bms-secure-portal/chat"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal/chat')} justify-between group`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Canlı Müşteri Chat</span>
              </div>
              {badgeCounts.chatBadge > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-pulse border border-emerald-300 shrink-0">
                  +{badgeCounts.chatBadge}
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
            </Link>

            <Link
              href="/bms-secure-portal/anasayfa-yonetimi"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal/anasayfa-yonetimi')} justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Anasayfa &amp; Banner</span>
              </div>
              {badgeCounts.anasayfaBadge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse border border-amber-300 shrink-0">
                  +{badgeCounts.anasayfaBadge} Vitrin
                </span>
              )}
            </Link>

            <Link
              href="/bms-secure-portal/banners"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal/banners')} justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Banner &amp; Reklam Masası</span>
              </div>
              {badgeCounts.bannersBadge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse border border-amber-300 shrink-0">
                  +{badgeCounts.bannersBadge}
                </span>
              )}
            </Link>

            <Link
              href="/bms-secure-portal/backlinks"
              prefetch={false}
              className={`${getNavClass('/bms-secure-portal/backlinks')} justify-between`}
            >
              <div className="flex items-center gap-2.5">
                <Link2 className="w-4 h-4 text-blue-400" />
                <span>SEO Backlink Ağı</span>
              </div>
            </Link>

            <Link
              href="/bms-secure-portal/guvenlik"
              prefetch={false}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors ${
                pathname === '/bms-secure-portal/guvenlik'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'hover:bg-red-500/5 text-red-500/70 hover:text-red-300 border border-transparent hover:border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Güvenlik &amp; IP Ban</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Bottom Actions: Logout & Back to Public Site */}
        <div className="pt-4 border-t border-[#30363d] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors border border-red-500/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Güvenli Çıkış Yap</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white text-xs font-bold transition-colors border border-[#363b42]"
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Ana Platforma Git</span>
          </Link>
        </div>
      </aside>

      {/* Secret Admin Content Viewport */}
      <main className={`flex-1 overflow-y-auto w-full max-w-full ${
        pathname === '/bms-secure-portal/chat' 
          ? 'p-0 pb-16 md:p-6 md:pb-8' 
          : 'p-3 sm:p-6 md:p-8 pb-24 md:pb-8'
      }`}>
        {children}
      </main>

      {/* ── MOBİL SABİT ALT GEZİNME ÇUBUĞU (MOBILE BOTTOM BAR) ──────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161b22]/95 backdrop-blur-xl border-t border-[#30363d] px-1 py-1.5 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
        <Link
          href="/bms-secure-portal/ilanlar"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            pathname === '/bms-secure-portal/ilanlar'
              ? 'text-amber-400 font-black'
              : 'text-[#8b949e] hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <List className="w-5 h-5" />
            {badgeCounts.ilanlarBadge > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse border border-[#161b22]">
                {badgeCounts.ilanlarBadge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-heading">İlanlar</span>
        </Link>

        <Link
          href="/bms-secure-portal/kullanicilar"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            pathname === '/bms-secure-portal/kullanicilar'
              ? 'text-amber-400 font-black'
              : 'text-[#8b949e] hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {badgeCounts.kullanicilarBadge > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center border border-[#161b22]">
                {badgeCounts.kullanicilarBadge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-heading">Kullanıcılar</span>
        </Link>

        <Link
          href="/bms-secure-portal/chat"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            pathname === '/bms-secure-portal/chat'
              ? 'text-amber-400 font-black'
              : 'text-[#8b949e] hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {badgeCounts.chatBadge > 0 ? (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse border border-[#161b22]">
                {badgeCounts.chatBadge}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-heading">Chat</span>
        </Link>

        <Link
          href="/bms-secure-portal"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            pathname === '/bms-secure-portal'
              ? 'text-amber-400 font-black'
              : 'text-[#8b949e] hover:text-white font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-heading">Analiz</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            isMobileMenuOpen ? 'text-amber-400 font-black' : 'text-[#8b949e] hover:text-white font-medium'
          }`}
        >
          <div className="relative">
            <Sliders className="w-5 h-5" />
            {(badgeCounts.anasayfaBadge > 0 || badgeCounts.bannersBadge > 0) && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse border border-[#161b22]">
                {badgeCounts.anasayfaBadge + badgeCounts.bannersBadge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-heading">Tüm Menü</span>
        </button>
      </div>

      {/* ── MOBİL DİĞER MODÜLLER ÇEKMECESİ (BOTTOM SHEET) ──────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="flex-1 w-full"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="w-full bg-[#161b22] border-t-2 border-amber-500/40 rounded-t-[32px] p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <CorporateLogo className="w-7 h-7" />
                <span className="font-black text-sm text-white font-heading">Tüm 8 Yönetici Masası</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-bold font-heading">
              <Link
                href="/bms-secure-portal"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>1. Trafik &amp; Analiz</span>
              </Link>

              <Link
                href="/bms-secure-portal/ilanlar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <div className="flex items-center justify-between">
                  <List className="w-5 h-5 text-amber-400" />
                  {badgeCounts.ilanlarBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                      +{badgeCounts.ilanlarBadge}
                    </span>
                  )}
                </div>
                <span>2. İlan Moderasyonu</span>
              </Link>

              <Link
                href="/bms-secure-portal/chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <div className="flex items-center justify-between">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  {badgeCounts.chatBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black animate-pulse">
                      +{badgeCounts.chatBadge}
                    </span>
                  )}
                </div>
                <span>3. Canlı Müşteri Chat</span>
              </Link>

              <Link
                href="/bms-secure-portal/kullanicilar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <div className="flex items-center justify-between">
                  <Users className="w-5 h-5 text-amber-400" />
                  {badgeCounts.kullanicilarBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black">
                      +{badgeCounts.kullanicilarBadge}
                    </span>
                  )}
                </div>
                <span>4. Kullanıcı Hesapları</span>
              </Link>

              <Link
                href="/bms-secure-portal/anasayfa-yonetimi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <div className="flex items-center justify-between">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  {badgeCounts.anasayfaBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black animate-pulse">
                      +{badgeCounts.anasayfaBadge}
                    </span>
                  )}
                </div>
                <span>5. Anasayfa Yönetimi</span>
              </Link>

              <Link
                href="/bms-secure-portal/banners"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <div className="flex items-center justify-between">
                  <Megaphone className="w-5 h-5 text-amber-400" />
                  {badgeCounts.bannersBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black animate-pulse">
                      +{badgeCounts.bannersBadge}
                    </span>
                  )}
                </div>
                <span>6. Banner Masası</span>
              </Link>

              <Link
                href="/bms-secure-portal/backlinks"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white flex flex-col gap-1 border border-[#363b42] relative"
              >
                <div className="flex items-center justify-between">
                  <Link2 className="w-5 h-5 text-blue-400" />
                </div>
                <span>7. SEO Backlink Ağı</span>
              </Link>

              <Link
                href="/bms-secure-portal/guvenlik"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 flex flex-col gap-1 border border-red-500/30 relative"
              >
                <div className="flex items-center justify-between">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <span>8. Güvenlik &amp; IP Ban</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-[#30363d] flex flex-col gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-black text-xs uppercase tracking-wider font-heading border border-red-500/40"
              >
                <LogOut className="w-4 h-4" />
                <span>Güvenli Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


