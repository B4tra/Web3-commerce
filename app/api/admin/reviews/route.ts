import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// GET all reviews with product titles
export async function GET() {
  try {
    const reviews = await executeQuery<any[]>(
      `SELECT r.id, r.productId, r.userId, r.userName, r.rating, r.comment, r.createdAt, p.title as productTitle 
       FROM reviews r 
       JOIN products p ON r.productId = p.id 
       ORDER BY r.createdAt DESC`
    );

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data ulasan dari database' },
      { status: 500 }
    );
  }
}

// DELETE a review by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID ulasan wajib disertakan' },
        { status: 400 }
      );
    }

    // Check if review exists
    const existing = await executeQuery<any[]>(
      'SELECT id FROM reviews WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Ulasan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete review
    await executeQuery('DELETE FROM reviews WHERE id = ?', [id]);

    return NextResponse.json({
      message: 'Ulasan berhasil dihapus',
      id,
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus ulasan' },
      { status: 500 }
    );
  }
}
