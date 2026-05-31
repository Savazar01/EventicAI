import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const db = new Database(path.join(process.cwd(), "prisma", "dev.db"));

console.log("Migrating database...");

// Create tables if they don't already exist (non-destructive)
db.exec(`
  CREATE TABLE IF NOT EXISTS Event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    location TEXT,
    contact TEXT
  );

  CREATE TABLE IF NOT EXISTS Activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    parent_activity_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog',
    completed INTEGER NOT NULL DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    location TEXT,
    planned_start DATETIME,
    planned_end DATETIME,
    actual_end DATETIME,
    assigned_owner_id INTEGER,
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (parent_activity_id) REFERENCES Activity(id)
  );

  CREATE TABLE IF NOT EXISTS Guest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    activity_id INTEGER,
    name TEXT NOT NULL,
    whatsapp TEXT,
    guest_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Attending',
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (activity_id) REFERENCES Activity(id)
  );

  CREATE TABLE IF NOT EXISTS Vendor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    business_name TEXT NOT NULL,
    whatsapp TEXT,
    services TEXT,
    FOREIGN KEY (activity_id) REFERENCES Activity(id)
  );

  CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS EventLocation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (event_id) REFERENCES Event(id)
  );

  CREATE TABLE IF NOT EXISTS TeamMember (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    whatsapp TEXT
  );

  CREATE TABLE IF NOT EXISTS BusinessContact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL DEFAULT '',
    whatsapp TEXT DEFAULT '',
    designation TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS PaymentInfo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name TEXT DEFAULT '',
    account_number TEXT DEFAULT '',
    ifsc_code TEXT DEFAULT '',
    qr_code TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS BusinessDetail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT NOT NULL DEFAULT '',
    address TEXT DEFAULT '',
    street TEXT DEFAULT '',
    location TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    country TEXT DEFAULT '',
    email TEXT DEFAULT '',
    whatsapp TEXT DEFAULT '',
    website TEXT DEFAULT '',
    youtube TEXT DEFAULT '',
    linkedin TEXT DEFAULT '',
    facebook TEXT DEFAULT '',
    tiktok TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    zip_code TEXT DEFAULT '',
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'English'
  );

  CREATE TABLE IF NOT EXISTS ColumnConfig (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    status_id TEXT NOT NULL,
    label TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#94a3b8',
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (event_id) REFERENCES Event(id)
  );

  CREATE TABLE IF NOT EXISTS Session (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES TeamMember(id)
  );
`);

