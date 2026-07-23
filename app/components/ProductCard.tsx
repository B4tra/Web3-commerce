'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, useCart } from '../context/CartContext';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart, setIsCartOpen } = useCart();
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleAddToCart = () => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        alert('Mohon hubungkan dompet (wallet) Anda terlebih dahulu di bagian atas halaman.');
      }
      return;
    }
    addToCart(product);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNow = () => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        alert('Mohon hubungkan dompet (wallet) Anda terlebih dahulu di bagian atas halaman.');
      }
      return;
    }
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          userName,
          rating: userRating,
          comment,
          walletAddress: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim ulasan');
      }

      setSubmitSuccess(true);
      setComment('');
      setUserName('');
      setUserRating(5);

      // Invalidate products query in React Query cache to fetch updated reviews/stats from MySQL
      queryClient.invalidateQueries({ queryKey: ['products'] });

      // Close the form after 2 seconds success message
      setTimeout(() => {
        setShowReviewForm(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inCart = isInCart(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const { reviewSummary } = product;

  // Format harga: tampilkan 2 desimal
  const formatPrice = (val: number) =>
    val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);

  // Hitung persentase bintang 5 untuk mini-bar
  const fiveStarPct =
    reviewSummary.totalReviews > 0
      ? Math.round((reviewSummary.ratingDistribution[5] / reviewSummary.totalReviews) * 100)
      : 0;

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
    >
      {/* Badge */}
      {product.badge && (
        <div className="product-badge">{product.badge}</div>
      )}

      {/* Discount Tag */}
      {discount > 0 && (
        <div className="product-discount">-{discount}%</div>
      )}

      {/* Image Container */}
      <div className="product-image-container">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: 'cover' }}
          className="product-image"
        />
        <div
          className="product-image-overlay"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <button
            className="btn-preview"
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="product-content">
        {/* Category */}
        <div className="product-category">
          <span className={`category-dot ${product.category === 'E-Book' ? 'dot-ebook' : 'dot-template'}`} />
          {product.category}
        </div>

        {/* Title */}
        <h3 className="product-title">{product.title}</h3>

        {/* Description */}
        <p className="product-description">{product.description}</p>

        {/* Rating & Reviews — data dari database user */}
        <div className="product-review-block">
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                const fill =
                  starValue <= Math.floor(reviewSummary.averageRating)
                    ? 1
                    : starValue - reviewSummary.averageRating < 1
                    ? reviewSummary.averageRating - Math.floor(reviewSummary.averageRating)
                    : 0;

                return (
                  <div key={i} className="star-wrapper">
                    {/* Empty star (background) */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b3b52" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {/* Filled star (overlay with clip) */}
                    <div className="star-fill" style={{ width: `${fill * 100}%` }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="rating-value">{reviewSummary.averageRating.toFixed(1)}</span>
            <span className="review-count">{reviewSummary.totalReviews} ulasan</span>
          </div>

          {/* Mini rating bar — persentase bintang 5 */}
          <div className="rating-mini-bar">
            <span className="rating-mini-label">★5</span>
            <div className="rating-mini-track">
              <div className="rating-mini-fill" style={{ width: `${fiveStarPct}%` }} />
            </div>
            <span className="rating-mini-pct">{fiveStarPct}%</span>
          </div>

          {/* Recent review snippet */}
          {product.recentReviews && product.recentReviews.length > 0 && (
            <div className="review-snippet">
              <div className="review-snippet-avatar">
                {product.recentReviews[0].userName.charAt(0)}
              </div>
              <div className="review-snippet-body">
                <span className="review-snippet-name">{product.recentReviews[0].userName}</span>
                <p className="review-snippet-text">&ldquo;{product.recentReviews[0].comment}&rdquo;</p>
              </div>
            </div>
          )}

          {/* Write review toggle */}
          <div className="review-block-actions">
            <button
              className={`btn-write-review ${showReviewForm ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isConnected) {
                  if (openConnectModal) {
                    openConnectModal();
                  } else {
                    alert('Mohon hubungkan dompet (wallet) Anda terlebih dahulu untuk menulis ulasan.');
                  }
                  return;
                }
                setShowReviewForm(!showReviewForm);
                setSubmitSuccess(false);
                setSubmitError('');
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {showReviewForm ? 'Batal' : 'Tulis Ulasan'}
            </button>
          </div>
        </div>

        {/* Dynamic Review Submission Form */}
        {showReviewForm && (
          <form
            className="review-submit-form"
            onSubmit={handleReviewSubmit}
            onClick={(e) => e.stopPropagation()} // Prevent card clicks
          >
            <h4 className="form-title">Tulis Ulasan Anda</h4>
            
            {submitError && <div className="form-error">{submitError}</div>}
            {submitSuccess && <div className="form-success">✓ Ulasan berhasil dikirim!</div>}
            
            {!submitSuccess && (
              <>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="rating-select-stars">
                    {[...Array(5)].map((_, i) => {
                      const starVal = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          className="star-select-btn"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(starVal)}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill={starVal <= (hoverRating || userRating) ? '#F59E0B' : 'none'}
                            stroke={starVal <= (hoverRating || userRating) ? '#F59E0B' : '#4b4b64'}
                            strokeWidth="1.5"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nama Anda"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Tulis ulasan/komentar produk di sini..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit-review"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-mini" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Ulasan'
                  )}
                </button>
              </>
            )}
          </form>
        )}

        {/* Price — USDT / USDC */}
        <div className="product-price-row">
          <div className="price-group">
            <span className="price-currency-icon">{product.currency === 'USDT' ? '₮' : '$'}</span>
            <span className="price-current">{formatPrice(product.price)}</span>
            <span className="price-currency-tag">{product.currency}</span>
            {product.originalPrice && (
              <span className="price-original">{formatPrice(product.originalPrice)} {product.currency}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button
            className="btn-buy"
            onClick={handleBuyNow}
            id={`buy-now-${product.id}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Beli Sekarang
          </button>
          <button
            className={`btn-cart ${inCart ? 'in-cart' : ''} ${addedAnimation ? 'cart-added' : ''}`}
            onClick={handleAddToCart}
            id={`add-cart-${product.id}`}
            title={inCart ? 'Sudah di keranjang' : 'Tambah ke keranjang'}
          >
            {addedAnimation ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
