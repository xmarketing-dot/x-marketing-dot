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
  Loader2,
  Home,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import CryptoPaymentCard from '@/components/common/CryptoPaymentCard';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';
import { useAdminWhatsApp } from '@/lib/siteConfig';

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
  const { getWaUrl, openWhatsApp } = useAdminWhatsApp();
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
  const [showCrypto, setShowCrypto] = useState(false);
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

  // Mobile Virtual Keyboard Scroll Handler
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

  // Initialize / Validate user thread on mount
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
      } catch (err) {}
    };

    initThread();
  }, []);

  // Fetch initial message history & SSE
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
      } catch (err) {}
    });

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
    } finally {
      setSending(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const quickPrompts = [
    { icon: '👑', label: 'İlan Vermek İstiyorum', msg: '👑 Merhaba, ilan vermek istiyorum. Fiyat ve detayları alabilir miyim?' },
    { icon: '✅', label: 'İlanımı Onaylat', msg: '✅ Merhaba, ilan formu doldurdum. Onay ve yayın süreci hakkında bilgi rica ederim.' },
    { icon: '🚀', label: 'VIP Vitrin Al', msg: '🚀 Merhaba, ana sayfa VIP vitrin ve reklam alanları hakkında bilgi almak istiyorum.' },
    { icon: '🔑', label: 'Panel Şifresi Al', msg: '🔑 Merhaba, ilan yönetim panel şifremi talep ediyorum.' },
    { icon: '💳', label: 'Ödeme Bilgisi', msg: '💳 Merhaba, güncel IBAN veya Kripto (USDT) ödeme bilgilerini iletir misiniz?' }
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-[#0a0d12] flex flex-col justify-between overflow-hidden max-w-lg mx-auto md:border-x md:border-[#21262d] shadow-2xl relative font-sans">
      
      {/* ── 1. ULTRA-CLEAN TOP HEADER (APPLE MESSAGES / TELEGRAM STYLE) ──────────────── */}
      <header className="shrink-0 h-14 sm:h-15 px-3 sm:px-4 bg-[#111620]/90 backdrop-blur-xl border-b border-[#21262d] flex items-center justify-between z-30 shadow-xs gap-2 w-full">
        
        {/* Sol: Geri + Profil Avatarı + Bilgi */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link 
            href="/"
            className="p-1.5 -ml-1 rounded-xl bg-[#1c212c] hover:bg-[#252b39] text-[#8b949e] hover:text-white transition-all active:scale-95 shrink-0"
            title="Ana Sayfaya Dön"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </Link>

          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/15">
              <Sparkles className="w-4.5 h-4.5 fill-slate-950 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111620] animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0 text-left leading-none gap-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-heading font-black text-xs sm:text-sm text-white truncate drop-shadow-xs">
                VIP Canlı Destek
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-black text-[9px] uppercase tracking-wider border border-amber-500/25 shrink-0">
                Resmi
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Çevrimiçi &bull; Ortalama 2 dk</span>
            </span>
          </div>
        </div>

        {/* Sağ: WhatsApp Hap Butonu */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={getWaUrl('Merhaba, VIP Canlı Destek üzerinden yazıyorum. İlan vermek ve bilgi almak istiyorum.')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              openWhatsApp('Merhaba, VIP Canlı Destek üzerinden yazıyorum. İlan vermek ve bilgi almak istiyorum.');
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-heading font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            title="WhatsApp Destek Hattı"
          >
            <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </header>

      {/* ── 2. MESAJ ALANI VE KULLANICI DOSTU ZARİF KARTLAR ──────────────── */}
      {bannedInfo?.isBanned ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 bg-[#0a0d12]">
          <div className="w-14 h-14 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center font-black animate-pulse shadow-xl">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <h2 className="text-base font-black text-white font-heading">Erişim Kısıtlandı</h2>
            <p className="text-xs text-red-400/90 font-medium mt-1 bg-red-500/10 p-3 rounded-2xl border border-red-500/20 leading-relaxed">
              {bannedInfo.banSebebi || 'Güvenlik kuralları gereği canlı desteğe erişiminiz sınırlandırılmıştır.'}
            </p>
          </div>

          <Link
            href="/"
            className="mt-1 px-4 py-2 rounded-xl bg-[#1c212c] hover:bg-[#252b39] text-white text-xs font-bold transition-all border border-[#2d3342]"
          >
            Ana Sayfaya Dön
          </Link>
        </main>
      ) : (
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 no-scrollbar">
        
          {/* ── SADE, MİNİMAL VE KULLANIŞLI HIZLI AKSİYON KARTI ──────────────── */}
          <div className="p-3.5 rounded-2xl bg-[#111620]/95 border border-[#21262d] shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black text-white/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Hızlı İlan &amp; Destek Merkezi</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                7/24 Aktif
              </span>
            </div>

            {/* 2 EŞİT YAN YANA AKSİYON BUTONU */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/ilan-ver"
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
              >
                <span>👑 İlan Ver</span>
              </Link>

              <a
                href={getWaUrl('Merhaba, VIP Canlı Destek üzerinden yazıyorum. İlan vermek ve VIP vitrin hakkında bilgi almak istiyorum.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  openWhatsApp('Merhaba, VIP Canlı Destek üzerinden yazıyorum. İlan vermek ve VIP vitrin hakkında bilgi almak istiyorum.');
                }}
                className="py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-heading font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
              >
                <OfficialWhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* İsteğe Bağlı Kripto Bilgisi Akordiyonu */}
            <div className="border-t border-[#1c212c] pt-2 flex flex-col">
              <button
                type="button"
                onClick={() => setShowCrypto(!showCrypto)}
                className="flex items-center justify-between text-[11px] text-[#8b949e] hover:text-white transition-colors py-0.5"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Wallet className="w-3 h-3 text-amber-400" />
                  <span>Kripto (USDT / TRC20) Ödeme Bilgileri</span>
                </span>
                {showCrypto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCrypto && (
                <div className="mt-2 animate-fadeIn">
                  <CryptoPaymentCard />
                </div>
              )}
            </div>
          </div>

          {/* ── ZARİF VE YATAY HIZLI MESAJ ÇİPLERİ (MESAJ YOKKEN GÖZÜKÜR) ──────────────── */}
          {messages.length === 0 && (
            <div className="flex flex-col gap-2 my-1">
              <span className="text-[11px] text-[#8b949e] font-heading font-bold px-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-amber-400" />
                <span>Sık Sorulan Hızlı Sorular:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.msg)}
                    className="text-left px-3 py-2.5 rounded-xl bg-[#111620] hover:bg-[#181f2c] border border-[#21262d] hover:border-amber-400/50 text-xs text-[#c9d1d9] hover:text-white font-medium transition-all active:scale-[0.98] flex items-center justify-between group shadow-2xs"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <span>{p.icon}</span>
                      <span className="truncate">{p.label}</span>
                    </span>
                    <SendHorizontal className="w-3.5 h-3.5 text-amber-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── MESAJ BALONLARI (CHAT BUBBLES) ──────────────── */}
          {messages.map((msg) => {
            const isAdmin = msg.gonderenTipi === 'admin';
            return (
              <div
                key={msg._id}
                className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isAdmin ? 'self-start' : 'self-end items-end'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                    isAdmin
                      ? 'bg-[#151b26] text-[#e6edf3] rounded-tl-xs border border-[#283141]'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-semibold rounded-tr-xs shadow-amber-500/10'
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
                          className="text-amber-400 underline font-bold hover:text-amber-300 break-all block my-1 p-1.5 rounded-lg bg-black/20 border border-amber-500/20"
                        >
                          🔗 {part}
                        </a>
                      );
                    }
                    return part;
                  })}
                </div>

                <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-[#6e7681] font-medium">
                  <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {!isAdmin && <CheckCheck className="w-3 h-3 text-amber-400" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>
      )}

      {/* ── 3. FIXED BOTTOM INPUT BAR (KLAVYE VE MOBİLE TAM UYUMLU) ─────────────── */}
      {!bannedInfo?.isBanned && (
        <footer className="shrink-0 p-2 sm:p-2.5 px-3 sm:px-4 bg-[#111620]/95 backdrop-blur-xl border-t border-[#21262d] z-30 pb-[max(env(safe-area-inset-bottom),8px)] flex flex-col gap-1.5">
          
          {/* Hızlı Çipler (Yatay Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => handleSend('👑 Merhaba, ilan vermek istiyorum. Fiyat ve detay alabilir miyim?')}
              className="px-2.5 py-1 rounded-lg bg-[#181f2c] hover:bg-[#20293a] text-amber-400 font-bold text-[11px] border border-amber-500/20 shrink-0 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>👑 İlan Ver</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('✅ İlanımı oluşturdum, onay ve kontrol rica ediyorum.')}
              className="px-2.5 py-1 rounded-lg bg-[#181f2c] hover:bg-[#20293a] text-emerald-400 font-bold text-[11px] border border-emerald-500/20 shrink-0 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>✅ İlan Onayı</span>
            </button>

            <button
              type="button"
              onClick={() => handleSend('🔑 İlan yönetim paneli şifremi alabilir miyim?')}
              className="px-2.5 py-1 rounded-lg bg-[#181f2c] hover:bg-[#20293a] text-[#c9d1d9] font-medium text-[11px] border border-[#283141] shrink-0 active:scale-95 transition-all"
            >
              🔑 Panel Şifresi
            </button>

            <button
              type="button"
              onClick={() => handleSend('💳 Ödeme bilgilerini alabilir miyim?')}
              className="px-2.5 py-1 rounded-lg bg-[#181f2c] hover:bg-[#20293a] text-[#c9d1d9] font-medium text-[11px] border border-[#283141] shrink-0 active:scale-95 transition-all"
            >
              💳 Ödeme
            </button>
          </div>

          {/* Form Input */}
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
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#181f2c] border border-[#283141] text-white text-xs placeholder-[#6e7681] focus:outline-none focus:border-amber-400 transition-colors font-medium shadow-inner"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/20 transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center shrink-0"
              title="Gönder"
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
