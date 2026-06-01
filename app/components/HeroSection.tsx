'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      {/* Animated Background Elements */}
      <div className="hero-bg-elements">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
      </div>

      <div className="hero-content">
        <div className="hero-badge-wrapper">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            Marketplace Digital Terbaru
          </span>
        </div>

        <h1 className="hero-title">
          Temukan Produk Digital
          <br />
          <span className="hero-title-gradient">Berkualitas Premium</span>
        </h1>

        <p className="hero-subtitle">
          Koleksi e-book, template, dan resource digital terbaik untuk mengembangkan
          skill & bisnis Anda. Transaksi aman dengan teknologi Web3.
        </p>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-label">Produk Digital</span>
          </div>
        </div>

        <div className="hero-actions">
          <a href="#products" className="hero-btn-primary">
            Jelajahi Produk
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#categories" className="hero-btn-secondary">
            Lihat Kategori
          </a>
        </div>
      </div>
    </section>
  );
}
