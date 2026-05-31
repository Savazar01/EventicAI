import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const service = searchParams.get("service");
  const sort = searchParams.get("sort") || "business_name";
  const order = searchParams.get("order") || "asc";

  let where = "";
  const params: any[] = [];

  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where = "WHERE a.event_id = ?";
    params.push(Number(event_id));
  }

  if (service) {
    where += where ? " AND v.services LIKE ?" : "WHERE v.services LIKE ?";
    params.push(`%${service}%`);
  }

  const sortCol =
    sort === "activity" ? "a.title" :
    sort === "service" ? "v.services" :
    "v.business_name";

  const dir = order === "desc" ? "DESC" : "ASC";

  const vendors = db.prepare(`
    SELECT v.id, v.business_name, v.whatsapp, v.services,
      COALESCE(a.title, '') as activity_title,
      a.event_id
    FROM Vendor v
    LEFT JOIN Activity a ON v.activity_id = a.id
    ${where}
    ORDER BY ${sortCol} ${dir}
  `).all(...params);
  return NextResponse.json(vendors);
}
