'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  X,
  Minus,
  Maximize2,
  Send,
  Loader2,
  Check,
  CheckCheck,
  ChevronLeft,
  Volume2,
  VolumeX,
  Search,
  Users,
  Radio,
  Clock,
  ExternalLink,
  ChevronUp,
  Sparkles,
  User,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useAdminWhatsApp } from '@/lib/siteConfig';

interface Thread {
  _id: string;
  kullaniciAdi: string;
  kullaniciTelefon?: string;
  ip?: string;
  isBanned?: boolean;
  listingId?: string;
  listingBaslik?: string;
  listingSlug?: string;
  listingRozet?: string;
  sonMesajOzeti: string;
  okunmadiAdminSayisi: number;
  updatedAt: string;
}

interface Message {
  _id: string;
  threadId: string;
  gonderenTipi: 'user' | 'admin';
  mesaj: string;
  okundu?: boolean;
  createdAt: string;
}

function playAdminDing() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

export default function AdminFloatingChat() {
  const pathname = usePathname();
  const { display, formatted, waLink } = useAdminWhatsApp();

  // Widget view states
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'list'>('chat'); // 'chat' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Data states
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs to prevent closure staleness and window scroll jumping
  const activeThreadRef = useRef<Thread | null>(null);
  activeThreadRef.current = activeThread;

  const prevTotalUnreadRef = useRef<number>(0);
  const messageListRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef<boolean>(true);
  const prevMessagesCountRef = useRef<number>(0);

  // 1. Hide on dedicated /chat page to avoid duplicate interface
  const isChatPage = pathname === '/bms-secure-portal/chat';

  // Sound preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bms_floating_chat_sound');
      if (saved !== null) {
        setSoundEnabled(saved === '1');
      }
    } catch (e) {}
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('bms_floating_chat_sound', next ? '1' : '0');
    } catch (e) {}
  };

  // 2. Fetch all threads and auto-pop on new message
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/admin/chat/threads', { cache: 'no-store' });
      const data = await res.json();
      if (data.threads && Array.isArray(data.threads)) {
        setThreads(data.threads);

        const currentTotalUnread = data.threads.reduce(
          (acc: number, t: Thread) => acc + (t.okunmadiAdminSayisi || 0),
          0
        );

        // Auto-popup: only when incoming unread count INCREASES and admin is not on /chat
        if (
          !isFirstLoadRef.current &&
          currentTotalUnread > prevTotalUnreadRef.current &&
          !isChatPage
        ) {
          if (soundEnabled) playAdminDing();

          // Find the thread that received the new message
          const incomingThread = data.threads.find((t: Thread) => (t.okunmadiAdminSayisi || 0) > 0);
          if (incomingThread) {
            setActiveThread(incomingThread);
            setViewMode('chat');
            setIsOpen(true);
            setIsMinimized(false);
          }
        }

        // Initialize active thread on very first load if none set
        if (!activeThreadRef.current && data.threads.length > 0) {
          const firstUnread = data.threads.find((t: Thread) => (t.okunmadiAdminSayisi || 0) > 0);
          setActiveThread(firstUnread || data.threads[0]);
        } else if (activeThreadRef.current) {
          // Keep active thread data fresh
          const refreshed = data.threads.find((t: Thread) => t._id === activeThreadRef.current?._id);
          if (refreshed) {
            setActiveThread(refreshed);
          }
        }

        prevTotalUnreadRef.current = currentTotalUnread;
        isFirstLoadRef.current = false;
      }
    } catch (e) {}
  };

  // Poll threads across entire portal every 5 seconds
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchThreads();
    }, 5000);
    return () => clearInterval(interval);
  }, [soundEnabled, isChatPage]);

  // 3. Load messages for active thread
  useEffect(() => {
    if (!activeThread || !isOpen || isMinimized) return;

    // Mark as read in backend
    fetch('/api/admin/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: activeThread._id }),
    }).catch(() => {});

    // Update unread count locally for instant UI responsiveness
    setThreads((prev) =>
      prev.map((t) => (t._id === activeThread._id ? { ...t, okunmadiAdminSayisi: 0 } : t))
    );

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?threadId=${activeThread._id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (e) {}
    };

    loadMessages();

    // Polling active thread messages every 3 seconds
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMessages();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeThread?._id, isOpen, isMinimized]);

  // SAFE SCROLL: Scroll ONLY the internal chat container, NEVER the window or page!
  const scrollContainerToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized && viewMode === 'chat') {
      // Only scroll when message count changes or thread switches
      if (messages.length !== prevMessagesCountRef.current) {
        prevMessagesCountRef.current = messages.length;
        // Small delay to ensure DOM has rendered
        setTimeout(scrollContainerToBottom, 30);
      }
    }
  }, [messages.length, activeThread?._id, isOpen, isMinimized, viewMode]);

  // Total unread count for badge
  const totalUnreadCount = useMemo(() => {
    return threads.reduce((acc, t) => acc + (t.okunmadiAdminSayisi || 0), 0);
  }, [threads]);

  // Filtered threads for selection list
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (filterUnreadOnly && (t.okunmadiAdminSayisi || 0) === 0) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.kullaniciAdi?.toLowerCase().includes(q) ||
        t.listingBaslik?.toLowerCase().includes(q) ||
        t.ip?.toLowerCase().includes(q) ||
        t.sonMesajOzeti?.toLowerCase().includes(q)
      );
    });
  }, [threads, searchQuery, filterUnreadOnly]);

  // Send reply handler
  const handleSendReply = async (customText?: string) => {
    const textToSend = (typeof customText === 'string' ? customText : replyText).trim();
    if (!textToSend || !activeThread || sending) return;

    const currentThreadId = activeThread._id;
    setReplyText('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentThreadId,
          gonderenTipi: 'admin',
          mesaj: textToSend,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        setTimeout(scrollContainerToBottom, 30);
      }
    } catch (e) {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // If currently on /chat page, do not render floating widget
  if (isChatPage) return null;

  // ══════════════════════════════════════════════════════════════
  // A. MINIMIZED STATE (SLEEK BOTTOM DOCK TAB)
  // ══════════════════════════════════════════════════════════════
  if (isOpen && isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 sm:right-6 z-50">
        <div
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-3 px-3.5 py-2.5 rounded-t-2xl bg-[#090d16]/95 hover:bg-[#0e1424] border-t border-x border-emerald-500/30 text-white shadow-[0_-8px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl cursor-pointer transition-all hover:border-emerald-500/60"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#090d16] animate-pulse" />
          </div>

          <div className="flex items-center gap-2 max-w-[170px] truncate">
            <span className="font-heading font-black text-xs truncate text-slate-100 group-hover:text-emerald-300 transition-colors">
              {activeThread ? activeThread.kullaniciAdi : 'Canlı Sohbet'}
            </span>
            {activeThread?.listingRozet && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold uppercase border border-emerald-500/20">
                {activeThread.listingRozet}
              </span>
            )}
          </div>

          {totalUnreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse shadow-md">
              +{totalUnreadCount}
            </span>
          )}

          <div className="flex items-center gap-1 text-slate-400 group-hover:text-white pl-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1 hover:text-emerald-400 transition-colors"
              title="Genişlet"
            >
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="p-1 hover:text-rose-400 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // B. CLOSED STATE (FLOATING TRIGGER BUTTON)
  // ══════════════════════════════════════════════════════════════
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="relative group px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-[#090d16]/95 hover:bg-[#0e1424] text-white font-heading font-bold shadow-[0_10px_35px_rgba(0,0,0,0.8)] border border-emerald-500/40 hover:border-emerald-400 flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer backdrop-blur-xl"
          title="BMS Canlı Destek Masasını Aç"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090d16] absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
              Canlı Destek
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {threads.length} Aktif Sohbet
            </span>
          </div>

          {totalUnreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black animate-pulse shadow-md border border-rose-400/40">
              +{totalUnreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // C. EXPANDED CYBER LUXURY CHAT WINDOW
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="fixed bottom-3 right-3 sm:right-6 z-50 w-[350px] sm:w-[410px] h-[550px] max-h-[88vh] bg-[#080c14] border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden backdrop-blur-2xl ring-1 ring-emerald-500/20">
      
      {/* ── 1. HEADER (CYBER GLASSMORPHISM) ────────────────────── */}
      <div className="px-3.5 py-2.5 bg-[#0a0f18]/95 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        
        {/* Left: View Mode Toggle / Active Customer Info */}
        <div className="flex items-center gap-2 min-w-0">
          {viewMode === 'chat' ? (
            <>
              {/* Back to threads list button */}
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors shrink-0"
                title="Tüm Sohbetler Listesi"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0a0f18] animate-pulse" />
              </div>

              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-xs text-white truncate max-w-[130px]">
                    {activeThread?.kullaniciAdi || 'Müşteri'}
                  </span>
                  {activeThread?.listingRozet && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold uppercase border border-emerald-500/20 shrink-0">
                      {activeThread.listingRozet}
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 truncate">
                  {activeThread?.listingBaslik || (activeThread?.ip ? `IP: ${activeThread.ip}` : 'Canlı Ziyaretçi')}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-black text-xs text-white">
                  Sohbet Masası
                </span>
                <span className="text-[10px] text-slate-400">
                  {threads.length} Toplam Konuşma
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          
          {/* Thread List Switcher Button */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'chat' ? 'list' : 'chat')}
            className={`px-2 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
              viewMode === 'list'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white'
            }`}
            title="Sohbet Listesini Göster/Gizle"
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Sohbetler</span>
            {totalUnreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                {totalUnreadCount}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Full Screen Link */}
          <Link
            href={`/bms-secure-portal/chat?threadId=${activeThread?._id || ''}`}
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Büyük Chat Masasına Git"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(false);
            }}
            className="p-1.5 rounded-xl hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
            title="Pencereyi Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── TOP HORIZONTAL QUICK SWITCHER PILLS (WHEN IN CHAT MODE) ── */}
      {viewMode === 'chat' && threads.length > 1 && (
        <div className="px-3 py-1.5 bg-[#070b12] border-b border-slate-800/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold shrink-0">
            Hızlı Geç:
          </span>
          {threads.slice(0, 10).map((t) => {
            const isCurrent = activeThread?._id === t._id;
            return (
              <button
                key={t._id}
                type="button"
                onClick={() => {
                  setActiveThread(t);
                  setViewMode('chat');
                }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                <span className="max-w-[70px] truncate">{t.kullaniciAdi}</span>
                {t.okunmadiAdminSayisi > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {t.okunmadiAdminSayisi}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 2. VIEW CONTENT: EITHER THREADS LIST OR ACTIVE CHAT ── */}
      {viewMode === 'list' ? (
        /* ══════════════════════════════════════════════════════════
           VIEW A: THREAD SELECTION & MANAGEMENT
           ══════════════════════════════════════════════════════════ */
        <div className="flex-1 flex flex-col bg-[#070b12] overflow-hidden">
          
          {/* Search & Filter Header */}
          <div className="p-2.5 border-b border-slate-800/80 flex flex-col gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Sohbet veya müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0b101b] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterUnreadOnly(false)}
                  className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase transition-all ${
                    !filterUnreadOnly
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tümü ({threads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterUnreadOnly(true)}
                  className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase flex items-center gap-1 transition-all ${
                    filterUnreadOnly
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Okunmamış</span>
                  {totalUnreadCount > 0 && (
                    <span className="px-1 py-0.1 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                      {totalUnreadCount}
                    </span>
                  )}
                </button>
              </div>

              <span className="font-mono text-slate-500">
                {filteredThreads.length} sonuç
              </span>
            </div>
          </div>

          {/* Threads Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800">
            {filteredThreads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2">
                <MessageSquare className="w-8 h-8 opacity-40" />
                <span className="text-xs font-bold text-slate-400">Eşleşen Sohbet Bulunamadı</span>
                <span className="text-[10px]">Arama filtrenizi temizleyip tekrar deneyin.</span>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = activeThread?._id === t._id;
                const hasUnread = (t.okunmadiAdminSayisi || 0) > 0;

                return (
                  <div
                    key={t._id}
                    onClick={() => {
                      setActiveThread(t);
                      setViewMode('chat');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : hasUnread
                        ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 text-white'
                        : 'bg-[#090d16] hover:bg-[#0e1424] border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          hasUnread ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#070b12]" />
                      </div>

                      <div className="flex flex-col min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-bold text-xs truncate">
                            {t.kullaniciAdi}
                          </span>
                          {t.listingRozet && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-mono text-[9px] font-bold uppercase">
                              {t.listingRozet}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {t.sonMesajOzeti || 'Henüz mesaj yok...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-mono text-slate-500">
                        {t.updatedAt
                          ? new Date(t.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                      {hasUnread && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black animate-pulse">
                          +{t.okunmadiAdminSayisi}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════
           VIEW B: ACTIVE CHAT MESSAGING VIEW
           ══════════════════════════════════════════════════════════ */
        <div className="flex-1 flex flex-col bg-[#070b12] overflow-hidden">
          
          {/* Scrollable Message Stream: Internal Container ONLY */}
          <div
            ref={messageListRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5 bg-[#070b12] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800"
          >
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center my-auto gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#0c101b] border border-slate-800 flex items-center justify-center text-emerald-400 shadow-md">
                  <MessageSquare className="w-5 h-5 opacity-60" />
                </div>
                <span className="font-heading font-black text-xs text-white">Sohbet Başlamadı</span>
                <span className="text-[11px] text-slate-400 max-w-[240px]">
                  Aşağıdaki hazır butonlara dokunarak veya mesaj yazarak müşteriye hemen yanıt verebilirsiniz.
                </span>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isAdmin = m.gonderenTipi === 'admin';
                return (
                  <div
                    key={m._id || idx}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} max-w-[85%] ${
                      isAdmin ? 'self-end' : 'self-start'
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                        isAdmin
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium rounded-tr-xs shadow-emerald-500/10'
                          : 'bg-[#101726] text-slate-100 border border-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.mesaj}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-slate-500 font-mono">
                      <span>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {isAdmin && (
                        <span>
                          {m.okundu ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Check className="w-3 h-3 text-slate-500" />}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Canned Chips Bar */}
          <div className="px-3 py-1.5 bg-[#0a0f18] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => {
                const phoneText = display || formatted || '+90 534 000 00 00';
                const whatsappUrl = waLink || 'https://wa.me/905340000000';
                handleSendReply(`Merhaba! 👑 Best Eskort VIP Destek Merkezine hoş geldiniz.\n\nİlanınızı doğrudan WhatsApp hattımızdan (${phoneText}) oluşturabilirsiniz:\n👉 ${whatsappUrl}\n\n👑 VIP: 7.000 TL | 💎 GOLD: 4.000 TL | 🥈 SILVER: 2.500 TL`);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-heading font-black shrink-0 whitespace-nowrap transition-all"
            >
              👑 VIP Tarifeler
            </button>

            <button
              type="button"
              onClick={() => {
                handleSendReply('🎉 Tebrikler! İlanınız incelendi ve başarıyla yayına alındı. Müşteri panelinizden kontrol edebilirsiniz.');
              }}
              className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[10px] font-heading font-black shrink-0 whitespace-nowrap transition-all"
            >
              ✅ Onaylandı
            </button>

            <button
              type="button"
              onClick={() => {
                handleSendReply('Ödeme Adresi (USDT BEP-20): 0xb7259aef66c9cd16e5a5d879baf0107bea03f527\nLütfen işlem sonrası dekont veya TXID iletiniz.');
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-heading font-black shrink-0 whitespace-nowrap transition-all"
            >
              💎 USDT Kripto
            </button>

            <button
              type="button"
              onClick={() => {
                handleSendReply('Merhaba, ilanınızın yayınlanabilmesi için güncel teyit fotoğrafı veya kimlik doğrulama bilgisi iletmeniz gerekmektedir.');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-bold shrink-0 whitespace-nowrap transition-all"
            >
              📸 Teyit İste
            </button>
          </div>

          {/* Reply Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendReply();
            }}
            className="p-2.5 bg-[#0a0f18] border-t border-slate-800/90 flex items-center gap-2 shrink-0"
          >
            <textarea
              rows={1}
              placeholder="Yanıt yazın... (Enter gönderir)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 rounded-xl bg-[#070b12] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 resize-none max-h-20 transition-colors"
            />

            <button
              type="submit"
              disabled={sending || !replyText.trim() || !activeThread}
              className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer font-bold"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
