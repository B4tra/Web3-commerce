const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Membaca .env
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const dbHost = process.env.DATABASE_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DATABASE_PORT || '3306');
const dbUser = process.env.DATABASE_USER || 'root';
const dbPassword = process.env.DATABASE_PASSWORD || '';
const dbName = process.env.DATABASE_NAME || 'bstore';

async function main() {
  console.log(`Menghubungkan ke MySQL di ${dbHost}:${dbPort}...`);
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  console.log('Menjalankan migrasi kolom `createdAt` ke DATETIME...');
  try {
    // 1. Ubah tipe data kolom createdAt
    await connection.query(`
      ALTER TABLE reviews 
      MODIFY COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✓ Kolom `createdAt` berhasil diubah menjadi DATETIME.');
  } catch (err) {
    console.error('Gagal mengubah kolom `createdAt`:', err.message);
  }

  console.log('Membuat indeks `idx_reviews_product_created`...');
  try {
    // 2. Tambah indeks
    await connection.query(`
      ALTER TABLE reviews 
      ADD INDEX idx_reviews_product_created (productId, createdAt DESC)
    `);
    console.log('✓ Indeks `idx_reviews_product_created` berhasil ditambahkan.');
  } catch (err) {
    if (err.code === 'ER_DUP_KEYNAME') {
      console.log('✓ Indeks sudah ada.');
    } else {
      console.error('Gagal menambahkan indeks:', err.message);
    }
  }

  await connection.end();
  console.log('Migrasi selesai!');
}

main().catch((err) => {
  console.error('Terjadi kesalahan:', err);
  process.exit(1);
});
