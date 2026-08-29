'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, 
  Sparkles, 
  ChevronLeft, 
  CheckCheck, 
  Clock, 
  SendHorizontal, 
  RefreshCw, 
  Zap, 
  Lock,
  KeyRound,
  Wallet,
  Copy,
  Check,
  CreditCard,
  Loader2
} from 'lucide-react';
import CryptoPaymentCard from '@/components/common/CryptoPaymentCard';

interface Message {
  _id: string;
  threadId: string;
  gonderenTipi: 'user' | 'admin';
  mesaj: string;
  okundu: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('best_eskort_chat_thread_id');
    }
    return null;
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('best_eskort_chat_cached_messages');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [bannedInfo, setBannedInfo] = useState<{ isBanned: boolean; banSebebi?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages to local cache for instant 0ms restoration next time
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('best_eskort_chat_cached_messages', JSON.stringify(messages.slice(-50)));
      } catch (e) {}
    }
  }, [messages]);

  // 1. Mobile Virtual Keyboard Scroll Handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // 2. Initialize / Validate user thread on mount
  useEffect(() => {
    const initThread = async () => {
      try {
        const savedThreadId = typeof window !== 'undefined' ? localStorage.getItem('best_eskort_chat_thread_id') : null;

        const res = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId: savedThreadId }),
        });
        const data = await res.json();
        
        if (res.status === 403 || data.isBanned) {
          setBannedInfo({ isBanned: true, banSebebi: data.banSebebi || 'Erişiminiz kısıtlanmıştır.' });
          return;
        }

        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }

        if (data.thread?._id) {
          if (data.thread._id !== threadId) {
            setThreadId(data.thread._id);
          }
          localStorage.setItem('best_eskort_chat_thread_id', data.thread._id);
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        // Silent
      }
    };

    initThread();
  }, []);

  // 3. Fetch initial message history & SSE
  useEffect(() => {
    if (!threadId) return;

    fetch(`/api/chat/messages?threadId=${threadId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    const eventSource = new EventSource(`/api/chat/sse?threadId=${threadId}`);

    eventSource.addEventListener('new_message', (event) => {
      try {
        const incoming: Message[] = JSON.parse(event.data);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const uniqueNew = incoming.filter((m) => !existingIds.has(m._id));
          return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
        });
      } catch (err) {
        // Silent
      }
    });

    return () => {
      eventSource.close();
    };
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text || inputText).trim();
    if (!content || sending) return;

    if (!text) setInputText('');
    setSending(true);

    try {
      let activeThreadId = threadId;

      // Ensure thread is created if not ready
      if (!activeThreadId) {
        const savedThreadId = typeof window !== 'undefined' ? localStorage.getItem('best_eskort_chat_thread_id') : null;
        const startRes = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId: savedThreadId }),
        });
        const startData = await startRes.json();
        if (startData.thread?._id) {
          activeThreadId = startData.thread._id;
          setThreadId(startData.thread._id);
          localStorage.setItem('best_eskort_chat_thread_id', startData.thread._id);
          window.dispatchEvent(new Event('storage'));
        }
      }

      if (!activeThreadId) {
        setSending(false);
        return;
      }

      // Optimistic message
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: Message = {
        _id: tempId,
        threadId: activeThreadId,
        gonderenTipi: 'user',
        mesaj: content,
        okundu: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // Post message to backend
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: activeThreadId,
          gonderenTipi: 'user',
          mesaj: content,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => 
          prev.map((m) => (m._id === tempId ? data.message : m))
        );
      }
    } catch (e) {
      // Silent
    } finally {
      setSending(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const quickPrompts = [
    '👑 Ultra VIP İlan için ödeme yapmak istiyorum',
    '💳 Güncel IBAN / Kripto hesap bilgisi alabilir miyim?',
    '🔑 İlan onayından sonra panel şifresi nasıl veriliyor?'
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#0d1117] flex flex-col justify-between overflow-hidden max-w-lg mx-auto md:border-x md:border-[#30363d] shadow-2xl relative">
      
      {/* ── 1. FIXED TOP HEADER ──────────────── */}
      <header className="shrink-0 h-16 px-4 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 -ml-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#161b22] animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white font-heading">
                Best VIP Canlı Destek
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[9px] uppercase border border-amber-500/30">
                Yetkili
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Çevrimiçi &bull; Ortalama yanıt 2 dk
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs text-[#8b949e] hover:text-white font-bold transition-colors border border-[#30363d]"
        >
          Ana Sayfa
        </Link>
      </header>

      {/* ── 2. SCROLLABLE MESSAGE AREA OR BANNED SCREEN ──────────────── */}
      {bannedInfo?.isBanned ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 bg-[#0d1117]">
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-black animate-pulse shadow-2xl">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <h2 className="text-lg font-black text-white font-heading">Erişiminiz Kısıtlanmıştır</h2>
            <p className="text-xs text-red-400 font-bold mt-1 bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
              {bannedInfo.banSebebi || 'Güvenlik ve kural ihlali nedeniyle canlı desteğe erişiminiz engellendi.'}
            </p>
          </div>

          <Link
            href="/"
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold transition-all border border-[#30363d]"
          >
            Ana Sayfaya Dön
          </Link>
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        
        {/* Onboarding Karşılama Kartı */}
        <div className="p-4 rounded-3xl bg-[#161b22] border border-[#30363d] flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="font-black text-xs text-white font-heading tracking-wide">
                Canlı Destek &amp; Yönetici Karşılama
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase border border-emerald-500/30">
              Online
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[11px] text-[#c9d1d9] leading-relaxed font-medium">
            <div className="flex items-start gap-2 text-amber-300 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>⚡ 5 Dakika içinde temsilcimiz size geri dönüş sağlayacaktır.</span>
            </div>

            <div className="flex items-start gap-2">
              <SendHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>📲 Kesintisiz iletişim için lütfen <strong>Telegram kullanıcı adınızı</strong> veya WhatsApp numaranızı bırakın.</span>
            </div>

            <div className="flex items-start gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>🔄 Veya bu sayfayı daha sonra tekrar açarak yöneticinin cevabını görebilirsiniz.</span>
            </div>

            <div className="flex items-start gap-2 text-emerald-300">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>💳 Güncel fiyat listesi, IBAN / Kripto (USDT) ödeme yöntemleri ve onay için yöneticiden yanıt bekleyiniz.</span>
            </div>

            {/* HIZLI KRİPTO CÜZDAN ADRESİ */}
            <div className="pt-1">
              <CryptoPaymentCard />
            </div>

            <div className="flex items-start gap-2 text-[#8b949e] border-t border-white/5 pt-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>🔑 Ödeme sonrasında size özel <strong>İlan Yönetim Paneli Şifreniz</strong> buradan verilecektir.</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[9px] text-[#8b949e]">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>256-Bit Uçtan Uca Şifreli Görüşme</span>
            </div>
            <span className="text-emerald-400 font-bold">● Aktif Temsilci</span>
          </div>
        </div>

        {/* Hızlı Soru Butonları */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-1.5 my-1">
            <span className="text-[10px] text-[#8b949e] font-bold uppercase tracking-wider px-1">
              ⚡ Hızlı Başlat:
            </span>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-3.5 py-2.5 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-amber-400/50 text-xs text-[#c9d1d9] font-medium transition-all active:scale-[0.98] shadow-sm flex items-center justify-between group"
                >
                  <span>{prompt}</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mesaj Balonları */}
        {messages.map((msg) => {
          const isAdmin = msg.gonderenTipi === 'admin';
          return (
            <div
              key={msg._id}
              className={`flex flex-col max-w-[85%] ${isAdmin ? 'self-start' : 'self-end items-end'}`}
            >
              <div
                className={`p-3.5 rounded-3xl text-xs leading-relaxed shadow-lg whitespace-pre-wrap break-words ${
                  isAdmin
                    ? 'bg-[#161b22] text-[#f0f6fc] rounded-tl-sm border border-[#30363d]'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold rounded-tr-sm shadow-amber-500/20'
                }`}
              >
                {msg.mesaj.split(/(https?:\/\/[^\s]+)/g).map((part, idx) => {
                  if (part.startsWith('http://') || part.startsWith('https://')) {
                    return (
                      <a
                        key={idx}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 underline font-black hover:text-amber-300 break-all block my-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30"
                      >
                        🔗 {part}
                      </a>
                    );
                  }
                  return part;
                })}
              </div>

              <div className="flex items-center gap-1 mt-1 px-1.5 text-[9px] text-[#8b949e] font-medium">
                <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                {!isAdmin && <CheckCheck className="w-3 h-3 text-amber-400" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>
      )}

      {/* ── 3. FIXED BOTTOM INPUT (KLAVYE ÜSTÜNE TAM YAPIŞAN BAR) ─────────────── */}
      {!bannedInfo?.isBanned && (
        <footer className="shrink-0 p-3 px-4 bg-[#161b22] border-t border-[#30363d] z-30 pb-[max(env(safe-area-inset-bottom),12px)]">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              handleSend(); 
            }} 
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Mesajınızı yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 250);
              }}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#21262d] border border-[#30363d] text-white text-[16px] sm:text-xs placeholder-[#8b949e] focus:outline-none focus:border-amber-400 transition-colors font-medium"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="w-11 h-11 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/25 transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center shrink-0"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
              ) : (
                <Send className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </form>
        </footer>
      )}

    </div>
  );
}

