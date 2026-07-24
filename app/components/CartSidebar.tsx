'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';

import { USDT_ADDRESSES, USDC_ADDRESSES, MERCHANT_ADDRESS } from '../config/web3';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'boolean' }],
  },
] as const;

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

  const { isConnected, chain, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Hook Wagmi untuk interaksi smart contract
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();

  // Hook Wagmi untuk mendengarkan status konfirmasi transaksi di blockchain
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

  const [successData, setSuccessData] = useState<{
    productId: number;
    walletAddress: string;
    txHash: string;
    productTitle: string;
  } | null>(null);

  // Efek setelah transaksi blockchain berhasil dikonfirmasi
  useEffect(() => {
    const savePurchases = async () => {
      if (isTxSuccess && address && items.length > 0 && hash) {
        const firstItem = items[0];
        const userAddress = address;

        // 1. Langsung tutup cart sidebar & kosongkan keranjang
        setIsCartOpen(false);
        clearCart();
        setCheckoutError(null);

        try {
          const responses = await Promise.all(
            items.map((item) =>
              fetch('/api/purchases', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  productId: item.id,
                  walletAddress: userAddress,
                  txHash: hash,
                }),
              })
            )
          );

          const failed = responses.find((res) => !res.ok);
          if (failed) {
            console.error('Beberapa entri pembelian gagal dicatat:', await failed.json());
          }
        } catch (error) {
          console.error('Failed to record purchases in DB:', error);
        }

        // 2. Tampilkan Center Success Modal interaktif
        setSuccessData({
          productId: firstItem.id,
          walletAddress: userAddress,
          txHash: hash,
          productTitle: firstItem.title,
        });
      }
    };

    savePurchases();
  }, [isTxSuccess, address, items, hash, clearCart, setIsCartOpen]);

  const handleDownloadAndClose = () => {
    if (successData) {
      const downloadUrl = `/api/download?productId=${successData.productId}&walletAddress=${successData.walletAddress}`;
      setSuccessData(null);
      window.location.href = downloadUrl;
    }
  };

  const handleCheckout = async () => {
    setCheckoutError(null);

    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        alert('Silakan hubungkan dompet Web3 Anda terlebih dahulu.');
      }
      return;
    }

    if (!chain) {
      setCheckoutError('Jaringan blockchain tidak terdeteksi. Silakan coba kembali.');
      return;
    }

    if (items.length === 0) return;

    // Ambil jenis mata uang dari item pertama (USDT atau USDC)
    const currency = items[0].currency;
    const tokenAddresses = currency === 'USDT' ? USDT_ADDRESSES : USDC_ADDRESSES;
    const tokenAddress = tokenAddresses[chain.id];

    if (!tokenAddress) {
      setCheckoutError(`Pembayaran dengan ${currency} belum didukung di jaringan ${chain.name}. Silakan ganti jaringan wallet Anda ke Sepolia Testnet.`);
      return;
    }

    // Seluruh token testnet MockUSDT di Sepolia Testnet menggunakan 6 desimal
    const decimals = 6;
    const amountInUnits = parseUnits(totalPrice.toFixed(2), decimals);

    try {
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [MERCHANT_ADDRESS, amountInUnits],
      });
    } catch (err: any) {
      setCheckoutError(err.message || 'Terjadi kesalahan sistem saat memicu transaksi.');
    }
  };

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
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Hapus dari keranjang"
                    title="Hapus dari keranjang"
                  >
                    −
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
                <span>{totalPrice.toFixed(2)} {items[0]?.currency || 'USDT'}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} {items[0]?.currency || 'USDT'}</span>
              </div>
            </div>

            {/* Tampilan Error jika ada */}
            {checkoutError && (
              <div className="checkout-error-msg" style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0', textAlign: 'center', lineHeight: '1.4' }}>
                ⚠️ {checkoutError}
              </div>
            )}
            {writeError && (
              <div className="checkout-error-msg" style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0', textAlign: 'center', lineHeight: '1.4' }}>
                ⚠️ {writeError.message.includes('User rejected')
                  ? 'Transaksi ditolak oleh pengguna di wallet.'
                  : writeError.message.substring(0, 100) + '...'}
              </div>
            )}

            <button
              className="btn-checkout"
              id="checkout-btn"
              onClick={handleCheckout}
              disabled={isWritePending || isTxConfirming}
              style={{ opacity: (isWritePending || isTxConfirming) ? 0.7 : 1 }}
            >
              {isWritePending || isTxConfirming ? (
                <>
                  <span className="spinner-mini" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '8px', verticalAlign: 'middle' }} />
                  {isWritePending ? 'Menyetujui Dompet...' : 'Menunggu Konfirmasi...'}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Checkout Sekarang
                </>
              )}
            </button>
            <button className="btn-clear-cart" onClick={clearCart} id="clear-cart-btn">
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </aside>

      {/* Center Success Modal Interaktif */}
      {successData && (
        <div className="cart-backdrop cart-backdrop-visible" style={{ zIndex: 300, backdropFilter: 'blur(8px)' }}>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 301,
              width: '90%',
              maxWidth: '440px',
              padding: '32px 24px',
              background: '#0a0a0f',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(59, 130, 246, 0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#4ade80',
                fontSize: '2rem',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
              }}
            >
              ✓
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '0.5px' }}>
              Pembayaran Berhasil!
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
              Transaksi Web3 Anda telah dikonfirmasi oleh blockchain. E-book <strong>{successData.productTitle}</strong> siap diunduh.
            </p>

            <div
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.78rem',
                color: '#cbd5e1',
              }}
            >
              <div style={{ marginBottom: '4px', color: '#64748b' }}>TRANSACTION HASH:</div>
              <a
                href={`https://sepolia.etherscan.io/tx/${successData.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#60a5fa', fontFamily: 'monospace', textDecoration: 'none', fontWeight: 600 }}
              >
                {successData.txHash.slice(0, 10)}...{successData.txHash.slice(-8)} ↗
              </a>
            </div>

            <button
              onClick={handleDownloadAndClose}
              id="success-download-btn"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              OK — UNDUH E-BOOK SEKARANG
            </button>
          </div>
        </div>
      )}
    </>
  );
}
