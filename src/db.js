import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../wandersplit.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS destination_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    destination TEXT NOT NULL,
    member_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    content_json TEXT NOT NULL,
    generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    paid_by_member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by_member_id) REFERENCES members (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expense_splits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    share_amount REAL NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    from_member INTEGER NOT NULL,
    to_member INTEGER NOT NULL,
    amount REAL NOT NULL,
    is_settled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE,
    FOREIGN KEY (from_member) REFERENCES members (id) ON DELETE CASCADE,
    FOREIGN KEY (to_member) REFERENCES members (id) ON DELETE CASCADE
  );
`);

const tripCount = db.prepare('SELECT COUNT(*) AS count FROM trips').get().count;

if (tripCount === 0) {
  const insertTrip = db.prepare(`
    INSERT INTO trips (name, destination, start_date, end_date)
    VALUES (?, ?, ?, ?)
  `);
  const insertMember = db.prepare('INSERT INTO members (trip_id, name, email) VALUES (?, ?, ?)');
  const insertExpense = db.prepare(`
    INSERT INTO expenses (trip_id, title, category, paid_by_member_id, amount, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertSplit = db.prepare(`
    INSERT INTO expense_splits (expense_id, member_id, share_amount)
    VALUES (?, ?, ?)
  `);

  const seedDemoTrip = db.transaction(() => {
    const tripResult = insertTrip.run('Goa Escape', 'Goa', '2026-04-10', '2026-04-13');
    const tripId = Number(tripResult.lastInsertRowid);

    const memberIds = {
      Rahul: Number(insertMember.run(tripId, 'Rahul', 'rahul@example.com').lastInsertRowid),
      Priya: Number(insertMember.run(tripId, 'Priya', 'priya@example.com').lastInsertRowid),
      Aman: Number(insertMember.run(tripId, 'Aman', 'aman@example.com').lastInsertRowid),
      Neha: Number(insertMember.run(tripId, 'Neha', 'neha@example.com').lastInsertRowid)
    };

    const expenses = [
      {
        title: 'Beachfront villa',
        category: 'Stay',
        paidBy: memberIds.Priya,
        amount: 8800,
        createdAt: '2026-04-10T09:00:00.000Z'
      },
      {
        title: 'Scooter rentals',
        category: 'Transport',
        paidBy: memberIds.Rahul,
        amount: 2200,
        createdAt: '2026-04-10T13:00:00.000Z'
      },
      {
        title: 'Seafood dinner',
        category: 'Food',
        paidBy: memberIds.Priya,
        amount: 3600,
        createdAt: '2026-04-10T20:00:00.000Z'
      },
      {
        title: 'Sunset cruise',
        category: 'Activities',
        paidBy: memberIds.Aman,
        amount: 4800,
        createdAt: '2026-04-11T16:00:00.000Z'
      },
      {
        title: 'Cafe brunch',
        category: 'Food',
        paidBy: memberIds.Neha,
        amount: 1600,
        createdAt: '2026-04-12T10:30:00.000Z'
      }
    ];

    const splitMembers = Object.values(memberIds);

    for (const expense of expenses) {
      const expenseId = Number(
        insertExpense.run(tripId, expense.title, expense.category, expense.paidBy, expense.amount, expense.createdAt)
          .lastInsertRowid
      );
      const shareAmount = Number((expense.amount / splitMembers.length).toFixed(2));

      for (const memberId of splitMembers) {
        insertSplit.run(expenseId, memberId, shareAmount);
      }
    }
  });

  seedDemoTrip();
}

export default db;
