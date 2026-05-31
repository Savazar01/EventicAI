import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, getEventIdFromActivity } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activityId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  const eventId = await getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const vendors = await prisma.vendor.findMany({ where: { activity_id: activityId } });
  return NextResponse.json(vendors);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activityId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;

  const { business_name, whatsapp, services } = await request.json();
  if (!business_name) return NextResponse.json({ error: "Missing business_name" }, { status: 400 });

  const eventId = await getEventIdFromActivity(activityId);
  if (!eventId) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const result = await prisma.vendor.create({
      data: { activity_id: activityId, business_name, whatsapp, services },
    });
    return NextResponse.json({ id: result.id, activity_id: activityId, business_name, whatsapp, services });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
