import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const status = searchParams.get("status");
  const level = searchParams.get("level");
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";

  let where = "";
  const params: any[] = [];

  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where = "WHERE (g.event_id = ? OR a.event_id = ?)";
    params.push(Number(event_id), Number(event_id));
  }

  if (status) {
    where += where ? " AND g.status = ?" : "WHERE g.status = ?";
    params.push(status);
  }

  if (level === "event") {
    where += where ? " AND g.event_id IS NOT NULL" : "WHERE g.event_id IS NOT NULL";
  } else if (level === "activity") {
    where += where ? " AND g.activity_id IS NOT NULL" : "WHERE g.activity_id IS NOT NULL";
  }

  const sortCol = sort === "event" ? "e.title" :
    sort === "activity" ? "a.title" :
    sort === "status" ? "g.status" :
    sort === "guest_count" ? "g.guest_count" :
    "g.name";

  const dir = order === "desc" ? "DESC" : "ASC";

  const guests = db.prepare(`
    SELECT g.id, g.name, g.whatsapp, g.guest_count, g.status,
      CASE WHEN g.event_id IS NOT NULL THEN 'Event' ELSE 'Activity' END as level,
      COALESCE(e.title, '') as event_title,
      COALESCE(a.title, '') as activity_title,
      COALESCE(e.id, a.event_id) as event_id
    FROM Guest g
    LEFT JOIN Event e ON g.event_id = e.id
    LEFT JOIN Activity a ON g.activity_id = a.id
    ${where}
    ORDER BY ${sortCol} ${dir}
  `).all(...params);
  return NextResponse.json(guests);
}
