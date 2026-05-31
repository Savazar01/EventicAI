import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activityId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  const eventId = getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const vendors = db.prepare("SELECT * FROM Vendor WHERE activity_id = ?").all(activityId);
  return NextResponse.json(vendors);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activityId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  const eventId = getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { business_name, whatsapp, services } = await request.json();
  try {
    const stmt = db.prepare("INSERT INTO Vendor (activity_id, business_name, whatsapp, services) VALUES (?, ?, ?, ?)");
    const info = stmt.run(id, business_name, whatsapp, services);
    return NextResponse.json({ id: Number(info.lastInsertRowid), activity_id: id, business_name, whatsapp, services });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
