'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';

// Pemetaan alamat smart contract token USDT per jaringan blockchain
const USDT_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',      // Ethereum Mainnet
  137: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',    // Polygon
  10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',     // Optimism
  42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',  // Arbitrum
  56: '0x55d398326f99059fF775485246999027B3197955',     // BSC (USDT)
  11155111: '0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23', // Sepolia Testnet MockUSDT (Lowercase)
  11155420: '0x6b25442abad6c9a19616d8e5e1b6b7c3a772dc23', // Optimism Sepolia MockUSDT (Lowercase)
};

// Pemetaan alamat smart contract token USDC per jaringan blockchain
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',      // Ethereum Mainnet
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',    // Polygon (USDC.e)
  10: '0x0b2C639c533813f4Aa9d7837CAf62653d097Ff85',     // Optimism
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',  // Arbitrum
  56: '0x8AC76a51cc950d9822D68b83fE1Ad97B32CD580d',     // BSC
};

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

// Alamat dompet toko / merchant penerima pembayaran
const MERCHANT_ADDRESS = (process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F') as `0x${string}`;

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

  // Efek setelah transaksi blockchain berhasil dikonfirmasi
  useEffect(() => {
    const savePurchases = async () => {
      if (isTxSuccess && address && items.length > 0 && hash) {
        const firstItem = items[0];
        const userAddress = address;

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

          // Cek apakah ada respon error dari server
          const failed = responses.find((res) => !res.ok);
          if (failed) {
            console.error('Beberapa entri pembelian gagal dicatat:', await failed.json());
          }

          alert(`✓ Pembayaran Berhasil! Transaksi Anda (${hash.slice(0, 10)}...) telah dikonfirmasi oleh blockchain. Mengunduh e-book Anda...`);

          // Clear cart terlebih dahulu sebelum mengarahkan ke download
          clearCart();
          setIsCartOpen(false);
          setCheckoutError(null);

          // Otomatis mengunduh e-book yang dibeli
          window.location.href = `/api/download?productId=${firstItem.id}&walletAddress=${userAddress}`;
        } catch (error) {
          console.error('Failed to record purchases in DB:', error);
          clearCart();
          setIsCartOpen(false);
        }
      }
    };

    savePurchases();
  }, [isTxSuccess, address, items, hash, clearCart, setIsCartOpen]);

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
      setCheckoutError(`Pembayaran dengan ${currency} belum didukung di jaringan ${chain.name}. Silakan ganti jaringan wallet Anda ke Ethereum Mainnet, Polygon, BSC, Arbitrum, atau Optimism.`);
      return;
    }

    // Set desimal token. Di BSC (chain 56), USDT dan USDC menggunakan 18 desimal.
    // Di Ethereum, Polygon, Arbitrum, dan Optimism, USDT/USDC menggunakan 6 desimal.
    const decimals = chain.id === 56 ? 18 : 6;
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
    </>
  );
}
