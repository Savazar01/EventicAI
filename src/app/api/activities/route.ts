import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");

  if (!event_id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  const eventId = Number(event_id);
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const activities = await prisma.activity.findMany({
    where: { event_id: eventId },
    include: {
      _count: {
        select: {
          sub_activities: true,
          guests: true,
          vendors: true,
        },
      },
    },
  });

  const result = activities.map(({ _count, ...rest }) => ({
    ...rest,
    sub_activity_count: _count.sub_activities,
    guest_count: _count.guests,
    vendor_count: _count.vendors,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const body = await request.json();
  const { event_id, parent_activity_id, title, description, status, start_date, end_date, location, completed, planned_start, planned_end, actual_end, assigned_owner_id, planned_effort_hours, planned_budget, currency } = body;

  if (!event_id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let effectiveStatus = status;
  if (!effectiveStatus) {
    const firstCol = await prisma.columnConfig.findFirst({
      where: { event_id: Number(event_id) },
      orderBy: { sort_order: 'asc' },
      select: { status_id: true },
    });
    effectiveStatus = firstCol?.status_id || 'backlog';
  }

  try {
    const result = await prisma.activity.create({
      data: {
        event_id: Number(event_id),
        parent_activity_id: parent_activity_id ? Number(parent_activity_id) : null,
        title,
        description: description || null,
        status: effectiveStatus,
        completed: completed ? 1 : 0,
        start_date,
        end_date,
        location: location || null,
        planned_start: planned_start || null,
        planned_end: planned_end || null,
        actual_end: actual_end || null,
        assigned_owner_id: assigned_owner_id ? Number(assigned_owner_id) : null,
        planned_effort_hours: planned_effort_hours != null ? Number(planned_effort_hours) : null,
        planned_budget: planned_budget != null ? Number(planned_budget) : null,
        currency: currency || null,
      },
    });
    return NextResponse.json({ id: result.id, ...body, status: effectiveStatus, completed: completed ? 1 : 0 });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json({ error: "Failed to insert activity" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const body = await request.json();
  const { id, status, title, description, start_date, end_date, location, completed, parent_activity_id, planned_start, planned_end, actual_end, assigned_owner_id, planned_effort_hours, planned_budget, currency, actual_effort_hours, actual_budget } = body;

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const activityId = Number(id);
  const eventId = await getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (completed !== undefined) data.completed = completed ? 1 : 0;
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (start_date !== undefined) data.start_date = start_date;
  if (end_date !== undefined) data.end_date = end_date;
  if (location !== undefined) data.location = location;
  if (planned_start !== undefined) data.planned_start = planned_start;
  if (planned_end !== undefined) data.planned_end = planned_end;
  if (actual_end !== undefined) data.actual_end = actual_end;
  if (assigned_owner_id !== undefined) data.assigned_owner_id = assigned_owner_id;
  if (planned_effort_hours !== undefined) data.planned_effort_hours = planned_effort_hours != null ? Number(planned_effort_hours) : null;
  if (planned_budget !== undefined) data.planned_budget = planned_budget != null ? Number(planned_budget) : null;
  if (currency !== undefined) data.currency = currency || null;
  if (actual_effort_hours !== undefined) data.actual_effort_hours = actual_effort_hours != null ? Number(actual_effort_hours) : null;
  if (actual_budget !== undefined) data.actual_budget = actual_budget != null ? Number(actual_budget) : null;

  if (Object.keys(data).length > 0) {
    await prisma.activity.update({ where: { id: activityId }, data });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const activityId = Number(id);

  const eventId = await getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.guest.deleteMany({ where: { activity_id: activityId } });
  await prisma.vendor.deleteMany({ where: { activity_id: activityId } });
  await prisma.activity.deleteMany({ where: { parent_activity_id: activityId } });
  await prisma.activity.delete({ where: { id: activityId } });
  return NextResponse.json({ success: true });
}
