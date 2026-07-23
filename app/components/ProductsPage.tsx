'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../context/CartContext';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const categories = ['Semua', 'E-Book', 'Template'];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products from database API using React Query
  // Diaktifkan segera setelah component dimuat di sisi klien agar crawler SEO dapat mengindeks katalog produk
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error('Gagal memuat data dari database MySQL');
      }
      return res.json();
    },
    enabled: mounted,
  });

  const filteredProducts =
    activeCategory === 'Semua'
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Mencegah hydration mismatch sebelum component dimuat di client-side
  if (!mounted) {
    return (
      <section className="products-section" id="products">
        <div className="section-header">
          <div className="section-label">Koleksi Digital</div>
          <h2 className="section-title">Produk Unggulan Kami</h2>
          <p className="section-subtitle">Memuat katalog...</p>
        </div>
        <div className="admin-loading-container" style={{ padding: '60px 20px' }}>
          <div className="spinner-large" />
        </div>
      </section>
    );
  }

  return (
    <section className="products-section" id="products">
      <div className="section-header">
        <div className="section-label">Koleksi Digital</div>
        <h2 className="section-title">Produk Unggulan Kami</h2>
        <p className="section-subtitle">
          Pilih dari berbagai e-book dan template premium untuk kebutuhan Anda
        </p>
      </div>

      {/* Category Filter */}
      <div className="filter-bar" id="categories">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            id={`filter-${cat.toLowerCase()}`}
          >
            {cat === 'Semua' ? 'All' : cat === 'E-Book' ? 'E-Book' : 'Template'}
          </button>
        ))}
      </div>

      {/* Loading State with Glassmorphism Skeletons */}
      {isLoading && (
        <div className="products-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="product-card skeleton-card">
              <div className="skeleton-image pulse" />
              <div className="product-content">
                <div className="skeleton-line short pulse" />
                <div className="skeleton-line title pulse" />
                <div className="skeleton-line desc pulse" />
                <div className="skeleton-line desc pulse" />
                <div className="skeleton-review-block pulse" />
                <div className="skeleton-price-row pulse" />
                <div className="skeleton-actions pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="db-error-card">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Gagal Terhubung ke MySQL</h3>
          <p className="error-message">{(error as Error).message || 'Terjadi kesalahan sistem.'}</p>
          <button className="btn-retry" onClick={() => refetch()}>
            Coba Hubungkan Kembali
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

