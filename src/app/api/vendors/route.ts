import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const activity_id = searchParams.get("activity_id");
  if (!activity_id) return NextResponse.json({ error: "Missing activity_id" }, { status: 400 });

  const eventId = await getEventIdFromActivity(Number(activity_id));
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const vendors = await prisma.vendor.findMany({ where: { activity_id: Number(activity_id) } });
  return NextResponse.json(vendors);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { activity_id, business_name, whatsapp, services } = await request.json();
  if (!activity_id) return NextResponse.json({ error: "Missing activity_id" }, { status: 400 });

  const eventId = await getEventIdFromActivity(Number(activity_id));
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const created = await prisma.vendor.create({
    data: { activity_id: Number(activity_id), business_name, whatsapp, services },
  });
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, business_name, whatsapp, services } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const vendor = await prisma.vendor.findUnique({ where: { id: Number(id) }, select: { activity_id: true } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  const eventId = await getEventIdFromActivity(vendor.activity_id);
  if (!eventId || !hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.vendor.update({
    where: { id: Number(id) },
    data: { ...(business_name !== undefined && { business_name }), ...(whatsapp !== undefined && { whatsapp }), ...(services !== undefined && { services }) },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const vendor = await prisma.vendor.findUnique({ where: { id: Number(id) }, select: { activity_id: true } });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  const eventId = await getEventIdFromActivity(vendor.activity_id);
  if (!eventId || !hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.vendor.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
