'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import CorporateLogo from '@/components/common/CorporateLogo';
import HeaderTicker from '@/components/common/HeaderTicker';
import SeoBacklinkFooter from '@/components/common/SeoBacklinkFooter';
import GlobalChatNotification from '@/components/common/GlobalChatNotification';
import SpecialAdPopup from '@/components/common/SpecialAdPopup';
import AgeVerificationModal from '@/components/common/AgeVerificationModal';
import GlobalAnnouncementBar from '@/components/common/GlobalAnnouncementBar';

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const isSecurePortal = pathname?.startsWith('/bms-secure-portal');
  const isChatPage = pathname === '/chat';
  const isPanelimPage = pathname === '/panelim';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        return; // Masaüstünde asla kontrol etme / açma
      }
      const verified = localStorage.getItem('age_verified_2026');
      if (!verified) {
        setIsAgeModalOpen(true);
      }
    } catch (e) {}
  }, []);

  const handleAgeConfirm = () => {
    try {
      localStorage.setItem('age_verified_2026', 'true');
    } catch (e) {}
    setIsAgeModalOpen(false);
  };

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

  // Standalone Fullscreen Native Chat Layout
  if (isChatPage) {
    return (
      <div className="h-[100dvh] w-full bg-[#0d1117] text-[#f0f6fc] font-sans overflow-hidden flex flex-col">
        {children}
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
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans w-full max-w-full overflow-x-hidden flex flex-col justify-between">
      {/* Global Üst Bildirim / Çekmece */}
      <GlobalAnnouncementBar />

      {/* Mobil/Masaüstü +18 Yaş Doğrulama Modalı (İlk Girişte Onay İster) */}
      <AgeVerificationModal isOpen={isAgeModalOpen} onConfirm={handleAgeConfirm} />

      {/* STICKY TOP HEADER BAR (Hem Masaüstü Hem Mobilde Ortak, Ultra Şık ve Responsive) */}
      <div id="app-sticky-header" className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md">
        {/* TOP ANNOUNCEMENT TICKER */}
        <HeaderTicker />

        {/* HEADER — Premium Global Brand Bar */}
        <header className="px-3.5 sm:px-6 py-3 border-b border-[#30363d]/60 flex items-center justify-between w-full max-w-7xl mx-auto shadow-md">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CorporateLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-black text-sm sm:text-base text-white font-heading tracking-tight group-hover:text-amber-400 transition-colors">
                Best Eskort
              </span>
              <span className="text-[9px] sm:text-[10px] text-amber-400/80 font-bold tracking-wider">
                #1 İlan Platformu 👑
              </span>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sehirler"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-white font-extrabold text-xs sm:text-sm transition-all font-heading"
            >
              Şehirler
            </Link>

            {isLoggedIn ? (
              <Link
                href="/panelim"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm font-heading uppercase tracking-wider shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Panelim</span>
              </Link>
            ) : (
              <Link
                href="/ilan-ver"
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm font-heading uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                İlan Ver
              </Link>
            )}
          </div>
        </header>
      </div>

      {/* MAIN PAGE CONTENT (Masaüstü ve Mobil İçin Gerçek Sayfa İçeriği) */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-8 overflow-x-hidden">
        {children}
      </main>

      {/* Backlink Footer */}
      <SeoBacklinkFooter />

      {/* Sponsored VIP Ad Popup */}
      <SpecialAdPopup />
      
      {/* Global Real-Time Chat Notifications */}
      <GlobalChatNotification />
    </div>
  );
}
