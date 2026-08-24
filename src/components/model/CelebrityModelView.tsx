'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Crown, 
  Sparkles, 
  BadgeCheck, 
  Flame, 
  Eye, 
  Heart, 
  Share2, 
  MessageSquare, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkle
} from 'lucide-react';

interface CelebrityModelViewProps {
  model: {
    _id?: string;
    slug: string;
    tamAd: string;
    unvan?: string;
    biyografi: string;
    likeSayisi?: number;
    goruntulenmeSayisi?: number;
    yas?: number;
    boy?: number;
    kilo?: number;
    gogusOlcusu?: string;
    sacRengi?: string;
    gozRengi?: string;
    burc?: string;
    uyruk?: string;
    diller?: string[];
    platformlar?: string[];
    anaFotografUrl: string;
    fotograflar?: string[];
    anonimYorumlar?: Array<{
      yazar: string;
      yorum: string;
      puan: number;
      createdAt: string | Date;
    }>;
  };
}

export default function CelebrityModelView({ model }: CelebrityModelViewProps) {
  const storageKey = `liked_model_${model.slug}`;
  const [likes, setLikes] = useState(model.likeSayisi || 24890);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const commentFormRef = useRef<HTMLFormElement | null>(null);

  const photos = model.fotograflar && model.fotograflar.length > 0 
    ? model.fotograflar 
    : [model.anaFotografUrl];

  // LocalStorage check on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'true') {
        setHasLiked(true);
      }
    } catch (e) {}
  }, [storageKey]);

  // Keyboard navigation for image slider (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIdx((prev) => (prev + 1) % photos.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length]);

  // Comments state
  const [comments, setComments] = useState(model.anonimYorumlar && model.anonimYorumlar.length > 0 ? model.anonimYorumlar : [
    {
      yazar: 'Burak_34',
      yorum: 'Hastayım buna abi ya... Türkiye OnlyFans ve Twitter aleminin tartışmasız 1 numarası!',
      puan: 5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
    {
      yazar: 'Emre V.',
      yorum: 'Fiziği gerçekten kusursuz. Her paylaştığı video ve fotoğraf olay oluyor, bambaşka seviye.',
      puan: 5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
    {
      yazar: 'Kadir_İst',
      yorum: 'Böyle bir enerji ve tatlılık yok. Sosyal medyadaki en çekici kadın net.',
      puan: 5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    },
    {
      yazar: 'Anonim Fan',
      yorum: 'Gözleri ve gülüşü aşırı büyüleyici. Kusursuz bir güzellik.',
      puan: 5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Like handler: Once liked, cannot be unliked or spammed!
  const handleLike = () => {
    if (hasLiked) return;

    setLikes((prev) => prev + 1);
    setHasLiked(true);
    setLikeAnim(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch (e) {}
    setTimeout(() => setLikeAnim(false), 1000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const added = {
        yazar: authorName.trim() || 'Gizli Hayran',
        yorum: newComment.trim().slice(0, 300),
        puan: starRating,
        createdAt: new Date(),
      };
      setComments([added, ...comments]);
      setNewComment('');
      setAuthorName('');
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }, 400);
  };

  // Keyboard shortcut for comment textarea (Ctrl+Enter or Cmd+Enter to submit)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAddComment(e);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-24 w-full max-w-full text-left selection:bg-rose-500 selection:text-white">
      
      {/* ── 1. BÜYÜK SİNEMATİK IMAGE SLIDER & HEADER BİLGİ MASASI ──────────────── */}
      <div className="relative w-full rounded-[36px] overflow-hidden bg-gradient-to-b from-[#1a080d] via-[#10070a] to-[#0d1117] border-2 border-rose-500/50 shadow-2xl">
        
        {/* Glow Lights */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* SLIDER ALANI (7 Kolon - Dev Görsel) */}
          <div className="lg:col-span-7 relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] max-h-[740px] bg-black group overflow-hidden">
            
            {/* Aktif Fotoğraf */}
            <Image
              src={photos[activePhotoIdx]}
              alt={`${model.tamAd} Fotoğraf ${activePhotoIdx + 1}`}
              fill
              priority
              className="object-cover transition-all duration-700 select-none group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

            {/* Üst Rozetler */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-rose-600/90 backdrop-blur-md text-white font-black text-xs font-heading uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                <Flame className="w-4 h-4 fill-white animate-pulse" />
                <span>VIP Dijital Model</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white/90 text-xs font-mono font-bold border border-white/20">
                {activePhotoIdx + 1} / {photos.length} HD
              </span>
            </div>

            {/* Sol & Sağ Slider Kontrol Okları */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90 z-20 group-hover:opacity-100 opacity-80"
                  title="Önceki Fotoğraf (Sol Ok Tuşu)"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[3]" />
                </button>

                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-90 z-20 group-hover:opacity-100 opacity-80"
                  title="Sonraki Fotoğraf (Sağ Ok Tuşu)"
                >
                  <ChevronRight className="w-6 h-6 stroke-[3]" />
                </button>
              </>
            )}

            {/* Alt Thumbnail Şeridi */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 z-20 overflow-x-auto py-1">
                {photos.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`relative w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activePhotoIdx === i 
                        ? 'border-rose-500 scale-110 shadow-lg shadow-rose-600/50 ring-2 ring-rose-400' 
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" sizes="60px" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* SAĞ BİLGİ MASASI & TÜM FİZİKSEL ÖLÇÜLER (5 Kolon) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-5 border-t lg:border-t-0 lg:border-l border-white/10 relative z-10">
            
            <div className="flex flex-col gap-4">
              
              {/* Verified Rozetleri */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black uppercase font-heading border border-blue-500/40 flex items-center gap-1.5 shadow-md">
                  <BadgeCheck className="w-4 h-4 fill-blue-500 text-slate-950" />
                  <span>%100 Teyitli Profil</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-heading border border-amber-500/30">
                  👑 Trend Fenomen
                </span>
              </div>

              {/* Model Adı */}
              <div className="flex flex-col gap-1">
                <h1 className="font-black text-3xl sm:text-4xl text-white font-heading tracking-tight flex items-center gap-2">
                  <span>{model.tamAd}</span>
                  <span className="text-rose-500 text-2xl">💋</span>
                </h1>
                <span className="text-xs text-rose-400 font-bold font-heading uppercase tracking-widest">
                  {model.unvan || 'OnlyFans & Twitter Fenomeni'}
                </span>
              </div>

              {/* Sosyal Platform Rozetleri */}
              <div className="flex items-center gap-2 flex-wrap">
                {(model.platformlar && model.platformlar.length > 0 
                  ? model.platformlar 
                  : ['OnlyFans', 'Twitter / X', 'Instagram', 'TikTok']
                ).map((plt, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-[#21262d] text-white text-xs font-bold font-heading border border-white/10 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>{plt}</span>
                  </span>
                ))}
              </div>

              {/* ── HEADER'DAKİ TÜM FİZİKSEL BİYOMETRİ & ÖLÇÜLER KUTUSU ──────────────── */}
              <div className="p-4 rounded-2xl bg-[#0d1117]/90 border border-rose-500/30 shadow-inner flex flex-col gap-2.5 mt-1">
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Fiziksel Nitelikler &amp; Biyometri</span>
                </span>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#161b22] border border-white/5 flex flex-col">
                    <span className="text-[10px] text-[#8b949e] font-bold uppercase">Yaş</span>
                    <span className="font-black text-sm text-white font-heading">{model.yas || 25}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161b22] border border-white/5 flex flex-col">
                    <span className="text-[10px] text-[#8b949e] font-bold uppercase">Boy</span>
                    <span className="font-black text-sm text-white font-heading">{model.boy || 171} cm</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161b22] border border-white/5 flex flex-col">
                    <span className="text-[10px] text-[#8b949e] font-bold uppercase">Kilo</span>
                    <span className="font-black text-sm text-white font-heading">{model.kilo || 53} kg</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161b22] border border-white/5 flex flex-col">
                    <span className="text-[10px] text-[#8b949e] font-bold uppercase">Göğüs</span>
                    <span className="font-black text-sm text-rose-400 font-heading">{model.gogusOlcusu || '85C (Doğal)'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161b22] border border-white/5 flex flex-col">
                    <span className="text-[10px] text-[#8b949e] font-bold uppercase">Saç &amp; Göz</span>
                    <span className="font-black text-xs text-white font-heading">{model.sacRengi || 'Siyah'} / {model.gozRengi || 'Kahve'}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#161b22] border border-white/5 flex flex-col">
                    <span className="text-[10px] text-[#8b949e] font-bold uppercase">Burç</span>
                    <span className="font-black text-xs text-amber-400 font-heading">{model.burc || 'Akrep'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Hayran Beğenme Butonu (Tek Seferlik, spam engelli) */}
            <div className="flex flex-col gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                disabled={hasLiked}
                onClick={handleLike}
                className={`w-full py-4 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-wider transition-all shadow-2xl flex items-center justify-center gap-3 ${
                  hasLiked
                    ? 'bg-emerald-600/90 text-white cursor-default shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-600/30 active:scale-95 cursor-pointer'
                }`}
              >
                {hasLiked ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    <span>✓ {model.tamAd}'ı Beğendiniz!</span>
                  </>
                ) : (
                  <>
                    <Heart className={`w-6 h-6 fill-white ${likeAnim ? 'scale-150 animate-bounce' : ''} transition-transform`} />
                    <span>{model.tamAd}'ı Beğen &amp; Hayranı Ol</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs px-1 text-[#8b949e] font-bold">
                <span className="text-rose-400 font-black">🔥 {likes.toLocaleString('tr-TR')} Toplam Hayran</span>
                <span>👀 {(model.goruntulenmeSayisi || 84900) + 12400} Ziyaret</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── 2. DETAYLI BİYOGRAFİ & GENİŞLETİLMİŞ HAYRAN YORUM ALANI ──────────────── */}
      <div className="flex flex-col gap-8">
        
        {/* Biyografi Metni */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-heading font-black text-lg">
            <Crown className="w-5 h-5 text-rose-400" />
            <span>{model.tamAd} Hakkında &amp; Biyografi</span>
          </div>

          <div className="text-sm text-[#f0f6fc] leading-relaxed whitespace-pre-line font-medium">
            {model.biyografi || `${model.tamAd}, Türkiye'de sosyal medya, Twitter ve OnlyFans gibi dijital mecralarda milyonlarca hayran kitlesine sahip olan, tarzı ve güzelliğiyle fenomen haline gelmiş ünlü bir dijital modeldir.

Güzelliği, estetik tarzı ve samimi tavırlarıyla dijital dünyada en çok konuşulan modeller arasında yer almaktadır.`}
          </div>
        </div>

        {/* ── GENİŞLETİLMİŞ & KLAVYE DESTEKLİ HAYRAN YORUMLARI MASASI ──────────────── */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-[#161b22] border border-[#30363d] shadow-xl flex flex-col gap-8">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-rose-400" />
              <h2 className="font-black text-lg text-white font-heading">
                Hayran Yorumları &amp; Değerlendirmeler ({comments.length})
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.98 / 5.0 (Efsane)</span>
            </div>
          </div>

          {/* 1. Yorumlar Akışı (Önce Mevcut Hayran Yorumları Listelenir) */}
          <div className="flex flex-col gap-3.5">
            {comments.map((c, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-[#0d1117] border border-[#21262d] flex flex-col gap-2.5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white font-heading">{c.yazar}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ✓ Teyitli Hayran
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: c.puan || 5 }).map((_, stIdx) => (
                      <Star key={stIdx} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed font-medium">
                  "{c.yorum}"
                </p>
              </div>
            ))}
          </div>

          {/* 2. En Alttaki Yeni Yorum Formu (Daha Geniş, 300 Karakter Limitli, Klavye Destekli) */}
          <form 
            ref={commentFormRef}
            onSubmit={handleAddComment} 
            className="flex flex-col gap-4 p-5 sm:p-6 rounded-[24px] bg-[#0d1117] border-2 border-rose-500/30 shadow-lg mt-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-rose-400" />
                <span>{model.tamAd} Hakkında Bir Yorum Bırak</span>
              </span>

              {/* Kalan Karakter Sayacı (En Fazla 300) */}
              <span className={`text-xs font-mono font-bold ${
                newComment.length >= 280 ? 'text-red-400' : 'text-[#8b949e]'
              }`}>
                {newComment.length} / 300 Karakter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input
                type="text"
                placeholder="İsminiz / Takma Adınız (Örn: Burak_34)"
                value={authorName}
                maxLength={40}
                onChange={(e) => setAuthorName(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-[#161b22] border border-[#30363d] text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-bold placeholder-[#6e7681]"
              />

              {/* Yıldız Puanı */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#161b22] border border-[#30363d]">
                <span className="text-xs text-[#8b949e] font-bold">Puanınız:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStarRating(st)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star 
                        className={`w-5 h-5 ${st <= starRating ? 'text-amber-400 fill-amber-400' : 'text-[#30363d]'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Genişletilmiş Textarea (Max 300 Karakter + Klavye Gönderim Kısayolu) */}
            <div className="relative">
              <textarea
                rows={3}
                required
                maxLength={300}
                placeholder="Model hakkında düşünceleriniz, tarzı, güzelliği... (En fazla 300 karakter)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#161b22] border border-[#30363d] text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500 font-medium placeholder-[#6e7681] resize-y min-h-[90px]"
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <span className="text-xs text-[#8b949e]">
                {submitted ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yorumunuz başarıyla yayınlandı!</span>
                  </span>
                ) : (
                  <span>💡 Göndermek için <strong>Ctrl+Enter</strong> tuşuna basabilirsiniz.</span>
                )}
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-black text-xs font-heading uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Yorum Gönder</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}
