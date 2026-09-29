import Database from 'better-sqlite3';
import path from 'path';

// Use a file path for the SQLite database
const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log, timeout: 5000 });
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    target_revenue INTEGER
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    nama TEXT,
    whatsapp TEXT,
    alamat TEXT,
    durasi_langganan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS business_registrations (
    id TEXT PRIMARY KEY,
    nama_bisnis TEXT,
    nama TEXT,
    jabatan TEXT,
    whatsapp TEXT,
    alamat TEXT,
    paket TEXT,
    durasi_langganan TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS minjel_registrations (
    id TEXT PRIMARY KEY,
    nama TEXT,
    whatsapp TEXT,
    alamat TEXT,
    frekuensi_setor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pickup_tasks (
    id TEXT PRIMARY KEY,
    scheduled_date TEXT,
    status TEXT,
    weight_kg REAL,
    report_notes TEXT,
    registrations TEXT -- JSON stringified for simplicity since it's nested
  );

  CREATE TABLE IF NOT EXISTS transactions ( id TEXT PRIMARY KEY, type TEXT, category TEXT, amount REAL, description TEXT, transaction_date TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );

  CREATE TABLE IF NOT EXISTS staff_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default staff if empty
const staffCount = db.prepare('SELECT count(*) as count FROM staff_users').get().count;
if (staffCount === 0) {
  const insert = db.prepare('INSERT INTO staff_users (id, email, password, role) VALUES (?, ?, ?, ?)');
  insert.run('management-123', 'management@tumpuksampah.com', 'Manajemen123!', 'management');
  insert.run('operasional-123', 'operasional@tumpuksampah.com', 'Operasional123!', 'operasional');
}

// Insert default settings if empty
const settingsCount = db.prepare('SELECT count(*) as count FROM settings').get().count;
if (settingsCount === 0) {
  const insert = db.prepare('INSERT INTO settings (id, target_revenue) VALUES (?, ?)');
  insert.run(1, 5000000);
}

export default db;
