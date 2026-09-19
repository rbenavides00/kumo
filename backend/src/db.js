const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = "./storage/database.sqlite";

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Folders
db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    parent_id INTEGER,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES folders(id)
  );
`);

// Prevent duplicate folder names inside the same directory.
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_folders_unique_name
  ON folders (
    owner_id,
    COALESCE(parent_id, 0),
    name
  );
`);

// Files
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    folder_id INTEGER,
    name TEXT NOT NULL,
    extension TEXT NOT NULL DEFAULT '',
    stored_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    is_public INTEGER DEFAULT 0,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (folder_id) REFERENCES folders(id)
  );
`);

// Prevent duplicate file names (name + extension) inside the same directory.
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_files_unique_name
  ON files (
    owner_id,
    COALESCE(folder_id, 0),
    name,
    extension
  );
`);

// Shares
db.exec(`
  CREATE TABLE IF NOT EXISTS shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    shared_with_user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (file_id) REFERENCES files(id),
    FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
    UNIQUE(file_id, shared_with_user_id)
  );
`);

module.exports = db;
