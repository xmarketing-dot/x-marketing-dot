'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Send, 
  User, 
  RefreshCw, 
  MessageSquare, 
  Loader2, 
  ChevronLeft, 
  Trash2, 
  ShieldAlert, 
  Ban, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  ExternalLink,
  Key,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Phone,
  Globe,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Clock,
  ArrowDown,
  Info,
  Layers,
  Flame,
  CheckCheck
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAdminWhatsApp } from '@/lib/siteConfig';
import { adminPortalCache } from '@/lib/adminPortalCache';

interface Thread {
  _id: string;
  kullaniciAdi: string;
  kullaniciTelefon?: string;
  ip?: string;
  isBanned?: boolean;
  banTuru?: 'tam_ban' | 'chat_ban';
  banSebebi?: string;
  listingId?: string;
  listingBaslik?: string;
  listingSlug?: string;
  listingRozet?: string;
  listingKonum?: string;
  listingFoto?: string;
  whatsappNumara?: string;
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

// Web Audio API Synth Beep for Admin Alert
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

export default function AdminChatPage() {
  const searchParams = useSearchParams();
  const targetThreadId = searchParams.get('threadId');
  const { display, formatted, waLink } = useAdminWhatsApp();

  const [threads, setThreads] = useState<Thread[]>(() => adminPortalCache.get<Thread[]>('bms_chat_threads') || []);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(() => adminPortalCache.get<Thread | null>('bms_chat_selected_thread') || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(() => !adminPortalCache.has('bms_chat_threads'));
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'vip' | 'banned'>('all');
  const [showInfoSidebar, setShowInfoSidebar] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Ban Modal States
  const [banModalThread, setBanModalThread] = useState<Thread | null>(null);
  const [banType, setBanType] = useState<'tam_ban' | 'chat_ban'>('tam_ban');
  const [banReason, setBanReason] = useState('Kural ihlali / Spam nedeniyle engellendi');
  const [banSubmitting, setBanSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastKnownMessageId = useRef<string>('');
  const initialTargetHandled = useRef(false);

  // 1. Fetch thread list
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/admin/chat/threads', { cache: 'no-store' });
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
        adminPortalCache.set('bms_chat_threads', data.threads);

        // targetThreadId parametresini sadece İLK SAYFA AÇILIŞINDA bir kez uygula
        if (!initialTargetHandled.current && targetThreadId) {
          const matched = data.threads.find((t: Thread) => t._id === targetThreadId);
          if (matched) {
            setSelectedThread(matched);
            adminPortalCache.set('bms_chat_selected_thread', matched);
            initialTargetHandled.current = true;
            return;
          }
        }

        // Kullanıcının tıkladığı seçili sohbeti koru, listeyi güncellerken başkasına sıçrama!
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          setSelectedThread((prev) => {
            if (prev) {
              const updated = data.threads.find((t: Thread) => t._id === prev._id);
              return updated || prev;
            }
            return data.threads[0] || null;
          });
        }
      }
    } catch (e) {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  // Aktif seçili sohbeti hafızada tut (kullanıcı menü değiştirip geri döndüğünde sohbeti açık kalsın)
  useEffect(() => {
    if (selectedThread) {
      adminPortalCache.set('bms_chat_selected_thread', selectedThread);
    }
  }, [selectedThread?._id]);

  // 2. Global Thread Polling (Hafif ve Vercel dostu 10s aralık)
  useEffect(() => {
    fetchThreads();

    const pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchThreads();
    }, 10000);

    return () => {
      clearInterval(pollTimer);
    };
  }, [soundEnabled]);

  // 3. Thread-Specific Message SSE + Polling Stream
  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }

    // Mark as read in backend
    fetch('/api/admin/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: selectedThread._id }),
    }).catch(() => {});

    // Update unread count locally and mark user messages as read locally
    setThreads((prev) =>
      prev.map((t) => (t._id === selectedThread._id ? { ...t, okunmadiAdminSayisi: 0 } : t))
    );
    setMessages((prev) =>
      prev.map((m) => (m.gonderenTipi === 'user' ? { ...m, okundu: true } : m))
    );

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?threadId=${selectedThread._id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (
              prev.length === data.messages.length &&
              prev[prev.length - 1]?._id === data.messages[data.messages.length - 1]?._id &&
              prev[prev.length - 1]?.okundu === data.messages[data.messages.length - 1]?.okundu
            ) {
              return prev;
            }
            return data.messages;
          });
          if (data.messages.length > 0) {
            lastKnownMessageId.current = data.messages[data.messages.length - 1]._id;
          }
        }
      } catch (e) {}
    };

    loadMessages();

    // Polling fallback every 3.5s for active thread (sekme aktifken)
    const activePoll = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMessages();
    }, 3500);

    return () => {
      clearInterval(activePoll);
    };
  }, [selectedThread?._id, soundEnabled]);

  // Scroll to bottom on message update - sadece kullanıcı en alttaysa kaydır
  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showScrollBottom]);

  // Scroll position listener for "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = (text: string, keyName: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Delete thread handler
  const handleDeleteThread = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bu sohbeti ve tüm mesaj geçmişini kalıcı olarak silmek istediğinize emin misiniz?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: id }),
      });

      if (res.ok) {
        setThreads((prev) => prev.filter((t) => t._id !== id));
        if (selectedThread?._id === id) {
          setSelectedThread(null);
          setMessages([]);
        }
      }
    } catch (err) {
      // Silent
    } finally {
      setDeletingId(null);
    }
  };

  // Apply ban handler
  const handleApplyBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banModalThread) return;

    setBanSubmitting(true);
    try {
      const res = await fetch('/api/admin/bans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: banModalThread._id,
          ip: banModalThread.ip,
          banTuru: banType,
          sebep: banReason,
        }),
      });

      if (res.ok) {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === banModalThread._id
              ? { ...t, isBanned: true, banTuru: banType, banSebebi: banReason }
              : t
          )
        );
        if (selectedThread?._id === banModalThread._id) {
          setSelectedThread((prev) =>
            prev ? { ...prev, isBanned: true, banTuru: banType, banSebebi: banReason } : null
          );
        }
        setBanModalThread(null);
      }
    } catch (err) {
      // Silent
    } finally {
      setBanSubmitting(false);
    }
  };

  // Unban handler
  const handleUnban = async (threadId: string) => {
    if (!window.confirm('Bu kullanıcının engelini kaldırmak istiyor musunuz?')) return;

    try {
      const res = await fetch(`/api/admin/bans?threadId=${threadId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === threadId
              ? { ...t, isBanned: false, banTuru: undefined, banSebebi: undefined }
              : t
          )
        );
        if (selectedThread?._id === threadId) {
          setSelectedThread((prev) =>
            prev ? { ...prev, isBanned: false, banTuru: undefined, banSebebi: undefined } : null
          );
        }
      }
    } catch (err) {
      // Silent
    }
  };

  // Send message handler
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedThread || sending) return;

    // Hedef thread ID'yi sabitle (arada arka planda liste güncellense bile asla başka chat'e gitmez!)
    const currentTargetId = selectedThread._id;
    const content = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: currentTargetId,
          gonderenTipi: 'admin',
          mesaj: content,
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
      // Silent
    } finally {
      setSending(false);
    }
  };

  // Handle keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Filtered thread list calculation
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.kullaniciAdi.toLowerCase().includes(q);
        const matchesListing = t.listingBaslik && t.listingBaslik.toLowerCase().includes(q);
        const matchesMsg = t.sonMesajOzeti && t.sonMesajOzeti.toLowerCase().includes(q);
        const matchesIp = t.ip && t.ip.toLowerCase().includes(q);
        const matchesPhone = t.kullaniciTelefon && t.kullaniciTelefon.includes(q);
        const matchesId = t._id.toLowerCase().includes(q);
        if (!matchesName && !matchesListing && !matchesMsg && !matchesIp && !matchesPhone && !matchesId) {
          return false;
        }
      }

      // 2. Tab filter (Seçili sohbet okunsa bile aktifken listeden aniden kaybolup sırayı bozmaz)
      if (activeFilter === 'unread') return (t.okunmadiAdminSayisi || 0) > 0 || (selectedThread ? t._id === selectedThread._id : false);
      if (activeFilter === 'vip') return Boolean(t.listingId || t.listingBaslik);
      if (activeFilter === 'banned') return Boolean(t.isBanned);

      return true;
    });
  }, [threads, searchQuery, activeFilter, selectedThread?._id]);

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((acc, t) => acc + (t.okunmadiAdminSayisi || 0), 0);
  }, [threads]);

  return (
    <div className="w-full h-[calc(100dvh-54px-4rem)] md:h-full min-h-0 flex-1 flex flex-col bg-[#070a0f] overflow-hidden max-w-full md:rounded-2xl md:border md:border-slate-800 md:shadow-2xl">
      
      <div className="flex-1 min-h-0 flex w-full h-full relative overflow-hidden">
        
        {/* ════════════════════════════════════════════════════════════════
            1. SOL SÜTUN: MÜŞTERİ / KONUŞMA (THREAD) LİSTESİ
           ════════════════════════════════════════════════════════════════ */}
        <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-slate-800 flex flex-col h-full shrink-0 bg-[#0c1017] overflow-hidden ${
          selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header & Live Stream Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-[#070a0f] flex flex-col gap-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    Canlı Destek
                    {totalUnreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold animate-pulse">
                        {totalUnreadCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Real-Time SSE</span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    soundEnabled 
                      ? 'bg-slate-900 border-slate-800 text-emerald-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                  }`}
                  title={soundEnabled ? 'Bildirim Sesi Açık' : 'Bildirim Sesi Kapalı'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={fetchThreads}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Listeyi Yenile"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Arama Kutusu */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Müşteri, telefon, ilan veya mesaj ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#0c1017] border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtre Sekmeleri (Image 2 Pill Design) */}
            <div className="flex items-center gap-1 bg-[#06090e] p-0.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all text-center whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü ({threads.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                  activeFilter === 'unread'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Okunmamış</span>
                {totalUnreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('vip')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                  activeFilter === 'vip'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CrownIcon className="w-2.5 h-2.5" />
                <span>İlanlar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('banned')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-all text-center whitespace-nowrap ${
                  activeFilter === 'banned'
                    ? 'bg-slate-800 text-rose-400 font-semibold border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Banlılar
              </button>
            </div>
          </div>

          {/* Kaydırılabilir Sohbet Listesi */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 max-md:no-scrollbar md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:w-1.5 md:[&::-webkit-scrollbar-thumb]:bg-slate-800 md:[&::-webkit-scrollbar-thumb]:rounded-full hover:md:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            {loading ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2.5">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Sohbetler senkronize ediliyor...</span>
              </div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((th) => {
                const isSelected = selectedThread?._id === th._id;
                const isDeleting = deletingId === th._id;
                const hasUnread = (th.okunmadiAdminSayisi || 0) > 0;
                const isVip = Boolean(th.listingId || th.listingBaslik);

                return (
                  <div
                    key={th._id}
                    onClick={() => setSelectedThread(th)}
                    className={`w-full p-3 flex items-start justify-between gap-3 text-left transition-all cursor-pointer relative group ${
                      isSelected 
                        ? 'bg-slate-800/50 border-l-2 border-emerald-400'
                        : 'hover:bg-slate-900/40 active:bg-slate-900/70'
                    }`}
                  >
                    {/* Profil Avatarı */}
                    <div className="relative shrink-0 mt-0.5">
                      {th.listingFoto ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800 shadow-sm bg-[#070a0f]">
                          <img src={th.listingFoto} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl font-heading font-bold text-sm flex items-center justify-center shadow-sm ${
                          isVip 
                            ? 'bg-slate-900 text-slate-200 border border-slate-700' 
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {th.kullaniciAdi.replace('👑 ', '').charAt(0).toUpperCase() || 'M'}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c1017]" />
                    </div>

                    {/* Müşteri Başlık, Etiket ve Son Mesaj */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`font-heading font-semibold text-xs truncate ${
                            isSelected ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {th.kullaniciAdi}
                          </span>
                          {th.isBanned && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 text-[8px] font-bold uppercase border border-rose-500/20 shrink-0">
                              BANLI
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(th.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Rozetler: Telefon / İlan Başlığı */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {th.listingBaslik && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-300 font-medium text-[9px] border border-slate-800 truncate max-w-[190px]">
                            <CrownIcon className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{th.listingBaslik}</span>
                          </span>
                        )}
                        {th.kullaniciTelefon && !th.listingBaslik && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-medium text-[9px] border border-slate-800">
                            <Phone className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{th.kullaniciTelefon}</span>
                          </span>
                        )}
                      </div>

                      {/* Son Mesaj Özeti */}
                      <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                        hasUnread ? 'text-white font-medium' : 'text-slate-400 font-normal'
                      }`}>
                        {th.sonMesajOzeti || 'Mesaj geçmişi yok'}
                      </p>
                    </div>

                    {/* Sağ Taraf: Rozet / Silme */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      {hasUnread ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[9px] animate-pulse shadow-sm">
                          {th.okunmadiAdminSayisi}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-40 group-hover:opacity-100 group-hover:text-slate-300 transition-all md:hidden" />
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteThread(th._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-all text-xs"
                        title="Sohbeti Sil"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <MessageSquare className="w-8 h-8 opacity-25 text-slate-500" />
                <span className="font-medium">Kriterlere uygun sohbet bulunamadı.</span>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            2. ORTA / SAĞ SÜTUN: SENIOR CYBER LUXURY SOHBET PENCERESİ
           ════════════════════════════════════════════════════════════════ */}
        <div className={`flex-1 min-h-0 flex flex-col h-full bg-[#070a0f] overflow-hidden ${
          !selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedThread ? (
            <>
              {/* ── ÜST BAŞLIK / MÜŞTERİ BİLGİ ŞERİDİ ──────────────── */}
              <div className="p-3 sm:px-4 bg-[#0c1017] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-sm gap-2">
                
                {/* Sol Profil Özeti */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  
                  {/* Mobilde Geri Dön Butonu */}
                  <button
                    type="button"
                    onClick={() => setSelectedThread(null)}
                    className="p-1.5 -ml-1 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors md:hidden flex items-center gap-0.5 font-bold text-xs shrink-0"
                    title="Geri Dön"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="relative shrink-0">
                    {selectedThread.listingFoto ? (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-800 bg-[#070a0f] shadow-sm">
                        <img src={selectedThread.listingFoto} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold flex items-center justify-center text-sm shadow-sm">
                        {selectedThread.kullaniciAdi.replace('👑 ', '').charAt(0).toUpperCase() || 'M'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c1017]" />
                  </div>

                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                        {selectedThread.kullaniciAdi}
                      </span>

                      {selectedThread.kullaniciTelefon && (
                        <a
                          href={`https://wa.me/${selectedThread.kullaniciTelefon.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[11px] border border-slate-800 transition-colors flex items-center gap-1"
                          title="WhatsApp'ta Aç"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{selectedThread.kullaniciTelefon}</span>
                        </a>
                      )}

                      {selectedThread.isBanned && (
                        <span className="px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase border border-rose-500/20">
                          {selectedThread.banTuru === 'chat_ban' ? 'CHAT BANLI' : 'TAM BANLI'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono truncate mt-0.5">
                      <span className="text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        IP: {selectedThread.ip || 'Gizli'}
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-500 truncate">ID: #{selectedThread._id.slice(-8)}</span>
                    </div>
                  </div>
                </div>

                {/* Sağ Aksiyon Butonları */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedThread.listingSlug && (
                    <a
                      href={`/ilan/${selectedThread.listingSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center gap-1"
                      title="İlanı Gör"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">İlanı İncele</span>
                    </a>
                  )}

                  {selectedThread.isBanned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(selectedThread._id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-white text-xs font-medium border border-slate-800 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Engeli Kaldır</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBanModalThread(selectedThread)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-medium border border-slate-800 transition-colors flex items-center gap-1"
                      title="Kullanıcıyı Engelle"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Banla</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                    className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1 ${
                      showInfoSidebar 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                    }`}
                    title="Detay Bilgi Paneli"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Panel Bilgileri</span>
                  </button>
                </div>
              </div>

              {/* ── İLAN VE ŞİFRE HIZLI ÇUBUĞU (KOLAY ERİŞİM) ──────────────── */}
              {(selectedThread.username || selectedThread.password || selectedThread.listingBaslik) && (
                <div className="px-3 sm:px-4 py-2 bg-[#070a0f] border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {selectedThread.listingBaslik && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 font-medium text-xs border border-slate-800 shrink-0">
                        <CrownIcon className="w-3 h-3 text-slate-400" />
                        <span>{selectedThread.listingBaslik}</span>
                      </span>
                    )}

                    {selectedThread.username && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedThread.username!, 'user')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Kullanıcı Adını Kopyala"
                      >
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Kullanıcı: {selectedThread.username}</span>
                        {copiedKey === 'user' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                      </button>
                    )}

                    {selectedThread.password && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedThread.password!, 'pwd')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-xs font-medium border border-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Şifreyi Kopyala"
                      >
                        <Key className="w-3 h-3 text-emerald-500" />
                        <span>Şifre: {selectedThread.password}</span>
                        {copiedKey === 'pwd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:block">
                    {messages.length} mesaj
                  </div>
                </div>
              )}

              {/* ── İKİLİ GÖVDE: MESAJ AKIŞI + SAĞ BİLGİ PANELİ (COLLAPSIBLE) ──────────────── */}
              <div className="flex-1 min-h-0 flex w-full h-full relative overflow-hidden">
                
                {/* Mesaj Akış Konteyneri */}
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 relative max-md:no-scrollbar md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:w-2 md:[&::-webkit-scrollbar-thumb]:bg-slate-800 md:[&::-webkit-scrollbar-thumb]:rounded-full hover:md:[&::-webkit-scrollbar-thumb]:bg-slate-700 md:[&::-webkit-scrollbar-track]:bg-transparent"
                >
                  {selectedThread.isBanned && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-300 text-xs font-medium shrink-0">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Bu müşteri engellenmiştir. Sebep: {selectedThread.banSebebi || 'Kural İhlali'}</span>
                    </div>
                  )}

                  {messages.length === 0 ? (
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 gap-2.5 my-auto max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-center text-slate-500 shadow-sm">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <span className="font-heading font-bold text-white text-sm">Mesajlaşma Henüz Başlamadı</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Müşteriyle henüz mesajlaşma yok. Aşağıdaki hızlı şablon butonlarına basarak fiyat tarifesi, onay veya hesap bilgisi iletebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isAdmin = m.gonderenTipi === 'admin';
                      const isNextSame = messages[index + 1]?.gonderenTipi === m.gonderenTipi;

                      return (
                        <div
                          key={`${m._id || index}-${index}`}
                          className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${
                            isAdmin ? 'self-end items-end' : 'self-start items-start'
                          } ${isNextSame ? 'mb-0.5' : 'mb-2'}`}
                        >
                          {/* Baloncuk Gövdesi (Senior Cyber Luxury Balon Mimarisi) */}
                          <div
                            className={`p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words text-left shadow-sm select-text cursor-text ${
                              isAdmin
                                ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs border border-emerald-500/30'
                                : 'bg-[#0c1017] text-slate-200 rounded-2xl rounded-tl-xs border border-slate-800'
                            }`}
                          >
                            {m.mesaj.split(/(https?:\/\/[^\s]+)/g).map((part, idx) => {
                              if (part.startsWith('http://') || part.startsWith('https://')) {
                                return (
                                  <a
                                    key={idx}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 underline font-semibold break-all my-1 px-2 py-0.5 rounded-md text-xs transition-colors ${
                                      isAdmin 
                                        ? 'bg-black/20 text-white hover:bg-black/30' 
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>{part}</span>
                                  </a>
                                );
                              }
                              return part;
                            })}
                          </div>

                          {/* Zaman & İletildi Durumu */}
                          <div className="flex items-center gap-1 mt-1 px-1 font-mono text-[10px] text-slate-500">
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isAdmin ? (
                              m.okundu ? (
                                <span className="flex items-center text-emerald-400" title="Müşteri okudu (Görüldü)">
                                  <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
                                </span>
                              ) : (
                                <span className="flex items-center text-slate-500" title="İletildi (Müşteri henüz görmedi)">
                                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                                </span>
                              )
                            ) : (
                              m.okundu ? (
                                <span className="flex items-center text-emerald-400" title="Okundu">
                                  <CheckCheck className="w-3.5 h-3.5 stroke-[2]" />
                                </span>
                              ) : (
                                <span className="flex items-center text-slate-500" title="Okunmadı">
                                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Aşağı Kaydır Butonu */}
                {showScrollBottom && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute right-6 bottom-4 p-2 rounded-full bg-slate-800 text-white border border-slate-700 shadow-xl hover:bg-slate-700 transition-all z-20 animate-bounce cursor-pointer"
                    title="En alta kaydır"
                  >
                    <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}

                {/* ── SAĞ PROFİL BİLGİ PANELİ (MÜŞTERİ KARTI) ──────────────── */}
                {showInfoSidebar && (
                  <div className="w-72 lg:w-80 border-l border-slate-800 bg-[#0c1017] flex flex-col h-full shrink-0 p-4 gap-4 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-slate-400" />
                        <span>Müşteri Kartı</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowInfoSidebar(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Müşteri Kimliği */}
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-400 font-medium">Müşteri Adı:</span>
                      <span className="font-semibold text-white bg-[#070a0f] p-2.5 rounded-xl border border-slate-800">
                        {selectedThread.kullaniciAdi}
                      </span>
                    </div>

                    {/* Panel Bilgileri (Tek Tık Kopyala) */}
                    <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[#070a0f] border border-slate-800">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-slate-400" />
                        <span>Müşteri Panel Girişi</span>
                      </span>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Kullanıcı Adı:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedThread.username || selectedThread.kullaniciAdi, 'user2')}
                            className="text-slate-300 hover:text-white hover:underline flex items-center gap-0.5"
                          >
                            <span>{copiedKey === 'user2' ? 'Kopyalandı ✓' : 'Kopyala'}</span>
                          </button>
                        </div>
                        <span className="font-mono text-white font-medium bg-[#0c1017] p-2 rounded-lg border border-slate-800 text-xs">
                          {selectedThread.username || 'Bilinmiyor'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Şifre:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedThread.password || '', 'pwd2')}
                            className="text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>{copiedKey === 'pwd2' ? 'Kopyalandı ✓' : 'Kopyala'}</span>
                          </button>
                        </div>
                        <span className="font-mono text-emerald-400 font-medium bg-[#0c1017] p-2 rounded-lg border border-slate-800 text-xs">
                          {selectedThread.password || 'Bilinmiyor'}
                        </span>
                      </div>
                    </div>

                    {/* İlan Bağlantısı */}
                    {selectedThread.listingBaslik && (
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-400 font-medium">Bağlı Olduğu İlan:</span>
                        <div className="p-2.5 rounded-xl bg-[#070a0f] border border-slate-800 flex flex-col gap-1.5">
                          <span className="font-medium text-white text-xs">{selectedThread.listingBaslik}</span>
                          {selectedThread.listingSlug && (
                            <a
                              href={`/ilan/${selectedThread.listingSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-white hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>İlan Sayfasını Aç</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* IP & Güvenlik */}
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-400 font-medium">Güvenlik / IP:</span>
                      <span className="font-mono text-xs text-slate-300 bg-[#070a0f] p-2 rounded-xl border border-slate-800">
                        {selectedThread.ip || '127.0.0.1'}
                      </span>
                    </div>

                    {/* Sohbeti Temizle / Sil Butonu */}
                    <button
                      type="button"
                      onClick={() => handleDeleteThread(selectedThread._id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 mt-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bu Sohbeti Kalıcı Sil</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── HIZLI ŞABLON BUTONLARI (EXECUTIVE SLATE PILLS) ──────────────── */}
              <div className="px-3 sm:px-4 py-2 bg-[#0c1017] border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 w-full max-w-full min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.besteskort.online';
                    const phoneText = display || formatted || '+90 534 000 00 00';
                    const whatsappUrl = waLink || 'https://wa.me/905340000000';
                    const ilanVerUrl = `${origin}/ilan-ver`;

                    setReplyText(`Merhaba, Best Eskort VIP Destek Merkezine hoş geldiniz! 👑\n\nİlanınızı 2 farklı şekilde oluşturabilirsiniz:\n1️⃣ WhatsApp destek hattımızdan (${phoneText}) bilgilerinizi iletebilirsiniz:\n👉 WhatsApp: ${whatsappUrl}\n\n2️⃣ Web sitemiz üzerinden ilan formu doldurabilirsiniz:\n👉 İlan Formu: ${ilanVerUrl}\n\n🔥 PAKETLER:\n👑 VIP: 7.000 TL (1 gün ücretsiz vitrin)\n💎 GOLD: 4.000 TL\n🥈 SILVER: 2.500 TL\n\nDetaylı bilgi için bize yazabilirsiniz.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                  title="Paket Fiyat Tarifesini Yanıta Yapıştır"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>Paket Tarifesi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyText('Ödeme Adresi (BNB SMART CHAIN BEP-20): 0xb7259aef66c9cd16e5a5d879baf0107bea03f527 - Ödemeden sonra lütfen TXID veya dekont iletiniz, 5 dakikada onaylanacaktır.')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <span>Kripto Cüzdan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    setReplyText(`🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.\n\n🔑 Müşteri Panel Bilgileriniz:\nPanel Giriş: ${origin}/panelim\nKullanıcı Adı: ${selectedThread.username || '...'}\nŞifre: ${selectedThread.password || '...'}\n\nPanelinize giriş yaparak ilanınızı güncelleyebilirsiniz.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Onay &amp; Şifre</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyText('Merhaba, ilanınızdaki fotoğrafların doğrulanabilmesi için yüzünüzün veya kimliğinizin görünmediği teyit fotoğrafı iletmeniz gerekmektedir.')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <span>Fotoğraf Teyidi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyText('İlanınızdaki iletişim bilgileri güncellenmiştir. Başka bir işlem için bize yazabilirsiniz.')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <span>Güncellendi</span>
                </button>
              </div>

              {/* ── TABANA SABİTLENMİŞ CEVAP YAZMA FORMU ──────────────── */}
              <form onSubmit={handleSendReply} className="p-3 bg-[#0c1017] border-t border-slate-800 flex items-end gap-2.5 shrink-0 w-full max-w-full min-w-0">
                <textarea
                  rows={1}
                  placeholder="Müşteriye yanıt yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-w-0 w-full px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-slate-700 resize-none max-h-28 transition-colors font-normal leading-relaxed break-words overflow-y-auto"
                />

                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-40 uppercase tracking-wider shrink-0 cursor-pointer h-10 active:scale-95"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Gönder</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3.5 my-auto max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#0c1017] border border-slate-800 flex items-center justify-center text-slate-500 shadow-sm">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-bold text-white text-base">Sohbet Seçilmedi</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Müşteriyle canlı mesajlaşmak veya panel bilgilerini iletmek için sol taraftaki listeden bir sohbete dokunun.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. BAN / ENGELLEME MODAL PENCERESİ (EXECUTIVE ROUNDED-2XL)
         ════════════════════════════════════════════════════════════════ */}
      {banModalThread && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1017] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <Ban className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="font-heading font-bold text-base text-white">Kullanıcıyı Engelle</h3>
                  <span className="text-xs text-rose-400 font-medium">{banModalThread.kullaniciAdi}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBanModalThread(null)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBan} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-400 font-medium">Engellenecek IP Adresi:</span>
                <span className="font-mono text-slate-300 font-medium bg-[#070a0f] p-2.5 rounded-xl border border-slate-800">
                  {banModalThread.ip || 'Bilinmiyor (Sohbet ID üzerinden engellenecek)'}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 font-medium">Engelleme Kapsamı:</label>
                <select
                  value={banType}
                  onChange={(e: any) => setBanType(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-slate-700 font-medium"
                >
                  <option value="tam_ban">Tam Siteden Banla (Siteye ve API'ye erişemez)</option>
                  <option value="chat_ban">Sadece Canlı Desteği Engelle</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-slate-400 font-medium">Engelleme Nedeni (Müşteriye Gösterilir):</label>
                <textarea
                  rows={2}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#070a0f] border border-slate-800 text-white text-xs focus:outline-none focus:border-slate-700"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBanModalThread(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 border border-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={banSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {banSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                  <span>Engeli Uygula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
