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
  X
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

  const pathname = usePathname();

  // Check existing session
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(!!data.authenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

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
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[#161b22] border-b border-[#30363d] p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <CorporateLogo className="w-8 h-8" />
          <span className="font-black text-sm text-white font-heading tracking-tight">BMS System Gate</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Admin Sidebar / Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] md:w-64 bg-[#161b22] border-r border-[#30363d] p-5 flex flex-col justify-between shrink-0 shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
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
            <button className="md:hidden p-1 text-[#8b949e] hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav 
            className="flex flex-col gap-1 text-xs font-extrabold uppercase tracking-wider font-heading"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Link
              href="/bms-secure-portal"
              className={getNavClass('/bms-secure-portal')}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Trafik &amp; Analizler</span>
            </Link>

            <Link
              href="/bms-secure-portal/ilanlar"
              className={getNavClass('/bms-secure-portal/ilanlar')}
            >
              <List className="w-4 h-4 text-amber-400" />
              <span>İlan Moderasyonu</span>
            </Link>

            <Link
              href="/bms-secure-portal/modeller"
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-bold transition-colors ${
                pathname === '/bms-secure-portal/modeller'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'hover:bg-[#21262d] text-amber-500/70 hover:text-amber-400 border border-transparent'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>👑 VIP Fenomen &amp; Model</span>
            </Link>

            <Link
              href="/bms-secure-portal/kullanicilar"
              className={getNavClass('/bms-secure-portal/kullanicilar')}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Kullanıcı Hesapları</span>
            </Link>

            <Link
              href="/bms-secure-portal/chat"
              className={`${getNavClass('/bms-secure-portal/chat')} justify-between group`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Canlı Müşteri Chat</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </Link>

            <Link
              href="/bms-secure-portal/anasayfa-yonetimi"
              className={getNavClass('/bms-secure-portal/anasayfa-yonetimi')}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Anasayfa &amp; Banner</span>
            </Link>

            <Link
              href="/bms-secure-portal/guvenlik"
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-colors ${
                pathname === '/bms-secure-portal/guvenlik'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'hover:bg-red-500/5 text-red-500/70 hover:text-red-300 border border-transparent hover:border-red-500/30'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Güvenlik &amp; IP Ban</span>
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-full">
        {children}
      </main>
    </div>
  );
}
