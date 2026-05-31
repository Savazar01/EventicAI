import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const activity_id = searchParams.get("activity_id");
  if (!activity_id) return NextResponse.json({ error: "Missing activity_id" }, { status: 400 });

  const eventId = getEventIdFromActivity(Number(activity_id));
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const vendors = db.prepare("SELECT * FROM Vendor WHERE activity_id = ?").all(Number(activity_id));
  return NextResponse.json(vendors);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { activity_id, business_name, whatsapp, services } = await request.json();
  if (!activity_id) return NextResponse.json({ error: "Missing activity_id" }, { status: 400 });

  const eventId = getEventIdFromActivity(Number(activity_id));
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const stmt = db.prepare("INSERT INTO Vendor (activity_id, business_name, whatsapp, services) VALUES (?, ?, ?, ?)");
  const info = stmt.run(activity_id, business_name, whatsapp, services);
  return NextResponse.json({ id: Number(info.lastInsertRowid), activity_id, business_name, whatsapp, services });
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, business_name, whatsapp, services } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Resolve event via activity
  const vendor = db.prepare("SELECT v.activity_id FROM Vendor v WHERE v.id = ?").get(Number(id)) as any;
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  const eventId = getEventIdFromActivity(vendor.activity_id);
  if (!eventId || !hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("UPDATE Vendor SET business_name = COALESCE(?, business_name), whatsapp = COALESCE(?, whatsapp), services = COALESCE(?, services) WHERE id = ?")
    .run(business_name ?? null, whatsapp ?? null, services ?? null, Number(id));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const vendor = db.prepare("SELECT v.activity_id FROM Vendor v WHERE v.id = ?").get(Number(id)) as any;
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  const eventId = getEventIdFromActivity(vendor.activity_id);
  if (!eventId || !hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  db.prepare("DELETE FROM Vendor WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
