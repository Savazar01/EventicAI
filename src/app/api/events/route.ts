import { NextResponse } from "next/server";
import db from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { authenticate, hasEventAccess } from "@/lib/auth";

export const GET = withErrorHandler(async (req, context) => {
  const [user, err] = await authenticate();
  if (err) return err;

  let whereClause = "";
  const params: any[] = [];

  if (user.role === "event_user") {
    try {
      const ids: number[] = JSON.parse(user.event_ids || "[]");
      if (ids.length === 0) return NextResponse.json([]);
      whereClause = "WHERE e.id IN (" + ids.map(() => "?").join(",") + ")";
      for (const id of ids) params.push(id);
    } catch {
      return NextResponse.json([]);
    }
  }

  const events = db.prepare(`
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
    FROM Event e LEFT JOIN TeamMember tm ON e.event_owner_id = tm.id
    ${whereClause}
    ORDER BY e.start_date DESC
  `).all(...params);
  return NextResponse.json(events);
});

export const POST = withErrorHandler(async (request: Request) => {
  const [user, err] = await authenticate();
  if (err) return err;
  if (user.role === "event_user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, start_date, end_date, location, contact, event_budget, event_effort_hours, event_owner_id, payment_bank_name, payment_account_number, payment_ifsc_code, payment_qr_code } = await request.json();
  const stmt = db.prepare(`
    INSERT INTO Event (title, description, start_date, end_date, location, contact, event_budget, event_effort_hours, event_owner_id, payment_bank_name, payment_account_number, payment_ifsc_code, payment_qr_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, description, start_date, end_date, location, contact, event_budget ?? null, event_effort_hours ?? null, event_owner_id ?? null, payment_bank_name ?? '', payment_account_number ?? '', payment_ifsc_code ?? '', payment_qr_code ?? '');
  return NextResponse.json({ id: Number(info.lastInsertRowid), title, description, start_date, end_date, location, contact, event_budget, event_effort_hours, event_owner_id, payment_bank_name, payment_account_number, payment_ifsc_code, payment_qr_code });
});
