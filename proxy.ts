import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect /admin atau /admin/
  if (pathname === '/admin' || pathname === '/admin/') {
    const session = request.cookies.get('admin_session');
    if (session && session.value) {
      try {
        const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
        const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';

        if (decoded.role === 'admin' && decoded.secret === sessionSecret) {
          // Jika sudah login, lempar langsung ke halaman kelola ulasan
          return NextResponse.redirect(new URL('/admin/reviews', request.url));
        }
      } catch {
        // Abaikan dan biarkan redirect ke login
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
        const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
        const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';

        if (decoded.role === 'admin' && decoded.secret === sessionSecret) {
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
      const decoded = JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'));
      const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';

      if (decoded.role !== 'admin' || decoded.secret !== sessionSecret) {
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
  // Menjalankan proxy untuk semua rute di bawah /admin
  matcher: ['/admin/:path*'],
};