// Seed default settings
const defaults: [string, string][] = [
  ['appTitle', 'Savazar Agentic Events & Projects Platform'],
  ['logoUrl', '/logo.png'],
  ['brandColor', '#6771ab'],
  ['llmEnabledOpenAI', ''],
  ['llmEnabledAnthropic', ''],
  ['llmEnabledOpenRouter', ''],
  ['llmEnabledGemini', 'true'],
  ['llmEnabledGroq', ''],
  ['llmEnabledOllama', ''],
  ['llmEnabledLMStudio', ''],
  // ---- Appearance Colors ----
  ['colorPrimary', '#6771ab'],
  ['colorPrimaryLight', '#8b93c5'],
  ['colorPrimaryDark', '#4a5280'],
  ['colorPrimaryContainer', '#eef0f7'],
  ['colorOnPrimaryContainer', '#2d336b'],
  ['colorSecondary', '#8b93c5'],
  ['colorSecondaryContainer', '#f0f1fa'],
  ['colorOnSecondaryContainer', '#3d4580'],
  ['colorTertiary', '#c484b0'],
  ['colorTertiaryContainer', '#fce4f0'],
  ['colorAccent', '#ffcc00'],
  ['colorCream', '#fefce8'],
  ['colorSuccess', '#22c55e'],
  ['colorWarning', '#f59e0b'],
  ['colorError', '#ef4444'],
  ['colorBackground', '#f8fafc'],
  ['colorForeground', '#1e293b'],
  ['colorCard', '#ffffff'],
  ['colorCardForeground', '#1e293b'],
  ['colorBorder', '#e2e8f0'],
  ['colorOutline', '#cbd5e1'],
  ['colorInput', '#e2e8f0'],
  ['colorRing', '#6771ab'],
  // ---- Font & Typography ----
  ['fontFamily', 'Inter'],
  ['fsPageTitle', '1.5rem'],
  ['fsSectionHeading', '1.125rem'],
  ['fsCardTitle', '0.875rem'],
  ['fsSidebarItem', '0.75rem'],
  ['fsFormLabel', '0.75rem'],
  ['fsBodyText', '0.75rem'],
  ['fsStatValue', '0.75rem'],
  ['fsButtonText', '0.875rem'],
  // ---- Button Labels ----
  ['btnAddActivity', 'Add Activity'],
  ['btnMarkComplete', 'Mark Complete'],
  ['btnSave', 'Save'],
  ['btnDelete', 'Delete'],
  ['btnCloneEvent', 'Copy'],
  ['btnAddGuest', 'Add Guest'],
  ['btnAddVendor', 'Add Vendor'],
  ['btnCancel', 'Cancel'],
  ['btnEdit', 'Edit'],
  ['btnCreateEvent', 'Create Event/Project'],
  ['btnEditEvent', 'Edit Event/Project'],
  ['btnViewBoard', 'View Board'],
  // ---- AI Model Names ----
  ['llmModelOpenAI', 'GPT-4o'],
  ['llmModelAnthropic', 'Claude 3.5 Sonnet'],
  ['llmModelOpenRouter', ''],
  ['llmModelGemini', 'Gemini 1.5 Pro'],
  ['llmModelGroq', 'Llama 3 70B'],
  ['llmModelOllama', 'llama2'],
  ['llmModelLMStudio', ''],
  // ---- AI API Keys ----
  ['llmKeyOpenAI', ''],
  ['llmKeyAnthropic', ''],
  ['llmKeyOpenRouter', ''],
  ['llmKeyGemini', ''],
  ['llmKeyGroq', ''],
  ['llmKeyOllama', ''],
  ['llmKeyLMStudio', ''],
];
for (const [k, v] of defaults) {
  db.prepare("INSERT OR IGNORE INTO Settings (key, value) VALUES (?, ?)").run(k, v);
}

