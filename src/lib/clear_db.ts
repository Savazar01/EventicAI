import Database from "better-sqlite3";
import path from "path";
const db = new Database(path.join(process.cwd(), "prisma", "dev.db"));
db.prepare("DELETE FROM Activity").run();
console.log("Activities cleared.");
