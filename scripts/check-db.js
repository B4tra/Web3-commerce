const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

async function main() {
  const dbHost = process.env.DATABASE_HOST || '127.0.0.1';
  const dbPort = parseInt(process.env.DATABASE_PORT || '3306');
  const dbUser = process.env.DATABASE_USER || 'root';
  const dbPassword = process.env.DATABASE_PASSWORD || '';
  const dbName = process.env.DATABASE_NAME || 'bstore';

  console.log(`Connecting to database ${dbHost}:${dbPort}...`);
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  });

  console.log('Connected!');
  
  // Show table schema
  const [columns] = await connection.query('DESCRIBE products');
  console.log('Products columns:', columns);

  // Check if auto_increment is already present
  const idCol = columns.find(col => col.Field === 'id');
  if (idCol && idCol.Extra !== 'auto_increment') {
    console.log('Modifying products.id to AUTO_INCREMENT...');
    
    // Disable foreign key checks to avoid constraints issues, modify column, and re-enable
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('ALTER TABLE products MODIFY COLUMN id INT AUTO_INCREMENT');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('products.id modified successfully!');
  } else {
    console.log('products.id is already AUTO_INCREMENT.');
  }

  await connection.end();
}

main().catch(console.error);
