const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mysql',
};

const libraryDB = mysql.createPool({ ...dbConfig, database: 'library_db' });
const bankDB = mysql.createPool({ ...dbConfig, database: 'bank_db' });

function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function respondJSON(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function respondFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function findOrCreateUser(firstName, lastName) {
  const [rows] = await libraryDB.query(
    'SELECT * FROM lugejad WHERE eesnimi = ? AND perenimi = ? LIMIT 1',
    [firstName, lastName]
  );
  if (rows.length) return rows[0];

  const [result] = await libraryDB.query(
    'INSERT INTO lugejad (eesnimi, perenimi, registreeritud) VALUES (?, ?, ?)',
    [firstName, lastName, formatDate(new Date())]
  );
  return { lugeja_id: result.insertId, eesnimi: firstName, perenimi: lastName };
}

async function getUserByName(firstName, lastName) {
  const [rows] = await libraryDB.query(
    'SELECT * FROM lugejad WHERE eesnimi = ? AND perenimi = ? LIMIT 1',
    [firstName, lastName]
  );
  return rows[0] || null;
}

async function handleBooks() {
  const [rows] = await libraryDB.query(
    'SELECT raamatu_id, pealkiri, aasta, keel, eksemplare, saadaval FROM raamatud ORDER BY raamatu_id'
  );
  return rows;
}

async function handleUserLoans(firstName, lastName) {
  const user = await getUserByName(firstName, lastName);
  if (!user) return [];

  const [rows] = await libraryDB.query(
    `SELECT l.laenutus_id AS loan_id,
            l.raamatu_id,
            r.pealkiri,
            l.laenutus_kp AS loan_date,
            l.tagastus_tp AS due_date
     FROM laenutus l
     JOIN raamatud r ON r.raamatu_id = l.raamatu_id
     WHERE l.lugeja_id = ?
       AND l.tagastatud_kp IS NULL
     ORDER BY l.laenutus_id`,
    [user.lugeja_id]
  );
  return rows;
}

async function handleBorrow(body) {
  const { firstName, lastName, bookId } = body;
  if (!firstName || !lastName || !bookId) {
    throw new Error('Palun sisesta eesnimi, perekonnanimi ja raamatu ID.');
  }

  const user = await findOrCreateUser(firstName.trim(), lastName.trim());
  const loanDate = new Date();
  const dueDate = new Date(loanDate);
  dueDate.setDate(dueDate.getDate() + 14);

  const connection = await libraryDB.getConnection();
  try {
    await connection.beginTransaction();

    const [bookRows] = await connection.query(
      'SELECT saadaval FROM raamatud WHERE raamatu_id = ? FOR UPDATE',
      [bookId]
    );
    if (!bookRows.length) {
      throw new Error('Valitud raamatut ei leitud.');
    }
    if (bookRows[0].saadaval < 1) {
      throw new Error('Raamatut ei ole praegu saadaval.');
    }

    await connection.query(
      'UPDATE raamatud SET saadaval = saadaval - 1 WHERE raamatu_id = ?',
      [bookId]
    );
    const [result] = await connection.query(
      'INSERT INTO laenutus (lugeja_id, raamatu_id, laenutus_kp, tagastus_tp) VALUES (?, ?, ?, ?)',
      [user.lugeja_id, bookId, formatDate(loanDate), formatDate(dueDate)]
    );

    await connection.commit();
    return {
      loanId: result.insertId,
      message: `Raamat võetud laenule. Tähtaeg on ${formatDate(dueDate)}.`
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function handleReturn(body) {
  const { loanId } = body;
  if (!loanId) {
    throw new Error('Palun sisesta laenutuse ID.');
  }

  const [loanRows] = await libraryDB.query(
    'SELECT laenutus_id, lugeja_id, raamatu_id, tagastus_tp FROM laenutus WHERE laenutus_id = ? AND tagastatud_kp IS NULL',
    [loanId]
  );
  if (!loanRows.length) {
    throw new Error('Laenutust ei leitud või see on juba tagastatud.');
  }

  const loan = loanRows[0];
  const returnDate = new Date();
  const dueDate = new Date(loan.tagastus_tp);
  const daysLate = Math.max(0, Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)));

  const loanConnection = await libraryDB.getConnection();
  try {
    await loanConnection.beginTransaction();

    await loanConnection.query(
      'UPDATE laenutus SET tagastatud_kp = ? WHERE laenutus_id = ?',
      [formatDate(returnDate), loanId]
    );
    await loanConnection.query(
      'UPDATE raamatud SET saadaval = saadaval + 1 WHERE raamatu_id = ?',
      [loan.raamatu_id]
    );

    await loanConnection.commit();
  } catch (err) {
    await loanConnection.rollback();
    throw err;
  } finally {
    loanConnection.release();
  }

  let fine = 0;
  if (daysLate > 0) {
    fine = daysLate;
    const accConnection = await bankDB.getConnection();
    try {
      await accConnection.beginTransaction();

      const [accountRows] = await accConnection.query(
        'SELECT * FROM accounts WHERE user_id = ?',
        [loan.lugeja_id]
      );

      if (accountRows.length === 0) {
        await accConnection.query(
          'INSERT INTO accounts (user_id, balance) VALUES (?, ?)',
          [loan.lugeja_id, -fine]
        );
      } else {
        await accConnection.query(
          'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
          [fine, loan.lugeja_id]
        );
      }

      await accConnection.query(
        'INSERT INTO fines (user_id, amount, days_late) VALUES (?, ?, ?)',
        [loan.lugeja_id, fine, daysLate]
      );

      await accConnection.commit();
    } catch (err) {
      await accConnection.rollback();
      throw err;
    } finally {
      accConnection.release();
    }
  }

  return {
    fine,
    daysLate,
    message: daysLate > 0
      ? `Tagastatud hiljem ${daysLate} päeva. Trahv ${fine}€.`
      : 'Raamat tagastatud õigeks ajaks. Trahvi ei ole.'
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    respondFile(res, path.join(__dirname, 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/books') {
    try {
      const books = await handleBooks();
      respondJSON(res, 200, { books });
    } catch (err) {
      respondJSON(res, 500, { error: err.message });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/user-loans') {
    const firstName = url.searchParams.get('firstName');
    const lastName = url.searchParams.get('lastName');
    if (!firstName || !lastName) {
      respondJSON(res, 400, { error: 'Palun lisa ees- ja perekonnanimi.' });
      return;
    }
    try {
      const loans = await handleUserLoans(firstName.trim(), lastName.trim());
      respondJSON(res, 200, { loans });
    } catch (err) {
      respondJSON(res, 500, { error: err.message });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/borrow') {
    try {
      const body = await parseJSON(req);
      const result = await handleBorrow(body);
      respondJSON(res, 200, result);
    } catch (err) {
      respondJSON(res, 400, { error: err.message });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/return') {
    try {
      const body = await parseJSON(req);
      const result = await handleReturn(body);
      respondJSON(res, 200, result);
    } catch (err) {
      respondJSON(res, 400, { error: err.message });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    respondJSON(res, 200, { status: 'ok' });
    return;
  }

  respondJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