// Non-destructive column additions for databases created by older schema versions
function addColumnIfMissing(table: string, column: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info('${table}')`).all() as any[];
  if (!cols.some((c: any) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    console.log(`  Added missing column ${table}.${column}`);
  }
}

addColumnIfMissing('Guest', 'event_id', 'event_id INTEGER REFERENCES Event(id)');
addColumnIfMissing('Guest', 'guest_count', 'guest_count INTEGER DEFAULT 1');
addColumnIfMissing('Guest', 'status', 'status TEXT DEFAULT \'Attending\'');
addColumnIfMissing('Activity', 'planned_start', 'planned_start DATETIME');
addColumnIfMissing('Activity', 'planned_end', 'planned_end DATETIME');
addColumnIfMissing('Activity', 'actual_end', 'actual_end DATETIME');
addColumnIfMissing('Activity', 'assigned_owner_id', 'assigned_owner_id INTEGER');
addColumnIfMissing('Activity', 'location', 'location TEXT');
addColumnIfMissing('Activity', 'progress_status', "progress_status TEXT DEFAULT NULL");
addColumnIfMissing('Activity', 'completion_note', "completion_note TEXT DEFAULT NULL");
addColumnIfMissing('Activity', 'completed_at', "completed_at DATETIME DEFAULT NULL");
addColumnIfMissing('Activity', 'planned_effort_hours', "planned_effort_hours REAL DEFAULT NULL");
addColumnIfMissing('Activity', 'actual_effort_hours', "actual_effort_hours REAL DEFAULT NULL");
addColumnIfMissing('Activity', 'planned_budget', "planned_budget REAL DEFAULT NULL");
addColumnIfMissing('Activity', 'actual_budget', "actual_budget REAL DEFAULT NULL");
addColumnIfMissing('Activity', 'currency', "currency TEXT DEFAULT NULL");
addColumnIfMissing('Vendor', 'services', 'services TEXT');
addColumnIfMissing('TeamMember', 'whatsapp', 'whatsapp TEXT');
addColumnIfMissing('TeamMember', 'email', "email TEXT DEFAULT NULL");
addColumnIfMissing('TeamMember', 'role', "role TEXT DEFAULT 'event_user'");
addColumnIfMissing('TeamMember', 'event_ids', "event_ids TEXT DEFAULT '[]'");
addColumnIfMissing('TeamMember', 'first_name', "first_name TEXT DEFAULT ''");
addColumnIfMissing('TeamMember', 'last_name', "last_name TEXT DEFAULT ''");
addColumnIfMissing('Event', 'payment_bank_name', "payment_bank_name TEXT DEFAULT ''");
addColumnIfMissing('Event', 'payment_account_number', "payment_account_number TEXT DEFAULT ''");
addColumnIfMissing('Event', 'payment_ifsc_code', "payment_ifsc_code TEXT DEFAULT ''");
addColumnIfMissing('Event', 'payment_qr_code', "payment_qr_code TEXT DEFAULT ''");
addColumnIfMissing('Event', 'event_budget', "event_budget REAL DEFAULT NULL");
addColumnIfMissing('Event', 'event_effort_hours', "event_effort_hours REAL DEFAULT NULL");
addColumnIfMissing('Event', 'event_owner_id', "event_owner_id INTEGER DEFAULT NULL REFERENCES TeamMember(id)");
addColumnIfMissing('EventLocation', 'city', "city TEXT DEFAULT ''");
addColumnIfMissing('EventLocation', 'state', "state TEXT DEFAULT ''");
addColumnIfMissing('EventLocation', 'country', "country TEXT DEFAULT ''");
addColumnIfMissing('EventLocation', 'zip_code', "zip_code TEXT DEFAULT ''");
addColumnIfMissing('BusinessDetail', 'zip_code', 'zip_code TEXT DEFAULT \'\'');
addColumnIfMissing('PaymentInfo', 'qr_code', 'qr_code TEXT DEFAULT \'\'');

// Auth columns
addColumnIfMissing('TeamMember', 'password', "password TEXT DEFAULT NULL");
addColumnIfMissing('TeamMember', 'force_password_change', "force_password_change INTEGER DEFAULT 1");

// Seed the default savadmin user if no admin exists
const existingAdmin = db.prepare("SELECT id FROM TeamMember WHERE username = 'savadmin'").get() as any;
if (!existingAdmin) {
  const hash = bcrypt.hashSync('savadmin123', 12);
  db.prepare("INSERT INTO TeamMember (username, name, role, password, force_password_change) VALUES (?, ?, ?, ?, ?)").run('savadmin', 'Super Admin', 'savadmin', hash, 1);
  console.log('  Created default savadmin user (password: savadmin123)');
}

// Seed default columns for events that have none
const eventsWithoutColumns = db.prepare("SELECT id FROM Event WHERE id NOT IN (SELECT DISTINCT event_id FROM ColumnConfig)").all() as any[];
const insertCol = db.prepare("INSERT INTO ColumnConfig (event_id, status_id, label, color, sort_order) VALUES (?, ?, ?, ?, ?)");
for (const ev of eventsWithoutColumns) {
  insertCol.run(ev.id, 'backlog', 'Backlog', '#6771ab', 0);
  insertCol.run(ev.id, 'in-progress', 'In-Progress', '#c484b0', 1);
  console.log(`  Seeded default columns for event ${ev.id}`);
}

// Cleanup: remove legacy auto-seeded "Done" column (status_id='done', label='Done', sort_order=2)
const legacyDoneCols = db.prepare("SELECT id FROM ColumnConfig WHERE status_id = 'done' AND label = 'Done' AND sort_order = 2").all() as any[];
for (const c of legacyDoneCols) {
  db.prepare("DELETE FROM ColumnConfig WHERE id = ?").run(c.id);
  console.log(`  Removed legacy auto-seeded Done column (id=${c.id})`);
}

console.log("Migration complete.");
