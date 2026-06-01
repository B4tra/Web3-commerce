'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminReview {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  productTitle: string;
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  // Fetch reviews using React Query
  const { data: reviews = [], isLoading, error } = useQuery<AdminReview[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews');
      if (!res.ok) {
        throw new Error('Gagal memuat ulasan dari database MySQL');
      }
      return res.json();
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menghapus ulasan');
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both admin reviews and products queries
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingId(null);
    },
  });

  // Calculate statistics from current reviews
  const totalCount = reviews.length;
  const averageRating = totalCount > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(2))
    : 0;

  // Star counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rating = r.rating as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      starCounts[rating]++;
    }
  });

  // Filter reviews based on search term and rating filter
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link href="/" className="btn-back-home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke Toko
          </Link>
          <h1 className="admin-title">⚙️ Dashboard Ulasan Bstore</h1>
        </div>
        <div className="admin-header-right">
          <div className="admin-status-badge">MySQL Connected</div>
          <button
            id="admin-logout-btn"
            className="admin-logout-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Keluar dari dashboard"
          >
            {isLoggingOut ? (
              <span className="logout-spinner" aria-hidden="true" />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            )}
            {isLoggingOut ? 'Keluar...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tab-bar">
        <Link href="/admin/reviews" className="admin-tab-link active">
          💬 Kelola Ulasan
        </Link>
        <Link href="/admin/product" className="admin-tab-link">
          📦 Produk
        </Link>
      </div>

      {isLoading ? (
        <div className="admin-loading-container">
          <div className="spinner-large" />
          <p>Memuat ulasan dari MySQL database...</p>
        </div>
      ) : error ? (
        <div className="db-error-card">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Gagal Terhubung ke MySQL</h3>
          <p className="error-message">{(error as Error).message || 'Terjadi kesalahan saat memuat ulasan.'}</p>
        </div>
      ) : (
        <>
          {/* Statistics Section */}
          <section className="admin-stats-grid">
            {/* Stat Card 1 */}
            <div className="admin-stat-card glass-panel">
              <span className="stat-card-label">Total Ulasan</span>
              <span className="stat-card-value text-glow-cyan">{totalCount}</span>
              <span className="stat-card-subtext">Dari pembeli terverifikasi</span>
            </div>

            {/* Stat Card 2 */}
            <div className="admin-stat-card glass-panel">
              <span className="stat-card-label">Rata-rata Rating</span>
              <div className="stat-rating-value-row">
                <span className="stat-card-value text-glow-yellow">{averageRating.toFixed(1)}</span>
                <span className="stat-card-star">★</span>
              </div>
              <span className="stat-card-subtext">Skala 1.0 sampai 5.0</span>
            </div>

            {/* Stat Card 3 */}
            <div className="admin-stat-card glass-panel star-distribution-card">
              <span className="stat-card-label">Distribusi Bintang</span>
              <div className="star-dist-rows">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = starCounts[stars as 1 | 2 | 3 | 4 | 5];
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                  return (
                    <div key={stars} className="dist-row">
                      <span className="dist-label">★{stars}</span>
                      <div className="dist-track">
                        <div className="dist-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dist-count">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Filter Bar */}
          <section className="admin-filter-bar glass-panel">
            <div className="admin-search-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Cari berdasarkan nama, isi ulasan, atau nama produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-rating-filters">
              <span className="filter-label">Filter Bintang:</span>
              <div className="filter-buttons">
                <button
                  className={`btn-filter-rating ${ratingFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setRatingFilter('all')}
                >
                  Semua
                </button>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    className={`btn-filter-rating ${ratingFilter === stars ? 'active' : ''}`}
                    onClick={() => setRatingFilter(stars)}
                  >
                    ★{stars}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Table of Reviews */}
          <section className="admin-table-container glass-panel">
            <div className="table-header-row">
              <h2 className="table-title">Daftar Ulasan Masuk ({filteredReviews.length} item)</h2>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="admin-empty-state">
                <p>Tidak ada ulasan yang sesuai dengan pencarian/filter Anda.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pengguna</th>
                      <th>Produk</th>
                      <th>Rating</th>
                      <th className="th-comment">Komentar/Ulasan</th>
                      <th>Tanggal Kirim</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((r) => (
                      <tr key={r.id} className={r.id.startsWith('mock_') ? 'row-mock' : 'row-user'}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar">
                              {r.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="admin-user-info">
                              <span className="admin-username">{r.userName}</span>
                              <span className="admin-userid">{r.userId}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-product-title">{r.productTitle}</span>
                        </td>
                        <td>
                          <div className="admin-stars-cell">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`admin-star ${i < r.rating ? 'filled' : 'empty'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="td-comment">
                          <p className="admin-comment-text">{r.comment}</p>
                        </td>
                        <td>
                          <span className="admin-date">{formatDate(r.createdAt)}</span>
                        </td>
                        <td>
                          <button
                            className="btn-delete-review"
                            onClick={() => handleDeleteClick(r.id)}
                            title="Hapus Ulasan"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Confirmation Modal */}
      {deletingId && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal glass-panel">
            <h3 className="modal-title">Konfirmasi Penghapusan</h3>
            <p className="modal-body">
              Apakah Anda yakin ingin menghapus ulasan ini secara permanen dari database MySQL? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={cancelDelete}
                disabled={deleteMutation.isPending}
              >
                Batal
              </button>
              <button
                className="btn-modal-delete"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
