const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Baca .env secara manual
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0 && !line.trim().startsWith('#')) {
        const key = line.substring(0, eqIdx).trim();
        const value = line.substring(eqIdx + 1).trim();
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

// Data admin awal — ambil dari env jika ada
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bstore2024';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bstore.id';

async function main() {
  console.log(`\n🔗 Menghubungkan ke MySQL di ${dbHost}:${dbPort}...`);
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });
  console.log(`✅ Terhubung ke database '${dbName}'`);

  // ── Buat tabel admin_users ──────────────────────────────────────
  console.log('\n📋 Membuat tabel `admin_users`...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id            INT           AUTO_INCREMENT PRIMARY KEY,
      username      VARCHAR(50)   NOT NULL UNIQUE,
      email         VARCHAR(150)  NOT NULL UNIQUE,
      password_hash VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash',
      role          VARCHAR(30)   NOT NULL DEFAULT 'admin',
      is_active     TINYINT(1)    NOT NULL DEFAULT 1,
      last_login    DATETIME               DEFAULT NULL,
      created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ Tabel `admin_users` siap.');

  // ── Seed admin pertama jika belum ada ───────────────────────────
  const [existing] = await connection.query(
    'SELECT id, password_hash FROM admin_users WHERE username = ?',
    [ADMIN_USERNAME]
  );

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await connection.query(
      `INSERT INTO admin_users (username, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')`,
      [ADMIN_USERNAME, ADMIN_EMAIL, passwordHash]
    );
    console.log(`\n🔐 Admin pertama berhasil ditambahkan:`);
    console.log(`   Username : ${ADMIN_USERNAME}`);
    console.log(`   Email    : ${ADMIN_EMAIL}`);
    console.log(`   Password : ${ADMIN_PASSWORD} (terenkripsi di DB menggunakan bcrypt)`);
    console.log(`   Hash     : ${passwordHash.slice(0, 40)}...`);
  } else {
    const currentHash = existing[0].password_hash;
    // Migrasi ke bcrypt jika format hash masih menggunakan HMAC lama
    if (!currentHash.startsWith('$2')) {
      console.log(`\n⚠️  Menemukan password hash lama (bukan bcrypt). Mengupdate ke bcrypt...`);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await connection.query(
        'UPDATE admin_users SET password_hash = ? WHERE username = ?',
        [passwordHash, ADMIN_USERNAME]
      );
      console.log('✅ Password hash admin berhasil dimigrasikan ke bcrypt!');
    } else {
      console.log(`\nℹ️  Admin '${ADMIN_USERNAME}' sudah ada dengan password hash bcrypt, dilewati.`);
    }
  }

  console.log('\n✅ Inisialisasi tabel admin_users selesai!');
  await connection.end();
}

main().catch((err) => {
  console.error('\n❌ Terjadi kesalahan:', err.message);
  process.exit(1);
});
