'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isSearchEngineBot } from '@/lib/botDetection';

interface Props {
  zoneId?: string;
  className?: string;
}

export default function ExoClickBanner({ zoneId = '6050980', className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [hasAd, setHasAd] = useState(false);

  useEffect(() => {
    // Arama motoru botlarına ve kamu denetleyicilerine reklam scriptini yükleme (SEO & BTK koruması)
    if (isSearchEngineBot()) return;

    // Reklamın gerçekten gelip gelmediğini denetle (Boşluk/kutu kalmasını engelle)
    const checkAdPresence = () => {
      if (insRef.current) {
        const hasChildren = insRef.current.children.length > 0;
        const hasIframe = !!insRef.current.querySelector('iframe');
        const hasImg = !!insRef.current.querySelector('img');
        const hasHeight = (insRef.current.offsetHeight || 0) > 15;
        if (hasIframe || hasImg || (hasChildren && hasHeight)) {
          setHasAd(true);
          return true;
        }
      }
      return false;
    };

    // 1. MutationObserver ile DOM'a reklam iframe'i eklendiği anı yakala
    let observer: MutationObserver | null = null;
    if (insRef.current && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        if (checkAdPresence() && observer) {
          observer.disconnect();
        }
      });
      observer.observe(insRef.current, { childList: true, subtree: true, attributes: true });
    }

    // 2. Periyodik kontrol (ilk 6 saniye)
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 400;
      if (checkAdPresence() || elapsed >= 6000) {
        clearInterval(interval);
      }
    }, 400);

    const triggerServe = () => {
      try {
        const w = window as any;
        w.AdProvider = w.AdProvider || [];
        w.AdProvider.push({ serve: {} });
      } catch (e) {
        // sessizce geç
      }
    };

    // 3. ExoClick ad-provider scriptini güvenle yükle
    const scriptId = 'exoclick-ad-provider-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/javascript';
      script.async = true;
      script.src = 'https://a.magsrv.com/ad-provider.js';
      script.onload = () => {
        setTimeout(triggerServe, 50);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(triggerServe, 50);
    }

    return () => {
      if (observer) observer.disconnect();
      clearInterval(interval);
    };
  }, [zoneId]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden transition-all duration-300 ${
        hasAd
          ? `my-1 sm:my-2 flex flex-col items-center justify-center ${className}`
          : 'h-0 min-h-0 m-0 p-0 opacity-0 pointer-events-none'
      }`}
      style={!hasAd ? { height: 0, minHeight: 0, margin: 0, padding: 0 } : undefined}
    >
      <div
        className={
          hasAd
            ? 'w-full max-w-[320px] flex items-center justify-center rounded-xl bg-[#090d16]/90 border border-amber-500/25 p-1 shadow-lg shadow-black/50 overflow-hidden'
            : ''
        }
      >
        <ins
          ref={insRef}
          className="eas6a97888e10"
          data-zoneid={zoneId}
          data-keywords="casino,slot,bet,dating,escort,live"
          data-block-ad-types="0"
          data-ex-av="name"
          style={{ display: 'inline-block', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}
