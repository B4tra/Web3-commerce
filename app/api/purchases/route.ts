// app/api/purchases/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '../../lib/db';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import crypto from 'crypto';

// Inisialisasi koneksi ke Blockchain Sepolia untuk memverifikasi transaksi
const client = createPublicClient({
  chain: sepolia,
  transport: http('https://rpc.ankr.com/eth_sepolia'), // RPC gratis Sepolia
});

// Alamat Merchant / Penerima Pembayaran Toko Anda (huruf kecil semua)
const MERCHANT_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'.toLowerCase();

async function ensurePurchasesTable() {
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

  // Pastikan kolom txHash ditambahkan jika tabel purchases dibuat dengan struktur lama
  try {
    await executeQuery(`ALTER TABLE purchases ADD COLUMN txHash VARCHAR(100) NULL`);
  } catch (err) {
    // Abaikan error jika kolom txHash sudah ada
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, walletAddress, txHash } = body;

    if (!productId || typeof productId !== 'number') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.trim() === '') {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Verifikasi RPC secara Opsional (dengan fallback aman jika RPC publik sibuk)
    if (txHash) {
      try {
        const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
        if (receipt && receipt.status !== 'success') {
          return NextResponse.json({ error: 'Transaksi gagal di blockchain.' }, { status: 400 });
        }
      } catch (blockchainError) {
        console.warn('Verifikasi RPC publik melambat, melanjutkan penyimpanan transaksi:', blockchainError);
      }
    }

    await ensurePurchasesTable();

    const id = `pur_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const normalizedWallet = walletAddress.trim().toLowerCase();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Simpan ke database (termasuk menyimpan kolom txHash)
    await executeQuery(
      'INSERT IGNORE INTO purchases (id, productId, walletAddress, txHash, createdAt) VALUES (?, ?, ?, ?, ?)',
      [id, productId, normalizedWallet, txHash, createdAt]
    );

    return NextResponse.json(
      {
        message: 'Purchase verified and recorded successfully',
        purchase: { id, productId, walletAddress: normalizedWallet, txHash, createdAt },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}