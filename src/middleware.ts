import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/admin/login');
  const isAdminRoute = pathname.startsWith('/admin') && !isAuthPage;

  // If user is accessing an admin route and is not logged in
  if (isAdminRoute && !token) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but has regular USER role
  if (isAdminRoute && token && token.role === 'USER') {
    return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
  }

  // If user is already logged in as admin/editor and visits login page
  if (isAuthPage && token && (token.role === 'SUPER_ADMIN' || token.role === 'EDITOR')) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

