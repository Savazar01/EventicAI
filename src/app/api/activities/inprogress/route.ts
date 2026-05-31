import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const activityId = Number(id);
  const eventId = getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("UPDATE Activity SET completed = 0, progress_status = 'in-progress' WHERE id = ?").run(activityId);
  db.prepare("UPDATE Activity SET completed = 0, progress_status = 'in-progress' WHERE parent_activity_id = ?").run(activityId);

  return NextResponse.json({ success: true });
}
