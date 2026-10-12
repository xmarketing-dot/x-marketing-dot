'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Headphones, MessageSquare, X, ArrowRight } from 'lucide-react';

export default function GlobalChatNotification() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
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

  // Canlı Destek Bildirim Zili (İki tonlu net ve dikkat çekici ses)
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch (e) {}
  };

  // Yeni admin mesajı geldiğinde tam bildirim fırlatıcı
  const triggerNotification = (msgText: string, newTotalCount?: number) => {
    setLatestMessage(msgText);
    setUnreadCount((prev) => (typeof newTotalCount === 'number' ? newTotalCount : prev + 1));
    setShowToast(true);
    setIsDismissed(false); // Kullanıcı balonu kapatmışsa bile yeni mesajda zorla öne çıkar
    playNotificationSound();

    // Sekme başlığı animasyonu (10 saniye boyunca dikkat çeker)
    let flash = false;
    const originalTitle = document.title;
    const interval = setInterval(() => {
      document.title = flash ? '💬 (1) Yeni Mesajınız Var!' : originalTitle;
      flash = !flash;
    }, 900);

    setTimeout(() => {
      clearInterval(interval);
      document.title = originalTitle;
    }, 12000);
  };

  // 1. Thread Takibi ve Anlık 0ms SSE + Polling Dinleme Motoru
  useEffect(() => {
    if (isChatPage || isSecurePortal) {
      setUnreadCount(0);
      setShowToast(false);
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

    // A) İlk Yükleme: Sayfa açılır açılmaz veritabanındaki okunmamış admin mesajlarını alıp balona yaz
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
            setShowToast(true);
          }
        }
      } catch (e) {}
    };

    fetchInitialUnread();

    // B) Anlık 0ms SSE Bağlantısı: Admin panelden mesaj bastığı anda tetiklenir
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
            setShowToast(false);
          }
        } catch (err) {}
      });

      eventSource.onerror = () => {
        // SSE koparsa tarayıcı otomatik yeniden dener
      };
    } catch (e) {}

    // C) Fallback Polling (Her 8 saniyede bir kontrol)
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
    }, 8000);

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
      {/* ── 1. EN TEPEDE AÇILAN MOBİL / MASAÜSTÜ PUSH BİLDİRİM BARI ──────────────── */}
      {showToast && latestMessage && (
        <div className="fixed top-2 left-3 right-3 sm:left-auto sm:right-5 sm:w-96 z-[99999] animate-in slide-in-from-top-4 duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
          <div className="w-full bg-[#161b22]/98 border-2 border-amber-400 rounded-2xl p-3 flex items-center justify-between gap-3 backdrop-blur-2xl ring-4 ring-amber-500/20">
            <div 
              onClick={() => {
                setShowToast(false);
                router.push('/chat');
              }}
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 active:opacity-80 transition-opacity"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/40">
                  <Headphones className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-[#161b22] animate-ping" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-[#161b22]" />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-xs text-white">
                      Canlı Destek
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black uppercase">
                      YENİ MESAJ
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-0.5 font-heading shrink-0">
                    <span>Aç ➔</span>
                  </span>
                </div>
                
                <p className="text-xs text-[#f0f6fc] font-semibold truncate mt-0.5">
                  "{latestMessage}"
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white shrink-0 active:scale-90 transition-transform"
              title="Kapat"
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

      {/* ── 3. SÜRÜKLENEBİLİR VE FARK EDİLMESİ İMKANSIZ CHAT BALONU ──────────────── */}
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
          {/* Unread Mesaj Olduğunda Yanıp Sönen Kırmızı Radar Dalgaları (Kaçırılması İmkansız!) */}
          {unreadCount > 0 && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
              <span className="absolute -inset-2 rounded-full bg-amber-400/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Balonun Yanından Çıkan Şık Konuşma Bildirimi */}
          {unreadCount > 0 && latestMessage && (
            <div 
              onClick={() => router.push('/chat')}
              className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-red-500 text-white text-xs font-bold shadow-2xl backdrop-blur-md whitespace-nowrap cursor-pointer hover:bg-slate-900 transition-colors pointer-events-auto"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="truncate max-w-[140px] text-amber-300 font-heading font-black">Yeni Mesaj:</span>
              <span className="truncate max-w-[150px] font-medium text-slate-200">"{latestMessage}"</span>
            </div>
          )}

          {/* Ana Balon */}
          <div className={`relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.55)] border-2 border-amber-200 active:scale-95 transition-all ${
            unreadCount > 0 ? 'scale-110 ring-4 ring-red-500/60 shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-bounce' : ''
          }`}>
            
            {/* Ortadaki Chat İkonu */}
            <MessageSquare className="w-6 h-6 stroke-[2.5] fill-slate-950 pointer-events-none" />

            {/* Yeşil Canlı Durum Noktası */}
            {unreadCount === 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0d1117] animate-pulse" />
            )}

            {/* BÜYÜK KIRMIZI BİLDİRİM SAYACI (+1 / +2 ROZETİ) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[24px] h-6 px-1 rounded-full bg-red-600 border-2 border-white text-white font-black text-xs shadow-2xl flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : `+${unreadCount}`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── 4. KAPATILDIĞINDA TEKRAR AÇMA DÜĞMESİ ──────────────── */}
      {isDismissed && (
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className={`fixed bottom-5 right-4 z-40 px-3.5 py-2 rounded-2xl bg-[#161b22]/98 border text-white text-xs font-black font-heading shadow-2xl backdrop-blur-md flex items-center gap-2 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 ${
            unreadCount > 0 ? 'border-red-500 ring-4 ring-red-500/30' : 'border-amber-500/50'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-amber-400 fill-amber-400" />
            {unreadCount > 0 ? (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
                +{unreadCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <span>Canlı Destek</span>
        </button>
      )}
    </>
  );
}
