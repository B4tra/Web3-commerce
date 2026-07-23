import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../../../lib/db';
import { signToken } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Query database untuk mencari user
    const users = await executeQuery<any[]>(
      'SELECT id, username, password_hash, is_active, role FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Cek apakah user aktif
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Akun admin dinonaktifkan. Hubungi administrator.' },
        { status: 403 }
      );
    }

    // Verifikasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Update last_login timestamp
    await executeQuery(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Build session token
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';
    const payload = await signToken(
      {
        role: user.role || 'admin',
        username: user.username,
        adminId: user.id,
        ts: Date.now(),
      },
      sessionSecret
    );

    const response = NextResponse.json({ success: true, message: 'Login berhasil' });

    // Set HttpOnly cookie — berlaku 8 jam
    response.cookies.set('admin_session', payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 jam
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
