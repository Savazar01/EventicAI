import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "prisma", "dev.db"));

console.log("Migrating database...");

// Helper to safely add column
function addColumn(table: string, column: string, type: string) {
    try {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
        console.log(`Added column ${column} to ${table}`);
    } catch (e) {
        console.log(`Column ${column} might already exist in ${table}`);
    }
}

// 1. Add missing Activity columns
addColumn("Activity", "planned_start", "DATETIME");
addColumn("Activity", "planned_end", "DATETIME");
addColumn("Activity", "actual_end", "DATETIME");
addColumn("Activity", "assigned_owner_id", "INTEGER");

// 2. Create TeamMember table
db.exec(`
  CREATE TABLE IF NOT EXISTS TeamMember (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  );
`);

console.log("Migration complete.");
