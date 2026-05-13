# Raamatukogu App

Simple library + bank database design using MySQL and Node.js.

## Design

- `library_db`
  - `users(id, full_name, email, phone)`
  - `books(id, title, author, isbn, copies_total, copies_available)`
  - `loans(id, user_id, book_id, loan_date, due_date, return_date)`

- `bank_db`
  - `accounts(id, user_id, balance)`
  - `fines(id, user_id, loan_id, amount, days_late, created_at)`

## Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Import the MySQL dump:
   ```bash
   npm run setup
   ```
   If your MySQL server requires a password or custom host, set environment variables before running:
   ```powershell
   $env:DB_HOST='127.0.0.1'
   $env:DB_USER='root'
   $env:DB_PASSWORD='mysql'
   npm run setup
   ```
3. Start the browser server:
   ```bash
   npm start
   ```
4. Open the browser at:
   ```text
   http://localhost:3000
   ```

## Notes

- This project now uses the schema from `Dump20260513.sql`.
- Tables in `library_db` are: `lugejad`, `autorid`, `raamatud`, `raamatu_autor`, `laenutus`.
- Tables in `bank_db` are: `accounts`, `fines`.
- The fine amount is calculated as `1€` per late day.
- `index.js` now uses the dump schema and updates the `bank_db` balances.
