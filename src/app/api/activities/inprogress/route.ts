import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const activityId = Number(id);
  const eventId = await getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.activity.update({ where: { id: activityId }, data: { completed: 0, progress_status: "in-progress" } });
  await prisma.activity.updateMany({ where: { parent_activity_id: activityId }, data: { completed: 0, progress_status: "in-progress" } });

  return NextResponse.json({ success: true });
}
