'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  registerKey?: string;
};

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  };

  const strength = getStrength();
  const labels = ['', 'Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  if (!password) return null;

  return (
    <div className="ar-strength-wrap">
      <div className="ar-strength-bars">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="ar-strength-bar"
            style={{ background: i <= strength ? colors[strength] : undefined }}
          />
        ))}
      </div>
      <span className="ar-strength-label" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

export default function AdminRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    registerKey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
    setServerError('');
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.username) errs.username = 'Username wajib diisi';
    else if (form.username.length < 3) errs.username = 'Minimal 3 karakter';
    else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) errs.username = 'Hanya huruf, angka, _ dan -';

    if (!form.email) errs.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid';

    if (!form.password) errs.password = 'Password wajib diisi';
    else if (form.password.length < 8) errs.password = 'Minimal 8 karakter';

    if (!form.confirmPassword) errs.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Password tidak cocok';

    if (!form.registerKey) errs.registerKey = 'Kunci registrasi wajib diisi';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || 'Pendaftaran gagal. Coba lagi.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Akun berhasil dibuat! Mengalihkan ke halaman login...');
      setTimeout(() => router.push('/admin/login'), 2200);
    } catch {
      setServerError('Terjadi kesalahan koneksi. Coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`ar-root ${mounted ? 'ar-mounted' : ''}`}>

      {/* ── Background ── */}
      <div className="ar-bg" aria-hidden="true">
        <div className="ar-orb ar-orb-1" />
        <div className="ar-orb ar-orb-2" />
        <div className="ar-orb ar-orb-3" />
        <div className="ar-grid" />
      </div>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div className="ar-left">
        {/* Brand */}
        <div className="ar-brand">
          <div className="ar-brand-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="ar-brand-name">Bstore</span>
          <span className="ar-brand-badge">Admin</span>
        </div>

        {/* Hero */}
        <div className="ar-hero-content">
          <div className="ar-hero-pill">
            <span className="ar-pulse-dot" />
            Pendaftaran Admin Baru
          </div>

          <h1 className="ar-hero-title">
            Bergabung sebagai<br />
            <span className="ar-gradient-text">Administrator</span>
          </h1>

          <p className="ar-hero-desc">
            Daftarkan akun admin baru untuk mengakses panel pengelolaan toko Bstore. Diperlukan kunci registrasi yang diberikan oleh admin utama.
          </p>

          {/* Steps */}
          <div className="ar-steps">
            <div className="ar-step">
              <div className="ar-step-num">01</div>
              <div className="ar-step-body">
                <span className="ar-step-title">Isi Data Akun</span>
                <span className="ar-step-desc">Username, email, dan password yang kuat</span>
              </div>
            </div>
            <div className="ar-step-line" />
            <div className="ar-step">
              <div className="ar-step-num">02</div>
              <div className="ar-step-body">
                <span className="ar-step-title">Masukkan Kunci Registrasi</span>
                <span className="ar-step-desc">Dapatkan kunci dari administrator utama</span>
              </div>
            </div>
            <div className="ar-step-line" />
            <div className="ar-step">
              <div className="ar-step-num">03</div>
              <div className="ar-step-body">
                <span className="ar-step-title">Login & Kelola Dashboard</span>
                <span className="ar-step-desc">Akses penuh ke panel admin Bstore</span>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="ar-info-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>

        {/* Back link */}
        <Link href="/admin/login" className="ar-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali ke Login
        </Link>
      </div>

      {/* ══════════════ RIGHT PANEL — register form ══════════════ */}
      <div className="ar-right">
        <div className="ar-form-card glass-panel">

          {/* Header */}
          <div className="ar-form-header">
            <div className="ar-icon-wrap">
              <div className="ar-icon-ring ar-ring-1" />
              <div className="ar-icon-ring ar-ring-2" />
              <div className="ar-icon-core">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
            </div>
            <h2 className="ar-form-title">Buat Akun Admin</h2>
            <p className="ar-form-subtitle">Daftarkan dirimu sebagai administrator Bstore</p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="ar-server-error" role="alert" aria-live="polite">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="ar-success-alert" role="status" aria-live="polite">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {!successMsg && (
            <form id="admin-register-form" className="ar-form" onSubmit={handleSubmit} noValidate>

              {/* Username */}
              <div className="ar-field">
                <label className="ar-label" htmlFor="reg-username">Username</label>
                <div className="ar-input-wrap">
                  <span className="ar-input-prefix" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="reg-username"
                    type="text"
                    className={`ar-input ${fieldErrors.username ? 'ar-input-error' : ''}`}
                    placeholder="Minimal 3 karakter, huruf & angka"
                    value={form.username}
                    onChange={(e) => setField('username', e.target.value)}
                    autoComplete="username"
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.username && <span className="ar-field-err">{fieldErrors.username}</span>}
              </div>

              {/* Email */}
              <div className="ar-field">
                <label className="ar-label" htmlFor="reg-email">Email</label>
                <div className="ar-input-wrap">
                  <span className="ar-input-prefix" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    className={`ar-input ${fieldErrors.email ? 'ar-input-error' : ''}`}
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && <span className="ar-field-err">{fieldErrors.email}</span>}
              </div>

              {/* Password */}
              <div className="ar-field">
                <label className="ar-label" htmlFor="reg-password">Password</label>
                <div className="ar-input-wrap">
                  <span className="ar-input-prefix" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`ar-input ar-input-has-suffix ${fieldErrors.password ? 'ar-input-error' : ''}`}
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button type="button" className="ar-toggle-pw" onClick={() => setShowPassword(!showPassword)} disabled={isLoading} aria-label="Toggle password">
                    {showPassword
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                <PasswordStrengthBar password={form.password} />
                {fieldErrors.password && <span className="ar-field-err">{fieldErrors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="ar-field">
                <label className="ar-label" htmlFor="reg-confirm">Konfirmasi Password</label>
                <div className="ar-input-wrap">
                  <span className="ar-input-prefix" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className={`ar-input ar-input-has-suffix ${fieldErrors.confirmPassword ? 'ar-input-error' : ''}`}
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={(e) => setField('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <button type="button" className="ar-toggle-pw" onClick={() => setShowConfirm(!showConfirm)} disabled={isLoading} aria-label="Toggle confirm">
                    {showConfirm
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                {fieldErrors.confirmPassword && <span className="ar-field-err">{fieldErrors.confirmPassword}</span>}
              </div>

              {/* Register Key */}
              <div className="ar-field">
                <label className="ar-label" htmlFor="reg-key">
                  Kunci Registrasi
                  <span className="ar-label-badge">Diperlukan</span>
                </label>
                <div className="ar-input-wrap">
                  <span className="ar-input-prefix" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </span>
                  <input
                    id="reg-key"
                    type={showKey ? 'text' : 'password'}
                    className={`ar-input ar-input-has-suffix ${fieldErrors.registerKey ? 'ar-input-error' : ''}`}
                    placeholder="Kunci rahasia dari administrator"
                    value={form.registerKey}
                    onChange={(e) => setField('registerKey', e.target.value)}
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <button type="button" className="ar-toggle-pw" onClick={() => setShowKey(!showKey)} disabled={isLoading} aria-label="Toggle key">
                    {showKey
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
                {fieldErrors.registerKey && <span className="ar-field-err">{fieldErrors.registerKey}</span>}
              </div>

              {/* Submit */}
              <button
                id="admin-register-submit"
                type="submit"
                className="ar-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="ar-btn-spinner" aria-hidden="true" />
                    Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Daftar Sebagai Admin
                  </>
                )}
              </button>

              {/* Divider + login link */}
              <div className="ar-divider-row">
                <span className="ar-divider-line" />
                <span className="ar-divider-text">atau</span>
                <span className="ar-divider-line" />
              </div>

              <Link href="/admin/login" className="ar-login-link" id="go-to-login">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sudah punya akun? Masuk
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
