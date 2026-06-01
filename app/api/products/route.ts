import { NextResponse } from 'next/server';
import { executeQuery } from '../../lib/db';
import { Product, Review, ReviewSummary } from '../../context/CartContext';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    // 1. Fetch all products
    const dbProducts = await executeQuery<any[]>(
      'SELECT id, title, description, price, originalPrice, currency, image, category, badge FROM products ORDER BY id ASC'
    );

    const products: Product[] = [];

    // 2. For each product, calculate reviews aggregation and fetch recent reviews
    for (const p of dbProducts) {
      // Get review stats
      const stats = await executeQuery<any[]>(
        'SELECT COUNT(*) as total, AVG(rating) as average FROM reviews WHERE productId = ?',
        [p.id]
      );
      
      const totalReviews = stats[0]?.total || 0;
      const averageRating = parseFloat(Number(stats[0]?.average || 0).toFixed(1));

      // Get rating distribution
      const distribution = await executeQuery<any[]>(
        'SELECT rating, COUNT(*) as count FROM reviews WHERE productId = ? GROUP BY rating',
        [p.id]
      );

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      distribution.forEach((d) => {
        const rating = d.rating as 1 | 2 | 3 | 4 | 5;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating] = d.count;
        }
      });

      // Get 3 recent reviews (prefer user reviews over mock ones)
      // Sorting: we can show custom reviews first, or simply order by createdAt desc
      // Since mock reviews are prefixed with 'mock_', we can order by id (recent ones are 'rX' or user-submitted UUIDs) or createdAt desc
      const recentReviews = await executeQuery<any[]>(
        'SELECT id, userId, userName, rating, comment, createdAt FROM reviews WHERE productId = ? ORDER BY createdAt DESC, id DESC LIMIT 3',
        [p.id]
      );

      const reviewSummary: ReviewSummary = {
        averageRating,
        totalReviews,
        ratingDistribution,
      };

      const mappedProduct: Product = {
        id: p.id,
        title: p.title,
        description: p.description,
        price: parseFloat(p.price),
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : undefined,
        currency: p.currency,
        image: p.image,
        category: p.category,
        badge: p.badge || undefined,
        reviewSummary,
        recentReviews: recentReviews.map((r) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      };

      products.push(mappedProduct);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
