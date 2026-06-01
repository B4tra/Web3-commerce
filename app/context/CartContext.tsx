'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;       // 1-5 dari user
  comment: string;
  createdAt: string;    // ISO date string dari DB
}

export interface ReviewSummary {
  averageRating: number;   // rata-rata dari semua review user (dihitung dari DB)
  totalReviews: number;    // jumlah total review dari DB
  ratingDistribution: {    // distribusi rating untuk progress bar
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;           // harga dalam USDT
  originalPrice?: number;  // harga asli dalam USDT (untuk diskon)
  currency: 'USDT' | 'USDC';
  image: string;
  category: string;
  badge?: string;
  reviewSummary: ReviewSummary;  // data aggregasi dari DB
  recentReviews?: Review[];      // beberapa review terbaru dari DB (opsional)
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (productId: number) => items.some((item) => item.id === productId),
    [items]
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
