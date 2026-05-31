import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
console.log("Using database at:", dbPath);
const db = new Database(dbPath);

// Initialize table
db.exec(`
  CREATE TABLE IF NOT EXISTS Todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'backlog',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
