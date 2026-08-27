'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import CorporateLogo from '@/components/common/CorporateLogo';
import HeaderTicker from '@/components/common/HeaderTicker';
import GlobalChatNotification from '@/components/common/GlobalChatNotification';

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();
  const isSecurePortal = pathname?.startsWith('/bms-secure-portal');
  const isChatPage = pathname === '/chat';
  const isPanelimPage = pathname === '/panelim';
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

  // 1. Secure portal routes render full-screen desktop dashboard
  if (isSecurePortal) {
    return <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans overflow-x-hidden">{children}</div>;
  }

  // 2. Standalone Fullscreen Native Chat Layout
  if (isChatPage) {
    return (
      <div className="h-[100dvh] w-full bg-[#0d1117] text-[#f0f6fc] font-sans overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  // 3. Panelim route renders dedicated dashboard
  if (isPanelimPage) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] font-sans overflow-x-hidden">
        {children}
        <GlobalChatNotification />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b0f] text-[#f0f6fc] font-sans selection:bg-amber-500 selection:text-slate-950 flex justify-center w-full">
      {/* Mobile-First Responsive App Frame */}
      <div className="w-full max-w-xl min-h-screen bg-[#0d1117] border-x border-[#30363d]/40 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col relative">

        {/* TOP DYNAMIC ANNOUNCEMENT TICKER */}
        <HeaderTicker />

        {/* TOP BRAND HEADER BAR */}
        <header className="px-3.5 py-3 bg-[#0d1117]/95 backdrop-blur-xl border-b border-[#30363d]/60 flex items-center justify-between w-full sticky top-0 z-30 shadow-md">
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

        {/* MAIN PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto pb-8 no-scrollbar w-full">
          {children}
        </main>

      </div>

      {/* Global Real-Time Chat Notifications */}
      <GlobalChatNotification />
    </div>
  );
}
