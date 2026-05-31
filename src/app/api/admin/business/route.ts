import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const row = await prisma.businessDetail.findFirst();
  return NextResponse.json(row || null);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const body = await request.json();
  const allowed = [
    "business_name", "address", "street", "location", "city", "state", "country",
    "zip_code",
    "email", "whatsapp",
    "website", "youtube", "linkedin", "facebook", "tiktok", "instagram",
    "timezone", "language",
  ];

  const existing = await prisma.businessDetail.findFirst({ select: { id: true } });
  if (existing) {
    const data: Record<string, any> = {};
    for (const k of allowed) {
      data[k] = body[k] ?? "";
    }
    await prisma.businessDetail.update({ where: { id: existing.id }, data });
    return NextResponse.json({ success: true, id: existing.id });
  } else {
    const data: Record<string, any> = {};
    for (const k of allowed) {
      data[k] = body[k] ?? "";
    }
    const info = await prisma.businessDetail.create({ data });
    return NextResponse.json({ success: true, id: info.id });
  }
}
