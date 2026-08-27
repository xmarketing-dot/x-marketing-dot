'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Headphones, MessageSquare, X, Trash2, ArrowRight } from 'lucide-react';

export default function GlobalChatNotification() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(true);
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

  const isChatPage = pathname === '/chat';
  const isSecurePortal = pathname?.startsWith('/bms-secure-portal');

  // Web Audio Soft Notification Ping
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  useEffect(() => {
    if (isChatPage) {
      setUnreadCount(0);
      setShowToast(false);
      return;
    }

    const savedThreadId = typeof window !== 'undefined' ? localStorage.getItem('best_eskort_chat_thread_id') : null;
    
    if (savedThreadId) {
      setHasStartedChat(true);

      const eventSource = new EventSource(`/api/chat/sse?threadId=${savedThreadId}`);

      eventSource.addEventListener('new_message', (event) => {
        try {
          const incoming = JSON.parse(event.data);
          const adminMessages = Array.isArray(incoming) 
            ? incoming.filter((m: any) => m.gonderenTipi === 'admin')
            : incoming.gonderenTipi === 'admin' ? [incoming] : [];

          if (adminMessages.length > 0) {
            const last = adminMessages[adminMessages.length - 1];
            setLatestMessage(last.mesaj);
            setUnreadCount((prev) => prev + 1);
            setShowToast(true);
            setIsDismissed(false); // Re-open on incoming message
            playNotificationSound();

            let flash = false;
            const originalTitle = document.title;
            const interval = setInterval(() => {
              document.title = flash ? '💬 (1) Yeni Mesajınız Var!' : originalTitle;
              flash = !flash;
            }, 1000);

            setTimeout(() => {
              clearInterval(interval);
              document.title = originalTitle;
            }, 10000);
          }
        } catch (err) {}
      });

      return () => {
        eventSource.close();
      };
    }
  }, [isChatPage, pathname]);

  // Set default initial position on screen bottom-right
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth - 76,
        y: window.innerHeight - 150,
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
      {/* ── 1. EN TEPEDE SIFIR MARGİNLİ MOBİL PUSH BİLDİRİM BARI ──────────────── */}
      {showToast && latestMessage && (
        <div className="fixed top-0 left-0 right-0 w-full z-50 animate-in slide-in-from-top duration-200 shadow-[0_15px_50px_rgba(0,0,0,0.95)]">
          <div className="w-full bg-[#161b22] border-b-2 border-amber-400 px-3.5 py-3 flex items-center justify-between gap-3 backdrop-blur-3xl">
            <div 
              onClick={() => {
                setShowToast(false);
                router.push('/chat');
              }}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 active:opacity-80 transition-opacity"
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
                  <Headphones className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#161b22] animate-ping" />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-white font-heading">
                      Best Eskort Canlı Destek
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                      YENİ
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5 font-heading">
                    <span>Cevapla ➔</span>
                  </span>
                </div>
                
                <p className="text-xs text-[#f0f6fc] font-medium truncate mt-0.5">
                  "{latestMessage}"
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white shrink-0 active:scale-90 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. AŞAĞIYA ÇEKİLDİĞİNDE AÇILAN "X KAPAT" HEDEF ALANI (Messenger Stili) ──────────────── */}
      {isDragging && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-fit z-[99998] flex flex-col items-center gap-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 shadow-2xl ${
            isOverDropTarget 
              ? 'bg-red-600 border-white scale-125 shadow-red-600/80 text-white' 
              : 'bg-black/80 border-red-500/60 text-red-400 backdrop-blur-md'
          }`}>
            <X className={`w-7 h-7 stroke-[3] transition-transform ${isOverDropTarget ? 'rotate-90 scale-110' : ''}`} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-white bg-black/80 px-3 py-0.5 rounded-full border border-white/10 font-heading">
            {isOverDropTarget ? 'Bırak ve Kapat' : 'Kapatmak için aşağı çekin'}
          </span>
        </div>
      )}

      {/* ── 3. SÜRÜKLENEBİLİR VE TEK TIKLA X İLE KAPANABİLİR CHAT BALONU ──────────────── */}
      {!isDismissed && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 9999,
            touchAction: 'none',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          className="cursor-grab active:cursor-grabbing select-none group"
        >
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.55)] border-2 border-amber-200 active:scale-95 transition-transform">
            
            {/* Ortadaki Chat İkonu */}
            <MessageSquare className="w-6 h-6 stroke-[2.5] fill-slate-950 pointer-events-none" />

            {/* Yeşil Canlı Nokta */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1117] animate-pulse" />

            {/* Kırmızı Bildirim Sayacı */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-600 text-white font-black text-[10px] ring-2 ring-[#0d1117] flex items-center justify-center animate-bounce shadow-lg">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── 4. KAPATILDIĞINDA TEKRAR AÇMA DÜĞMESİ ("bi yerden açılsın tabii") ──────────────── */}
      {isDismissed && (
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="fixed bottom-5 right-4 z-40 px-3.5 py-2 rounded-2xl bg-[#161b22]/95 hover:bg-[#21262d] border border-amber-500/50 text-white text-xs font-black font-heading shadow-xl backdrop-blur-md flex items-center gap-2 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span>Canlı Chat</span>
        </button>
      )}
    </>
  );
}
