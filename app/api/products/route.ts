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

    if (dbProducts.length === 0) {
      return NextResponse.json([]);
    }

    const productIds = dbProducts.map((p) => p.id);

    // 2. Fetch review aggregates (total, average) for all products in one query
    const statsList = await executeQuery<any[]>(
      `SELECT productId, COUNT(*) as total, AVG(rating) as average 
       FROM reviews 
       WHERE productId IN (${productIds.map(() => '?').join(',')}) 
       GROUP BY productId`,
      productIds
    );

    // 3. Fetch rating distributions for all products in one query
    const distributionList = await executeQuery<any[]>(
      `SELECT productId, rating, COUNT(*) as count 
       FROM reviews 
       WHERE productId IN (${productIds.map(() => '?').join(',')}) 
       GROUP BY productId, rating`,
      productIds
    );

    // 4. Fetch top 3 recent reviews per product in one query (using Window Functions)
    const recentReviewsList = await executeQuery<any[]>(
      `WITH RankedReviews AS (
         SELECT id, productId, userId, userName, rating, comment, createdAt,
                ROW_NUMBER() OVER (PARTITION BY productId ORDER BY createdAt DESC, id DESC) as rn
         FROM reviews
         WHERE productId IN (${productIds.map(() => '?').join(',')})
       )
       SELECT id, productId, userId, userName, rating, comment, createdAt
       FROM RankedReviews
       WHERE rn <= 3`,
      productIds
    );

    // Create maps for fast lookup
    const statsMap = new Map<number, { total: number; average: number }>();
    statsList.forEach((s) => {
      statsMap.set(s.productId, {
        total: s.total,
        average: parseFloat(Number(s.average || 0).toFixed(1)),
      });
    });

    const distMap = new Map<number, { [key: number]: number }>();
    distributionList.forEach((d) => {
      const pid = d.productId;
      const rating = d.rating as 1 | 2 | 3 | 4 | 5;
      if (!distMap.has(pid)) {
        distMap.set(pid, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
      const dist = distMap.get(pid)!;
      if (rating >= 1 && rating <= 5) {
        dist[rating] = d.count;
      }
    });

    const recentReviewsMap = new Map<number, any[]>();
    recentReviewsList.forEach((r) => {
      const pid = r.productId;
      if (!recentReviewsMap.has(pid)) {
        recentReviewsMap.set(pid, []);
      }
      recentReviewsMap.get(pid)!.push({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      });
    });

    // 5. Map products with aggregated data
    const products: Product[] = dbProducts.map((p) => {
      const stats = statsMap.get(p.id) || { total: 0, average: 0 };
      const ratingDistribution = distMap.get(p.id) || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const recentReviews = recentReviewsMap.get(p.id) || [];

      const reviewSummary: ReviewSummary = {
        averageRating: stats.average,
        totalReviews: stats.total,
        ratingDistribution: ratingDistribution as any,
      };

      return {
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
        recentReviews,
      };
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from database:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
