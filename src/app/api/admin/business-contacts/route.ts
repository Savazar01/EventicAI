import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const contacts = await prisma.businessContact.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { full_name, whatsapp, designation } = await request.json();
  const info = await prisma.businessContact.create({
    data: { full_name: full_name || "", whatsapp: whatsapp || "", designation: designation || "" },
  });
  return NextResponse.json({ id: info.id });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.businessContact.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
