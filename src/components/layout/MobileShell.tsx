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
import CorporateWebHome from '@/components/corporate/CorporateWebHome';

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

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans w-full max-w-full overflow-x-hidden">
      
      {/* ── 1. DESKTOP KURUMSAL YAZILIM, SEO & BÖLGESEL DİJİTAL AJANS GÖRÜNÜMÜ (LIGHT MODE, 100% AYRI) ──────────────── */}
      <div className="hidden md:flex flex-col min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden">
        <CorporateWebHome />
        <SeoBacklinkFooter />
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
