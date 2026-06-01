'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin/reviews';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Username atau password salah. Coba lagi.');
        setIsLoading(false);
        return;
      }

      window.location.href = from;
    } catch {
      setError('Terjadi kesalahan koneksi. Coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`al-root ${mounted ? 'al-mounted' : ''}`}>

      {/* ── Global animated background ── */}
      <div className="al-bg" aria-hidden="true">
        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />
        <div className="al-orb al-orb-3" />
        <div className="al-grid" />
      </div>

      {/* ══════════════ LEFT PANEL — hero info ══════════════ */}
      <div className="al-left">
        {/* Bstore brand */}
        <div className="al-brand">
          <div className="al-brand-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="al-brand-name">Bstore</span>
          <span className="al-brand-badge">Admin</span>
        </div>

        {/* Hero text */}
        <div className="al-hero-content">
          <div className="al-hero-pill">
            <span className="al-pulse-dot" />
            Dashboard Aktif
          </div>

          <h1 className="al-hero-title">
            Kelola Toko<br />
            <span className="al-gradient-text">Dengan Mudah</span>
          </h1>

          <p className="al-hero-desc">
            Panel administrasi terpusat untuk memantau ulasan, produk, dan performa toko digital Bstore secara real-time.
          </p>

          {/* Stats row */}
          <div className="al-stats-row">
            <div className="al-stat-item">
              <span className="al-stat-number">100%</span>
              <span className="al-stat-label">Terenkripsi</span>
            </div>
            <div className="al-stat-divider" />
            <div className="al-stat-item">
              <span className="al-stat-number">MySQL</span>
              <span className="al-stat-label">Database</span>
            </div>
            <div className="al-stat-divider" />
            <div className="al-stat-item">
              <span className="al-stat-number">Real-time</span>
              <span className="al-stat-label">Data Sync</span>
            </div>
          </div>

          {/* Feature cards */}
          <div className="al-feature-list">
            <div className="al-feature-card">
              <div className="al-feature-icon al-icon-purple">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="al-feature-text">
                <span className="al-feature-title">Manajemen Ulasan</span>
                <span className="al-feature-desc">Monitor & hapus ulasan dari database</span>
              </div>
            </div>

            <div className="al-feature-card">
              <div className="al-feature-icon al-icon-cyan">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className="al-feature-text">
                <span className="al-feature-title">Analitik Rating</span>
                <span className="al-feature-desc">Distribusi bintang & rata-rata rating</span>
              </div>
            </div>

            <div className="al-feature-card">
              <div className="al-feature-icon al-icon-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div className="al-feature-text">
                <span className="al-feature-title">Akses Aman</span>
                <span className="al-feature-desc">Session terenkripsi & HttpOnly cookie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <a href="/" className="al-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali ke Toko
        </a>
      </div>

      {/* ══════════════ RIGHT PANEL — login form ══════════════ */}
      <div className="al-right">
        <div className="al-form-card glass-panel">

          {/* Card header */}
          <div className="al-form-header">
            <div className="al-shield-wrap">
              <div className="al-shield-ring al-ring-1" />
              <div className="al-shield-ring al-ring-2" />
              <div className="al-shield-core">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
            </div>
            <h2 className="al-form-title">Selamat Datang</h2>
            <p className="al-form-subtitle">Masuk ke panel admin Bstore</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="al-error-alert" role="alert" aria-live="polite">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form id="admin-login-form" className="al-form" onSubmit={handleSubmit} noValidate>

            {/* Username */}
            <div className="al-field">
              <label className="al-label" htmlFor="admin-username">Username</label>
              <div className="al-input-wrap">
                <span className="al-input-prefix" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="admin-username"
                  type="text"
                  className={`al-input ${error ? 'al-input-error' : ''}`}
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  autoComplete="username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="al-field">
              <label className="al-label" htmlFor="admin-password">Password</label>
              <div className="al-input-wrap">
                <span className="al-input-prefix" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`al-input al-input-has-suffix ${error ? 'al-input-error' : ''}`}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  id="toggle-password"
                  className="al-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              className="al-submit-btn"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <>
                  <span className="al-btn-spinner" aria-hidden="true" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          {/* Register link row */}
          <div className="al-divider-row">
            <span className="al-divider-line" />
            <span className="al-divider-text">atau</span>
            <span className="al-divider-line" />
          </div>

          <Link href="/admin/register" id="go-to-register" className="al-register-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Daftar Admin Baru
          </Link>

          {/* Secure notice */}
          <div className="al-secure-notice">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Koneksi terenkripsi · Session 8 jam · HttpOnly cookie</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
