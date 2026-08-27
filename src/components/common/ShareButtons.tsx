'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { OfficialWhatsAppIcon } from './WhatsAppButton';

export default function ShareButtons({ title }: { url?: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Always use the real browser URL
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
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız', err);
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getTaggedUrl('native_share');
    if (typeof window !== 'undefined' && (window as any).trackEvent) {
      (window as any).trackEvent('share_listing', { title, channel: 'native' });
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl || currentUrl,
        });
      } catch (err) {
        console.error('Paylaşım hatası', err);
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
    <div className="flex flex-col items-center gap-3 w-full py-4 border-t border-[#30363d] mt-2 mb-2">
      <div className="flex items-center gap-2 text-sm text-[#8b949e] font-bold font-heading">
        <Share2 className="w-4 h-4" />
        <span>Bu İlanı Paylaş</span>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2">
        {/* Native Share for Mobile */}
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#21262d] text-white hover:bg-[#30363d] transition-colors border border-white/10 md:hidden text-xs font-bold"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Paylaş</span>
        </button>

        {/* WhatsApp Share Button with UTM & Tracking */}
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedWaUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/30 text-xs font-bold"
        >
          <OfficialWhatsAppIcon className="w-3.5 h-3.5" />
          <span>WhatsApp'ta Paylaş</span>
        </a>

        {/* Twitter / X */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getTaggedUrl('x'))}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
              (window as any).trackEvent('share_listing', { title, channel: 'x' });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors border border-[#1DA1F2]/30 text-xs font-bold"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          <span>Twitter</span>
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(getTaggedUrl('telegram'))}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).trackEvent) {
              (window as any).trackEvent('share_listing', { title, channel: 'telegram' });
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors border border-[#0088cc]/30 text-xs font-bold"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
          <span>Telegram</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#21262d] text-white hover:bg-[#30363d] transition-colors border border-white/10 text-xs font-bold"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
        </button>
      </div>
    </div>
  );
}
