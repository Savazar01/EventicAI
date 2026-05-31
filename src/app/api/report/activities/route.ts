import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { authenticate, hasEventAccess } from "@/lib/auth";

export const GET = withErrorHandler(async (request: Request) => {
  const [user, err] = await authenticate();
  if (err) return err;

  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get("event_id");
  const status = searchParams.get("status");
  const progress = searchParams.get("progress");
  const level = searchParams.get("level");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "planned_start";
  const order = searchParams.get("order") || "asc";

  const where: any = {};

  if (event_id) {
    if (!hasEventAccess(user, Number(event_id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    where.event_id = Number(event_id);
  }

  if (status) where.status = status;

  if (progress) {
    if (progress === "done") {
      where.OR = [{ progress_status: "done" }, { completed: 1 }];
    } else if (progress === "in-progress") {
      where.progress_status = "in-progress";
    } else if (progress === "none") {
      where.progress_status = null;
      where.completed = 0;
    }
  }

  if (level === "parent") where.parent_activity_id = null;
  else if (level === "sub") where.parent_activity_id = { not: null };

  if (dateFrom) {
    where.planned_start = { ...(where.planned_start || {}), gte: new Date(dateFrom) };
  }
  if (dateTo) {
    where.planned_start = { ...(where.planned_start || {}), lte: new Date(dateTo + "T23:59:59") };
  }

  if (search) {
    where.title = { contains: search };
  }

  const orderBy: any = {};
  if (sort === "title") orderBy.title = order;
  else if (sort === "status") orderBy.status = order;
  else if (sort === "column") orderBy.columnConfig = { sort_order: order };
  else if (sort === "date" || sort === "planned_start") orderBy.planned_start = order;
  else if (sort === "progress") orderBy.progress_status = order;
  else if (sort === "guest_count") orderBy.guests = { _count: order };
  else if (sort === "vendor_count") orderBy.vendors = { _count: order };
  else if (sort === "parent") orderBy.parent_activity = { title: order };
  else orderBy.planned_start = order;

  const activities = await prisma.activity.findMany({
    where,
    orderBy,
    include: {
      parent_activity: { select: { title: true } },
      _count: { select: { guests: true, vendors: true, sub_activities: true } },
    },
  });

  const columnConfigs = await prisma.columnConfig.findMany({
    where: { event_id: where.event_id },
    select: { status_id: true, label: true, color: true },
  });
  const ccMap = new Map(columnConfigs.map((cc) => [cc.status_id, cc]));

  const result = activities.map((a) => {
    const cc = ccMap.get(a.status);
    return {
      id: a.id,
      title: a.title,
      status: a.status,
      progress_status: a.progress_status,
      completed: a.completed,
      completion_note: a.completion_note,
      planned_start: a.planned_start,
      start_date: a.start_date,
      parent_activity_id: a.parent_activity_id,
      planned_effort_hours: a.planned_effort_hours,
      actual_effort_hours: a.actual_effort_hours,
      planned_budget: a.planned_budget,
      actual_budget: a.actual_budget,
      currency: a.currency,
      parent_title: a.parent_activity?.title || "",
      column_label: cc?.label || "",
      column_color: cc?.color || "#94a3b8",
      guest_count: a._count.guests,
      vendor_count: a._count.vendors,
      sub_activity_count: a._count.sub_activities,
    };
  });
  return NextResponse.json(result);
});
