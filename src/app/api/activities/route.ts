import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");

  if (!event_id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });
  const eventId = Number(event_id);
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const activities = db.prepare(`
    SELECT a.*, 
      (SELECT COUNT(*) FROM Activity sub WHERE sub.parent_activity_id = a.id) as sub_activity_count,
      (SELECT COUNT(*) FROM Guest g WHERE g.activity_id = a.id) as guest_count,
      (SELECT COUNT(*) FROM Vendor v WHERE v.activity_id = a.id) as vendor_count
    FROM Activity a 
    WHERE a.event_id = ?
  `).all(eventId);

  return NextResponse.json(activities);
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
    const firstCol = db.prepare("SELECT status_id FROM ColumnConfig WHERE event_id = ? ORDER BY sort_order ASC LIMIT 1").get(event_id) as { status_id: string } | undefined;
    effectiveStatus = firstCol?.status_id || 'backlog';
  }

  try {
    const stmt = db.prepare(`
        INSERT INTO Activity (event_id, parent_activity_id, title, description, status, completed, start_date, end_date, location, planned_start, planned_end, actual_end, assigned_owner_id, planned_effort_hours, planned_budget, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
        event_id, 
        parent_activity_id || null, 
        title, 
        description || null, 
        effectiveStatus,
        completed ? 1 : 0,
        start_date, 
        end_date, 
        location || null,
        planned_start || null,
        planned_end || null,
        actual_end || null,
        assigned_owner_id || null,
        planned_effort_hours != null ? Number(planned_effort_hours) : null,
        planned_budget != null ? Number(planned_budget) : null,
        currency || null
    );
    return NextResponse.json({ id: Number(info.lastInsertRowid), ...body, status: effectiveStatus, completed: completed ? 1 : 0 });
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
  const eventId = getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const fields = [];
  const values = [];
  if (status !== undefined) { fields.push("status = ?"); values.push(status); }
  if (completed !== undefined) { fields.push("completed = ?"); values.push(completed ? 1 : 0); }
  if (title !== undefined) { fields.push("title = ?"); values.push(title); }
  if (description !== undefined) { fields.push("description = ?"); values.push(description); }
  if (start_date !== undefined) { fields.push("start_date = ?"); values.push(start_date); }
  if (end_date !== undefined) { fields.push("end_date = ?"); values.push(end_date); }
  if (location !== undefined) { fields.push("location = ?"); values.push(location); }
  if (planned_start !== undefined) { fields.push("planned_start = ?"); values.push(planned_start); }
  if (planned_end !== undefined) { fields.push("planned_end = ?"); values.push(planned_end); }
  if (actual_end !== undefined) { fields.push("actual_end = ?"); values.push(actual_end); }
  if (assigned_owner_id !== undefined) { fields.push("assigned_owner_id = ?"); values.push(assigned_owner_id); }
  if (planned_effort_hours !== undefined) { fields.push("planned_effort_hours = ?"); values.push(planned_effort_hours != null ? Number(planned_effort_hours) : null); }
  if (planned_budget !== undefined) { fields.push("planned_budget = ?"); values.push(planned_budget != null ? Number(planned_budget) : null); }
  if (currency !== undefined) { fields.push("currency = ?"); values.push(currency || null); }
  if (actual_effort_hours !== undefined) { fields.push("actual_effort_hours = ?"); values.push(actual_effort_hours != null ? Number(actual_effort_hours) : null); }
  if (actual_budget !== undefined) { fields.push("actual_budget = ?"); values.push(actual_budget != null ? Number(actual_budget) : null); }

  if (fields.length > 0) {
      values.push(id);
      db.prepare(`UPDATE Activity SET ${fields.join(", ")} WHERE id = ?`).run(...values);
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

  const eventId = getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("DELETE FROM Guest WHERE activity_id = ?").run(activityId);
  db.prepare("DELETE FROM Vendor WHERE activity_id = ?").run(activityId);
  db.prepare("DELETE FROM Activity WHERE parent_activity_id = ?").run(activityId);
  db.prepare("DELETE FROM Activity WHERE id = ?").run(activityId);
  return NextResponse.json({ success: true });
}
