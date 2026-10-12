'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquare, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function GlobalChatNotification() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Floating Bubble Position (Draggable)
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDropTarget, setIsOverDropTarget] = useState(false);

  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; hasMoved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

  const previewTimerRef = useRef<any>(null);

  const isChatPage = pathname === '/chat';
  const isSecurePortal = pathname?.startsWith('/bms-secure-portal');

  // Apple iMessage Tarzı Ultra Soft Su Damlası / Pop Sesi
  const playSoftNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // Yeni mesaj bildirim fırlatıcı (Zarif Intercom stili)
  const triggerNotification = (msgText: string, newTotalCount?: number) => {
    setLatestMessage(msgText);
    setUnreadCount((prev) => (typeof newTotalCount === 'number' ? newTotalCount : prev + 1));
    setShowPreview(true);
    setIsDismissed(false);
    playSoftNotificationSound();

    // 8 saniye sonra önizleme kartı kendi kendine zarifçe kapanır, ama rozet kalır
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 8000);

    // Sekme başlığı zarif senkronu
    let flash = false;
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = flash ? '💬 (1) Yeni Mesaj' : originalTitle;
      flash = !flash;
    }, 1200);

    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 8000);
  };

  // 1. Thread Takibi ve Anlık 0ms SSE + Polling Dinleme Motoru
  useEffect(() => {
    if (isChatPage || isSecurePortal) {
      setUnreadCount(0);
      setShowPreview(false);
      return;
    }

    const getSavedThreadId = () => {
      if (typeof window === 'undefined') return null;
      const ls = localStorage.getItem('best_eskort_chat_thread_id');
      if (ls) return ls;
      const match = document.cookie.match(/best_eskort_chat_thread_id=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : null;
    };

    const savedThreadId = getSavedThreadId();
    if (!savedThreadId) return;

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    // A) İlk Yükleme: Veritabanındaki okunmamış admin mesajlarını al
    const fetchInitialUnread = async () => {
      try {
        const res = await fetch(`/api/chat/messages?threadId=${savedThreadId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          const unreadAdminMsgs = data.messages.filter(
            (m: any) => m.gonderenTipi === 'admin' && !m.okundu
          );
          if (unreadAdminMsgs.length > 0) {
            setUnreadCount(unreadAdminMsgs.length);
            const lastMsg = unreadAdminMsgs[unreadAdminMsgs.length - 1];
            setLatestMessage(lastMsg.mesaj);
            setShowPreview(true);
          }
        }
      } catch (e) {}
    };

    fetchInitialUnread();

    // B) Anlık 0ms SSE Dinleyicisi
    try {
      eventSource = new EventSource(`/api/chat/sse?threadId=${savedThreadId}`);

      eventSource.addEventListener('new_message', (event) => {
        try {
          const newMsgs = JSON.parse(event.data);
          if (Array.isArray(newMsgs)) {
            newMsgs.forEach((msg: any) => {
              if (msg.gonderenTipi === 'admin') {
                triggerNotification(msg.mesaj);
              }
            });
          }
        } catch (err) {}
      });

      eventSource.addEventListener('messages_read', (event) => {
        try {
          const readEvent = JSON.parse(event.data);
          if (readEvent.reader === 'user') {
            setUnreadCount(0);
            setShowPreview(false);
          }
        } catch (err) {}
      });

      eventSource.onerror = () => {};
    } catch (e) {}

    // C) Fallback Polling (10 saniye)
    pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch(`/api/chat/messages?threadId=${savedThreadId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          const unreadAdminMsgs = data.messages.filter(
            (m: any) => m.gonderenTipi === 'admin' && !m.okundu
          );
          setUnreadCount(unreadAdminMsgs.length);
          if (unreadAdminMsgs.length > 0 && !latestMessage) {
            setLatestMessage(unreadAdminMsgs[unreadAdminMsgs.length - 1].mesaj);
          }
        }
      } catch (e) {}
    }, 10000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isChatPage, isSecurePortal, pathname]);

  // Set default initial position on screen bottom-right
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: Math.max(16, window.innerWidth - 76),
        y: Math.max(80, window.innerHeight - 150),
      });
    }
  }, []);

  // Check if position is in bottom drop zone
  const checkDropZone = (y: number) => {
    if (typeof window !== 'undefined') {
      return y > window.innerHeight - 130;
    }
    return false;
  };

  // Drag Handlers for Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragRef.current.startX;
    const dy = touch.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      dragRef.current.hasMoved = true;
    }

    const maxX = window.innerWidth - 64;
    const maxY = window.innerHeight - 64;
    const newY = Math.max(10, Math.min(maxY, dragRef.current.initialY + dy));
    const newX = Math.max(10, Math.min(maxX, dragRef.current.initialX + dx));

    setIsOverDropTarget(checkDropZone(newY));
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (isOverDropTarget) {
      setIsDismissed(true);
      setIsOverDropTarget(false);
      return;
    }

    if (!dragRef.current.hasMoved) {
      router.push('/chat');
    }
  };

  // Drag Handlers for Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        dragRef.current.hasMoved = true;
      }

      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      const newY = Math.max(10, Math.min(maxY, dragRef.current.initialY + dy));
      const newX = Math.max(10, Math.min(maxX, dragRef.current.initialX + dx));

      setIsOverDropTarget(checkDropZone(newY));
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (checkDropZone(dragRef.current.initialY)) {
        setIsDismissed(true);
        setIsOverDropTarget(false);
        return;
      }

      if (!dragRef.current.hasMoved) {
        router.push('/chat');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (isChatPage || isSecurePortal) return null;

  return (
    <>
      {/* ── 1. AŞAĞIYA ÇEKİLDİĞİNDE AÇILAN ZARİF KAPATMA ALANI ──────────────── */}
      {isDragging && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-fit z-[99998] flex flex-col items-center gap-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 shadow-2xl ${
            isOverDropTarget 
              ? 'bg-rose-600 border-white scale-110 text-white' 
              : 'bg-slate-900/90 border-slate-700 text-slate-400 backdrop-blur-md'
          }`}>
            <X className={`w-5 h-5 stroke-[2.5] transition-transform ${isOverDropTarget ? 'rotate-90' : ''}`} />
          </div>
          <span className="text-[10px] font-medium tracking-wide text-slate-300 bg-slate-900/90 px-3 py-0.5 rounded-full border border-white/10 font-heading">
            {isOverDropTarget ? 'Bırak ve Kapat' : 'Kapatmak için sürükleyin'}
          </span>
        </div>
      )}

      {/* ── 2. SENIOR LEVEL PREMIUM CHAT BUBBLE & INTERCOM STYLE PREVIEW ──────────────── */}
      {!isDismissed && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 50,
            touchAction: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing select-none group"
        >
          {/* ZARİF INTERCOM / APPLE STİLİ KOMPAKT MESAJ ÖNİZLEMESİ (Gürültü yok, şık cam kart) */}
          {showPreview && latestMessage && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                router.push('/chat');
              }}
              className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 w-64 sm:w-72 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-amber-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-start gap-3 cursor-pointer hover:border-amber-400 active:scale-98 transition-all animate-in fade-in slide-in-from-right-3 duration-300 pointer-events-auto"
            >
              {/* Canlı Destek Avatarı */}
              <div className="relative shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>

              {/* Mesaj İçeriği */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-heading font-black text-amber-400 tracking-wide uppercase">
                    Canlı Destek
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Şimdi</span>
                </div>
                <p className="text-xs text-slate-100 font-medium leading-snug line-clamp-2 mt-0.5">
                  {latestMessage}
                </p>
              </div>

              {/* Kapat Çarpısı */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* LÜKS OBSIDIAN CAM CHAT BALONU */}
          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
            unreadCount > 0
              ? 'bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400 shadow-[0_8px_30px_rgba(251,191,36,0.35)] ring-2 ring-amber-400/50'
              : 'bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 border-2 border-amber-200 shadow-[0_8px_25px_rgba(245,158,11,0.45)]'
          }`}>
            
            {/* Chat İkonu */}
            <MessageSquare className={`w-6 h-6 stroke-[2.2] pointer-events-none transition-colors ${
              unreadCount > 0 ? 'text-amber-400 fill-amber-400/30' : 'text-slate-950 fill-slate-950'
            }`} />

            {/* Durum Göstergesi (Okunmamış yoksa yeşil, varsa minimal Apple kırmızı rozet) */}
            {unreadCount === 0 ? (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1117]" />
            ) : (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-600 border-2 border-[#0d1117] text-white font-heading font-black text-[10px] shadow-lg flex items-center justify-center animate-in zoom-in duration-200">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── 3. BALON KAPATILMIŞSA KÖŞEDE MİNİMAL VE ZARİF DÜĞME ──────────────── */}
      {isDismissed && (
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="fixed bottom-5 right-4 z-40 px-3.5 py-2 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-heading font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 active:scale-95 transition-all"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 fill-amber-400/30 text-amber-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 border border-slate-950 text-[8px] font-black text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span>Canlı Destek</span>
        </button>
      )}
    </>
  );
}
