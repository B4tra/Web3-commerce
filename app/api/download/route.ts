import { NextResponse } from 'next/server';
import { executeQuery } from '../../lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const walletAddress = searchParams.get('walletAddress');

    if (!productId || !walletAddress) {
      return NextResponse.json(
        { error: 'Product ID dan wallet address wajib diisi.' },
        { status: 400 }
      );
    }

    const normalizedWallet = walletAddress.trim().toLowerCase();

    // 1. Verifikasi ke database MySQL bahwa dompet ini telah membeli produk tersebut
    const purchases = await executeQuery<any[]>(
      'SELECT id FROM purchases WHERE productId = ? AND LOWER(walletAddress) = ?',
      [parseInt(productId), normalizedWallet]
    );

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Dompet Anda belum memiliki riwayat pembelian produk ini.' },
        { status: 403 }
      );
    }

    // 2. Pemetaan nama file e-book berdasarkan productId
    const sampleFiles: Record<number, string> = {
      1: 'mastering-web3.pdf',
      2: 'uiux-handbook.pdf',
      3: 'social-media-template.zip',
      4: 'crypto-trading.pdf',
    };

    const fileName = sampleFiles[parseInt(productId)] || `ebook-product-${productId}.pdf`;
    const filePath = path.join(process.cwd(), 'ebooks-secure', fileName);

    // Jika file fisik belum ada di folder ebooks-secure, buatkan file sampel otomatis
    if (!fs.existsSync(filePath)) {
      const secureDir = path.dirname(filePath);
      if (!fs.existsSync(secureDir)) {
        fs.mkdirSync(secureDir, { recursive: true });
      }
      fs.writeFileSync(
        filePath,
        `%PDF-1.4\n1 0 obj\n<< /Title (E-Book Sampel Product ${productId}) /Creator (My E-Book Store) >>\nendobj\n`
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    // 3. Stream file langsung ke pembeli sebagai lampiran unduhan
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error saat memproses unduhan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
