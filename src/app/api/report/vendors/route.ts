import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const service = searchParams.get("service");
  const sort = searchParams.get("sort") || "business_name";
  const order = searchParams.get("order") || "asc";

  const where: any = {};
  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where.activity = { event_id: Number(event_id) };
  }
  if (service) {
    where.services = { contains: service };
  }

  const orderBy: any = {};
  if (sort === "activity") orderBy.activity = { title: order };
  else if (sort === "service") orderBy.services = order;
  else orderBy.business_name = order;

  const vendors = await prisma.vendor.findMany({
    where,
    orderBy,
    include: { activity: { select: { title: true, event_id: true } } },
  });

  const result = vendors.map((v) => ({
    id: v.id,
    business_name: v.business_name,
    whatsapp: v.whatsapp,
    services: v.services,
    activity_title: v.activity.title || "",
    event_id: v.activity.event_id,
  }));
  return NextResponse.json(result);
}
