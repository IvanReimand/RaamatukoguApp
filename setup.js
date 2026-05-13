const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function run() {
  const conn = await mysql.createConnection(config);
  const dumpPath = path.join(__dirname, 'Dump20260513.sql');

  if (!fs.existsSync(dumpPath)) {
    throw new Error(`Dump file not found: ${dumpPath}`);
  }

  const sql = fs.readFileSync(dumpPath, 'utf8');
  await conn.query(sql);

  console.log('Dump imported successfully from Dump20260513.sql.');
  await conn.end();
}

run().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
