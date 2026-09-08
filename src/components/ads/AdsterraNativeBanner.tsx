'use client';

import { usePathname } from 'next/navigation';

interface Props {
  className?: string;
}

export default function AdsterraNativeBanner({ className = '' }: Props) {
  const pathname = usePathname();

  // Admin panelinde reklam gösterme
  if (pathname?.startsWith('/bms-secure-portal')) {
    return null;
  }

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
          #container-67fb70cfd547bd484057daf3b46c5fda {
            width: 100% !important;
            display: flex;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <script async="async" data-cfasync="false" src="https://pl31198532.profitableratecpmnetwork.com/67fb70cfd547bd484057daf3b46c5fda/invoke.js"></script>
        <div id="container-67fb70cfd547bd484057daf3b46c5fda"></div>
      </body>
    </html>
  `;

  return (
    <div className={`my-4 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-3 sm:p-4 shadow-xl ${className}`}>
      <div className="mb-2 flex items-center justify-between px-1 text-[10px] text-gray-400 font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-sm shadow-pink-500/50"></span>
          SPONSORLU VIP VİTRİN
        </span>
        <span className="text-gray-500 text-[9px] uppercase tracking-wider font-mono">Tanıtım</span>
      </div>
      <div className="w-full flex items-center justify-center min-h-[140px]">
        <iframe
          srcDoc={iframeContent}
          className="w-full min-h-[140px] border-0"
          scrolling="no"
          title="Sponsorlu Vitrin"
        />
      </div>
    </div>
  );
}

