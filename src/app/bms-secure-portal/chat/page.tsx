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
  AlertTriangle 
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Thread {
  _id: string;
  kullaniciAdi: string;
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

        if (!selectedThread && data.threads.length > 0) {
          setSelectedThread(data.threads[0]);
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

    // Real-Time Server-Sent Events (SSE) Stream for Admin Threads
    const eventSource = new EventSource('/api/chat/sse?role=admin');

    eventSource.addEventListener('threads', () => {
      fetchThreads();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Real-Time SSE Stream for selected thread messages
  useEffect(() => {
    if (!selectedThread) return;

    // Mark as read
    fetch('/api/admin/chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: selectedThread._id }),
    }).catch(() => {});

    // Initial message fetch
    fetch(`/api/chat/messages?threadId=${selectedThread._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    // SSE connection for selected thread
    const eventSource = new EventSource(`/api/chat/sse?threadId=${selectedThread._id}`);

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
  }, [selectedThread]);

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
          engellemeTuru: banType,
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

  return (
    <div className="flex flex-col h-[calc(100vh-95px)] md:h-[calc(100vh-80px)] w-full max-w-full gap-3.5 overflow-hidden select-none">
      
      {/* ── ÜST BAŞLIK & YENİLE BUTONU ──────────────── */}
      <div className="flex items-center justify-between shrink-0 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black text-lg md:text-xl text-white font-heading">Canlı Destek Chat &amp; Güvenlik Masası</h1>
            <p className="text-[11px] text-[#8b949e]">
              0 Gecikmeli anlık canlı mesajlaşma, şifre onay ve IP/Chat banlama masası.
            </p>
          </div>
        </div>

        <button
          onClick={fetchThreads}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-white border border-[#30363d] font-bold text-xs transition-colors shadow-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Yenile</span>
        </button>
      </div>

      {/* ── ANA PENCERE: SOL KOMPAKT LİSTE + SAĞ DEVASA CHAT (RESPONSIVE) ──────────────── */}
      <div className="flex-1 min-h-0 flex rounded-3xl bg-[#161b22] border-2 border-[#30363d] shadow-2xl overflow-hidden">
        
        {/* ── SOL SÜTUN: KOMPAKT SOHBETLER LİSTESİ ──────────────── */}
        <div className={`w-full md:w-64 lg:w-72 border-r border-[#30363d] flex flex-col h-full shrink-0 bg-[#161b22] overflow-hidden ${
          selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          
          <div className="p-3 px-3.5 border-b border-[#30363d] bg-[#21262d] font-extrabold text-[11px] text-[#8b949e] uppercase tracking-wider font-heading flex items-center justify-between shrink-0">
            <span>Sohbetler ({threads.length})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Kaydırılabilir İnce Liste */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#30363d]/60 no-scrollbar">
            {loading ? (
              <div className="p-6 text-center flex justify-center">
                <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
            ) : threads.length > 0 ? (
              threads.map((th) => {
                const isSelected = selectedThread?._id === th._id;
                const isDeleting = deletingId === th._id;

                return (
                  <div
                    key={th._id}
                    onClick={() => setSelectedThread(th)}
                    className={`w-full p-3 px-3.5 flex flex-col gap-0.5 text-left transition-all cursor-pointer group relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-l-4 border-amber-400'
                        : 'hover:bg-[#21262d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5 font-heading truncate">
                        <User className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{th.kullaniciAdi}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {th.isBanned && (
                          <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[8px] font-black uppercase border border-red-500/30">
                            BANLI
                          </span>
                        )}
                        <span className="text-[9px] text-[#8b949e] font-mono shrink-0">
                          #{th._id.slice(-4)}
                        </span>
                        
                        {/* Hızlı Sil Butonu */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteThread(th._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition-all ml-1"
                          title="Sohbeti Sil"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {th.listingBaslik && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[9px] truncate max-w-[180px] border border-amber-500/30">
                          👑 {th.listingBaslik}
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-[#8b949e] line-clamp-1 font-medium mt-0.5">
                      {th.sonMesajOzeti || 'Mesaj yok'}
                    </p>

                    <div className="flex items-center justify-between mt-1 text-[9px] text-[#8b949e]">
                      <span>{new Date(th.updatedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {th.okunmadiAdminSayisi > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] animate-pulse">
                          {th.okunmadiAdminSayisi} YENİ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#8b949e]">
                Gelen mesaj yok.
              </div>
            )}
          </div>
        </div>

        {/* ── SAĞ SÜTUN: GENİŞ, FERAH MESAJLAŞMA GÖVDESİ ──────────────── */}
        <div className={`flex-1 min-h-0 flex flex-col h-full bg-[#0d1117] overflow-hidden ${
          !selectedThread ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedThread ? (
            <>
              {/* Üst Başlık & Eşleştirilen İlan / Hesap Bilgileri */}
              <div className="p-3 px-4 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between shrink-0 shadow-md flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="md:hidden p-1.5 rounded-lg bg-[#21262d] text-white hover:bg-[#30363d] -ml-1"
                    title="Geri"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                    {selectedThread.kullaniciAdi.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs sm:text-sm text-white font-heading">{selectedThread.kullaniciAdi}</span>
                      
                      {/* Eşleştirilen İlan Butonu */}
                      {selectedThread.listingSlug && (
                        <a
                          href={`/ilan/${selectedThread.listingSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-black border border-amber-500/40 transition-all flex items-center gap-1"
                        >
                          <span>👑 İlan: {selectedThread.listingBaslik || selectedThread.listingSlug} ➔</span>
                        </a>
                      )}

                      {/* Eşleştirilen Kullanıcı Adı (Username) */}
                      {selectedThread.username && (
                        <span className="px-2 py-0.5 rounded-lg bg-[#0d1117] text-amber-400 font-mono text-[10px] font-black border border-amber-500/30">
                          👤 User: {selectedThread.username}
                        </span>
                      )}

                      {/* Eşleştirilen Şifre */}
                      {selectedThread.password && (
                        <span className="px-2 py-0.5 rounded-lg bg-[#0d1117] text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/30">
                          🔑 Şifre: {selectedThread.password}
                        </span>
                      )}

                      {selectedThread.isBanned && (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-black uppercase border border-red-500/40">
                          🚫 {selectedThread.banTuru === 'tam_ban' ? 'SİTEDEN BANLI' : 'CHAT BANLI'}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      IP: {selectedThread.ip || 'Bilinmiyor'} &bull; ID: #{selectedThread._id.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Butonlar: Banla & Sil */}
                <div className="flex items-center gap-2">
                  {selectedThread.isBanned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(selectedThread._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Engeli Kaldır</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBanModalThread(selectedThread)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition-all active:scale-95"
                      title="Kullanıcıyı / IP'yi Banla"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>🚫 Banla</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteThread(selectedThread._id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#21262d] hover:bg-red-600/80 text-[#8b949e] hover:text-white border border-[#30363d] text-xs font-bold transition-all active:scale-95"
                    title="Bu Sohbeti Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Mesaj Akış Alanı */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-5 flex flex-col gap-3">
                {selectedThread.isBanned && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs font-bold">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Bu kullanıcı engellenmiştir. Sebep: {selectedThread.banSebebi || 'Kural İhlali'}</span>
                  </div>
                )}

                {messages.map((m) => {
                  const isAdmin = m.gonderenTipi === 'admin';
                  return (
                    <div
                      key={m._id}
                      className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isAdmin ? 'self-end items-end' : 'self-start'}`}
                    >
                      <div
                        className={`p-3 md:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
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
                                className="underline font-black break-all block my-1 p-1.5 rounded-lg bg-black/15 hover:opacity-80"
                              >
                                🔗 {part}
                              </a>
                            );
                          }
                          return part;
                        })}
                      </div>
                      <span className="text-[9px] text-[#8b949e] mt-0.5 px-1">
                        {new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Hızlı Şablon Butonları */}
              <div className="px-3.5 py-1.5 bg-[#161b22] border-t border-[#30363d] flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setReplyText('Ödeme Adresi (BNB SMART CHAIN BEP-20): 0xb7259aef66c9cd16e5a5d879baf0107bea03f527 - Ödemeden sonra lütfen TXID veya dekont iletiniz, 5 dakikada onaylanacaktır.')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>💎 Kripto Cüzdan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    setReplyText(`🎉 Tebrikler! İlanınız onaylandı ve yayına alındı.\n\n🔑 Müşteri Panel Bilgileriniz:\nPanel Giriş Adresi: ${origin}/panelim\nKullanıcı Adı: ...\nŞifre: ...\n\nPanelinize giriş yaparak ilanınızı yönetebilir, fotoğraflarınızı güncelleyebilir ve sürenizi uzatabilirsiniz.`);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>✅ Onay &amp; Şifre Şablonu</span>
                </button>
              </div>

              {/* Tabana Kilitli Yanıt Formu */}
              <form onSubmit={handleSendReply} className="p-3 px-3.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Müşteriye yanıt yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#21262d] border border-[#363b42] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
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
                  <span>Yanıtla</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
              <span className="text-xs text-[#8b949e]">Lütfen soldan bir müşteri sohbeti seçin.</span>
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

