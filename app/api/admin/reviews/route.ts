import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// Helper function untuk validasi sesi admin secara aman di sisi server
async function validateAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      return false;
    }

    const sessionSecret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret';
    const decoded = await verifyToken(sessionCookie.value, sessionSecret);

    return decoded && decoded.role === 'admin';
  } catch (e) {
    return false;
  }
async function ensurePurchasesTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS purchases (
        id VARCHAR(50) PRIMARY KEY,
        productId INT NOT NULL,
        walletAddress VARCHAR(100) NOT NULL,
        txHash VARCHAR(100) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_purchase (productId, walletAddress)
      )
    `);
  } catch (e) {
    console.warn('ensurePurchasesTable warning:', e);
  }
}

// GET all reviews with product titles
export async function GET() {
  try {
    if (!(await validateAdminSession())) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    await ensurePurchasesTable();

    const reviews = await executeQuery<any[]>(
      `SELECT r.id, r.productId, r.userId, r.userName, r.rating, r.comment, r.createdAt, p.title as productTitle, pu.txHash 
       FROM reviews r 
       JOIN products p ON r.productId = p.id 
       LEFT JOIN purchases pu ON r.productId = pu.productId AND LOWER(r.userId) = LOWER(pu.walletAddress)
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
    if (!(await validateAdminSession())) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

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
