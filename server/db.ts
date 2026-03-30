import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = process.env.NODE_ENV === 'production'
  ? '/tmp'
  : path.join(__dirname, '..', 'data');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'nexus.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supabase_id TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '',
    discordId TEXT,
    twoFactorEnabled INTEGER DEFAULT 0,
    spotifyAccessToken TEXT,
    spotifyRefreshToken TEXT,
    spotifyTokenExpiry INTEGER,
    avatarUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS two_factor_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    code TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    deviceInfo TEXT,
    ipAddress TEXT,
    lastActive DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const migrations = [
  "ALTER TABLE users ADD COLUMN supabase_id TEXT",
  "ALTER TABLE users ADD COLUMN avatarUrl TEXT",
  "ALTER TABLE users ADD COLUMN discordId TEXT",
];

for (const migration of migrations) {
  try { db.exec(migration); } catch { }
}

export default db;
