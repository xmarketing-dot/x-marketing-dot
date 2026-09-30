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

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
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

  // 1. Fetch thread list
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/admin/chat/threads', { cache: 'no-store' });
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);

        if (targetThreadId) {
          const matched = data.threads.find((t: Thread) => t._id === targetThreadId);
          if (matched) {
            setSelectedThread(matched);
            return;
          }
        }

        // On desktop, auto-select first thread if nothing is selected
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

  // 2. Global Thread SSE Stream
  useEffect(() => {
    fetchThreads();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/chat/sse?role=admin');
      eventSource.addEventListener('threads', () => {
        fetchThreads();
        if (soundEnabled) playAdminDing();
      });
    } catch (e) {}

    // Polling fallback every 12s
    const pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchThreads();
    }, 12000);

    return () => {
      if (eventSource) eventSource.close();
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

    // Update unread count locally
    setThreads((prev) =>
      prev.map((t) => (t._id === selectedThread._id ? { ...t, okunmadiAdminSayisi: 0 } : t))
    );

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?threadId=${selectedThread._id}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          if (data.messages.length > 0) {
            lastKnownMessageId.current = data.messages[data.messages.length - 1]._id;
          }
        }
      } catch (e) {}
    };

    loadMessages();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/chat/sse?threadId=${selectedThread._id}`);
      eventSource.addEventListener('new_message', (event) => {
        try {
          const incoming: Message[] = JSON.parse(event.data);
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id));
            const uniqueNew = incoming.filter((m) => !existingIds.has(m._id));
            if (uniqueNew.length > 0) {
              const hasUserMsg = uniqueNew.some((m) => m.gonderenTipi === 'user');
              if (hasUserMsg && soundEnabled) {
                playAdminDing();
              }
              lastKnownMessageId.current = uniqueNew[uniqueNew.length - 1]._id;
              return [...prev, ...uniqueNew];
            }
            return prev;
          });
        } catch (err) {}
      });
    } catch (e) {}

    // Polling fallback every 4s for active thread
    const activePoll = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      loadMessages();
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(activePoll);
    };
  }, [selectedThread?._id, soundEnabled]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const content = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread._id,
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

      // 2. Tab filter
      if (activeFilter === 'unread') return (t.okunmadiAdminSayisi || 0) > 0;
      if (activeFilter === 'vip') return Boolean(t.listingId || t.listingBaslik);
      if (activeFilter === 'banned') return Boolean(t.isBanned);

      return true;
    });
  }, [threads, searchQuery, activeFilter]);

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((acc, t) => acc + (t.okunmadiAdminSayisi || 0), 0);
  }, [threads]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e14] md:rounded-2xl border-0 md:border md:border-[#232936] shadow-2xl overflow-hidden select-none">
      
      <div className="flex-1 min-h-0 flex w-full h-full relative overflow-hidden">
        
        {/* ════════════════════════════════════════════════════════════════
            1. SOL SÜTUN: PROFESYONEL MÜŞTERİ / THREAD LİSTESİ
           ════════════════════════════════════════════════════════════════ */}
        <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-[#232936] flex flex-col h-full shrink-0 bg-[#10141d] overflow-hidden ${
          selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header & Live Stream Bar */}
          <div className="p-3.5 border-b border-[#232936] bg-[#141924] flex flex-col gap-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-500/30 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-heading font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    Canlı Destek Masası
                    {totalUnreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-black text-[9px] animate-pulse">
                        {totalUnreadCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[#7d8590] font-mono">0ms Real-Time SSE</span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    soundEnabled 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                      : 'bg-[#1b2230] border-[#2b3547] text-[#7d8590] hover:text-white'
                  }`}
                  title={soundEnabled ? 'Bildirim Sesi Açık' : 'Bildirim Sesi Kapalı'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={fetchThreads}
                  className="p-1.5 rounded-lg bg-[#1b2230] hover:bg-[#232c3d] border border-[#2b3547] text-[#7d8590] hover:text-amber-400 transition-colors"
                  title="Listeyi Yenile"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
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
                className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#090c12] border border-[#232936] text-white text-xs placeholder-[#545d6e] focus:outline-none focus:border-amber-400/80 transition-all font-medium"
              />
              <Search className="w-3.5 h-3.5 text-[#545d6e] absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#7d8590] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtre Sekmeleri */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-black tracking-wider uppercase whitespace-nowrap transition-all ${
                  activeFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'bg-[#181f2c] text-[#7d8590] hover:text-white border border-[#232936]'
                }`}
              >
                Tümü ({threads.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-black tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeFilter === 'unread'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/20'
                    : 'bg-[#181f2c] text-[#7d8590] hover:text-white border border-[#232936]'
                }`}
              >
                <span>Okunmamış</span>
                {totalUnreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('vip')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-black tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeFilter === 'vip'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'bg-[#181f2c] text-[#7d8590] hover:text-white border border-[#232936]'
                }`}
              >
                <CrownIcon className="w-2.5 h-2.5" />
                <span>İlan Sahipleri</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('banned')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-heading font-black tracking-wider uppercase whitespace-nowrap transition-all ${
                  activeFilter === 'banned'
                    ? 'bg-red-900/60 text-red-200 border border-red-500/50'
                    : 'bg-[#181f2c] text-[#7d8590] hover:text-white border border-[#232936]'
                }`}
              >
                Banlılar
              </button>
            </div>
          </div>

          {/* Kaydırılabilir Sohbet Listesi */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#1e2433] no-scrollbar">
            {loading ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-2.5">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-xs text-[#7d8590] font-medium">Sohbetler senkronize ediliyor...</span>
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
                        ? 'bg-amber-500/10 border-l-[3px] border-amber-400'
                        : 'hover:bg-[#151b27] active:bg-[#1a2230]'
                    }`}
                  >
                    {/* Profil Avatarı */}
                    <div className="relative shrink-0 mt-0.5">
                      {th.listingFoto ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#2b3547] shadow-sm bg-black">
                          <img src={th.listingFoto} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl font-heading font-black text-sm flex items-center justify-center shadow-md ${
                          isVip 
                            ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 text-slate-950 border border-amber-300/40' 
                            : 'bg-[#1e2638] text-white border border-[#2b3547]'
                        }`}>
                          {th.kullaniciAdi.replace('👑 ', '').charAt(0).toUpperCase() || 'M'}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#10141d]" />
                    </div>

                    {/* Müşteri Başlık, Etiket ve Son Mesaj */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`font-heading font-bold text-xs truncate ${
                            isSelected ? 'text-amber-300' : 'text-[#f0f6fc]'
                          }`}>
                            {th.kullaniciAdi}
                          </span>
                          {th.isBanned && (
                            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[8px] font-black uppercase border border-red-500/40 shrink-0">
                              BANLI
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#7d8590] font-mono shrink-0">
                          {new Date(th.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Rozetler: Telefon / İlan Başlığı */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {th.listingBaslik && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[9px] border border-amber-500/30 truncate max-w-[190px]">
                            <CrownIcon className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span className="truncate">{th.listingBaslik}</span>
                          </span>
                        )}
                        {th.kullaniciTelefon && !th.listingBaslik && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
                            <Phone className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{th.kullaniciTelefon}</span>
                          </span>
                        )}
                      </div>

                      {/* Son Mesaj Özeti */}
                      <p className={`text-[11px] truncate leading-tight mt-0.5 ${
                        hasUnread ? 'text-white font-black' : 'text-[#7d8590] font-normal'
                      }`}>
                        {th.sonMesajOzeti || 'Mesaj geçmişi yok'}
                      </p>
                    </div>

                    {/* Sağ Taraf: Rozet / Silme */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                      {hasUnread ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-heading font-black text-[10px] animate-pulse shadow-md shadow-amber-500/30">
                          {th.okunmadiAdminSayisi}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-[#545d6e] opacity-40 group-hover:opacity-100 group-hover:text-amber-400 transition-all md:hidden" />
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteThread(th._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-400 hover:text-white hover:bg-red-600 transition-all text-xs"
                        title="Sohbeti Sil"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-xs text-[#7d8590] flex flex-col items-center justify-center gap-2">
                <MessageSquare className="w-8 h-8 opacity-25 text-amber-400" />
                <span className="font-medium">Kriterlere uygun sohbet bulunamadı.</span>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            2. ORTA / SAĞ SÜTUN: WORLD-CLASS ENTERPRISE SOHBET PENCERESİ
           ════════════════════════════════════════════════════════════════ */}
        <div className={`flex-1 min-h-0 flex flex-col h-full bg-[#090c12] overflow-hidden ${
          !selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedThread ? (
            <>
              {/* ── ÜST BAŞLIK / MÜŞTERİ BİLGİ ŞERİDİ ──────────────── */}
              <div className="p-3 sm:px-4 bg-[#121722] border-b border-[#232936] flex items-center justify-between shrink-0 shadow-md gap-2">
                
                {/* Sol Profil Özeti */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  
                  {/* Mobilde Geri Dön Butonu */}
                  <button
                    type="button"
                    onClick={() => setSelectedThread(null)}
                    className="p-1.5 -ml-1 rounded-xl bg-[#1b2230] text-amber-400 hover:text-white hover:bg-[#283247] transition-colors md:hidden flex items-center gap-0.5 font-bold text-xs shrink-0"
                    title="Geri Dön"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="relative shrink-0">
                    {selectedThread.listingFoto ? (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#2b3547] bg-black shadow-sm">
                        <img src={selectedThread.listingFoto} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 font-heading font-black flex items-center justify-center text-sm shadow-sm">
                        {selectedThread.kullaniciAdi.replace('👑 ', '').charAt(0).toUpperCase() || 'M'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121722]" />
                  </div>

                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-heading font-black text-xs sm:text-sm text-white truncate drop-shadow-sm">
                        {selectedThread.kullaniciAdi}
                      </span>

                      {selectedThread.kullaniciTelefon && (
                        <a
                          href={`https://wa.me/${selectedThread.kullaniciTelefon.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 transition-all flex items-center gap-1"
                          title="WhatsApp'ta Aç"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{selectedThread.kullaniciTelefon}</span>
                        </a>
                      )}

                      {selectedThread.isBanned && (
                        <span className="px-1.5 py-0.2 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black uppercase border border-red-500/40">
                          🚫 {selectedThread.banTuru === 'chat_ban' ? 'CHAT BANLI' : 'TAM BANLI'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#7d8590] font-mono truncate mt-0.5">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        IP: {selectedThread.ip || 'Gizli'}
                      </span>
                      <span>&bull;</span>
                      <span className="text-[#545d6e] truncate">ID: #{selectedThread._id.slice(-8)}</span>
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
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[11px] font-heading font-black transition-all flex items-center gap-1 shadow-sm"
                      title="İlanı Gör"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">İlanı İncele</span>
                    </a>
                  )}

                  {selectedThread.isBanned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(selectedThread._id)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-[11px] font-bold border border-emerald-500/40 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Engeli Kaldır</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBanModalThread(selectedThread)}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-600 hover:text-white text-[11px] font-bold border border-red-500/40 transition-all flex items-center gap-1"
                      title="Kullanıcıyı Engelle"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Banla</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                    className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1 ${
                      showInfoSidebar 
                        ? 'bg-amber-500 text-slate-950 border-amber-400' 
                        : 'bg-[#1b2230] text-[#7d8590] hover:text-white border-[#2b3547]'
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
                <div className="px-3 sm:px-4 py-2 bg-[#0e121a] border-b border-[#232936] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 text-left">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {selectedThread.listingBaslik && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-bold text-[10px] border border-amber-500/20 shrink-0">
                        <CrownIcon className="w-3 h-3 text-amber-400" />
                        <span>{selectedThread.listingBaslik}</span>
                      </span>
                    )}

                    {selectedThread.username && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedThread.username!, 'user')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#141924] hover:bg-[#1b2230] text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 transition-all shrink-0 cursor-pointer"
                        title="Kullanıcı Adını Kopyala"
                      >
                        <User className="w-3 h-3 text-amber-400" />
                        <span>Kullanıcı: {selectedThread.username}</span>
                        {copiedKey === 'user' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                      </button>
                    )}

                    {selectedThread.password && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedThread.password!, 'pwd')}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#141924] hover:bg-[#1b2230] text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
                        title="Şifreyi Kopyala"
                      >
                        <Key className="w-3 h-3 text-emerald-400" />
                        <span>Şifre: {selectedThread.password}</span>
                        {copiedKey === 'pwd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-[#545d6e] font-mono shrink-0 hidden sm:block">
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
                  className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-3.5 no-scrollbar relative"
                >
                  {selectedThread.isBanned && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-bold shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>Bu müşteri engellenmiştir. Sebep: {selectedThread.banSebebi || 'Kural İhlali'}</span>
                    </div>
                  )}

                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#7d8590] gap-2.5 my-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[#141924] border border-[#232936] flex items-center justify-center text-amber-400">
                        <MessageSquare className="w-6 h-6 opacity-40" />
                      </div>
                      <span className="font-heading font-bold text-white text-sm">Mesajlaşma Başlamadı</span>
                      <p className="max-w-xs text-[11px] text-[#7d8590]">
                        Müşteriye şablon yanıtı göndermek veya doğrudan mesaj yazmak için aşağıdaki formu kullanabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    messages.map((m, index) => {
                      const isAdmin = m.gonderenTipi === 'admin';
                      const isNextSame = messages[index + 1]?.gonderenTipi === m.gonderenTipi;

                      return (
                        <div
                          key={m._id || index}
                          className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${
                            isAdmin ? 'self-end items-end' : 'self-start items-start'
                          } ${isNextSame ? 'mb-0.5' : 'mb-2'}`}
                        >
                          {/* Baloncuk Gövdesi */}
                          <div
                            className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words text-left shadow-md ${
                              isAdmin
                                ? 'bg-gradient-to-br from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-semibold rounded-tr-sm border border-amber-300/40 shadow-amber-500/10'
                                : 'bg-[#161c28] text-[#f0f6fc] rounded-tl-sm border border-[#263145] font-normal'
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
                                    className={`inline-flex items-center gap-1 underline font-black break-all my-1 p-1.5 rounded-lg text-xs ${
                                      isAdmin 
                                        ? 'bg-black/15 text-slate-950 hover:bg-black/25' 
                                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
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
                          <div className="flex items-center gap-1 mt-0.5 px-1 font-mono text-[9px] text-[#7d8590]">
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isAdmin && (
                              <CheckCheck className="w-3 h-3 text-amber-400 stroke-[2.5]" />
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
                    className="absolute right-6 bottom-4 p-2 rounded-full bg-amber-500 text-slate-950 shadow-xl hover:bg-amber-400 transition-all z-20 animate-bounce"
                    title="En alta kaydır"
                  >
                    <ArrowDown className="w-4 h-4 stroke-[3]" />
                  </button>
                )}

                {/* ── SAĞ PROFİL BİLGİ PANELİ (DRAWER) ──────────────── */}
                {showInfoSidebar && (
                  <div className="w-72 lg:w-80 border-l border-[#232936] bg-[#0e121a] flex flex-col h-full shrink-0 p-4 gap-4 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-200">
                    <div className="flex items-center justify-between border-b border-[#232936] pb-3">
                      <h4 className="font-heading font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-400" />
                        <span>Müşteri Kartı</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowInfoSidebar(false)}
                        className="p-1 rounded-lg text-[#7d8590] hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Müşteri Kimliği */}
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-[#7d8590] font-bold">Müşteri Adı / Ünvan:</span>
                      <span className="font-bold text-white bg-[#141924] p-2.5 rounded-xl border border-[#232936]">
                        {selectedThread.kullaniciAdi}
                      </span>
                    </div>

                    {/* Panel Bilgileri (Tek Tık Kopyala) */}
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                      <span className="text-[11px] font-heading font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5" />
                        <span>Müşteri Panel Girişi</span>
                      </span>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#7d8590]">
                          <span>Kullanıcı Adı:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedThread.username || selectedThread.kullaniciAdi, 'user2')}
                            className="text-amber-300 hover:underline flex items-center gap-0.5"
                          >
                            <span>{copiedKey === 'user2' ? 'Kopyalandı ✓' : 'Kopyala'}</span>
                          </button>
                        </div>
                        <span className="font-mono text-white font-bold bg-[#090c12] p-2 rounded-lg border border-[#232936]">
                          {selectedThread.username || 'Bilinmiyor'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#7d8590]">
                          <span>Şifre:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedThread.password || '', 'pwd2')}
                            className="text-emerald-300 hover:underline flex items-center gap-0.5"
                          >
                            <span>{copiedKey === 'pwd2' ? 'Kopyalandı ✓' : 'Kopyala'}</span>
                          </button>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold bg-[#090c12] p-2 rounded-lg border border-[#232936]">
                          {selectedThread.password || 'Bilinmiyor'}
                        </span>
                      </div>
                    </div>

                    {/* İlan Bağlantısı */}
                    {selectedThread.listingBaslik && (
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[#7d8590] font-bold">Bağlı Olduğu İlan:</span>
                        <div className="p-2.5 rounded-xl bg-[#141924] border border-[#232936] flex flex-col gap-1.5">
                          <span className="font-bold text-amber-300 text-xs">👑 {selectedThread.listingBaslik}</span>
                          {selectedThread.listingSlug && (
                            <a
                              href={`/ilan/${selectedThread.listingSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
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
                      <span className="text-[#7d8590] font-bold">Güvenlik / IP:</span>
                      <span className="font-mono text-xs text-white bg-[#141924] p-2 rounded-xl border border-[#232936]">
                        {selectedThread.ip || '127.0.0.1'}
                      </span>
                    </div>

                    {/* Sohbeti Temizle / Sil Butonu */}
                    <button
                      type="button"
                      onClick={() => handleDeleteThread(selectedThread._id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bu Sohbeti Kalıcı Sil</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── HIZLI ŞABLON BUTONLARI (TEK TIKLA CEVAP) ──────────────── */}
              <div className="px-3 sm:px-4 py-2 bg-[#121722] border-t border-[#232936] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setReplyText('Ödeme Adresi (BNB SMART CHAIN BEP-20): 0xb7259aef66c9cd16e5a5d879baf0107bea03f527 - Ödemeden sonra lütfen TXID veya dekont iletiniz, 5 dakikada onaylanacaktır.')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-heading font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <span>💎 Kripto Cüzdan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    setReplyText(`🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.\n\n🔑 Müşteri Panel Bilgileriniz:\nPanel Giriş: ${origin}/panelim\nKullanıcı Adı: ${selectedThread.username || '...'}\nŞifre: ${selectedThread.password || '...'}\n\nPanelinize giriş yaparak ilanınızı dilediğiniz an güncelleyebilirsiniz.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[11px] font-heading font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <span>✅ Onay &amp; Şifre Bilgisi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyText('Merhaba, ilanınızdaki fotoğrafların doğrulanabilmesi için yüzünüzün veya kimliğinizin görünmediği teyit fotoğrafı iletmeniz gerekmektedir.')}
                  className="px-3 py-1.5 rounded-xl bg-[#1c2333] hover:bg-[#252f45] border border-[#2b3547] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <span>📸 Fotoğraf Teyidi İste</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReplyText('İlanınızdaki iletişim bilgileri güncellenmiştir. Başka bir işlem için bize yazabilirsiniz.')}
                  className="px-3 py-1.5 rounded-xl bg-[#1c2333] hover:bg-[#252f45] border border-[#2b3547] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <span>✏️ Bilgiler Güncellendi</span>
                </button>
              </div>

              {/* ── TABANA SABİTLENMİŞ CEVAP YAZMA FORMU ──────────────── */}
              <form onSubmit={handleSendReply} className="p-3 sm:p-4 bg-[#121722] border-t border-[#232936] flex items-center gap-2 shrink-0">
                <textarea
                  rows={1}
                  placeholder="Müşteriye yanıt yazın... (Göndermek için Enter, alt satır için Shift+Enter)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090c12] border border-[#263145] text-white text-xs sm:text-sm placeholder-[#545d6e] focus:outline-none focus:border-amber-400 resize-none max-h-32 transition-colors font-normal leading-relaxed"
                />

                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-heading font-black text-xs sm:text-sm shadow-xl transition-all disabled:opacity-40 uppercase tracking-wider shrink-0 cursor-pointer"
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
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-3.5 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-black text-white text-base sm:text-lg">Sohbet Seçilmedi</h3>
              <p className="text-xs text-[#7d8590] max-w-sm leading-relaxed">
                Müşteriyle canlı mesajlaşmak veya panel bilgilerini iletmek için sol taraftaki listeden bir sohbete tıklayın.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. PROFESYONEL BAN / ENGELLEME MODAL PENCERESİ
         ════════════════════════════════════════════════════════════════ */}
      {banModalThread && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121722] border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#232936] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black shadow-lg shadow-red-500/30">
                  <Ban className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="font-heading font-black text-base text-white">Kullanıcıyı Engelle</h3>
                  <span className="text-xs text-red-400 font-bold">{banModalThread.kullaniciAdi}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBanModalThread(null)}
                className="p-2 rounded-xl bg-[#1b2230] text-[#7d8590] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBan} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-[#7d8590] font-bold">Engellenecek IP Adresi:</span>
                <span className="font-mono text-amber-400 font-bold bg-[#090c12] p-2.5 rounded-xl border border-[#232936]">
                  {banModalThread.ip || 'Bilinmiyor (Sohbet ID üzerinden engellenecek)'}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-[#7d8590] font-bold">Engelleme Kapsamı:</label>
                <select
                  value={banType}
                  onChange={(e: any) => setBanType(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#090c12] border border-[#232936] text-white text-xs focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="tam_ban">🚫 Tam Siteden Banla (Siteye ve API'ye erişemez)</option>
                  <option value="chat_ban">💬 Sadece Canlı Desteği Engelle</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-[#7d8590] font-bold">Engelleme Nedeni (Müşteriye Gösterilir):</label>
                <textarea
                  rows={2}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#090c12] border border-[#232936] text-white text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBanModalThread(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1b2230] text-white text-xs font-bold hover:bg-[#283247]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={banSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-heading font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 disabled:opacity-50"
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
