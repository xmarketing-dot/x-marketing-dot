'use client';

import React, { useEffect, useRef } from 'react';
import { isSearchEngineBot } from '@/lib/botDetection';

interface Props {
  zoneId?: string;
  className?: string;
}

export default function ExoClickBanner({ zoneId = '6050980', className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Arama motoru botlarına ve kamu denetleyicilerine reklam scriptini yükleme (SEO & BTK koruması)
    if (isSearchEngineBot()) return;

    const triggerServe = () => {
      try {
        const w = window as any;
        w.AdProvider = w.AdProvider || [];
        w.AdProvider.push({ serve: {} });
      } catch (e) {
        // sessizce geç
      }
    };

    // ExoClick ad-provider scriptini yükle
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
  }, [zoneId]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center justify-center my-2 select-none ${className}`}
    >
      <div className="flex items-center justify-center max-w-[320px] rounded-xl overflow-hidden shadow-lg border border-amber-500/20 bg-[#090d16]">
        <ins
          className="eas6a97888e10"
          data-zoneid={zoneId}
          data-keywords="casino,slot,bet,dating,escort,live"
          data-block-ad-types="0"
          data-ex-av="name"
          style={{ display: 'inline-block', width: '300px', height: '100px' }}
        />
      </div>
    </div>
  );
}
