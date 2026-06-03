import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { authenticate, hasEventAccess } from "@/lib/auth";

export const GET = withErrorHandler(async (req, context) => {
  const [user, err] = await authenticate();
  if (err) return err;

  const where: any = {};
  if (user.role === "event_user") {
    try {
      const ids: number[] = JSON.parse(user.event_ids || "[]");
      if (ids.length === 0) return NextResponse.json([]);
      where.id = { in: ids };
    } catch {
      return NextResponse.json([]);
    }
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      event_owner: { select: { name: true } },
      _count: {
        select: {
          activities: true,
          guests: true,
          locations: true,
          columnConfigs: true,
        },
      },
    },
    orderBy: { start_date: "desc" },
  });

  const result = await Promise.all(events.map(async (e) => {
    const parentCount = await prisma.activity.count({ where: { event_id: e.id, parent_activity_id: null } });
    const subCount = await prisma.activity.count({ where: { event_id: e.id, parent_activity_id: { not: null } } });

    const attendingGuests = await prisma.guest.aggregate({
      where: { OR: [{ event_id: e.id }, { activity: { event_id: e.id } }], status: "Attending" },
      _sum: { guest_count: true },
    });
    const maybeGuests = await prisma.guest.aggregate({
      where: { OR: [{ event_id: e.id }, { activity: { event_id: e.id } }], status: "Maybe" },
      _sum: { guest_count: true },
    });
    const noGuests = await prisma.guest.aggregate({
      where: { OR: [{ event_id: e.id }, { activity: { event_id: e.id } }], status: "No" },
      _sum: { guest_count: true },
    });
    const totalGuests = await prisma.guest.aggregate({
      where: { OR: [{ event_id: e.id }, { activity: { event_id: e.id } }] },
      _sum: { guest_count: true },
    });
    const vendorCount = await prisma.vendor.count({ where: { activity: { event_id: e.id } } });
    const guestCountAtEvent = await prisma.guest.count({ where: { event_id: e.id } });

    const columns = await prisma.columnConfig.findMany({
      where: { event_id: e.id },
      orderBy: { sort_order: "asc" },
    });

    const columnStatuses = await Promise.all(columns.map(async (cc) => {
      const openCnt = await prisma.activity.count({
        where: { event_id: e.id, status: cc.status_id, completed: 0, OR: [{ progress_status: null }, { progress_status: "" }] },
      });
      const ipCnt = await prisma.activity.count({
        where: { event_id: e.id, status: cc.status_id, progress_status: "in-progress" },
      });
      const doneCnt = await prisma.activity.count({
        where: { event_id: e.id, status: cc.status_id, OR: [{ progress_status: "done" }, { completed: 1 }] },
      });
      return { status: cc.status_id, label: cc.label, color: cc.color, open: openCnt, in_progress: ipCnt, done: doneCnt };
    }));

    return {
      ...e,
      event_owner_name: e.event_owner?.name || null,
      parent_activity_count: parentCount,
      sub_activity_count: subCount,
      event_guest_count: guestCountAtEvent,
      activity_guest_count: e._count.activities - parentCount,
      attending_total: attendingGuests._sum.guest_count || 0,
      maybe_total: maybeGuests._sum.guest_count || 0,
      no_total: noGuests._sum.guest_count || 0,
      total_guest_count: totalGuests._sum.guest_count || 0,
      vendor_count: vendorCount,
      activity_status_breakdown: columnStatuses,
    };
  }));

  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (request: Request) => {
  const [user, err] = await authenticate();
  if (err) return err;
  if (user.role === "event_user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, start_date, end_date, location, contact, event_budget, event_effort_hours, event_owner_id, payment_bank_name, payment_account_number, payment_ifsc_code, payment_qr_code } = await request.json();
  const created = await prisma.event.create({
    data: {
      title,
      description,
      start_date: start_date ? new Date(start_date) : new Date(),
      end_date: end_date ? new Date(end_date) : new Date(),
      location,
      contact,
      event_budget: event_budget ?? null,
      event_effort_hours: event_effort_hours ?? null,
      event_owner_id: event_owner_id ?? null,
      payment_bank_name: payment_bank_name ?? "",
      payment_account_number: payment_account_number ?? "",
      payment_ifsc_code: payment_ifsc_code ?? "",
      payment_qr_code: payment_qr_code ?? "",
    },
  });
  return NextResponse.json(created);
});
