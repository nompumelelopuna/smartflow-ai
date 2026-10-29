import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export const dataDir = process.env.SMARTFLOW_DATA_DIR ?? path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(process.env.SMARTFLOW_DB ?? path.join(dataDir, 'smartflow.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  contact_email TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  order_date TEXT NOT NULL,
  expected_delivery TEXT,
  actual_delivery TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','shipped','delivered','cancelled')),
  tracking_number TEXT,
  notes TEXT
);
`);

// Lightweight migrations so a v1 database keeps working.
function addColumn(table: string, col: string, def: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some(c => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}
addColumn('orders', 'business_unit', 'TEXT');
addColumn('orders', 'placed_at', 'TEXT');
addColumn('orders', 'pod_received', 'INTEGER NOT NULL DEFAULT 0');
addColumn('suppliers', 'phone', 'TEXT');
addColumn('suppliers', 'address', 'TEXT');
db.exec(`UPDATE orders SET placed_at = order_date WHERE placed_at IS NULL AND status IN ('shipped','delivered')`);
