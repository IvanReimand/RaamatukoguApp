const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: ''
};

async function run() {
  const conn = await mysql.createConnection(config);

  await conn.query('CREATE DATABASE IF NOT EXISTS library_db');
  await conn.query('CREATE DATABASE IF NOT EXISTS bank_db');

  await conn.query('USE library_db');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(30)
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      author VARCHAR(150),
      isbn VARCHAR(50),
      copies_total INT NOT NULL DEFAULT 1,
      copies_available INT NOT NULL DEFAULT 1
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS loans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      book_id INT NOT NULL,
      loan_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `);

  await conn.query('USE bank_db');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      balance DECIMAL(10,2) NOT NULL DEFAULT 0.00
    )
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS fines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      loan_id INT,
      amount DECIMAL(10,2) NOT NULL,
      days_late INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query('USE library_db');
  await conn.query('DELETE FROM loans');
  await conn.query('DELETE FROM books');
  await conn.query('DELETE FROM users');
  await conn.query(`INSERT INTO users (full_name, email, phone) VALUES 
    (?, ?, ?),
    (?, ?, ?)`,
    ['Mati Mees', 'mati@example.com', '+372555001', 'Kati Naine', 'kati@example.com', '+372555002']
  );
  await conn.query(`INSERT INTO books (title, author, isbn, copies_total, copies_available) VALUES 
    (?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?)`,
    ['Eesti ajalugu', 'Peeter', '978-994900001', 3, 2, 'JavaScript algajatele', 'Ülo', '978-994900002', 5, 5]
  );
  await conn.query(`INSERT INTO loans (user_id, book_id, loan_date, due_date, return_date) VALUES 
    (?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?)`,
    [1, 1, '2026-04-01', '2026-04-15', '2026-04-20', 2, 2, '2026-04-05', '2026-04-19', '2026-04-22']
  );

  await conn.query('USE bank_db');
  await conn.query('DELETE FROM fines');
  await conn.query('DELETE FROM accounts');
  await conn.query('INSERT INTO accounts (user_id, balance) VALUES (?, ?), (?, ?)', [1, 50.00, 2, 30.00]);

  console.log('Setup completed: library_db and bank_db created with sample data.');
  await conn.end();
}

run().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
