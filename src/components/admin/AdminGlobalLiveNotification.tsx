'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, X, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminGlobalLiveNotification() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState<any | null>(null);
  const [showToast, setShowToast] = useState(false);
  const lastProcessedTimeRef = useRef<number>(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Check if user is authenticated Admin (only once on mount)
  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  // Web Audio High-Priority Chime Sound (Çift tonlu admin alarm zili)
  const playAdminAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // First Ding (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);

      // Second Dong (D6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.45, ctx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.65);
    } catch (e) {
      // Silent
    }
  };

  const triggerNotification = (msg: any) => {
    if (pathname === '/bms-secure-portal/chat') return;
    setIncomingMessage(msg);
    setShowToast(true);
    playAdminAlertSound();

    let flash = false;
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = flash ? '🚨 (1) YENİ MÜŞTERİ MESAJI!' : originalTitle;
      flash = !flash;
    }, 800);

    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 15000);
  };

  // 2. Real-time Live SSE Connection (Zero polling overhead)
  useEffect(() => {
    if (!isAdmin) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/admin/chat/sse');
      eventSource.addEventListener('admin_customer_message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg) {
            lastProcessedTimeRef.current = Date.now();
            triggerNotification(msg);
          }
        } catch (err) {}
      });
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isAdmin]);

  if (!isAdmin || !showToast || !incomingMessage || pathname === '/bms-secure-portal/chat') {
    return null;
  }

  const handleGoToChat = () => {
    setShowToast(false);
    const targetUrl = incomingMessage.threadId 
      ? `/bms-secure-portal/chat?threadId=${incomingMessage.threadId}` 
      : `/bms-secure-portal/chat`;
    router.push(targetUrl);
  };

  return (
    <div 
      onClick={handleGoToChat}
      className="fixed top-0 left-0 right-0 w-full z-[999999] bg-gradient-to-r from-red-700 via-[#161b22] to-amber-600 border-b-2 border-amber-400 p-3.5 sm:p-4.5 shadow-[0_10px_40px_rgba(239,68,68,0.6)] animate-in slide-in-from-top-full duration-300 cursor-pointer select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 w-full px-2 sm:px-4">
        
        {/* Sol: İkon, Başlık ve Mesaj İçeriği */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/50 animate-bounce">
              <MessageSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#161b22] animate-ping" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-xs sm:text-sm text-amber-300 font-heading uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>🚨 Yeni Müşteri Canlı Mesajı:</span>
              </span>
              <span className="text-[11px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                {new Date(incomingMessage.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white font-bold truncate mt-1 drop-shadow-sm max-w-2xl">
              "{incomingMessage.mesaj}"
            </p>
          </div>
        </div>

        {/* Sağ: Tıklayınca Git & Kapat */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleGoToChat();
            }}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm font-heading uppercase tracking-wider shadow-xl flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Mesaja Git</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowToast(false);
            }}
            className="p-2.5 rounded-xl bg-black/40 text-white/70 hover:text-white hover:bg-black/70 border border-white/10 transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
}
