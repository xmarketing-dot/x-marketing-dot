'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Clock,
  User,
  AlertCircle,
  Loader2,
  Plus,
  Lock
} from 'lucide-react';

export interface CommentItem {
  _id?: string;
  yazar: string;
  yorum: string;
  puan: number;
  onayli?: boolean;
  userIp?: string;
  visitorId?: string;
  createdAt: string | Date;
}

interface Props {
  listingSlug: string;
  listingTitle: string;
  initialComments?: CommentItem[];
}

export default function ListingCommentsSection({
  listingSlug,
  listingTitle,
  initialComments = [],
}: Props) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hasAlreadyCommented, setHasAlreadyCommented] = useState(false);

  // Form states
  const [puan, setPuan] = useState(5);
  const [hoverPuan, setHoverPuan] = useState<number | null>(null);
  const [yazar, setYazar] = useState('');
  const [yorum, setYorum] = useState('');
  const [hpField, setHpField] = useState(''); // Honeypot anti-spam
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Get or create persistent visitor ID
  const getVisitorId = () => {
    if (typeof window === 'undefined') return '';
    let vid = localStorage.getItem('best_eskort_visitor_id');
    if (!vid) {
      vid = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('best_eskort_visitor_id', vid);
    }
    return vid;
  };

  // Visitor ID, Cooldown & Previously Commented Check on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vid = getVisitorId();

    // Check if this user already commented on THIS specific listing
    const isCommentedLocally = localStorage.getItem(`commented_slug_${listingSlug}`);
    const isCommentedInList = comments.some(
      (c) => c.visitorId && c.visitorId === vid
    );

    if (isCommentedLocally || isCommentedInList) {
      setHasAlreadyCommented(true);
    }

    // Check global cooldown timestamp
    const lastGlobalTs = localStorage.getItem('best_eskort_global_last_comment_ts');
    if (lastGlobalTs) {
      const elapsed = Date.now() - Number(lastGlobalTs);
      if (elapsed < 60000) {
        setCooldownRemaining(Math.ceil((60000 - elapsed) / 1000));
      }
    }
  }, [listingSlug, comments]);

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // Calculate average rating
  const avgRating = useMemo(() => {
    if (!comments || comments.length === 0) return 5.0;
    const sum = comments.reduce((acc, c) => acc + (Number(c.puan) || 5), 0);
    return (sum / comments.length).toFixed(1);
  }, [comments]);

  // Comments to display: Max 5 initially, or all if expanded
  const displayedComments = showAll ? comments : comments.slice(0, 5);

  const formatDate = (dateInput: string | Date) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Yakın zamanda';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (hasAlreadyCommented) {
      setErrorMessage('Bu ilana daha önce zaten yorum yaptınız. Her ilana yalnızca 1 kez yorum yapabilirsiniz.');
      return;
    }

    if (cooldownRemaining > 0) {
      setErrorMessage(`Güvenlik Koruması: Lütfen ${cooldownRemaining} saniye bekleyin.`);
      return;
    }

    if (yorum.trim().length < 5) {
      setErrorMessage('Lütfen en az 5 karakter uzunluğunda bir yorum yazın.');
      return;
    }

    if (yorum.trim().length > 500) {
      setErrorMessage('Yorumunuz 500 karakterden uzun olamaz.');
      return;
    }

    setSubmitting(true);

    try {
      const vid = getVisitorId();
      const res = await fetch('/api/listings/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingSlug,
          yazar: yazar.trim(),
          yorum: yorum.trim(),
          puan,
          hp_field: hpField,
          visitorId: vid,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Yorum gönderilirken bir sorun oluştu.');

        // If 403 (Already commented), lock permanently
        if (res.status === 403) {
          setHasAlreadyCommented(true);
          localStorage.setItem(`commented_slug_${listingSlug}`, 'true');
        }

        // If 429 rate limited, set client cooldown
        if (res.status === 429) {
          const match = data.error?.match(/(\d+)\s*saniye/);
          const sec = match ? Number(match[1]) : 60;
          setCooldownRemaining(sec);
          localStorage.setItem('best_eskort_global_last_comment_ts', Date.now().toString());
        }
        setSubmitting(false);
        return;
      }

      // Success -> Lock this listing permanently for this user
      localStorage.setItem(`commented_slug_${listingSlug}`, 'true');
      localStorage.setItem('best_eskort_global_last_comment_ts', Date.now().toString());
      setHasAlreadyCommented(true);
      setCooldownRemaining(60);

      if (data.comments) {
        setComments(data.comments);
      } else if (data.newComment) {
        setComments((prev) => [data.newComment, ...prev]);
      }

      setSuccessMessage('Yorumunuz başarıyla yayınlandı!');
      setYorum('');
      setYazar('');
      setPuan(5);

      setTimeout(() => {
        setSuccessMessage('');
        setShowForm(false);
      }, 3000);
    } catch (err) {
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3 sm:gap-4 mt-2">
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
        
        {/* ── 1. HEADER BAR ──────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#30363d]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white font-heading tracking-wide">
                  Kullanıcı Yorumları
                </h3>
                {comments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black font-mono">
                    {comments.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8b949e]">
                Gerçek ziyaretçi deneyimleri ve değerlendirmeleri
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            {/* Rating Score Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d]">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(Number(avgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-white font-heading">{avgRating}</span>
            </div>

            {/* Action / Status Button */}
            {hasAlreadyCommented ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-heading shrink-0 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Değerlendirmeniz Kayıtlı</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs font-heading shadow-md active:scale-95 transition-all shrink-0"
              >
                <Plus className={`w-3.5 h-3.5 stroke-[3] transition-transform duration-200 ${showForm ? 'rotate-45' : ''}`} />
                <span>{showForm ? 'Formu Kapat' : 'Yorum Yaz'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── 2. DAHA ÖNCE YORUM YAPILDIYSA BİLGİLENDİRME PANELİ ──────────────── */}
        {hasAlreadyCommented && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Bu ilanı daha önce değerlendirdiniz. Güvenlik politikamız gereği her ilana yalnızca <strong>1 kez</strong> yorum yapabilirsiniz.
            </span>
          </div>
        )}

        {/* ── 3. YORUM YAZMA FORMU (COLLAPSIBLE FORM) ──────────────── */}
        {showForm && !hasAlreadyCommented && (
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border border-amber-500/40 shadow-xl flex flex-col gap-3.5 animate-in fade-in slide-in-from-top-3 duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#30363d]/60 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white font-heading">
                  Deneyimini Paylaş
                </span>
              </div>
              <span className="text-[10px] text-amber-400/80 font-medium">
                Her ilana yalnızca 1 kez yorum yapılabilir
              </span>
            </div>

            {/* Star Rating Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#8b949e]">
                Puanınız:
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentRating = hoverPuan !== null ? hoverPuan : puan;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setPuan(star)}
                        onMouseEnter={() => setHoverPuan(star)}
                        onMouseLeave={() => setHoverPuan(null)}
                        className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= currentRating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-black text-amber-400 font-heading">
                  {puan === 5
                    ? '⭐⭐⭐⭐⭐ Mükemmel (5/5)'
                    : puan === 4
                    ? '⭐⭐⭐⭐ Çok İyi (4/5)'
                    : puan === 3
                    ? '⭐⭐⭐ Ortalama (3/5)'
                    : puan === 2
                    ? '⭐⭐ Zayıf (2/5)'
                    : '⭐ Kötü (1/5)'}
                </span>
              </div>
            </div>

            {/* Rumuz / İsim (İsteğe Bağlı) */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#8b949e]">
                  Rumuz veya İsim <span className="text-slate-500 font-normal">(İsteğe Bağlı)</span>
                </label>
                <span className="text-[10px] text-amber-400/80">
                  Boş bırakılırsa gizli anonim atanır
                </span>
              </div>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  maxLength={30}
                  value={yazar}
                  onChange={(e) => setYazar(e.target.value)}
                  placeholder="Örn: M*** K*** veya Kerem_34"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#161b22] border border-[#30363d] rounded-xl text-white placeholder:text-[#8b949e]/50 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Yorum Metni */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#8b949e]">
                  Yorumunuz <span className="text-red-400">*</span>
                </label>
                <span className={`text-[10px] font-mono ${yorum.length > 450 ? 'text-amber-400' : 'text-[#8b949e]'}`}>
                  {yorum.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                required
                value={yorum}
                onChange={(e) => setYorum(e.target.value)}
                placeholder="Model hakkında görüş, hijyen, samimiyet ve deneyimlerinizi saygı çerçevesinde paylaşın..."
                className="w-full p-3 text-xs bg-[#161b22] border border-[#30363d] rounded-xl text-white placeholder:text-[#8b949e]/50 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Honeypot Invisible Anti-Bot Trap */}
            <input
              type="text"
              name="hp_website"
              value={hpField}
              onChange={(e) => setHpField(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="opacity-0 absolute h-0 w-0 pointer-events-none -z-10"
            />

            {/* Alert Messages */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting || yorum.trim().length < 5 || cooldownRemaining > 0}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs font-heading shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yayınlanıyor...</span>
                </>
              ) : cooldownRemaining > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>⏳ {cooldownRemaining}s Bekleyin</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Yorumu Güvenli Yayınla</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── 4. YORUMLAR LİSTESİ ──────────────── */}
        {comments.length === 0 ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0d1117] border border-[#30363d]/60 text-center flex flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white font-heading">
                Henüz Yorum Yapılmamış
              </span>
              <p className="text-xs text-[#8b949e] max-w-sm mt-0.5">
                Bu ilan için ilk değerlendirmeyi yaparak diğer ziyaretçilere rehberlik edin.
              </p>
            </div>
            {!hasAlreadyCommented && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-1 px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-amber-400 text-xs font-black font-heading border border-[#30363d] transition-colors"
              >
                + İlk Yorumu Sen Yaz
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {displayedComments.map((item, idx) => {
              const stars = Number(item.puan) || 5;
              const authorLetter = item.yazar ? item.yazar.charAt(0).toUpperCase() : 'A';

              return (
                <div
                  key={item._id || idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#0d1117] border border-[#30363d]/80 hover:border-amber-500/30 transition-all flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar Circle */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        {authorLetter}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-white">
                            {item.yazar}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Onaylı Görüş</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8b949e]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center text-amber-400 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-[#e6edf3] leading-relaxed pl-10 pr-1 break-words font-normal">
                    {item.yorum}
                  </p>
                </div>
              );
            })}

            {/* ── 5. DAHA FAZLA GÖSTER (5'TEN FAZLA YORUM OLURSA) ──────────────── */}
            {comments.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#0d1117] hover:bg-[#21262d] text-amber-400 hover:text-white border border-[#30363d] text-xs font-black font-heading transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Daha Az Göster (İlk 5 Yorum)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Daha Fazla Göster ({comments.length - 5} Yorum Daha)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
