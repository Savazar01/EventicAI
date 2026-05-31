import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, hasEventAccess, requireRole } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { event_owner: { select: { name: true } } },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parentCount = await prisma.activity.count({ where: { event_id: eventId, parent_activity_id: null } });
  const subCount = await prisma.activity.count({ where: { event_id: eventId, parent_activity_id: { not: null } } });

  const attendingGuests = await prisma.guest.aggregate({
    where: { OR: [{ event_id: eventId }, { activity: { event_id: eventId } }], status: "Attending" },
    _sum: { guest_count: true },
  });
  const maybeGuests = await prisma.guest.aggregate({
    where: { OR: [{ event_id: eventId }, { activity: { event_id: eventId } }], status: "Maybe" },
    _sum: { guest_count: true },
  });
  const noGuests = await prisma.guest.aggregate({
    where: { OR: [{ event_id: eventId }, { activity: { event_id: eventId } }], status: "No" },
    _sum: { guest_count: true },
  });
  const totalGuests = await prisma.guest.aggregate({
    where: { OR: [{ event_id: eventId }, { activity: { event_id: eventId } }] },
    _sum: { guest_count: true },
  });
  const vendorCount = await prisma.vendor.count({ where: { activity: { event_id: eventId } } });
  const guestCountAtEvent = await prisma.guest.count({ where: { event_id: eventId } });

  const columns = await prisma.columnConfig.findMany({
    where: { event_id: eventId },
    orderBy: { sort_order: "asc" },
  });

  const columnStatuses = await Promise.all(columns.map(async (cc) => {
    const openCnt = await prisma.activity.count({
      where: { event_id: eventId, status: cc.status_id, completed: 0, OR: [{ progress_status: null }, { progress_status: "" }] },
    });
    const ipCnt = await prisma.activity.count({
      where: { event_id: eventId, status: cc.status_id, progress_status: "in-progress" },
    });
    const doneCnt = await prisma.activity.count({
      where: { event_id: eventId, status: cc.status_id, OR: [{ progress_status: "done" }, { completed: 1 }] },
    });
    return { status: cc.status_id, label: cc.label, color: cc.color, open: openCnt, in_progress: ipCnt, done: doneCnt };
  }));

  const result = {
    ...event,
    event_owner_name: event.event_owner?.name || null,
    parent_activity_count: parentCount,
    sub_activity_count: subCount,
    event_guest_count: guestCountAtEvent,
    activity_guest_count: parentCount,
    attending_total: attendingGuests._sum.guest_count || 0,
    maybe_total: maybeGuests._sum.guest_count || 0,
    no_total: noGuests._sum.guest_count || 0,
    total_guest_count: totalGuests._sum.guest_count || 0,
    vendor_count: vendorCount,
    activity_status_breakdown: columnStatuses,
  };

  return NextResponse.json(result);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  if (!hasEventAccess(user, eventId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const data: any = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.start_date !== undefined) data.start_date = new Date(body.start_date);
  if (body.end_date !== undefined) data.end_date = new Date(body.end_date);
  if (body.location !== undefined) data.location = body.location;
  if (body.contact !== undefined) data.contact = body.contact;
  if (body.event_budget !== undefined) data.event_budget = body.event_budget;
  if (body.event_effort_hours !== undefined) data.event_effort_hours = body.event_effort_hours;
  if (body.event_owner_id !== undefined) data.event_owner_id = body.event_owner_id;
  if (body.payment_bank_name !== undefined) data.payment_bank_name = body.payment_bank_name;
  if (body.payment_account_number !== undefined) data.payment_account_number = body.payment_account_number;
  if (body.payment_ifsc_code !== undefined) data.payment_ifsc_code = body.payment_ifsc_code;
  if (body.payment_qr_code !== undefined) data.payment_qr_code = body.payment_qr_code;

  if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  await prisma.event.update({ where: { id: eventId }, data });
  return NextResponse.json({ success: true });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  if (user.role === "event_user") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const original = await prisma.event.findUnique({ where: { id: eventId } });
  if (!original) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  try {
    const newEvent = await prisma.event.create({
      data: {
        title: `Copy of ${original.title}`,
        description: original.description,
        start_date: original.start_date,
        end_date: original.end_date,
        location: original.location,
        contact: original.contact,
        event_budget: original.event_budget,
        event_effort_hours: original.event_effort_hours,
        event_owner_id: original.event_owner_id,
      },
    });
    const newEventId = newEvent.id;

    const cols = await prisma.columnConfig.findMany({ where: { event_id: eventId } });
    for (const c of cols) {
      await prisma.columnConfig.create({
        data: { event_id: newEventId, status_id: c.status_id, label: c.label, color: c.color, sort_order: c.sort_order },
      });
    }

    const locs = await prisma.eventLocation.findMany({ where: { event_id: eventId } });
    for (const l of locs) {
      await prisma.eventLocation.create({
        data: { event_id: newEventId, name: l.name, description: l.description, city: l.city || "", state: l.state || "", country: l.country || "", zip_code: l.zip_code || "" },
      });
    }

    const activities = await prisma.activity.findMany({ where: { event_id: eventId } });
    const idMap: Record<number, number> = {};
    for (const a of activities) {
      if (!a.parent_activity_id) {
        const created = await prisma.activity.create({
          data: {
            event_id: newEventId, parent_activity_id: null,
            title: a.title, description: a.description, status: a.status,
            completed: a.completed, start_date: a.start_date, end_date: a.end_date,
            location: a.location, planned_start: a.planned_start, planned_end: a.planned_end,
            actual_end: a.actual_end, assigned_owner_id: a.assigned_owner_id,
          },
        });
        idMap[a.id] = created.id;
      }
    }
    for (const a of activities) {
      if (a.parent_activity_id) {
        const newParentId = idMap[a.parent_activity_id];
        if (newParentId) {
          const created = await prisma.activity.create({
            data: {
              event_id: newEventId, parent_activity_id: newParentId,
              title: a.title, description: a.description, status: a.status,
              completed: a.completed, start_date: a.start_date, end_date: a.end_date,
              location: a.location, planned_start: a.planned_start, planned_end: a.planned_end,
              actual_end: a.actual_end, assigned_owner_id: a.assigned_owner_id,
            },
          });
          idMap[a.id] = created.id;
        }
      }
    }

    const guests = await prisma.guest.findMany({
      where: { OR: [{ event_id: eventId }, { activity: { event_id: eventId } }] },
    });
    for (const g of guests) {
      const newActivityId = g.activity_id ? idMap[g.activity_id] : null;
      const newEventIdForGuest = g.event_id === eventId ? newEventId : g.event_id;
      await prisma.guest.create({
        data: {
          event_id: newEventIdForGuest, activity_id: newActivityId,
          name: g.name, whatsapp: g.whatsapp, guest_count: g.guest_count, status: g.status,
        },
      });
    }

    const vendors = await prisma.vendor.findMany({ where: { activity: { event_id: eventId } } });
    for (const v of vendors) {
      const newActivityId = idMap[v.activity_id];
      if (newActivityId) {
        await prisma.vendor.create({
          data: { activity_id: newActivityId, business_name: v.business_name, whatsapp: v.whatsapp, services: v.services },
        });
      }
    }

    return NextResponse.json({ success: true, id: newEventId, title: `Copy of ${original.title}` });
  } catch (error) {
    console.error("Error cloning event:", error);
    return NextResponse.json({ success: false, error: "Failed to clone event" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);

  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin", "event_manager"]);
  if (roleErr) return roleErr;

  try {
    await prisma.vendor.deleteMany({ where: { activity: { event_id: eventId } } });
    await prisma.guest.deleteMany({ where: { activity: { event_id: eventId } } });
    await prisma.guest.deleteMany({ where: { event_id: eventId } });
    await prisma.activity.deleteMany({ where: { event_id: eventId } });
    await prisma.eventLocation.deleteMany({ where: { event_id: eventId } });
    await prisma.columnConfig.deleteMany({ where: { event_id: eventId } });
    await prisma.event.delete({ where: { id: eventId } });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
