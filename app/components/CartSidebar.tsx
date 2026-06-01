'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isCartOpen ? 'cart-backdrop-visible' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`cart-sidebar ${isCartOpen ? 'cart-sidebar-open' : ''}`}
        id="cart-sidebar"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h2>Keranjang</h2>
            {totalItems > 0 && (
              <span className="cart-header-count">{totalItems}</span>
            )}
          </div>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            id="cart-close-btn"
            aria-label="Tutup keranjang"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-items-container">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p className="cart-empty-text">Keranjang kosong</p>
              <p className="cart-empty-sub">Tambahkan produk digital favoritmu!</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="64px"
                      style={{ objectFit: 'cover', borderRadius: '10px' }}
                    />
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.title}</h4>
                    <span className="cart-item-category">{item.category}</span>
                    <div className="cart-item-bottom">
                      <span className="cart-item-price">{item.price.toFixed(2)} {item.currency}</span>
                      <div className="cart-item-qty">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Kurangi jumlah"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Hapus dari keranjang"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal ({totalItems} item)</span>
                <span>${totalPrice.toFixed(2)} USD</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)} USD</span>
              </div>
            </div>
            <button className="btn-checkout" id="checkout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Checkout Sekarang
            </button>
            <button className="btn-clear-cart" onClick={clearCart} id="clear-cart-btn">
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
