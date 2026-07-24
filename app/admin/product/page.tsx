'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Product } from '../../context/CartContext';

const presetCovers = [
  { path: '/products/ebook-web3.png', name: 'Web3 Guide' },
  { path: '/products/ebook-uiux.png', name: 'UI/UX Design' },
  { path: '/products/template-social.png', name: 'Social Template' },
  { path: '/products/ebook-crypto.png', name: 'Crypto Trading' },
  { path: '/products/template-notion.png', name: 'Notion Template' },
  { path: '/products/ebook-ai.png', name: 'AI & ML Guide' },
  { path: '/products/template-resume.png', name: 'Resume Pack' },
  { path: '/products/ebook-defi.png', name: 'DeFi Guide' }
];

export default function AdminProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mode Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const currency = 'USDT';
  const [category, setCategory] = useState<'E-Book' | 'Template'>('E-Book');
  const [badge, setBadge] = useState('');
  
  // Image covers states
  const [selectedPreset, setSelectedPreset] = useState(presetCovers[0].path);
  const [customImagePath, setCustomImagePath] = useState('');
  const [useCustomImage, setUseCustomImage] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentImage = useCustomImage ? customImagePath : selectedPreset;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  // Fetch all products using React Query (Read)
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error('Gagal memuat daftar produk dari MySQL database.');
      }
      return res.json();
    },
  });

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setBadge('');
    setCustomImagePath('');
    setUseCustomImage(false);
    setSelectedPreset(presetCovers[0].path);
    setEditingProduct(null);
  };

  // Add Product Mutation (Create)
  const addProductMutation = useMutation({
    mutationFn: async (newProduct: any) => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan produk baru.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSuccessMessage('Produk baru berhasil disimpan ke database MySQL dan aktif di dashboard pelanggan!');
      setErrorMessage('');
      resetForm();

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan produk.');
      setSuccessMessage('');
    }
  });

  // Update Product Mutation (Update)
  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: any) => {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui produk.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSuccessMessage('Produk berhasil diperbarui di database MySQL!');
      setErrorMessage('');
      resetForm();

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memperbarui produk.');
      setSuccessMessage('');
    }
  });

  // Delete Product Mutation (Delete)
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus produk.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSuccessMessage('Produk berhasil dihapus secara permanen dari database!');
      setErrorMessage('');
      setDeletingId(null);

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menghapus produk.');
      setSuccessMessage('');
      setDeletingId(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (useCustomImage && !customImagePath) {
      setErrorMessage('Silakan isi path/URL gambar kustom Anda.');
      return;
    }

    const payload: any = {
      title,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      currency,
      image: currentImage,
      category,
      badge: badge || undefined
    };

    if (editingProduct) {
      payload.id = editingProduct.id;
      updateProductMutation.mutate(payload);
    } else {
      addProductMutation.mutate(payload);
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setDescription(product.description);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setCategory(product.category as 'E-Book' | 'Template');
    setBadge(product.badge || '');

    // Cek preset cover vs custom
    const matchedPreset = presetCovers.find((cover) => cover.path === product.image);
    if (matchedPreset) {
      setUseCustomImage(false);
      setSelectedPreset(product.image);
    } else {
      setUseCustomImage(true);
      setCustomImagePath(product.image);
    }

    // Scroll form ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = () => {
    if (deletingId !== null) {
      deleteProductMutation.mutate(deletingId);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const isMutationPending = addProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending;

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
          <h1 className="admin-title">⚙️ Dashboard Produk Bstore</h1>
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
        <Link href="/admin/reviews" className="admin-tab-link">
          💬 Kelola Ulasan
        </Link>
        <Link href="/admin/product" className="admin-tab-link active">
          📦 Produk
        </Link>
      </div>

      {/* Form Container */}
      <div className="admin-form-card glass-panel">
        <h2 className="admin-form-title">
          {editingProduct ? `Edit Produk: ${editingProduct.title}` : 'Tambah Produk Baru ke Dashboard Pelanggan'}
        </h2>

        {successMessage && (
          <div className="ar-success-alert" style={{ marginBottom: '20px' }}>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="ar-server-error" style={{ marginBottom: '20px' }}>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="al-form">
          <div className="form-row">
            {/* Title */}
            <div className="admin-input-group">
              <label className="admin-form-label">Judul Produk / Buku *</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Contoh: Mastering Next.js & Turbopack"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isMutationPending}
              />
            </div>

            {/* Category */}
            <div className="admin-input-group">
              <label className="admin-form-label">Kategori *</label>
              <select
                className="admin-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'E-Book' | 'Template')}
                disabled={isMutationPending}
              >
                <option value="E-Book">📚 E-Book</option>
                <option value="Template">🎨 Template</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="admin-input-group" style={{ marginBottom: '20px' }}>
            <label className="admin-form-label">Deskripsi Produk *</label>
            <textarea
              className="admin-form-textarea"
              placeholder="Berikan deskripsi detail tentang materi buku atau isi template pack..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isMutationPending}
            />
          </div>

          <div className="form-row">
            {/* Price */}
            <div className="admin-input-group">
              <label className="admin-form-label">Harga Jual *</label>
              <input
                type="number"
                step="0.01"
                className="admin-form-input"
                placeholder="Contoh: 19.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={isMutationPending}
              />
            </div>

            {/* Original Price */}
            <div className="admin-input-group">
              <label className="admin-form-label">Harga Asli (Untuk Diskon - Opsional)</label>
              <input
                type="number"
                step="0.01"
                className="admin-form-input"
                placeholder="Contoh: 39.99"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                disabled={isMutationPending}
              />
            </div>
          </div>

          <div className="form-row">
            {/* Currency */}
            <div className="admin-input-group">
              <label className="admin-form-label">Tipe Crypto Pembayaran *</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(38, 161, 123, 0.2)',
                    color: '#26A17B',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  ₮
                </span>
                <span>USDT (Tether)</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(38, 161, 123, 0.15)',
                    color: '#26A17B',
                    border: '1px solid rgba(38, 161, 123, 0.3)',
                    letterSpacing: '0.5px',
                    fontWeight: 700,
                  }}
                >
                  STANDAR DEFAULT
                </span>
              </div>
            </div>

            {/* Badge */}
            <div className="admin-input-group">
              <label className="admin-form-label">Label Promo / Badge (Opsional)</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Contoh: Bestseller, New, 50% OFF"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={isMutationPending}
              />
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="admin-input-group" style={{ marginBottom: '20px' }}>
            <label className="admin-form-label">Gambar Sampul Produk / Buku *</label>

            {/* Toggle Custom vs Preset */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <label className="crypto-radio-label" style={{ fontSize: '0.8rem' }}>
                <input
                  type="radio"
                  name="imageSource"
                  className="crypto-radio-input"
                  checked={!useCustomImage}
                  onChange={() => setUseCustomImage(false)}
                  disabled={isMutationPending}
                />
                Gunakan Preset Gambar Cover
              </label>
              <label className="crypto-radio-label" style={{ fontSize: '0.8rem' }}>
                <input
                  type="radio"
                  name="imageSource"
                  className="crypto-radio-input"
                  checked={useCustomImage}
                  onChange={() => setUseCustomImage(true)}
                  disabled={isMutationPending}
                />
                Masukkan URL / Path Gambar Kustom
              </label>
            </div>

            {/* Preset Grid */}
            {!useCustomImage ? (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Pilih salah satu template cover buku digital premium bawaan:
                </p>
                <div className="preset-cover-grid">
                  {presetCovers.map((cover) => (
                    <div
                      key={cover.path}
                      className={`preset-cover-option ${selectedPreset === cover.path ? 'active' : ''}`}
                      onClick={() => setSelectedPreset(cover.path)}
                    >
                      <Image
                        src={cover.path}
                        alt={cover.name}
                        fill
                        sizes="100px"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="preset-label">{cover.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Input */
              <input
                type="text"
                className="admin-form-input"
                placeholder="Contoh: /products/custom-book.png atau https://example.com/cover.jpg"
                value={customImagePath}
                onChange={(e) => setCustomImagePath(e.target.value)}
                required={useCustomImage}
                disabled={isMutationPending}
              />
            )}

            {/* Live Preview */}
            {currentImage && (
              <div className="preview-container">
                <div className="preview-image-wrapper">
                  <Image
                    src={currentImage}
                    alt="Preview"
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/products/ebook-web3.png';
                    }}
                  />
                </div>
                <div className="preview-info">
                  <span className="preview-title">Live Preview Gambar</span>
                  <span className="preview-url">{currentImage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            {editingProduct && (
              <button
                type="button"
                className="btn-cancel-edit"
                onClick={resetForm}
                disabled={isMutationPending}
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              className="btn-submit"
              disabled={isMutationPending}
            >
              {isMutationPending ? (
                <>
                  <span className="spinner-mini" />
                  Menyimpan...
                </>
              ) : editingProduct ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Simpan Produk Baru
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Products Table Section (Read) */}
      <section className="admin-table-container glass-panel" style={{ marginTop: '30px' }}>
        <div className="table-header-row">
          <h2 className="table-title">Daftar Produk Aktif ({products.length} item)</h2>
        </div>

        {isLoading ? (
          <div className="admin-loading-container">
            <div className="spinner-large" />
            <p>Memuat daftar produk dari MySQL database...</p>
          </div>
        ) : error ? (
          <div className="db-error-card">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Gagal Terhubung ke MySQL</h3>
            <p className="error-message">{(error as Error).message || 'Terjadi kesalahan sistem.'}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="admin-empty-state">
            <p>Belum ada produk terdaftar. Gunakan formulir di atas untuk menambahkan produk.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Deskripsi</th>
                  <th>Harga</th>
                  <th>Badge</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div style={{ position: 'relative', width: '50px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="admin-user-info">
                          <span className="admin-username" style={{ fontSize: '0.85rem' }}>{p.title}</span>
                          <span className="admin-userid" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                            {p.category} • ID: {p.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <p className="admin-comment-text" style={{ fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description}
                      </p>
                    </td>
                    <td>
                      <span className="price-currency-tag" style={{ background: 'rgba(38,161,123,0.12)', color: '#26A17B', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {p.price.toFixed(2)} USDT
                      </span>
                      {p.originalPrice && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginTop: '2px' }}>
                          {p.originalPrice.toFixed(2)} USDT
                        </div>
                      )}
                    </td>
                    <td>
                      {p.badge ? (
                        <span className="logo-badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{p.badge}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-action-group">
                        <button
                          className="btn-edit-product"
                          onClick={() => handleStartEdit(p)}
                          title="Edit Produk"
                          disabled={isMutationPending}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn-delete-review"
                          onClick={() => setDeletingId(p.id)}
                          title="Hapus Produk"
                          disabled={isMutationPending}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Confirmation Delete Modal */}
      {deletingId !== null && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal glass-panel">
            <h3 className="modal-title">Konfirmasi Penghapusan</h3>
            <p className="modal-body">
              Apakah Anda yakin ingin menghapus produk ini secara permanen dari database MySQL? Semua ulasan terkait produk ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={cancelDelete}
                disabled={deleteProductMutation.isPending}
              >
                Batal
              </button>
              <button
                className="btn-modal-delete"
                onClick={confirmDelete}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
