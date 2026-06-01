import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../../../lib/db';

export const dynamic = 'force-dynamic';

interface ExistingRow { id: number }

export async function POST(request: Request) {
  try {
    const { username, email, password, confirmPassword, registerKey } = await request.json();

    // ── Validasi input ────────────────────────────────────────────
    if (!username || !email || !password || !confirmPassword || !registerKey) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Cek kunci registrasi
    const validRegisterKey = process.env.ADMIN_REGISTER_KEY || '';
    if (registerKey !== validRegisterKey) {
      return NextResponse.json(
        { error: 'Kunci registrasi tidak valid. Hubungi administrator.' },
        { status: 403 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validasi panjang username
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: 'Username harus antara 3–50 karakter' },
        { status: 400 }
      );
    }

    // Validasi karakter username (hanya huruf, angka, underscore, dash)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username hanya boleh berisi huruf, angka, _ dan -' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password dan konfirmasi password tidak cocok' },
        { status: 400 }
      );
    }

    // ── Cek duplikat username ─────────────────────────────────────
    const existingUsername = await executeQuery<ExistingRow[]>(
      'SELECT id FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );
    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username sudah digunakan. Pilih username lain.' },
        { status: 409 }
      );
    }

    // Cek duplikat email
    const existingEmail = await executeQuery<ExistingRow[]>(
      'SELECT id FROM admin_users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Gunakan email lain.' },
        { status: 409 }
      );
    }

    // ── Hash password & simpan ─────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    await executeQuery(
      `INSERT INTO admin_users (username, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'admin', 1)`,
      [username, email.toLowerCase(), passwordHash]
    );

    return NextResponse.json({
      success: true,
      message: `Akun admin '${username}' berhasil dibuat. Silakan login.`,
    });
  } catch (error) {
    console.error('Admin register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server. Coba lagi.' },
      { status: 500 }
    );
  }
}
