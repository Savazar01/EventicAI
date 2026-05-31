import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, note, actual_effort_hours, actual_budget, currency } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const activityId = Number(id);
  const eventId = getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date().toISOString();

  const sets = ["completed = 1", "progress_status = 'done'", "completed_at = ?"];
  const params: any[] = [now];

  if (note !== undefined && note !== null) {
    sets.push("completion_note = ?");
    params.push(note);
  }
  if (actual_effort_hours !== undefined && actual_effort_hours !== null) {
    sets.push("actual_effort_hours = ?");
    params.push(Number(actual_effort_hours));
  }
  if (actual_budget !== undefined && actual_budget !== null) {
    sets.push("actual_budget = ?");
    params.push(Number(actual_budget));
  }
  if (currency !== undefined && currency !== null) {
    sets.push("currency = ?");
    params.push(currency);
  }

  params.push(activityId);
  db.prepare(`UPDATE Activity SET ${sets.join(", ")} WHERE id = ?`).run(...params);

  const subParams: any[] = [now];
  const subSets = ["completed = 1", "progress_status = 'done'", "completed_at = ?"];
  if (note) { subSets.push("completion_note = ?"); subParams.push(note); }
  subParams.push(activityId);
  db.prepare(`UPDATE Activity SET ${subSets.join(", ")} WHERE parent_activity_id = ?`).run(...subParams);

  return NextResponse.json({ success: true });
}
