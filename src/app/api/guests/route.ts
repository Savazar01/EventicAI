import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const activity_id = searchParams.get("activity_id");
  const event_id = searchParams.get("event_id");

  if (event_id) {
    const eventId = Number(event_id);
    if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const guests = db.prepare("SELECT * FROM Guest WHERE event_id = ?").all(eventId);
    return NextResponse.json(guests);
  }
  if (activity_id) {
    const activityId = Number(activity_id);
    const eventId = getEventIdFromActivity(activityId);
    if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const guests = db.prepare("SELECT * FROM Guest WHERE activity_id = ?").all(activityId);
    return NextResponse.json(guests);
  }
  return NextResponse.json({ error: "Missing activity_id or event_id" }, { status: 400 });
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const body = await request.json();
  const { event_id, activity_id, name, whatsapp, guest_count, status } = body;
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  if (activity_id) {
    const eventId = getEventIdFromActivity(Number(activity_id));
    if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const stmt = db.prepare("INSERT INTO Guest (activity_id, name, whatsapp, guest_count, status) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(activity_id, name, whatsapp, guest_count || 1, status || 'Attending');
    return NextResponse.json({ id: Number(info.lastInsertRowid), activity_id, name, whatsapp, guest_count: guest_count || 1, status: status || 'Attending' });
  }
  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const stmt = db.prepare("INSERT INTO Guest (event_id, name, whatsapp, guest_count, status) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(event_id, name, whatsapp, guest_count || 1, status || 'Attending');
    return NextResponse.json({ id: Number(info.lastInsertRowid), event_id, name, whatsapp, guest_count: guest_count || 1, status: status || 'Attending' });
  }
  return NextResponse.json({ error: "Missing activity_id or event_id" }, { status: 400 });
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const body = await request.json();
  const { id, name, whatsapp, guest_count, status } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Resolve event from guest's parent
  const guest = db.prepare(`
    SELECT g.event_id, a.event_id as activity_event_id
    FROM Guest g LEFT JOIN Activity a ON g.activity_id = a.id WHERE g.id = ?
  `).get(Number(id)) as any;
  const eventId = guest?.event_id || guest?.activity_event_id;
  if (!eventId || !hasEventAccess(user, Number(eventId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stmt = db.prepare("UPDATE Guest SET name = COALESCE(?, name), whatsapp = COALESCE(?, whatsapp), guest_count = COALESCE(?, guest_count), status = COALESCE(?, status) WHERE id = ?");
  stmt.run(name ?? null, whatsapp ?? null, guest_count ?? null, status ?? null, Number(id));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const guest = db.prepare(`
    SELECT g.event_id, a.event_id as activity_event_id
    FROM Guest g LEFT JOIN Activity a ON g.activity_id = a.id WHERE g.id = ?
  `).get(Number(id)) as any;
  const eventId = guest?.event_id || guest?.activity_event_id;
  if (!eventId || !hasEventAccess(user, Number(eventId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("DELETE FROM Guest WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
