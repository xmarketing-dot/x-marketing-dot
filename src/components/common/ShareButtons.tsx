'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check, Copy, Send } from 'lucide-react';
import { OfficialWhatsAppIcon } from './WhatsAppButton';

export default function ShareButtons({ title }: { url?: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const cleanUrl = window.location.href.split('?')[0];
    setCurrentUrl(cleanUrl);
  }, []);

  const getTaggedUrl = (source: string) => {
    if (!currentUrl) return '';
    return `${currentUrl}?utm_source=${source}&utm_medium=share`;
  };

  const handleCopy = async () => {
    try {
      const shareUrl = getTaggedUrl('direct_share');
      await navigator.clipboard.writeText(shareUrl || currentUrl);
      setCopied(true);
      if (typeof window !== 'undefined' && (window as any).trackEvent) {
        (window as any).trackEvent('share_listing', { title, channel: 'copy_link' });
      }
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Kopyalama başarısız', err);
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getTaggedUrl('native_share');
    if (typeof window !== 'undefined' && (window as any).trackEvent) {
      (window as any).trackEvent('share_listing', { title, channel: 'native' });
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl || currentUrl,
        });
      } catch {
        // User canceled or failed
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== 'undefined' && (window as any).trackEvent) {
      (window as any).trackEvent('share_listing', { title, channel: 'whatsapp' });
    }
  };

  if (!currentUrl) return null;

  const waShareUrl = getTaggedUrl('whatsapp');
  const encodedWaUrl = encodeURIComponent(waShareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-col items-center gap-3 w-full py-3 border-t border-[#30363d]/70 mt-1">
      {/* Başlık */}
      <div className="flex items-center gap-1.5 text-xs text-[#8b949e] font-extrabold uppercase tracking-wider font-heading">
        <Share2 className="w-3.5 h-3.5 text-amber-400" />
        <span>İlanı Arkadaşınla Paylaş</span>
      </div>

      {/* ── MOBİL-NATİVE APP TARZI İKON AKSİYONLARI ──────────────── */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-4 w-full max-w-sm justify-center">
        
        {/* 1. WHATSAPP */}
        <a
          href={`https://wa.me/?text=${encodedWaUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppShare}
          className="group flex flex-col items-center gap-1 text-center active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 border border-[#25D366]/40 flex items-center justify-center shadow-md transition-all">
            <OfficialWhatsAppIcon className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[10px] font-heading font-extrabold text-[#8b949e] group-hover:text-emerald-400">
            WhatsApp
          </span>
        </a>

        {/* 2. TELEGRAM */}
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(getTaggedUrl('telegram'))}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
              (window as any).trackEvent('share_listing', { title, channel: 'telegram' });
            }
          }}
          className="group flex flex-col items-center gap-1 text-center active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc] text-[#0088cc] hover:text-white border border-[#0088cc]/40 flex items-center justify-center shadow-md transition-all">
            <Send className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-heading font-extrabold text-[#8b949e] group-hover:text-sky-400">
            Telegram
          </span>
        </a>

        {/* 3. TWITTER / X */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getTaggedUrl('x'))}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
              (window as any).trackEvent('share_listing', { title, channel: 'x' });
            }
          }}
          className="group flex flex-col items-center gap-1 text-center active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-950 border border-white/20 flex items-center justify-center shadow-md transition-all">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <span className="text-[10px] font-heading font-extrabold text-[#8b949e] group-hover:text-white">
            Twitter (X)
          </span>
        </a>

        {/* 4. LİNKİ KOPYALA */}
        <button
          onClick={handleCopy}
          className="group flex flex-col items-center gap-1 text-center active:scale-90 transition-transform"
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shadow-md transition-all ${
            copied
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-[#21262d] hover:bg-amber-500 hover:text-slate-950 text-amber-400 border-amber-500/30'
          }`}>
            {copied ? <Check className="w-5 h-5 stroke-[3]" /> : <Copy className="w-5 h-5" />}
          </div>
          <span className={`text-[10px] font-heading font-extrabold transition-colors ${
            copied ? 'text-emerald-400' : 'text-[#8b949e] group-hover:text-amber-400'
          }`}>
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </span>
        </button>

        {/* 5. NATIVE SİSTEM PAYLAŞIMI (Mobilde Açılır) */}
        <button
          onClick={handleNativeShare}
          className="hidden sm:flex group flex-col items-center gap-1 text-center active:scale-90 transition-transform"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#21262d] hover:bg-[#30363d] text-white border border-[#363b42] flex items-center justify-center shadow-md transition-all">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-heading font-extrabold text-[#8b949e] group-hover:text-white">
            Diğer
          </span>
        </button>

      </div>
    </div>
  );
}

