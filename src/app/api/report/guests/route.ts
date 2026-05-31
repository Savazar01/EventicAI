import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const status = searchParams.get("status");
  const level = searchParams.get("level");
  const sort = searchParams.get("sort") || "name";
  const order = searchParams.get("order") || "asc";

  const where: any = {};
  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where.OR = [{ event_id: Number(event_id) }, { activity: { event_id: Number(event_id) } }];
  }
  if (status) where.status = status;
  if (level === "event") where.event_id = { not: null };
  else if (level === "activity") where.activity_id = { not: null };

  const orderBy: any = {};
  if (sort === "event") orderBy.event = { title: order };
  else if (sort === "activity") orderBy.activity = { title: order };
  else if (sort === "status") orderBy.status = order;
  else if (sort === "guest_count") orderBy.guest_count = order;
  else orderBy.name = order;

  const guests = await prisma.guest.findMany({
    where,
    orderBy,
    include: {
      event: { select: { id: true, title: true } },
      activity: { select: { id: true, title: true, event_id: true } },
    },
  });

  const result = guests.map((g) => ({
    id: g.id,
    name: g.name,
    whatsapp: g.whatsapp,
    guest_count: g.guest_count,
    status: g.status,
    level: g.event_id ? "Event" : "Activity",
    event_title: g.event?.title || "",
    activity_title: g.activity?.title || "",
    event_id: g.event?.id || g.activity?.event_id || null,
  }));
  return NextResponse.json(result);
}
