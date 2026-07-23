import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './app/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect /admin atau /admin/
  if (pathname === '/admin' || pathname === '/admin/') {
    const session = request.cookies.get('admin_session');
    if (session && session.value) {
      try {
        const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';
        const decoded = await verifyToken(session.value, sessionSecret);

        if (decoded && decoded.role === 'admin') {
          // Jika sudah login, lempar langsung ke halaman kelola ulasan
          return NextResponse.redirect(new URL('/admin/reviews', request.url));
        }
      } catch {
        // Abaikan
      }
    }
    // Jika belum login, alihkan ke /admin/login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 2. Jika mengakses /admin/login atau /admin/register, cek apakah sudah login
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    const session = request.cookies.get('admin_session');
    if (session && session.value) {
      try {
        const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';
        const decoded = await verifyToken(session.value, sessionSecret);

        if (decoded && decoded.role === 'admin') {
          // Jika sudah login admin, alihkan otomatis ke reviews
          return NextResponse.redirect(new URL('/admin/reviews', request.url));
        }
      } catch {
        // Abaikan
      }
    }
  }

  // 3. Lindungi semua rute /admin/* selain login dan register
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/admin/register')
  ) {
    const session = request.cookies.get('admin_session');

    if (!session || !session.value) {
      // Redirect ke login dengan param 'from' agar setelah login kembali ke rute ini
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';
      const decoded = await verifyToken(session.value, sessionSecret);

      if (!decoded || decoded.role !== 'admin') {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Menjalankan middleware untuk semua rute di bawah /admin
  matcher: ['/admin/:path*'],
};
