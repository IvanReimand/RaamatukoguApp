const mysql = require('mysql2/promise');

const libraryDB = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'library_db'
});

const bankDB = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bank_db'
});

async function calculateFines() {
  const [loans] = await libraryDB.query(`
    SELECT l.id AS loan_id, l.user_id, l.loan_date, l.due_date, l.return_date, u.full_name
    FROM loans l
    JOIN users u ON u.id = l.user_id
    WHERE l.return_date IS NOT NULL
      AND l.return_date > l.due_date
  `);

  for (const loan of loans) {
    const daysLate = Math.ceil(
      (new Date(loan.return_date) - new Date(loan.due_date)) / (1000 * 60 * 60 * 24)
    );

    const fineAmount = daysLate * 1.00;

    const [existing] = await bankDB.query(
      'SELECT id FROM fines WHERE loan_id = ?',
      [loan.loan_id]
    );

    if (existing.length > 0) {
      console.log(`Loan ${loan.loan_id} already fined, skipping.`);
      continue;
    }

    const connection = await bankDB.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        'INSERT INTO fines (user_id, loan_id, amount, days_late) VALUES (?, ?, ?, ?)',
        [loan.user_id, loan.loan_id, fineAmount, daysLate]
      );
      await connection.query(
        'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
        [fineAmount, loan.user_id]
      );
      await connection.commit();
      console.log(`User ${loan.user_id} (${loan.full_name}) fined ${fineAmount.toFixed(2)}€ for ${daysLate} late days.`);
    } catch (err) {
      await connection.rollback();
      console.error(`Failed to apply fine for loan ${loan.loan_id}:`, err.message);
    } finally {
      connection.release();
    }
  }
}

calculateFines()
  .then(() => {
    console.log('Fine calculation finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error while calculating fines:', err.message);
    process.exit(1);
  });
