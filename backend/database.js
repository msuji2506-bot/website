
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDirectory = path.join(__dirname, "data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(path.join(dataDirectory, "techspire.db"));

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        college TEXT NOT NULL,
        department TEXT NOT NULL,
        year TEXT NOT NULL,
        event TEXT NOT NULL,
        comments TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;
