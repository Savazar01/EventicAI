import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, requireRole } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const event = db.prepare(`
    SELECT e.*, tm.name as event_owner_name,
      (SELECT COUNT(*) FROM Activity WHERE event_id = e.id AND parent_activity_id IS NULL) as parent_activity_count,
      (SELECT COUNT(*) FROM Activity WHERE event_id = e.id AND parent_activity_id IS NOT NULL) as sub_activity_count,
      (SELECT COUNT(*) FROM Guest WHERE event_id = e.id) as event_guest_count,
      (SELECT COUNT(*) FROM Guest g JOIN Activity a ON g.activity_id = a.id WHERE a.event_id = e.id) as activity_guest_count,
      (SELECT COALESCE(SUM(g.guest_count), 0) FROM Guest g LEFT JOIN Activity a ON g.activity_id = a.id WHERE (g.event_id = e.id OR a.event_id = e.id) AND g.status = 'Attending') as attending_total,
      (SELECT COALESCE(SUM(g.guest_count), 0) FROM Guest g LEFT JOIN Activity a ON g.activity_id = a.id WHERE (g.event_id = e.id OR a.event_id = e.id) AND g.status = 'Maybe') as maybe_total,
      (SELECT COALESCE(SUM(g.guest_count), 0) FROM Guest g LEFT JOIN Activity a ON g.activity_id = a.id WHERE (g.event_id = e.id OR a.event_id = e.id) AND g.status = 'No') as no_total,
      (SELECT COALESCE(SUM(g.guest_count), 0) FROM Guest g LEFT JOIN Activity a ON g.activity_id = a.id WHERE (g.event_id = e.id OR a.event_id = e.id)) as total_guest_count,
      (SELECT COUNT(*) FROM Vendor v JOIN Activity a ON v.activity_id = a.id WHERE a.event_id = e.id) as vendor_count,
      (SELECT COALESCE(
        '[' || GROUP_CONCAT(
          '{"status":"' || cc.status_id || '","label":"' || REPLACE(cc.label, '"', '\\"') ||
          '","color":"' || cc.color ||
          '","open":' || COALESCE(a.open_cnt, 0) || ',"in_progress":' || COALESCE(a.ip_cnt, 0) || ',"done":' || COALESCE(a.done_cnt, 0) || '}'
        , ',') || ']', '[]')
        FROM ColumnConfig cc
        LEFT JOIN (
          SELECT a.status,
            SUM(CASE WHEN (a.progress_status IS NULL OR a.progress_status = '') AND a.completed = 0 THEN 1 ELSE 0 END) as open_cnt,
            SUM(CASE WHEN a.progress_status = 'in-progress' THEN 1 ELSE 0 END) as ip_cnt,
            SUM(CASE WHEN a.progress_status = 'done' OR a.completed = 1 THEN 1 ELSE 0 END) as done_cnt
          FROM Activity a WHERE a.event_id = e.id GROUP BY a.status
        ) a ON a.status = cc.status_id
        WHERE cc.event_id = e.id
        ORDER BY cc.sort_order
      ) as activity_status_breakdown
    FROM Event e LEFT JOIN TeamMember tm ON e.event_owner_id = tm.id WHERE e.id = ?
  `).get(eventId) as any;
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const fields: string[] = [];
  const values: any[] = [];
  if (body.title !== undefined) { fields.push("title = ?"); values.push(body.title); }
  if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
  if (body.start_date !== undefined) { fields.push("start_date = ?"); values.push(body.start_date); }
  if (body.end_date !== undefined) { fields.push("end_date = ?"); values.push(body.end_date); }
  if (body.location !== undefined) { fields.push("location = ?"); values.push(body.location); }
  if (body.contact !== undefined) { fields.push("contact = ?"); values.push(body.contact); }
  if (body.event_budget !== undefined) { fields.push("event_budget = ?"); values.push(body.event_budget); }
  if (body.event_effort_hours !== undefined) { fields.push("event_effort_hours = ?"); values.push(body.event_effort_hours); }
  if (body.event_owner_id !== undefined) { fields.push("event_owner_id = ?"); values.push(body.event_owner_id); }
  if (body.payment_bank_name !== undefined) { fields.push("payment_bank_name = ?"); values.push(body.payment_bank_name); }
  if (body.payment_account_number !== undefined) { fields.push("payment_account_number = ?"); values.push(body.payment_account_number); }
  if (body.payment_ifsc_code !== undefined) { fields.push("payment_ifsc_code = ?"); values.push(body.payment_ifsc_code); }
  if (body.payment_qr_code !== undefined) { fields.push("payment_qr_code = ?"); values.push(body.payment_qr_code); }
  if (fields.length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  values.push(Number(id));
  db.prepare(`UPDATE Event SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return NextResponse.json({ success: true });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  if (user.role === "event_user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const original = db.prepare("SELECT * FROM Event WHERE id = ?").get(eventId) as any;
  if (!original) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  db.exec("PRAGMA foreign_keys = OFF");
  try {
    const newEvent = db.prepare(
      "INSERT INTO Event (title, description, start_date, end_date, location, contact, event_budget, event_effort_hours, event_owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(`Copy of ${original.title}`, original.description, original.start_date, original.end_date, original.location, original.contact, original.event_budget, original.event_effort_hours, original.event_owner_id);
    const newEventId = Number(newEvent.lastInsertRowid);

    const cols = db.prepare("SELECT * FROM ColumnConfig WHERE event_id = ?").all(eventId) as any[];
    for (const c of cols) {
      db.prepare("INSERT INTO ColumnConfig (event_id, status_id, label, color, sort_order) VALUES (?, ?, ?, ?, ?)")
        .run(newEventId, c.status_id, c.label, c.color, c.sort_order);
    }

    const locs = db.prepare("SELECT * FROM EventLocation WHERE event_id = ?").all(eventId) as any[];
    for (const l of locs) {
      db.prepare("INSERT INTO EventLocation (event_id, name, description, city, state, country, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(newEventId, l.name, l.description, l.city, l.state, l.country, l.zip_code);
    }

    const activities = db.prepare("SELECT * FROM Activity WHERE event_id = ?").all(eventId) as any[];
    const idMap: Record<number, number> = {};
    for (const a of activities) {
      if (!a.parent_activity_id) {
        const r = db.prepare(
          "INSERT INTO Activity (event_id, parent_activity_id, title, description, status, completed, start_date, end_date, location, planned_start, planned_end, actual_end, assigned_owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(newEventId, null, a.title, a.description, a.status, a.completed, a.start_date, a.end_date, a.location, a.planned_start, a.planned_end, a.actual_end, a.assigned_owner_id);
        idMap[a.id] = Number(r.lastInsertRowid);
      }
    }
    for (const a of activities) {
      if (a.parent_activity_id) {
        const newParentId = idMap[a.parent_activity_id];
        if (newParentId) {
          const r = db.prepare(
            "INSERT INTO Activity (event_id, parent_activity_id, title, description, status, completed, start_date, end_date, location, planned_start, planned_end, actual_end, assigned_owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
          ).run(newEventId, newParentId, a.title, a.description, a.status, a.completed, a.start_date, a.end_date, a.location, a.planned_start, a.planned_end, a.actual_end, a.assigned_owner_id);
          idMap[a.id] = Number(r.lastInsertRowid);
        }
      }
    }

    const guests = db.prepare(`
      SELECT g.* FROM Guest g
      LEFT JOIN Activity a ON g.activity_id = a.id
      WHERE g.event_id = ? OR a.event_id = ?
    `).all(eventId, eventId) as any[];
    for (const g of guests) {
      const newActivityId = g.activity_id ? idMap[g.activity_id] : null;
      const newEventIdForGuest = g.event_id === eventId ? newEventId : g.event_id;
      db.prepare("INSERT INTO Guest (event_id, activity_id, name, whatsapp, guest_count, status) VALUES (?, ?, ?, ?, ?, ?)")
        .run(newEventIdForGuest, newActivityId, g.name, g.whatsapp, g.guest_count, g.status);
    }

    const vendors = db.prepare("SELECT v.* FROM Vendor v JOIN Activity a ON v.activity_id = a.id WHERE a.event_id = ?").all(eventId) as any[];
    for (const v of vendors) {
      const newActivityId = idMap[v.activity_id];
      if (newActivityId) {
        db.prepare("INSERT INTO Vendor (activity_id, business_name, whatsapp, services) VALUES (?, ?, ?, ?)")
          .run(newActivityId, v.business_name, v.whatsapp, v.services);
      }
    }

    return NextResponse.json({ success: true, id: newEventId, title: `Copy of ${original.title}` });
  } catch (error) {
    console.error("Error cloning event:", error);
    return NextResponse.json({ success: false, error: "Failed to clone event" }, { status: 500 });
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin", "event_manager"]);
  if (roleErr) return roleErr;

  db.exec("PRAGMA foreign_keys = OFF");
  try {
    db.prepare("DELETE FROM EventLocation WHERE event_id = ?").run(eventId);
    db.prepare("DELETE FROM Guest WHERE event_id = ?").run(eventId);
    db.prepare("DELETE FROM Activity WHERE event_id = ?").run(eventId);
    db.prepare("DELETE FROM ColumnConfig WHERE event_id = ?").run(eventId);
    db.prepare("DELETE FROM Event WHERE id = ?").run(eventId);
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
  return NextResponse.json({ success: true });
}
