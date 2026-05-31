import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, authenticate, requireRole } from "@/lib/auth";

export async function GET(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { searchParams } = new URL(request.url);
  const report = searchParams.get("report");
  if (report === "true") {
    const members = await prisma.teamMember.findMany({
      orderBy: { name: "asc" },
    });
    const result = members.map((m) => {
      let eventIds: number[] = [];
      try { eventIds = JSON.parse(m.event_ids || "[]"); } catch {}
      return { ...m, event_titles: "" };
    });
    return NextResponse.json(result);
  }
  const members = await prisma.teamMember.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(members);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const body = await request.json();
  const { username, name, first_name, last_name, whatsapp, email, role, event_ids, password } = body;
  if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });
  const fullName = name || [first_name || "", last_name || ""].filter(Boolean).join(" ") || username;
  if (!fullName.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const passwordHash = password ? await hashPassword(password) : null;
  try {
    const created = await prisma.teamMember.create({
      data: {
        username,
        name: fullName.trim(),
        first_name: first_name || null,
        last_name: last_name || null,
        whatsapp: whatsapp || null,
        email: email || null,
        role: role || "event_user",
        event_ids: event_ids ? JSON.stringify(event_ids) : "[]",
        password: passwordHash,
        force_password_change: passwordHash ? 1 : 0,
      },
    });
    return NextResponse.json({ id: created.id, username, name: fullName.trim(), first_name, last_name, whatsapp, email, role, event_ids: event_ids || [] });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    console.error("Error creating team member:", e);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const body = await request.json();
  const { id, name, first_name, last_name, username, whatsapp, email, role, event_ids, password } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (first_name !== undefined) data.first_name = first_name || null;
  if (last_name !== undefined) data.last_name = last_name || null;
  if (username !== undefined) data.username = username;
  if (whatsapp !== undefined) data.whatsapp = whatsapp || null;
  if (email !== undefined) data.email = email || null;
  if (role !== undefined) data.role = role || "event_user";
  if (event_ids !== undefined) data.event_ids = JSON.stringify(event_ids);
  if (password !== undefined) {
    data.password = await hashPassword(password);
    data.force_password_change = 1;
  }

  if (name === undefined && (first_name !== undefined || last_name !== undefined)) {
    const existing = await prisma.teamMember.findUnique({ where: { id: Number(id) }, select: { first_name: true, last_name: true } });
    const fn = first_name !== undefined ? (first_name || "") : (existing?.first_name || "");
    const ln = last_name !== undefined ? (last_name || "") : (existing?.last_name || "");
    const computed = [fn, ln].filter(Boolean).join(" ");
    if (computed) data.name = computed;
  }

  if (Object.keys(data).length > 0) {
    await prisma.teamMember.update({ where: { id: Number(id) }, data });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.teamMember.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
