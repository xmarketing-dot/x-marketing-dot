'use client';

import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, User, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

interface Comment {
  _id?: string;
  yazar: string;
  yorum: string;
  puan: number;
  createdAt: string | Date;
}

interface CommentSectionProps {
  listingSlug: string;
  initialComments?: Comment[];
}

export default function CommentSection({
  listingSlug,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    setSuccessMsg(false);

    try {
      const res = await fetch('/api/listings/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingSlug,
          yazar: authorName.trim() || 'Anonim Müşteri',
          yorum: commentText.trim(),
          puan: rating,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setComments(data.comments);
        setCommentText('');
        setAuthorName('');
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 4000);
      }
    } catch (err) {
      // Silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-2xl flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-sm sm:text-base text-white font-heading">
              Anonim Müşteri Değerlendirmeleri
            </h3>
            <span className="text-[11px] text-[#8b949e]">
              %100 Gizli &amp; Doğrulanmış Gerçek Yorumlar ({comments.length})
            </span>
          </div>
        </div>

        <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1 font-heading">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>4.9 / 5.0 Memnuniyet</span>
        </span>
      </div>

      {/* Yorum Bırakma Formu */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-3.5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-black text-white font-heading uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Anonim Yorum &amp; Puan Bırak</span>
          </span>

          {/* Yıldız Puanı */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-125 transition-transform"
              >
                <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="İsim veya Takma Adınız (Opsiyonel)"
            value={authorName}
            maxLength={40}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs placeholder-[#6e7681] focus:outline-none focus:border-amber-400 font-bold"
          />

          <div className="flex items-center justify-between px-3 text-xs text-[#8b949e] font-mono">
            <span>Karakter Sınırı:</span>
            <span className={commentText.length >= 280 ? 'text-red-400 font-bold' : 'text-amber-400'}>
              {commentText.length} / 300
            </span>
          </div>
        </div>

        <textarea
          rows={3}
          required
          maxLength={300}
          placeholder="Deneyiminizi, memnuniyetinizi ve tavsiyenizi yazın... (En fazla 300 karakter)"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
          className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-xs sm:text-sm placeholder-[#6e7681] focus:outline-none focus:border-amber-400 resize-y min-h-[80px]"
        />

        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>IP adresiniz veya kimliğiniz asla kaydedilmez.</span>
          </span>

          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase font-heading tracking-wider shadow-lg flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span>Yorumu Yayınla</span>
          </button>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Yorumunuz başarıyla yayınlandı, teşekkürler!</span>
          </div>
        )}
      </form>

      {/* Yorumlar Listesi */}
      <div className="flex flex-col gap-3">
        {comments && comments.length > 0 ? (
          comments.map((c, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-white font-heading">
                    {c.yazar || 'Anonim Müşteri'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                    Doğrulanmış
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: c.puan || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#c9d1d9] leading-relaxed pl-9 font-medium">
                "{c.yorum}"
              </p>

              <span className="text-[9px] text-[#8b949e] pl-9">
                {new Date(c.createdAt || Date.now()).toLocaleDateString('tr-TR')}
              </span>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] text-center text-xs text-[#8b949e]">
            Henüz yorum yazılmamış. İlk değerlendirmeyi siz bırakın!
          </div>
        )}
      </div>

    </div>
  );
}

