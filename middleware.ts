import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /library route
  if (pathname.startsWith('/library')) {
    // Check for session cookie
    const sessionCookie = request.cookies.get('mwa_session') || request.cookies.get('session_token');
    
    // If no session cookie, redirect to home
    if (!sessionCookie || !sessionCookie.value) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    
    // Validate session token format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionCookie.value)) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/library/:path*',
  ],
};
