'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  MessageSquare, 
  X, 
  ArrowRight, 
  ShieldAlert, 
  ExternalLink, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Flame,
  Volume2
} from 'lucide-react';
import { OfficialWhatsAppIcon } from '@/components/common/WhatsAppButton';

interface LiveNotificationItem {
  id: string;
  type: 'chat' | 'whatsapp';
  data: any;
  receivedAt: number;
}

export default function AdminGlobalLiveNotification() {
  const [currentNotification, setCurrentNotification] = useState<LiveNotificationItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processedEventIdsRef = useRef<Set<string>>(new Set());
  const lastProcessedChatTimeRef = useRef<number>(Date.now());
  const router = useRouter();
  const pathname = usePathname();

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
        ctx.resume().catch(() => {});
      }

      if (type === 'whatsapp') {
        // High-end WhatsApp Pop-Chime (F6 -> A6)
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
    } catch {
      // Audio might be restricted until user touches page
    }
  };

  const triggerNotification = (item: { type: 'chat' | 'whatsapp'; data: any }) => {
    // Chat sayfasındayken chat bildirim banner'ı açmayalım (kendi içinde zaten çalıyor)
    if (item.type === 'chat' && pathname.includes('/bms-secure-portal/chat')) {
      return;
    }

    const uniqueId = item.data.eventId || item.data._id || `${item.type}_${Date.now()}`;
    if (processedEventIdsRef.current.has(uniqueId)) {
      return;
    }
    processedEventIdsRef.current.add(uniqueId);

    // Keep set bounded
    if (processedEventIdsRef.current.size > 200) {
      const arr = Array.from(processedEventIdsRef.current);
      processedEventIdsRef.current = new Set(arr.slice(arr.length - 100));
    }

    const notifItem: LiveNotificationItem = {
      id: uniqueId,
      type: item.type,
      data: item.data,
      receivedAt: Date.now(),
    };

    setCurrentNotification(notifItem);
    setShowToast(true);
    playAlertSound(item.type);

    // Flash tab title
    if (typeof document !== 'undefined') {
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
      }, 12000);
    }
  };

  // 1. Real-time Server-Sent Events (SSE) Listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/admin/chat/sse');

        eventSource.addEventListener('admin_whatsapp_click', (event: MessageEvent) => {
          try {
            const clickData = JSON.parse(event.data);
            if (clickData) {
              triggerNotification({ type: 'whatsapp', data: clickData });
            }
          } catch {}
        });

        eventSource.addEventListener('admin_customer_message', (event: MessageEvent) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg) {
              triggerNotification({ type: 'chat', data: msg });
            }
          } catch {}
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff
          reconnectTimer = setTimeout(connectSSE, 5000);
        };
      } catch {
        reconnectTimer = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) eventSource.close();
    };
  }, [pathname]);

  // 2. Chat Polling Fallback (in case SSE is dropped)
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/admin/chat/threads', { cache: 'no-store' });
        const data = await res.json();
        if (data.threads && Array.isArray(data.threads)) {
          const unreadThread = data.threads.find((t: any) => (t.okunmadiAdminSayisi || 0) > 0);
          if (unreadThread && unreadThread.updatedAt) {
            const upTime = new Date(unreadThread.updatedAt).getTime();
            if (upTime > lastProcessedChatTimeRef.current) {
              lastProcessedChatTimeRef.current = upTime;
              triggerNotification({
                type: 'chat',
                data: {
                  mesaj: unreadThread.sonMesajOzeti || 'Yeni mesaj alındı',
                  threadId: unreadThread._id,
                  kullaniciAdi: unreadThread.kullaniciAdi,
                  listingBaslik: unreadThread.listingBaslik,
                },
              });
            }
          }
        }
      } catch {}
    }, 15000);

    return () => clearInterval(pollTimer);
  }, [pathname]);

  // Auto-dismiss after 14 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 14000);
    return () => clearTimeout(timer);
  }, [showToast, currentNotification?.id]);

  if (!showToast || !currentNotification) {
    return null;
  }

  // ── 1. WHATSAPP CANLI TIKLAMA BİLDİRİMİ ───────────────────────
  if (currentNotification.type === 'whatsapp') {
    const d = currentNotification.data;
    const isMobile = d.device === 'mobile';
    const refSrc = (d.refererSource || 'direct').toLowerCase();

    return (
      <div 
        className="fixed top-3 left-3 right-3 md:left-auto md:right-5 md:max-w-2xl z-[999999] bg-[#070a0f] border-2 border-emerald-500/60 rounded-2xl p-4 shadow-[0_12px_45px_rgba(16,185,129,0.35)] animate-in slide-in-from-top-4 duration-300 select-none text-left backdrop-blur-xl"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            
            {/* Sol: İkon & Başlık */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/40 animate-pulse">
                  <OfficialWhatsAppIcon className="w-5 h-5 fill-slate-950" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070a0f] animate-ping" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💬 CANLI WHATSAPP TIKLAMASI</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {new Date(d.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {d.listingLocation && (
                    <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      📍 {d.listingLocation.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Tıklanan İlan Başlığı */}
                <p className="text-sm text-white font-bold truncate mt-0.5">
                  👑 {d.targetTitle || d.baslik || 'İlan'} {d.phone ? `(${d.phone})` : ''}
                </p>
              </div>
            </div>

            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors shrink-0"
              title="Kapat"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* İstihbarat Satırı */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono flex-wrap bg-[#0c1017] p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-200 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{d.city || d.targetCity || 'Türkiye'}</span>
            </span>
            <span>•</span>
            <span className="text-slate-300 flex items-center gap-1">
              {isMobile ? <Smartphone className="w-3 h-3 text-purple-400" /> : <Monitor className="w-3 h-3 text-blue-400" />}
              <span>{isMobile ? 'Mobil' : 'PC'} ({d.os || 'Cihaz'})</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400">
              {refSrc === 'yandex' ? '🇷🇺 Yandex' : refSrc === 'google' ? '🌐 Google' : '🔗 Direkt'}
              {d.searchKeyword ? ` ("${d.searchKeyword}")` : ''}
            </span>
            <span>•</span>
            <span className="text-slate-400">IP: {d.ip || 'Bilinmiyor'}</span>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {d.listingSlug && (
              <a
                href={`/ilan/${d.listingSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowToast(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/30"
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
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              Dashboard'a Git
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
      className="fixed top-3 left-3 right-3 md:left-auto md:right-5 md:max-w-2xl z-[999999] bg-[#070a0f] border-2 border-emerald-500/60 rounded-2xl p-4 shadow-[0_12px_45px_rgba(16,185,129,0.35)] animate-in slide-in-from-top-4 duration-300 select-none text-left backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/40 animate-pulse">
                <MessageSquare className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070a0f] animate-ping" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>🚨 YENİ MÜŞTERİ CANLI MESAJI</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {new Date(currentNotification.data.createdAt || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-sm text-white font-bold truncate mt-0.5 max-w-xl">
                "{currentNotification.data.mesaj}"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors shrink-0"
            title="Kapat"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleGoToChat}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/30"
          >
            <span>Mesaja Git</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
