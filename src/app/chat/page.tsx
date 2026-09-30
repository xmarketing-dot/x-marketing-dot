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
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { getAdminWhatsAppUrl } from '@/lib/siteConfig';

interface Message {
  _id: string;
  threadId: string;
  gonderenTipi: 'user' | 'admin';
  mesaj: string;
  okundu: boolean;
  createdAt: string;
}

function getSavedThreadId(): string | null {
  if (typeof window === 'undefined') return null;
  const ls = localStorage.getItem('best_eskort_chat_thread_id');
  if (ls) return ls;
  const match = document.cookie.match(/best_eskort_chat_thread_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string | null>(() => {
    return getSavedThreadId();
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
        const savedThreadId = getSavedThreadId();
        const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('panel_user_session') : null;
        let parsedUser: any = null;
        if (savedUserStr) {
          try { parsedUser = JSON.parse(savedUserStr); } catch (e) {}
        }

        const res = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            threadId: savedThreadId,
            kullaniciAdi: parsedUser?.ad ? `İlan Sahibi: ${parsedUser.ad}` : undefined,
            kullaniciTelefon: parsedUser?.telefon || parsedUser?.identifier || undefined,
          }),
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
          document.cookie = `best_eskort_chat_thread_id=${data.thread._id};path=/;max-age=31536000;SameSite=Lax`;
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

    // Otomatik senkronizasyon (SSE'ye ek olarak 2.5 saniyede bir sessiz kontrol — mesaj asla kaçmaz)
    const pollInterval = setInterval(() => {
      fetch(`/api/chat/messages?threadId=${threadId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && Array.isArray(data.messages)) {
            setMessages((prev) => {
              if (data.messages.length !== prev.length) {
                return data.messages;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 2500);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
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
      const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('panel_user_session') : null;
      let parsedUser: any = null;
      if (savedUserStr) {
        try { parsedUser = JSON.parse(savedUserStr); } catch (e) {}
      }

      const senderName = parsedUser?.ad ? `İlan Sahibi: ${parsedUser.ad}` : undefined;
      const senderPhone = parsedUser?.telefon || parsedUser?.identifier || undefined;

      if (!activeThreadId) {
        const savedThreadId = getSavedThreadId();
        const startRes = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            threadId: savedThreadId, 
            createIfNotFound: true,
            kullaniciAdi: senderName,
            kullaniciTelefon: senderPhone,
          }),
        });
        const startData = await startRes.json();
        if (startData.thread?._id) {
          activeThreadId = startData.thread._id;
          setThreadId(startData.thread._id);
          localStorage.setItem('best_eskort_chat_thread_id', startData.thread._id);
          document.cookie = `best_eskort_chat_thread_id=${startData.thread._id};path=/;max-age=31536000;SameSite=Lax`;
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
          kullaniciAdi: senderName,
          kullaniciTelefon: senderPhone,
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
    '👑 İlan Vermek İstiyorum (Fiyat ve Detay Alabilir miyim?)',
    '✅ İlan Verdim / Onaylatmak İstiyorum',
    '🚀 VIP Vitrin & Reklam Alanı Satın Almak İstiyorum',
    '🔑 İlan Yönetim Panel Şifremi Almak İstiyorum',
    '💳 Güncel IBAN / Kripto Ödeme Bilgisi Alabilir miyim?'
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

        <div className="flex items-center gap-2">
          <a
            href={getAdminWhatsAppUrl('Merhaba, Best VIP Canlı Destek üzerinden yazıyorum. İlan vermek ve onaylatmak istiyorum.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all font-heading"
            title="WhatsApp Destek Hattı"
          >
            <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>

          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-xs text-[#8b949e] hover:text-white font-bold transition-colors border border-[#30363d]"
          >
            Ana Sayfa
          </Link>
        </div>
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
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 flex flex-col gap-3.5 no-scrollbar">
        
        {/* ── KOCAMAN İLAN VERMEK İSTİYORUM & ADMIN WHATSAPP EYLEM BLOĞU ──────────────── */}
        <div className="flex flex-col gap-2.5 p-4 rounded-3xl bg-gradient-to-b from-[#1c2333] via-[#161b22] to-[#12161f] border-2 border-amber-500/60 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-1">
            <span className="font-heading font-black text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 fill-amber-400" />
              <span>Hızlı İlan &amp; Destek Masası</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 animate-pulse">
              ● Temsilci Aktif
            </span>
          </div>

          {/* KOCAMAN İLAN VERMEK İSTİYORUM BUTONU */}
          <Link
            href="/ilan-ver"
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-heading font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-sm font-black tracking-wide">👑 İLAN VERMEK İSTİYORUM</span>
                <span className="text-[10px] font-bold text-slate-900 opacity-90">Hemen Formu Doldur &amp; Yayınlat ➔</span>
              </div>
            </div>
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950 group-hover:scale-125 transition-transform" />
          </Link>

          {/* KOCAMAN ADMIN WHATSAPP BUTONU */}
          <a
            href={getAdminWhatsAppUrl('Merhaba, Best VIP Canlı Destek üzerinden yazıyorum. İlan vermek ve VIP vitrin hakkında bilgi almak istiyorum.')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <OfficialWhatsAppIcon className="w-6 h-6 fill-white shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-black">📲 ADMIN WHATSAPP DİREKT HATTI</span>
                <span className="text-[10px] font-medium text-emerald-100 opacity-95">Yöneticiye WhatsApp'tan Anında Yaz</span>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">TIKLA YAZ ➔</span>
          </a>

          {/* Kripto / Güvenlik Alt Notu */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <CryptoPaymentCard />
            <div className="flex items-center justify-between text-[10px] text-[#8b949e] px-1">
              <span>⚡ Ortalama yanıt süresi: <strong>2-5 Dakika</strong></span>
              <span>🔒 256-Bit Güvenli İletişim</span>
            </div>
          </div>
        </div>

        {/* ── HIZLI SORU / İLAN MESAJ BUTONLARI (KULLANICI DOKUNUNCA GÖNDERİR) ──────────────── */}
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 my-1">
            <span className="text-[11px] text-amber-400 font-heading font-black uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Hızlı Mesaj Gönder:</span>
            </span>
            <div className="flex flex-col gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-left px-4 py-3 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-amber-400 text-xs text-[#f0f6fc] font-bold transition-all active:scale-[0.98] shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex-1">{prompt}</span>
                  <SendHorizontal className="w-4 h-4 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
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
        <footer className="shrink-0 p-2.5 sm:p-3 px-3 sm:px-4 bg-[#161b22] border-t border-[#30363d] z-30 pb-[max(env(safe-area-inset-bottom),10px)] flex flex-col gap-2">
          {/* Hızlı Aksiyon Çipleri */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/ilan-ver"
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-heading font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md shrink-0 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>👑 İlan Vermek İstiyorum</span>
            </Link>

            <a
              href={getAdminWhatsAppUrl('Merhaba, Best VIP üzerinden yazıyorum. İlan vermek ve onaylatmak istiyorum.')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-heading font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md shrink-0 active:scale-95 transition-all"
            >
              <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>📲 Admin WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => handleSend('✅ İlan verdim, onay ve panel şifresi rica ediyorum.')}
              className="px-3 py-1 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-bold text-[11px] border border-[#30363d] shrink-0 active:scale-95 transition-all"
            >
              ✅ İlan Verdim
            </button>
          </div>

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

