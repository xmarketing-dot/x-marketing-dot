'use client';

import { usePathname } from 'next/navigation';

interface Props {
  className?: string;
}

export default function AdsterraBanner320x50({ className = '' }: Props) {
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
        <style>
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '465bce5e65e041bc39b151a308eac1f7',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highrevenueformat.com/465bce5e65e041bc39b151a308eac1f7/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`my-3 w-full max-w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#30363d] bg-gradient-to-b from-[#161b22] to-[#0d1117] p-2.5 sm:p-3 shadow-xl flex flex-col gap-2 ${className}`}>
      <div className="w-full flex items-center justify-between px-1 text-[10px] text-gray-400 font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-sm shadow-pink-500/50"></span>
          SPONSORLU VİTRİN
        </span>
        <span className="text-gray-500 text-[9px] uppercase tracking-wider font-mono">Tanıtım</span>
      </div>
      <div className="w-full flex items-center justify-center overflow-hidden py-1">
        <div className="w-[320px] max-w-full h-[50px] overflow-hidden flex items-center justify-center rounded-xl bg-black/30 border border-white/5">
          <iframe
            srcDoc={iframeContent}
            width="320"
            height="50"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            title="Sponsor Reklam"
          />
        </div>
      </div>
    </div>
  );
}
