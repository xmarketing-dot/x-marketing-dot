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
    <div className={`my-3 w-full flex flex-col items-center justify-center ${className}`}>
      <div className="w-[320px] max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#161b22]/70 shadow-lg shadow-black/30 flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-2 py-0.5 bg-black/40 text-[9px] text-gray-400 font-medium">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse"></span>
            SPONSORLU VİTRİN
          </span>
          <span className="text-gray-500 uppercase tracking-wider">Reklam</span>
        </div>
        <div className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center bg-black/20">
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
