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
2. Initialize sample data:
   ```bash
   node setup.js
   ```
3. Calculate overdue fines:
   ```bash
   node index.js
   ```

## Notes

- The fine amount is calculated as `1€` per late day.
- The `setup.js` script creates sample users, books, loans, and bank accounts.
- `index.html` is a simple static page with instructions.
