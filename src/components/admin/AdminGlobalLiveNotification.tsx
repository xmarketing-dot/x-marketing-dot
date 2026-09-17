'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, X, ArrowRight, ShieldAlert, ExternalLink, MapPin, Smartphone, Monitor } from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

interface LiveNotificationItem {
  type: 'chat' | 'whatsapp';
  data: any;
}

export default function AdminGlobalLiveNotification() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<LiveNotificationItem | null>(null);
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

  // Web Audio Chimes
  const playAlertSound = (type: 'chat' | 'whatsapp') => {
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

      if (type === 'whatsapp') {
        // WhatsApp Style Pop-Chime (F6 -> A6)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1396.91, ctx.currentTime);
        gain1.gain.setValueAtTime(0.4, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.25);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760.00, ctx.currentTime + 0.12);
        gain2.gain.setValueAtTime(0.5, ctx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.45);
      } else {
        // Chat Ding Dong (A5 -> D6)
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
      }
    } catch (e) {
      // Silent
    }
  };

  const triggerNotification = (item: LiveNotificationItem) => {
    if (item.type === 'chat' && pathname === '/bms-secure-portal/chat') return;
    
    setCurrentNotification(item);
    setShowToast(true);
    playAlertSound(item.type);

    let flash = false;
    const originalTitle = document.title;
    const alertTitle = item.type === 'whatsapp' 
      ? '💬 (1) YENİ WHATSAPP TIKLAMASI!' 
      : '🚨 (1) YENİ MÜŞTERİ MESAJI!';

    const interval = setInterval(() => {
      document.title = flash ? alertTitle : originalTitle;
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
      
      // Canlı Müşteri Mesajı
      eventSource.addEventListener('admin_customer_message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg) {
            lastProcessedTimeRef.current = Date.now();
            triggerNotification({ type: 'chat', data: msg });
          }
        } catch (err) {}
      });

      // Canlı WhatsApp Tıklaması
      eventSource.addEventListener('admin_whatsapp_click', (event) => {
        try {
          const clickData = JSON.parse(event.data);
          if (clickData) {
            lastProcessedTimeRef.current = Date.now();
            triggerNotification({ type: 'whatsapp', data: clickData });
          }
        } catch (err) {}
      });
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isAdmin, pathname]);

  if (!isAdmin || !showToast || !currentNotification) {
    return null;
  }

  // ── 1. WHATSAPP CANLI TIKLAMA BİLDİRİMİ ───────────────────────
  if (currentNotification.type === 'whatsapp') {
    const d = currentNotification.data;
    const isMobile = d.device === 'mobile';
    const refSrc = (d.refererSource || 'direct').toLowerCase();

    return (
      <div 
        className="fixed top-0 left-0 right-0 w-full z-[999999] bg-gradient-to-r from-emerald-800 via-[#161b22] to-emerald-950 border-b-2 border-emerald-400 p-3.5 sm:p-4.5 shadow-[0_10px_40px_rgba(16,185,129,0.5)] animate-in slide-in-from-top-full duration-300 select-none text-left"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 w-full px-2 sm:px-4">
          
          {/* Sol: WhatsApp İkonu ve Tıklanan İlan Bilgisi */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/50 animate-pulse">
                <OfficialWhatsAppIcon className="w-6 h-6 fill-slate-950" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#161b22] animate-ping" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-xs sm:text-sm text-emerald-300 font-heading uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md">
                  <OfficialWhatsAppIcon className="w-4 h-4 fill-emerald-400 shrink-0" />
                  <span>💬 Canlı WhatsApp Tıklaması:</span>
                </span>
                <span className="text-[11px] text-white/80 font-mono bg-black/40 px-2 py-0.5 rounded-lg border border-white/10">
                  {new Date(d.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {d.listingLocation && (
                  <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    📍 {d.listingLocation.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Tıklanan İlan Başlığı */}
              <p className="text-xs sm:text-sm text-white font-black truncate mt-0.5 font-heading">
                👑 {d.targetTitle || 'İlan'} {d.phone ? `(${d.phone})` : ''}
              </p>

              {/* Ziyaretçi İstihbaratı: Şehir, Cihaz, Referrer */}
              <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono mt-1 flex-wrap">
                <span className="text-white font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{d.city || 'İstanbul'}</span>
                </span>
                <span>•</span>
                <span className="text-slate-300 flex items-center gap-1">
                  {isMobile ? <Smartphone className="w-3 h-3 text-purple-400" /> : <Monitor className="w-3 h-3 text-blue-400" />}
                  <span>{isMobile ? 'Mobil' : 'PC'} ({d.os || 'Cihaz'})</span>
                </span>
                <span>•</span>
                <span className="text-amber-400">
                  {refSrc === 'yandex' ? '🇷🇺 Yandex' : refSrc === 'google' ? '🌐 Google' : '🔗 Direkt'}
                  {d.searchKeyword ? ` ("${d.searchKeyword}")` : ''}
                </span>
                <span>•</span>
                <span className="text-slate-400">IP: {d.ip || '127.0.0.1'}</span>
              </div>
            </div>
          </div>

          {/* Sağ: İlana Git & Kapat */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {d.listingSlug && (
              <a
                href={`/ilan/${d.listingSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowToast(false)}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-300 hover:from-emerald-300 text-slate-950 font-black text-xs font-heading uppercase tracking-wider shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>İlana Git</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                setShowToast(false);
                router.push('/bms-secure-portal');
              }}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs font-heading flex items-center gap-1 transition-all"
            >
              <span>Panele Dön</span>
            </button>

            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="p-2 rounded-xl bg-black/40 text-white/70 hover:text-white hover:bg-black/70 border border-white/10 transition-colors"
              title="Kapat"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── 2. MÜŞTERİ CANLI CHAT MESAJI BİLDİRİMİ ────────────────────
  const handleGoToChat = () => {
    setShowToast(false);
    const targetUrl = currentNotification.data.threadId 
      ? `/bms-secure-portal/chat?threadId=${currentNotification.data.threadId}` 
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
                {new Date(currentNotification.data.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-white font-bold truncate mt-1 drop-shadow-sm max-w-2xl">
              "{currentNotification.data.mesaj}"
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
