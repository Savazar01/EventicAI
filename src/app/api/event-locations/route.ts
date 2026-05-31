import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  if (!event_id) return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const locations = db.prepare("SELECT * FROM EventLocation WHERE event_id = ? ORDER BY name ASC").all(Number(event_id));
  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { event_id, name, description, city, state, country, zip_code } = await request.json();
  if (!event_id || !name) return NextResponse.json({ error: "event_id and name required" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stmt = db.prepare("INSERT INTO EventLocation (event_id, name, description, city, state, country, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const info = stmt.run(event_id, name, description || null, city || '', state || '', country || '', zip_code || '');
  return NextResponse.json({ id: Number(info.lastInsertRowid), event_id, name, description, city, state, country, zip_code });
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, name, description, city, state, country, zip_code } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const loc = db.prepare("SELECT event_id FROM EventLocation WHERE id = ?").get(Number(id)) as any;
  if (!loc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!hasEventAccess(user, loc.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("UPDATE EventLocation SET name = ?, description = ?, city = ?, state = ?, country = ?, zip_code = ? WHERE id = ?").run(name, description, city || '', state || '', country || '', zip_code || '', id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const loc = db.prepare("SELECT event_id FROM EventLocation WHERE id = ?").get(Number(id)) as any;
  if (!loc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!hasEventAccess(user, loc.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("DELETE FROM EventLocation WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
