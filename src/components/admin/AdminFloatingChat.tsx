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
  Sparkles,
  ExternalLink,
  ChevronUp,
  Volume2,
  VolumeX,
  Crown,
  User,
  Key,
  Copy,
  ChevronDown
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
  username?: string;
  password?: string;
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

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showThreadSelector, setShowThreadSelector] = useState(false);

  const prevTotalUnreadRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef<boolean>(true);

  // 1. Hide on dedicated /chat page to avoid duplicate chat UI
  const isChatPage = pathname === '/bms-secure-portal/chat';

  // 2. Fetch threads and detect incoming messages for auto-popup
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

        // Auto-popup trigger: if new unread message arrives and admin is NOT on /chat
        if (
          !isFirstLoadRef.current &&
          currentTotalUnread > prevTotalUnreadRef.current &&
          !isChatPage
        ) {
          if (soundEnabled) playAdminDing();

          // Find the thread with newest unread message
          const unreadThread = data.threads.find((t: Thread) => (t.okunmadiAdminSayisi || 0) > 0);
          if (unreadThread) {
            setActiveThread(unreadThread);
            setIsOpen(true);
            setIsMinimized(false);
          }
        }

        // Set default active thread if none selected
        if (!activeThread && data.threads.length > 0) {
          const firstUnread = data.threads.find((t: Thread) => (t.okunmadiAdminSayisi || 0) > 0);
          setActiveThread(firstUnread || data.threads[0]);
        }

        prevTotalUnreadRef.current = currentTotalUnread;
        isFirstLoadRef.current = false;
      }
    } catch (e) {}
  };

  // Poll threads every 6 seconds across whole admin portal
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchThreads();
    }, 6000);
    return () => clearInterval(interval);
  }, [soundEnabled, isChatPage]);

  // 3. Load messages when activeThread changes or when opened
  useEffect(() => {
    if (!activeThread || !isOpen || isMinimized) return;

    // Mark as read in backend
    fetch('/api/admin/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: activeThread._id }),
    }).catch(() => {});

    // Update unread count locally
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

    // Fast polling every 3.5s while active thread is open
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMessages();
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [activeThread?._id, isOpen, isMinimized]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

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

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((acc, t) => acc + (t.okunmadiAdminSayisi || 0), 0);
  }, [threads]);

  // If admin is currently on the full /chat page, hide the mini floating widget
  if (isChatPage) return null;

  // ══════════════════════════════════════════════════════════════
  // A. MINIMIZED STATE (FACEBOOK BOTTOM TAB)
  // ══════════════════════════════════════════════════════════════
  if (isOpen && isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom duration-200">
        <div
          onClick={() => setIsMinimized(false)}
          className="h-11 px-4 rounded-t-2xl bg-[#0c1017] hover:bg-slate-900 border-t border-x border-slate-700/80 shadow-2xl flex items-center gap-2.5 cursor-pointer text-white transition-all group"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 max-w-[160px] truncate">
            <span className="font-heading font-black text-xs truncate">
              {activeThread ? activeThread.kullaniciAdi : 'Canlı Destek'}
            </span>
            {activeThread?.listingRozet && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold uppercase">
                {activeThread.listingRozet}
              </span>
            )}
          </div>

          {totalUnreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse shadow-md">
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
              className="p-1 hover:text-amber-400"
              title="Büyüt"
            >
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="p-1 hover:text-red-400"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // B. CLOSED STATE (FLOATING BUTTON WITH UNREAD COUNTER)
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
          className="relative group p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black shadow-2xl shadow-amber-500/30 flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
          title="BMS Canlı Destek Widget'ını Aç"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-slate-950" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <span className="hidden sm:inline text-xs uppercase tracking-wider">
            Canlı Chat
          </span>

          {totalUnreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-black animate-pulse shadow-md">
              +{totalUnreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // C. EXPANDED FACEBOOK CHAT WINDOW
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="fixed bottom-3 right-3 sm:right-6 z-50 w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] bg-[#0c1017] border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 backdrop-blur-xl">
      
      {/* ── 1. HEADER (CUSTOMER & CONTROLS) ────────────────────── */}
      <div className="px-4 py-3 bg-[#070a0f] border-b border-slate-800/90 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#070a0f] animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowThreadSelector(!showThreadSelector)}
                className="font-heading font-black text-xs text-white truncate max-w-[150px] hover:text-amber-400 flex items-center gap-1 transition-colors"
                title="Sohbet Seç"
              >
                <span className="truncate">{activeThread?.kullaniciAdi || 'Müşteri'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {activeThread?.listingRozet && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold uppercase shrink-0">
                  {activeThread.listingRozet}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 truncate">
              {activeThread?.listingBaslik || (activeThread?.ip ? `IP: ${activeThread.ip}` : 'Canlı Ziyaretçi')}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Full Screen Link */}
          <Link
            href={`/bms-secure-portal/chat?threadId=${activeThread?._id || ''}`}
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
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
            className="p-1 rounded-lg hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 1.1 THREAD SELECTOR DROPDOWN (MULTI-CONVERSATION) ── */}
      {showThreadSelector && (
        <div className="p-2 bg-[#070a0f] border-b border-slate-800 flex flex-col gap-1 max-h-48 overflow-y-auto shrink-0 animate-in slide-in-from-top-2 duration-150">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase px-2 py-1">
            Gelen Sohbetler ({threads.length})
          </span>
          {threads.slice(0, 8).map((t) => {
            const isSelected = activeThread?._id === t._id;
            return (
              <div
                key={t._id}
                onClick={() => {
                  setActiveThread(t);
                  setShowThreadSelector(false);
                }}
                className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isSelected ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300' : 'bg-[#0c1017] hover:bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-bold text-xs truncate">{t.kullaniciAdi}</span>
                  <span className="text-[10px] text-slate-500 truncate">{t.sonMesajOzeti || 'Henüz mesaj yok'}</span>
                </div>
                {t.okunmadiAdminSayisi > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono text-[9px] font-black animate-pulse shrink-0">
                    +{t.okunmadiAdminSayisi}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. MESSAGE STREAM CONTAINER ──────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5 bg-[#070a0f] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center my-auto gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-center text-amber-400 shadow-md">
              <MessageSquare className="w-5 h-5 opacity-60" />
            </div>
            <span className="font-heading font-black text-xs text-white">Mesaj Akışı Başlamadı</span>
            <span className="text-[11px] text-slate-400">
              Aşağıdaki butonlara dokunarak müşteriye hazır şablon veya mesaj iletebilirsiniz.
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
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-medium rounded-tr-xs'
                      : 'bg-[#161f2e] text-slate-100 border border-slate-700/60 rounded-tl-xs'
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
                      {m.okundu ? <CheckCheck className="w-3 h-3 text-amber-400" /> : <Check className="w-3 h-3 text-slate-500" />}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── 3. QUICK CANNED CHIPS BAR ────────────────────────── */}
      <div className="px-3 py-1.5 bg-[#0c1017] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => {
            const phoneText = display || formatted || '+90 534 000 00 00';
            const whatsappUrl = waLink || 'https://wa.me/905340000000';
            handleSendReply(`Merhaba! 👑 Best Eskort VIP Destek Merkezine hoş geldiniz.\n\nİlanınızı doğrudan WhatsApp hattımızdan (${phoneText}) oluşturabilirsiniz:\n👉 ${whatsappUrl}\n\n👑 VIP: 7.000 TL | 💎 GOLD: 4.000 TL | 🥈 SILVER: 2.500 TL`);
          }}
          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-heading font-black shrink-0 whitespace-nowrap transition-all"
        >
          👑 Tarifeler
        </button>

        <button
          type="button"
          onClick={() => {
            handleSendReply('🎉 Tebrikler! İlanınız incelendi ve başarıyla yayına alındı. Müşteri panelinizden düzenleyebilirsiniz.');
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-heading font-black shrink-0 whitespace-nowrap transition-all"
        >
          ✅ Onaylandı
        </button>

        <button
          type="button"
          onClick={() => {
            handleSendReply('Ödeme Adresi (USDT BEP-20): 0xb7259aef66c9cd16e5a5d879baf0107bea03f527\nLütfen işlem sonrası dekont veya TXID iletiniz.');
          }}
          className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-[10px] font-heading font-black shrink-0 whitespace-nowrap transition-all"
        >
          💎 Kripto
        </button>

        <button
          type="button"
          onClick={() => {
            handleSendReply('Merhaba, ilanınızın onaylanabilmesi için teyit fotoğrafı veya bilgi iletmeniz gerekmektedir.');
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-bold shrink-0 whitespace-nowrap transition-all"
        >
          📸 Teyit
        </button>
      </div>

      {/* ── 4. REPLY FORM (INPUT & SEND) ─────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendReply();
        }}
        className="p-2.5 bg-[#0c1017] border-t border-slate-800/90 flex items-center gap-2 shrink-0"
      >
        <textarea
          rows={1}
          placeholder="Yanıt yazın... (Enter gönderir)"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none max-h-20 transition-colors"
        />

        <button
          type="submit"
          disabled={sending || !replyText.trim() || !activeThread}
          className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
        </button>
      </form>

    </div>
  );
}
