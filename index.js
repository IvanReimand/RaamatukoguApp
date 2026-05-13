const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const libraryDB = mysql.createPool({
  ...dbConfig,
  database: 'library_db'
});

const bankDB = mysql.createPool({
  ...dbConfig,
  database: 'bank_db'
});

async function calculateFines() {
  const [loans] = await libraryDB.query(`
    SELECT l.laenutus_id AS loan_id,
           l.lugeja_id,
           l.laenutus_kp,
           l.tagastus_tp,
           l.tagastatud_kp,
           CONCAT(u.eesnimi, ' ', u.perenimi) AS full_name
    FROM laenutus l
    JOIN lugejad u ON u.lugeja_id = l.lugeja_id
    WHERE l.tagastatud_kp IS NOT NULL
      AND l.tagastatud_kp > l.tagastus_tp
  `);

  if (loans.length === 0) {
    console.log('No overdue loans found.');
    return;
  }

  for (const loan of loans) {
    const daysLate = Math.ceil(
      (new Date(loan.tagastatud_kp) - new Date(loan.tagastus_tp)) / (1000 * 60 * 60 * 24)
    );

    const fineAmount = daysLate * 1.00;

    const [existing] = await bankDB.query(
      'SELECT id FROM fines WHERE user_id = ? AND amount = ? AND days_late = ? LIMIT 1',
      [loan.lugeja_id, fineAmount, daysLate]
    );

    if (existing.length > 0) {
      console.log(`Loan ${loan.loan_id} already has a matching fine, skipping.`);
      continue;
    }

    const connection = await bankDB.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        'INSERT INTO fines (user_id, amount, days_late) VALUES (?, ?, ?)',
        [loan.lugeja_id, fineAmount, daysLate]
      );
      const [result] = await connection.query(
        'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
        [fineAmount, loan.lugeja_id]
      );

      if (result.affectedRows === 0) {
        console.warn(`Warning: no bank account found for user ${loan.lugeja_id}.`);
      }

      await connection.commit();
      console.log(`User ${loan.lugeja_id} (${loan.full_name}) fined ${fineAmount.toFixed(2)}€ for ${daysLate} late days.`);
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
