import { NextRequest, NextResponse } from 'next/server';
import { resolveTargetFromHost } from '@/lib/domainHelper';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Statik dosyalar, dahili Next yolları, API ve Admin portalını pas geç
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/bms-secure-portal') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const hostname = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const targetLoc = resolveTargetFromHost(hostname);

  // Eğer bu domain belirli bir il veya ilçeye bağlıysa ve anasayfaya (/) geldiyse:
  if (targetLoc && pathname === '/') {
    if (targetLoc.ilceSlug) {
      // Örn: beylikduzuescort.devs.surf -> /istanbul/beylikduzu içeriğini URL değiştirmeden sun
      return NextResponse.rewrite(new URL(`/${targetLoc.ilSlug}/${targetLoc.ilceSlug}`, req.url));
    } else if (targetLoc.ilSlug) {
      // Örn: istanbulescort.devs.surf -> /istanbul içeriğini URL değiştirmeden sun
      return NextResponse.rewrite(new URL(`/${targetLoc.ilSlug}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
