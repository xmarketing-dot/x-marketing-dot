'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe, Sparkles } from 'lucide-react';

interface IBacklinkData {
  _id: string;
  baslik: string;
  url: string;
  anchorText?: string;
  nofollow: boolean;
}

export default function SeoBacklinkFooter() {
  const [backlinks, setBacklinks] = useState<IBacklinkData[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/backlinks')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.backlinks)) {
          setBacklinks(data.backlinks);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLinkClick = (id: string) => {
    fetch('/api/backlinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  if (backlinks.length === 0) return null;

  return (
    <div className="w-full py-6 px-4 sm:px-8 border-t border-[#30363d]/60 bg-[#080b0f] text-left">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span className="font-heading font-black text-xs uppercase tracking-wider text-[#8b949e]">
            Partner &amp; Güvenilir Ağ Bağlantıları (Backlinks)
          </span>
        </div>

        {/* %100 Çalışan HTML A Etiketleri - Google & Yandex Botları Tarafından Tam İndekslenir */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-heading font-bold">
          {backlinks.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel={link.nofollow ? 'nofollow noopener' : 'noopener'}
              onClick={() => handleLinkClick(link._id)}
              className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-amber-400 border border-[#30363d] hover:border-amber-500/50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{link.anchorText || link.baslik}</span>
              <ExternalLink className="w-3 h-3 text-[#8b949e] group-hover:text-amber-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
