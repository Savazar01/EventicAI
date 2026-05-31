import { NextResponse } from "next/server";
import db from "@/lib/db";
import { withErrorHandler } from "@/lib/api-handler";
import { authenticate, hasEventAccess } from "@/lib/auth";

export const GET = withErrorHandler(async (request: Request) => {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const status = searchParams.get("status");
  const progress = searchParams.get("progress");
  const level = searchParams.get("level");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "planned_start";
  const order = searchParams.get("order") || "asc";

  let where = "";
  const params: any[] = [];

  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where = "WHERE a.event_id = ?";
    params.push(Number(event_id));
  }

  if (status) {
    where += " AND a.status = ?";
    params.push(status);
  }

  if (progress) {
    if (progress === "done") {
      where += " AND (a.progress_status = 'done' OR a.completed = 1)";
    } else if (progress === "in-progress") {
      where += " AND a.progress_status = 'in-progress'";
    } else if (progress === "none") {
      where += " AND a.progress_status IS NULL AND a.completed = 0";
    }
  }

  if (level === "parent") {
    where += " AND a.parent_activity_id IS NULL";
  } else if (level === "sub") {
    where += " AND a.parent_activity_id IS NOT NULL";
  }

  if (dateFrom) {
    where += " AND (a.planned_start IS NOT NULL AND a.planned_start >= ?)";
    params.push(dateFrom);
  }

  if (dateTo) {
    where += " AND (a.planned_start IS NOT NULL AND a.planned_start <= ?)";
    params.push(dateTo + "T23:59:59");
  }

  if (search) {
    where += " AND a.title LIKE ?";
    params.push(`%${search}%`);
  }

  const sortCol =
    sort === "title" ? "a.title" :
    sort === "status" ? "a.status" :
    sort === "column" ? "cc.sort_order" :
    sort === "date" ? "a.planned_start" :
    sort === "progress" ? "a.progress_status" :
    sort === "guest_count" ? "guest_count" :
    sort === "vendor_count" ? "vendor_count" :
    sort === "parent" ? "parent.title" :
    "a.planned_start";

  const dir = order === "desc" ? "DESC" : "ASC";

  const activities = db.prepare(`
    SELECT a.id, a.title, a.status, a.progress_status, a.completed, a.completion_note,
      a.planned_start, a.start_date, a.parent_activity_id,
      a.planned_effort_hours, a.actual_effort_hours, a.planned_budget, a.actual_budget, a.currency,
      COALESCE(parent.title, '') as parent_title,
      COALESCE(cc.label, '') as column_label,
      COALESCE(cc.color, '#94a3b8') as column_color,
      (SELECT COUNT(*) FROM Guest g WHERE g.activity_id = a.id) as guest_count,
      (SELECT COUNT(*) FROM Vendor v WHERE v.activity_id = a.id) as vendor_count,
      (SELECT COUNT(*) FROM Activity sub WHERE sub.parent_activity_id = a.id) as sub_activity_count
    FROM Activity a
    LEFT JOIN Activity parent ON a.parent_activity_id = parent.id
    LEFT JOIN ColumnConfig cc ON a.event_id = cc.event_id AND a.status = cc.status_id
    ${where}
    ORDER BY ${sortCol} ${dir}
  `).all(...params);

  return NextResponse.json(activities);
});
