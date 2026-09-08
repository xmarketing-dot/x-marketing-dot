'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  ChevronRight
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
  username?: string;
  password?: string;
  sonMesajOzeti: string;
  okunmadiAdminSayisi: number;
  updatedAt: string;
}

interface Message {
  _id: string;
  gonderenTipi: 'user' | 'admin';
  mesaj: string;
  createdAt: string;
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
  
  // Ban Modal States
  const [banModalThread, setBanModalThread] = useState<Thread | null>(null);
  const [banType, setBanType] = useState<'tam_ban' | 'chat_ban'>('tam_ban');
  const [banReason, setBanReason] = useState('Kural ihlali / Spam nedeniyle engellendi');
  const [banSubmitting, setBanSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial fetch threads
  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/admin/chat/threads');
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

        // On desktop only auto-select first thread if nothing selected
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          setSelectedThread((prev) => prev || data.threads[0] || null);
        }
      }
    } catch (e) {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/chat/sse?role=admin');
      eventSource.addEventListener('threads', () => {
        fetchThreads();
      });
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Real-Time SSE + Polling Stream for selected thread messages
  useEffect(() => {
    if (!selectedThread) return;

    // Mark as read
    fetch('/api/admin/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: selectedThread._id }),
    }).catch(() => {});

    // Update unread count locally in thread list
    setThreads((prev) =>
      prev.map((t) => (t._id === selectedThread._id ? { ...t, okunmadiAdminSayisi: 0 } : t))
    );

    const fetchCurrentMessages = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetch(`/api/chat/messages?threadId=${selectedThread._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(() => {});
    };

    fetchCurrentMessages();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/chat/sse?threadId=${selectedThread._id}`);
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
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [selectedThread?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (e) {
      // Silent
    } finally {
      setSending(false);
    }
  };

  // Filtered threads based on search
  const filteredThreads = threads.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.kullaniciAdi.toLowerCase().includes(q) ||
      (t.listingBaslik && t.listingBaslik.toLowerCase().includes(q)) ||
      (t.sonMesajOzeti && t.sonMesajOzeti.toLowerCase().includes(q)) ||
      (t.ip && t.ip.toLowerCase().includes(q)) ||
      t._id.toLowerCase().includes(q)
    );
  });

  const totalUnread = threads.reduce((acc, t) => acc + (t.okunmadiAdminSayisi || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100dvh-55px-58px)] md:h-[calc(100vh-110px)] w-full max-w-full gap-0 md:gap-3 overflow-hidden select-none">
      
      {/* ── ÜST BAŞLIK & YENİLE BUTONU (Sadece Masaüstünde Görünür, Mobilde Alan Tasarrufu) ──────────────── */}
      <div className="hidden md:flex items-center justify-between shrink-0 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white font-heading">Canlı Müşteri Sohbet Masası</h1>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] animate-pulse">
                  {totalUnread} YENİ
                </span>
              )}
            </div>
            <p className="text-xs text-[#8b949e]">
              0ms Canlı SSE Destek Hattı &bull; Müşteri Onay ve Güvenlik Masası
            </p>
          </div>
        </div>

        <button
          onClick={fetchThreads}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* ── ANA PENCERE: INSTAGRAM / WHATSAPP STİLİ TAM EKRAN DİNAMİK YAPI ──────────────── */}
      <div className="flex-1 min-h-0 flex w-full h-full rounded-none md:rounded-3xl bg-[#0d1117] md:bg-[#161b22] border-0 md:border md:border-[#30363d] shadow-none md:shadow-2xl overflow-hidden relative">
        
        {/* ── SOL SÜTUN: MÜŞTERİ / SOHBETLER LİSTESİ (Mobilde seçili değilken full ekran) ──────────────── */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-[#30363d] flex flex-col h-full shrink-0 bg-[#161b22] overflow-hidden ${
          selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Arama ve Sayaç Başlığı */}
          <div className="p-3 border-b border-[#30363d] bg-[#1a202c] flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between font-extrabold text-[11px] text-[#8b949e] uppercase tracking-wider font-heading">
              <span className="flex items-center gap-1.5">
                <span>Gelen Kutusu</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                  {threads.length}
                </span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Canlı Yayın</span>
              </span>
            </div>

            {/* Arama Inputu */}
            <div className="relative">
              <input
                type="text"
                placeholder="Müşteri, ilan veya mesaj ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs placeholder-[#484f58] focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#8b949e] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Kaydırılabilir İnce Liste (Instagram / WhatsApp Kartları) */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#30363d]/40 no-scrollbar">
            {loading ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                <span className="text-xs text-[#8b949e]">Sohbetler yükleniyor...</span>
              </div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((th) => {
                const isSelected = selectedThread?._id === th._id;
                const isDeleting = deletingId === th._id;

                return (
                  <div
                    key={th._id}
                    onClick={() => setSelectedThread(th)}
                    className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-l-4 border-amber-400'
                        : 'hover:bg-[#21262d] active:bg-[#262c36]'
                    }`}
                  >
                    {/* Profil Avatarı */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                        {th.kullaniciAdi.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#161b22]" />
                    </div>

                    {/* Müşteri Bilgi & Son Mesaj */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white font-heading truncate flex items-center gap-1.5">
                          <span className="truncate">{th.kullaniciAdi}</span>
                          {th.isBanned && (
                            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[8px] font-black uppercase border border-red-500/30 shrink-0">
                              BANLI
                            </span>
                          )}
                        </span>
                        <span className="text-[9px] text-[#8b949e] font-mono shrink-0">
                          {new Date(th.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {th.listingBaslik && (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[9px] truncate max-w-[200px] border border-amber-500/30">
                            👑 {th.listingBaslik}
                          </span>
                        </div>
                      )}

                      <p className={`text-[11px] truncate mt-0.5 ${
                        th.okunmadiAdminSayisi > 0 ? 'text-white font-bold' : 'text-[#8b949e] font-normal'
                      }`}>
                        {th.sonMesajOzeti || 'Mesaj yok'}
                      </p>
                    </div>

                    {/* Sağ Taraf: Rozet / Silme Butonu */}
                    <div className="flex items-center gap-1 shrink-0">
                      {th.okunmadiAdminSayisi > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                          {th.okunmadiAdminSayisi}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#8b949e] opacity-40 group-hover:opacity-100 group-hover:text-amber-400 transition-all md:hidden" />
                      )}

                      {/* Masaüstünde hover silme butonu */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteThread(th._id, e)}
                        className="hidden md:inline-flex opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-all"
                        title="Sohbeti Sil"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#8b949e] flex flex-col items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 opacity-30" />
                <span>Eşleşen sohbet bulunamadı.</span>
              </div>
            )}
          </div>
        </div>

        {/* ── SAĞ SÜTUN: GENİŞ INSTAGRAM/WHATSAPP MESAJLAŞMA GÖVDESİ ──────────────── */}
        <div className={`flex-1 min-h-0 flex flex-col h-full bg-[#0d1117] overflow-hidden ${
          !selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedThread ? (
            <>
              {/* ÜST BAŞLIK — INSTAGRAM TARZI GERİ OKU + MÜŞTERİ PROFİLİ + EŞLEŞTİRİLEN BİLGİLER */}
              <div className="p-2.5 sm:p-3 px-3 sm:px-4 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between shrink-0 shadow-md gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  
                  {/* Mobilde Geri Butonu (Instagram Direct / WhatsApp Stili) */}
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="p-1.5 -ml-1 rounded-xl bg-[#21262d] text-amber-400 hover:text-white hover:bg-[#30363d] transition-colors md:hidden flex items-center gap-1 font-bold text-xs shrink-0"
                    title="Sohbet Listesine Dön"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm shrink-0">
                    {selectedThread.kullaniciAdi.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-xs sm:text-sm text-white font-heading truncate">
                        {selectedThread.kullaniciAdi}
                      </span>

                      {selectedThread.kullaniciTelefon && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                          📞 {selectedThread.kullaniciTelefon}
                        </span>
                      )}

                      {selectedThread.listingBaslik && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 truncate max-w-[180px]">
                          👑 {selectedThread.listingBaslik}
                        </span>
                      )}

                      {selectedThread.isBanned && (
                        <span className="px-1.5 py-0.2 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black uppercase border border-red-500/40">
                          🚫 BANLI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-[#8b949e] font-mono truncate">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        IP: {selectedThread.ip || 'Gizli'}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">#{selectedThread._id.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonları: İlan, Ban, Sil */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedThread.listingSlug && (
                    <a
                      href={`/ilan/${selectedThread.listingSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] font-black transition-all flex items-center gap-1"
                      title="İlan Sayfasına Git"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">İlanı Gör</span>
                    </a>
                  )}

                  {selectedThread.isBanned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(selectedThread._id)}
                      className="px-2 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-[10px] font-bold border border-emerald-500/40 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Engeli Aç</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBanModalThread(selectedThread)}
                      className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-600 hover:text-white text-[10px] font-bold border border-red-500/40 transition-all flex items-center gap-1"
                      title="Kullanıcıyı Engelle"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Banla</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteThread(selectedThread._id)}
                    className="p-1.5 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-red-600/80 border border-[#30363d] text-xs font-bold transition-all"
                    title="Bu Sohbeti Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Müşteri Eşleştirilen Kullanıcı Adı & Şifre Bilgi Çubuğu */}
              {(selectedThread.username || selectedThread.password || selectedThread.listingBaslik) && (
                <div className="px-3 py-1.5 bg-[#1a202c] border-b border-[#30363d] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-left">
                  {selectedThread.listingBaslik && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-bold text-[10px] border border-amber-500/20 shrink-0">
                      👑 {selectedThread.listingBaslik}
                    </span>
                  )}
                  {selectedThread.username && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#0d1117] text-amber-400 font-mono text-[10px] font-black border border-amber-500/30 shrink-0">
                      👤 User: {selectedThread.username}
                    </span>
                  )}
                  {selectedThread.password && (
                    <span className="px-2 py-0.5 rounded-lg bg-[#0d1117] text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/30 shrink-0">
                      🔑 Şifre: {selectedThread.password}
                    </span>
                  )}
                </div>
              )}

              {/* Mesaj Akış Alanı */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-2.5 no-scrollbar">
                {selectedThread.isBanned && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-bold shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Bu kullanıcı engellenmiştir. Sebep: {selectedThread.banSebebi || 'Kural İhlali'}</span>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-[#8b949e] gap-2">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                    <span>Henüz mesajlaşma başlamadı.</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.gonderenTipi === 'admin';
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col max-w-[88%] sm:max-w-[75%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words text-left ${
                            isAdmin
                              ? 'bg-amber-500 text-slate-950 font-extrabold rounded-tr-none shadow-md'
                              : 'bg-[#21262d] text-[#f0f6fc] rounded-tl-none border border-[#363b42]'
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
                                  className="underline font-black break-all block my-1 p-1.5 rounded-lg bg-black/20 hover:opacity-80"
                                >
                                  🔗 {part}
                                </a>
                              );
                            }
                            return part;
                          })}
                        </div>
                        <span className="text-[9px] text-[#8b949e] mt-0.5 px-1 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Hızlı Şablon Butonları (Tek Tıkla Mesaj Doldurma) */}
              <div className="px-3 py-1.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setReplyText('Ödeme Adresi (BNB SMART CHAIN BEP-20): 0xb7259aef66c9cd16e5a5d879baf0107bea03f527 - Ödemeden sonra lütfen TXID veya dekont iletiniz, 5 dakikada onaylanacaktır.')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-[10px] font-extrabold flex items-center gap-1 transition-all shrink-0"
                >
                  <span>💎 Kripto Cüzdan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    setReplyText(`🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.\n\n🔑 Müşteri Panel Bilgileriniz:\nPanel Giriş Adresi: ${origin}/panelim\nKullanıcı Adı: ...\nŞifre: ...\n\nPanelinize giriş yaparak ilanınızı yönetebilirsiniz.`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 transition-all shrink-0"
                >
                  <span>✅ Onay &amp; Şifre</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReplyText('Merhaba, ilanınızdaki fotoğrafların doğrulanabilmesi için yüzünüzün veya kimliğinizin görünmediği teyit fotoğrafı iletmeniz gerekmektedir.')}
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  <span>📸 Fotoğraf Teyidi İste</span>
                </button>
              </div>

              {/* Tabana Sabitlenmiş Yanıt Formu */}
              <form onSubmit={handleSendReply} className="p-2.5 sm:p-3 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Müşteriye yanıt yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all disabled:opacity-50 font-heading uppercase shrink-0"
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-white text-base">Sohbet Seçilmedi</h3>
              <p className="text-xs text-[#8b949e] max-w-sm">
                Mesajlaşmayı başlatmak veya yanıtlamak için soldaki listeden bir müşteri sohbetine tıklayın.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ── BAN MODAL (IP & CHAT ENGELLEME PENCERESİ) ──────────────── */}
      {banModalThread && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161b22] border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black">
                  <Ban className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="font-black text-base text-white font-heading">Kullanıcıyı &amp; IP'yi Engelle</h3>
                  <span className="text-xs text-red-400 font-bold">{banModalThread.kullaniciAdi}</span>
                </div>
              </div>
              <button
                onClick={() => setBanModalThread(null)}
                className="p-2 rounded-xl bg-[#21262d] text-[#8b949e] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyBan} className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-[#8b949e] font-bold">IP Adresi:</span>
                <span className="font-mono text-amber-400 font-bold bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]">
                  {banModalThread.ip || 'Bilinmiyor (Thread ID üzerinden engellenecek)'}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-[#8b949e] font-bold">Engelleme Türü:</label>
                <select
                  value={banType}
                  onChange={(e: any) => setBanType(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="tam_ban">🚫 Tam Siteden Banla (Siteye ve API'ye erişemez)</option>
                  <option value="chat_ban">💬 Sadece Canlı Desteği Engelle</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="text-[#8b949e] font-bold">Ban Sebebi (Kullanıcıya Gösterilir):</label>
                <textarea
                  rows={2}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#0d1117] border border-[#30363d] text-white text-xs focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBanModalThread(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#21262d] text-white text-xs font-bold hover:bg-[#30363d]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={banSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase font-heading tracking-wider shadow-lg flex items-center gap-1.5 disabled:opacity-50"
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
