import { NextResponse } from 'next/server';
import { executeQuery } from '../../lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, rating, comment } = body;

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

    // 3. Generate review details
    const id = `rev_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
    const createdAt = new Date().toISOString();

    // 4. Insert review into MySQL
    await executeQuery(
      'INSERT INTO reviews (id, productId, userId, userName, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, productId, userId, userName.trim(), ratingVal, comment.trim(), createdAt]
    );

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        review: {
          id,
          userId,
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
