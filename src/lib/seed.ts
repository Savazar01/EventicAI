import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "prisma", "dev.db"));

function seed(table: string, column: string, value: string, extraColumns: Record<string, string | number> = {}) {
  const existing = db.prepare(`SELECT rowid FROM ${table} WHERE ${column} = ?`).get(value) as { rowid: number } | undefined;
  if (existing) return existing.rowid;

  const cols = [column, ...Object.keys(extraColumns)];
  const vals = [value, ...Object.values(extraColumns)];
  const placeholders = cols.map(() => "?").join(", ");
  const info = db.prepare(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`).run(...vals);
  return Number(info.lastInsertRowid);
}

seed("Event", "title", "Grand Wedding", {
  description: "A spectacular three-day wedding celebration",
  start_date: "2026-06-01",
  end_date: "2026-06-03",
});

const eventId = seed("Event", "title", "Grand Wedding");

const activityId = seed("Activity", "title", "Catering Setup", {
  event_id: eventId,
  status: "plan-in-progress",
  start_date: "2026-06-01",
  end_date: "2026-06-01",
});

seed("Activity", "title", "Select Menu", {
  event_id: eventId,
  parent_activity_id: activityId,
  status: "backlog",
  start_date: "2026-06-01",
  end_date: "2026-06-01",
});

const vendorId = seed("Vendor", "name", "Delicious Bites", { service_type: "Catering" });

db.prepare("INSERT OR IGNORE INTO ActivityVendor (activity_id, vendor_id) VALUES (?, ?)").run(activityId, vendorId);

const guestId = seed("Guest", "email", "john@example.com", { name: "John Doe" });

db.prepare("INSERT OR IGNORE INTO ActivityGuest (activity_id, guest_id) VALUES (?, ?)").run(activityId, guestId);

console.log("Seed completed successfully.");
