import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve auth credentials from cookies or authorization header
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Protect all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    // 1. If no auth token is present, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // 2. If token exists but user role is not ADMIN, block access
    if (userRole && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher to run middleware specifically on admin routes
export const config = {
  matcher: ['/admin/:path*'],
};