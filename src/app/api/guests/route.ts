import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const activity_id = searchParams.get("activity_id");
  const event_id = searchParams.get("event_id");

  if (event_id) {
    const eventId = Number(event_id);
    if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const guests = await prisma.guest.findMany({ where: { event_id: eventId } });
    return NextResponse.json(guests);
  }
  if (activity_id) {
    const activityId = Number(activity_id);
    const eventId = await getEventIdFromActivity(activityId);
    if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const guests = await prisma.guest.findMany({ where: { activity_id: activityId } });
    return NextResponse.json(guests);
  }
  return NextResponse.json({ error: "Missing activity_id or event_id" }, { status: 400 });
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const body = await request.json();
  const { event_id, activity_id, name, whatsapp, guest_count, status } = body;
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  if (activity_id) {
    const eventId = await getEventIdFromActivity(Number(activity_id));
    if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const created = await prisma.guest.create({
      data: { activity_id: Number(activity_id), name, whatsapp, guest_count: guest_count || 1, status: status || "Attending" },
    });
    return NextResponse.json(created);
  }
  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const created = await prisma.guest.create({
      data: { event_id: Number(event_id), name, whatsapp, guest_count: guest_count || 1, status: status || "Attending" },
    });
    return NextResponse.json(created);
  }
  return NextResponse.json({ error: "Missing activity_id or event_id" }, { status: 400 });
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const body = await request.json();
  const { id, name, whatsapp, guest_count, status } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const guest = await prisma.guest.findUnique({
    where: { id: Number(id) },
    select: { event_id: true, activity: { select: { event_id: true } } },
  });
  const eventId = guest?.event_id || guest?.activity?.event_id;
  if (!eventId || !hasEventAccess(user, Number(eventId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (whatsapp !== undefined) data.whatsapp = whatsapp;
  if (guest_count !== undefined) data.guest_count = guest_count;
  if (status !== undefined) data.status = status;

  await prisma.guest.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const guest = await prisma.guest.findUnique({
    where: { id: Number(id) },
    select: { event_id: true, activity: { select: { event_id: true } } },
  });
  const eventId = guest?.event_id || guest?.activity?.event_id;
  if (!eventId || !hasEventAccess(user, Number(eventId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.guest.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
