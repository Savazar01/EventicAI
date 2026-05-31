import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });
  if (!hasEventAccess(user, Number(eventId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cols = db.prepare("SELECT * FROM ColumnConfig WHERE event_id = ? ORDER BY sort_order").all(Number(eventId));
  return NextResponse.json(cols);
}

export async function POST(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { event_id, status_id, label, color } = await req.json();
  if (!event_id || !status_id || !label) return NextResponse.json({ error: "event_id, status_id, label required" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const maxSort = db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM ColumnConfig WHERE event_id = ?").get(event_id) as any;
  const result = db.prepare("INSERT INTO ColumnConfig (event_id, status_id, label, color, sort_order) VALUES (?, ?, ?, ?, ?)").run(event_id, status_id, label, color || '#94a3b8', maxSort.next);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, label, color, sort_order } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const col = db.prepare("SELECT event_id FROM ColumnConfig WHERE id = ?").get(Number(id)) as any;
  if (!col) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!hasEventAccess(user, col.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("UPDATE ColumnConfig SET label = COALESCE(?, label), color = COALESCE(?, color), sort_order = COALESCE(?, sort_order) WHERE id = ?").run(label, color, sort_order, id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const col = db.prepare("SELECT * FROM ColumnConfig WHERE id = ?").get(Number(id)) as any;
  if (!col) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!hasEventAccess(user, col.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("DELETE FROM ColumnConfig WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
