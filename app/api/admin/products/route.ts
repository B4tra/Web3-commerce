import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

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
}

// 1. POST: Menambahkan produk baru
export async function POST(request: Request) {
  try {
    if (!(await validateAdminSession())) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, price, originalPrice, currency, image, category, badge } = body;

    if (!title || !description || price === undefined || !currency || !image || !category) {
      return NextResponse.json(
        { error: 'Data produk tidak lengkap. Judul, deskripsi, harga, tipe crypto, gambar, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const numericPrice = parseFloat(price);
    const numericOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: 'Harga produk harus berupa angka positif yang valid.' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      'INSERT INTO products (title, description, price, originalPrice, currency, image, category, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        description,
        numericPrice,
        numericOriginalPrice,
        currency,
        image,
        category,
        badge || null
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Produk baru berhasil disimpan ke database MySQL',
      productId: result.insertId
    });

  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan produk baru ke database.' },
      { status: 500 }
    );
  }
}

// 2. PUT: Memperbarui produk yang sudah ada
export async function PUT(request: Request) {
  try {
    if (!(await validateAdminSession())) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, description, price, originalPrice, currency, image, category, badge } = body;

    if (!id || !title || !description || price === undefined || !currency || !image || !category) {
      return NextResponse.json(
        { error: 'Data produk tidak lengkap untuk diperbarui. ID, judul, deskripsi, harga, tipe crypto, gambar, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const numericPrice = parseFloat(price);
    const numericOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: 'Harga produk harus berupa angka positif yang valid.' },
        { status: 400 }
      );
    }

    // Cek apakah produk tersebut ada di database
    const existing = await executeQuery<any[]>(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    await executeQuery(
      'UPDATE products SET title = ?, description = ?, price = ?, originalPrice = ?, currency = ?, image = ?, category = ?, badge = ? WHERE id = ?',
      [
        title,
        description,
        numericPrice,
        numericOriginalPrice,
        currency,
        image,
        category,
        badge || null,
        id
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui di database MySQL',
      productId: id
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data produk di database.' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Menghapus produk
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
        { error: 'ID produk wajib disertakan untuk penghapusan.' },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'ID produk tidak valid.' },
        { status: 400 }
      );
    }

    // Cek apakah produk ada di database
    const existing = await executeQuery<any[]>(
      'SELECT id FROM products WHERE id = ?',
      [parsedId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    // Hapus produk (reviews terkait terhapus otomatis karena foreign key ON DELETE CASCADE)
    await executeQuery(
      'DELETE FROM products WHERE id = ?',
      [parsedId]
    );

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus secara permanen dari database MySQL',
      productId: parsedId
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus produk dari database.' },
      { status: 500 }
    );
  }
}
