import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  if (!event_id) return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const locations = await prisma.eventLocation.findMany({
    where: { event_id: Number(event_id) },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { event_id, name, description, city, state, country, zip_code } = await request.json();
  if (!event_id || !name) return NextResponse.json({ error: "event_id and name required" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const created = await prisma.eventLocation.create({
    data: { event_id: Number(event_id), name, description: description || null, city: city || "", state: state || "", country: country || "", zip_code: zip_code || "" },
  });
  return NextResponse.json(created);
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, name, description, city, state, country, zip_code } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const loc = await prisma.eventLocation.findUnique({ where: { id: Number(id) }, select: { event_id: true } });
  if (!loc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!hasEventAccess(user, loc.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.eventLocation.update({
    where: { id: Number(id) },
    data: { name, description, city: city || "", state: state || "", country: country || "", zip_code: zip_code || "" },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const loc = await prisma.eventLocation.findUnique({ where: { id: Number(id) }, select: { event_id: true } });
  if (!loc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!hasEventAccess(user, loc.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.eventLocation.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
