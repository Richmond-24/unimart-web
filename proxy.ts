import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/auth', '/login', '/signup'];

const PROTECTED_ROUTES = ['/profile', '/checkout', '/seller','/messages', '/orders'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('unimart:token')?.value || null;
  const hasToken = !!token;

  // Legacy /home → main marketplace at /
  if (pathname === '/home' || pathname.startsWith('/home/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Already signed in — skip auth screens
  if (AUTH_ROUTES.some((route)=> pathname.startsWith(route))&& hasToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protected pages require the auth cookie (set alongside localStorage on login)
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !hasToken) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};