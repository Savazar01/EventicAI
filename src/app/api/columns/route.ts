import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });
  if (!hasEventAccess(user, Number(eventId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cols = await prisma.columnConfig.findMany({
    where: { event_id: Number(eventId) },
    orderBy: { sort_order: "asc" },
  });
  return NextResponse.json(cols);
}

export async function POST(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { event_id, status_id, label, color } = await req.json();
  if (!event_id || !status_id || !label) return NextResponse.json({ error: "event_id, status_id, label required" }, { status: 400 });
  if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const maxSort = await prisma.columnConfig.aggregate({
    where: { event_id: Number(event_id) },
    _max: { sort_order: true },
  });
  const nextSort = (maxSort._max.sort_order ?? -1) + 1;
  const result = await prisma.columnConfig.create({
    data: { event_id: Number(event_id), status_id, label, color: color || "#94a3b8", sort_order: nextSort },
  });
  return NextResponse.json({ id: result.id });
}

export async function PUT(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id, label, color, sort_order } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const col = await prisma.columnConfig.findUnique({ where: { id: Number(id) }, select: { event_id: true } });
  if (!col) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!hasEventAccess(user, col.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data: any = {};
  if (label !== undefined) data.label = label;
  if (color !== undefined) data.color = color;
  if (sort_order !== undefined) data.sort_order = sort_order;
  await prisma.columnConfig.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const [user, err] = await authenticate();
  if (err) return err;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const col = await prisma.columnConfig.findUnique({ where: { id: Number(id) } });
  if (!col) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!hasEventAccess(user, col.event_id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.columnConfig.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
