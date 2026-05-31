import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, note, actual_effort_hours, actual_budget, currency } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const activityId = Number(id);
  const eventId = await getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date().toISOString();

  const data: Record<string, unknown> = {
    completed: 1,
    progress_status: "done",
    completed_at: now,
  };
  if (note !== undefined && note !== null) data.completion_note = note;
  if (actual_effort_hours !== undefined && actual_effort_hours !== null) data.actual_effort_hours = Number(actual_effort_hours);
  if (actual_budget !== undefined && actual_budget !== null) data.actual_budget = Number(actual_budget);
  if (currency !== undefined && currency !== null) data.currency = currency;

  await prisma.activity.update({ where: { id: activityId }, data });

  const subData: Record<string, unknown> = {
    completed: 1,
    progress_status: "done",
    completed_at: now,
  };
  if (note) subData.completion_note = note;
  await prisma.activity.updateMany({ where: { parent_activity_id: activityId }, data: subData });

  return NextResponse.json({ success: true });
}
