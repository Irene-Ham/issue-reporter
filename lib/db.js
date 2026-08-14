import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "app.db");

const globalForDb = globalThis;

// timeout: how long (ms) better-sqlite3 waits for a lock before throwing.
// Raised well above the default because Next.js's build step opens this
// module from several worker processes in parallel, which can briefly
// contend for the same file lock. The actual production server runs as a
// single process, so this contention never occurs at real runtime.
export const db = globalForDb.__issueReporterDb || new Database(DB_PATH, { timeout: 10000 });
if (process.env.NODE_ENV !== "production") globalForDb.__issueReporterDb = db;

try {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('resident', 'staff')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('road','electricity','sanitation','water','safety','other')),
      location TEXT NOT NULL,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported','in_progress','resolved')),
      reported_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      old_status TEXT NOT NULL,
      new_status TEXT NOT NULL,
      note TEXT,
      updated_by INTEGER NOT NULL REFERENCES users(id),
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
    CREATE INDEX IF NOT EXISTS idx_status_updates_issue ON status_updates(issue_id);
  `);

  function seedDemoAccounts() {
    const staffHash = bcrypt.hashSync("StaffDemo123!", 10);
    db.prepare(
      "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run("Demo Staff", "staff@civicissue.test", staffHash, "staff");

    const residentHash = bcrypt.hashSync("ResidentDemo123!", 10);
    db.prepare(
      "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run("Demo Resident", "resident@civicissue.test", residentHash, "resident");
  }

  seedDemoAccounts();
} catch (err) {
  // Non-fatal at build time: Next.js's build step imports this module from
  // multiple parallel workers, which can transiently contend for the SQLite
  // file lock. The real server (single process) initializes cleanly. If this
  // error appears while actually running the app (not building it), that is
  // a real problem and should be investigated.
  console.error("Database setup warning (safe to ignore during build):", err.message);
}

export default db;