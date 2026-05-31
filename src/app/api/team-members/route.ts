import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, authenticate, requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { searchParams } = new URL(request.url);
  const report = searchParams.get("report");
  if (report === "true") {
    const members = db.prepare(`
      SELECT tm.*,
        COALESCE(e.event_titles, '') as event_titles
      FROM TeamMember tm
      LEFT JOIN (
        SELECT tm2.id,
          GROUP_CONCAT(e2.title, ', ') as event_titles
        FROM TeamMember tm2
        LEFT JOIN json_each(tm2.event_ids) AS je ON true
        LEFT JOIN Event e2 ON e2.id = CAST(je.value AS INTEGER)
        GROUP BY tm2.id
      ) e ON e.id = tm.id
      ORDER BY tm.name ASC
    `).all();
    return NextResponse.json(members);
  }
  const members = db.prepare("SELECT * FROM TeamMember ORDER BY name ASC").all();
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const body = await request.json();
  const { username, name, first_name, last_name, whatsapp, email, role, event_ids, password } = body;
  if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });
  const fullName = name || [first_name || '', last_name || ''].filter(Boolean).join(' ') || username;
  if (!fullName.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const passwordHash = password ? await hashPassword(password) : null;
  try {
    const stmt = db.prepare("INSERT INTO TeamMember (username, name, first_name, last_name, whatsapp, email, role, event_ids, password, force_password_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    const info = stmt.run(
      username, fullName.trim(), first_name || null, last_name || null, whatsapp || null, email || null,
      role || 'event_user',
      event_ids ? JSON.stringify(event_ids) : '[]',
      passwordHash,
      passwordHash ? 1 : 0
    );
    return NextResponse.json({ id: Number(info.lastInsertRowid), username, name: fullName.trim(), first_name, last_name, whatsapp, email, role, event_ids: event_ids || [] });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    console.error("Error creating team member:", e);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const body = await request.json();
  const { id, name, first_name, last_name, username, whatsapp, email, role, event_ids, password } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const fields: string[] = [];
  const values: any[] = [];
  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (first_name !== undefined) { fields.push("first_name = ?"); values.push(first_name || null); }
  if (last_name !== undefined) { fields.push("last_name = ?"); values.push(last_name || null); }
  if (username !== undefined) { fields.push("username = ?"); values.push(username); }
  if (whatsapp !== undefined) { fields.push("whatsapp = ?"); values.push(whatsapp || null); }
  if (email !== undefined) { fields.push("email = ?"); values.push(email || null); }
  if (role !== undefined) { fields.push("role = ?"); values.push(role || 'event_user'); }
  if (event_ids !== undefined) { fields.push("event_ids = ?"); values.push(JSON.stringify(event_ids)); }
  if (password !== undefined) {
    const passwordHash = await hashPassword(password);
    fields.push("password = ?"); values.push(passwordHash);
    fields.push("force_password_change = ?"); values.push(1);
  }
  if (name === undefined && (first_name !== undefined || last_name !== undefined)) {
    const existing = db.prepare("SELECT first_name, last_name FROM TeamMember WHERE id = ?").get(Number(id)) as any;
    const fn = first_name !== undefined ? (first_name || '') : (existing?.first_name || '');
    const ln = last_name !== undefined ? (last_name || '') : (existing?.last_name || '');
    const computed = [fn, ln].filter(Boolean).join(' ');
    if (computed) { fields.push("name = ?"); values.push(computed); }
  }

  if (fields.length > 0) {
    values.push(Number(id));
    db.prepare(`UPDATE TeamMember SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  db.prepare("DELETE FROM TeamMember WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
