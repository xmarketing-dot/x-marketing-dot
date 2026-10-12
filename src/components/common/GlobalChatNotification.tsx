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

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;
    let isMounted = true;

    const setupChatListener = (tid: string) => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);

      // A) İlk Yükleme: Okunmamış mesajları al
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

      fetchUnread();

      // B) Anlık 0ms SSE Dinleyicisi
      try {
        eventSource = new EventSource(`/api/chat/sse?threadId=${tid}`);

        eventSource.addEventListener('new_message', (event) => {
          try {
            const newMsgs = JSON.parse(event.data);
            if (Array.isArray(newMsgs)) {
              newMsgs.forEach((msg: any) => {
                if (msg.gonderenTipi === 'admin') {
                  handleNewMessage(msg.mesaj);
                }
              });
            }
          } catch (err) {}
        });

        eventSource.addEventListener('messages_read', (event) => {
          try {
            const readEvent = JSON.parse(event.data);
            if (readEvent.reader === 'user' && isMounted) {
              setUnreadCount(0);
              setShowPopup(false);
            }
          } catch (err) {}
        });
      } catch (e) {}

      // C) Fallback Polling (6 saniye)
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
            setUnreadCount(unreadAdmin.length);
          }
        } catch (e) {}
      }, 6000);
    };

    const getSavedThreadId = () => {
      if (typeof window === 'undefined') return null;
      const ls = localStorage.getItem('best_eskort_chat_thread_id');
      if (ls) return ls;
      const match = document.cookie.match(/best_eskort_chat_thread_id=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const init = async () => {
      let tid = getSavedThreadId();
      if (!tid) {
        try {
          const res = await fetch('/api/chat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ createIfNotFound: true }),
          });
          const data = await res.json();
          if (data.thread?._id) {
            tid = data.thread._id;
            localStorage.setItem('best_eskort_chat_thread_id', data.thread._id);
            document.cookie = `best_eskort_chat_thread_id=${data.thread._id};path=/;max-age=31536000;SameSite=Lax`;
          }
        } catch (e) {}
      }

      if (tid && isMounted) {
        setupChatListener(tid);
      }
    };

    init();

    const handleStorage = () => {
      const updatedTid = getSavedThreadId();
      if (updatedTid) setupChatListener(updatedTid);
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [isChatPage, isSecurePortal, pathname]);

  if (isChatPage || isSecurePortal) return null;

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
