import mysql from 'mysql2/promise';

// Reuse database connection pool in Next.js development mode
const globalForDb = globalThis as unknown as {
  connPool: mysql.Pool | undefined;
};

const pool =
  globalForDb.connPool ||
  mysql.createPool({
    host: process.env.DATABASE_HOST || process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '3306'),
    user: process.env.DATABASE_USER || process.env.DB_USER || 'root',
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.DATABASE_NAME || process.env.DB_NAME || 'my_ebook_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.connPool = pool;
}

export async function executeQuery<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;
