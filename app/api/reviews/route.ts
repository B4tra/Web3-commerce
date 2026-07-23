import { NextResponse } from 'next/server';
import { executeQuery } from '../../lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, rating, comment, walletAddress } = body;

    // 1. Basic validation
    if (!productId || typeof productId !== 'number') {
      return NextResponse.json(
        { error: 'Product ID is required and must be a number' },
        { status: 400 }
      );
    }

    if (!userName || typeof userName !== 'string' || userName.trim() === '') {
      return NextResponse.json(
        { error: 'User name is required' },
        { status: 400 }
      );
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    if (!walletAddress || typeof walletAddress !== 'string' || !walletAddress.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Silakan hubungkan dompet (wallet) Anda terlebih dahulu untuk mengirimkan ulasan.' },
        { status: 400 }
      );
    }

    // 2. Check if product exists
    const products = await executeQuery<any[]>(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const normalizedWallet = walletAddress.trim().toLowerCase();

    // 3. Ensure purchases table exists
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS purchases (
        id VARCHAR(50) PRIMARY KEY,
        productId INT NOT NULL,
        walletAddress VARCHAR(100) NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_purchase (productId, walletAddress)
      )
    `);

    // 4. Verify user has purchased the product
    const purchases = await executeQuery<any[]>(
      'SELECT id FROM purchases WHERE productId = ? AND walletAddress = ?',
      [productId, normalizedWallet]
    );

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'Anda hanya dapat memberikan ulasan setelah melakukan pembelian produk ini.' },
        { status: 403 }
      );
    }

    // 5. Verify user hasn't already submitted a review
    const existingReviews = await executeQuery<any[]>(
      'SELECT id FROM reviews WHERE productId = ? AND userId = ?',
      [productId, normalizedWallet]
    );

    if (existingReviews.length > 0) {
      return NextResponse.json(
        { error: 'Anda sudah mengirimkan ulasan untuk produk ini. Setiap pembelian hanya diperbolehkan menulis 1 ulasan.' },
        { status: 400 }
      );
    }

    // 6. Generate review details
    const id = `rev_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // 7. Insert review into MySQL, using normalizedWallet as userId
    await executeQuery(
      'INSERT INTO reviews (id, productId, userId, userName, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, productId, normalizedWallet, userName.trim(), ratingVal, comment.trim(), createdAt]
    );

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        review: {
          id,
          userId: normalizedWallet,
          userName: userName.trim(),
          rating: ratingVal,
          comment: comment.trim(),
          createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding review to database:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
