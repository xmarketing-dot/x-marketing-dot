import { NextRequest, NextResponse } from 'next/server';
import { resolveTargetFromHost } from '@/lib/domainHelper';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-current-path', pathname);
  if (pathname.startsWith('/bms-secure-portal')) {
    requestHeaders.set('x-is-admin', 'true');
  }

  // Statik dosyalar ve dahili Next yollarını pas geç
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Admin portalına her koşulda tam erişim ver ve ban çerezini temizle
  if (pathname.startsWith('/bms-secure-portal')) {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    });
    res.cookies.delete('bms_banned');
    return res;
  }

  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const targetLoc = resolveTargetFromHost(hostname);

  // Eğer bu domain belirli bir il veya ilçeye bağlıysa ve anasayfaya (/) geldiyse:
  if (targetLoc && pathname === '/') {
    if (targetLoc.ilceSlug) {
      // Örn: beylikduzuescort.devs.surf -> /istanbul/beylikduzu içeriğini URL değiştirmeden sun
      return NextResponse.rewrite(new URL(`/${targetLoc.ilSlug}/${targetLoc.ilceSlug}`, req.url), {
        request: { headers: requestHeaders },
      });
    } else if (targetLoc.ilSlug) {
      // Örn: istanbulescort.devs.surf -> /istanbul içeriğini URL değiştirmeden sun
      return NextResponse.rewrite(new URL(`/${targetLoc.ilSlug}`, req.url), {
        request: { headers: requestHeaders },
      });
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
