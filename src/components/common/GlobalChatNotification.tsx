'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';

export default function GlobalChatNotification() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [hasChatStarted, setHasChatStarted] = useState(false);

  const isChatPage = pathname === '/chat';
  const isSecurePortal = pathname?.startsWith('/bms-secure-portal');
  const popupTimeoutRef = useRef<any>(null);

  // Standart yumuşak bildirim sesi
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  // Yeni mesaj geldiğinde standart bildirim
  const handleNewMessage = (msgText?: string) => {
    setUnreadCount((prev) => prev + 1);
    if (msgText) setLatestMessage(msgText);
    setShowPopup(true);
    playNotificationSound();

    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    popupTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 7000);
  };

  // 1. Thread Takibi ve Anlık 0ms SSE + Polling
  useEffect(() => {
    if (isChatPage || isSecurePortal) {
      setUnreadCount(0);
      setShowPopup(false);
      return;
    }

    let pollInterval: any = null;
    let isMounted = true;

    const setupChatListener = (tid: string) => {
      if (pollInterval) clearInterval(pollInterval);

      const fetchUnread = async () => {
        try {
          const res = await fetch(`/api/chat/messages?threadId=${tid}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages) && isMounted) {
            const unreadAdmin = data.messages.filter(
              (m: any) => m.gonderenTipi === 'admin' && !m.okundu
            );
            setUnreadCount(unreadAdmin.length);
            if (unreadAdmin.length > 0) {
              setLatestMessage(unreadAdmin[unreadAdmin.length - 1].mesaj);
            }
          }
        } catch (e) {}
      };

      // A) İlk Yükleme: Sayfanın ilk açılışında LCP ve ana kaynakları engellememesi için 3.5 sn rölantide çalıştır
      const initialTimer = setTimeout(() => {
        if (isMounted) fetchUnread();
      }, 3500);

      // B) SSE KALDIRILDI: Her sayfada açık kalan EventSource, Vercel Fluid örneğini sürekli
      // ayakta tutuyor (Provisioned Memory faturası). Bildirim için düşük frekanslı polling yeterli.

      // C) Düşük frekanslı akıllı kontrol (Sadece sekme aktifken ve 45s aralıkla - Vercel maliyet koruması)
      let prevCount = 0;
      pollInterval = setInterval(async () => {
        if (typeof document !== 'undefined' && document.hidden) return;
        try {
          const res = await fetch(`/api/chat/messages?threadId=${tid}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages) && isMounted) {
            const unreadAdmin = data.messages.filter(
              (m: any) => m.gonderenTipi === 'admin' && !m.okundu
            );
            if (unreadAdmin.length > prevCount && unreadAdmin.length > 0) {
              handleNewMessage(unreadAdmin[unreadAdmin.length - 1].mesaj);
            }
            prevCount = unreadAdmin.length;
            setUnreadCount(unreadAdmin.length);
          }
        } catch (e) {}
      }, 45000);
    };

    const getSavedThreadId = () => {
      if (typeof window === 'undefined') return null;
      const ls = localStorage.getItem('best_eskort_chat_thread_id');
      if (ls) return ls;
      const match = document.cookie.match(/best_eskort_chat_thread_id=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const init = () => {
      const tid = getSavedThreadId();
      // Kullanıcının daha önce başlattığı aktif bir sohbeti yoksa bubble çıkmaz ve polling çalışmaz
      if (!tid) {
        setHasChatStarted(false);
        return;
      }

      setHasChatStarted(true);
      if (isMounted) {
        setupChatListener(tid);
      }
    };

    init();

    const handleStorage = () => {
      const updatedTid = getSavedThreadId();
      if (updatedTid) {
        setHasChatStarted(true);
        setupChatListener(updatedTid);
      } else {
        setHasChatStarted(false);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isChatPage, isSecurePortal, pathname]);

  // Sohbet sayfası veya admin panelinde gizle
  if (isChatPage || isSecurePortal) return null;

  // Kullanıcı sohbet başlatmamışsa veya okunmamış mesaj yoksa bubble GÖZÜKMEZ
  const shouldShow = hasChatStarted && (unreadCount > 0 || showPopup);
  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-none select-none">
      
      {/* ── 1. MESAJ GELDİĞİNDE ÇIKAN SADE ÖNİZLEME BALONU ── */}
      {showPopup && latestMessage && (
        <div
          onClick={() => {
            setShowPopup(false);
            router.push('/chat');
          }}
          className="mb-3 p-3 max-w-[260px] sm:max-w-xs rounded-2xl bg-[#161b22] border border-[#30363d] shadow-2xl text-white flex items-center justify-between gap-2 cursor-pointer pointer-events-auto hover:border-slate-500 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <p className="text-xs text-slate-200 leading-snug line-clamp-2 font-medium flex-1">
            {latestMessage}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(false);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 2. GLOBAL CANLI DESTEK BUTONU ── */}
      <button
        type="button"
        onClick={() => router.push('/chat')}
        className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 flex items-center justify-center shadow-[0_6px_25px_rgba(245,158,11,0.45)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.6)] active:scale-90 transition-all pointer-events-auto border-2 border-amber-200"
        aria-label="Canlı Sohbet"
      >
        {/* Sohbet İkonu */}
        <MessageCircle className="w-7 h-7 fill-slate-950 stroke-[1.8]" />

        {/* KIRMIZI BİLDİRİM ROZETİ: RAKAMIN BAŞINDA + (+1, +2, +3...) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[24px] h-[24px] px-1.5 rounded-full bg-red-600 border-2 border-[#0d1117] text-white font-black text-xs flex items-center justify-center shadow-xl animate-in zoom-in-75 duration-200">
            +{unreadCount}
          </span>
        )}
      </button>

    </div>
  );
}
