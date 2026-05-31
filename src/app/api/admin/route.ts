import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const settings = await prisma.settings.findMany();
  const config = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const settings = await request.json();
  for (const [key, value] of Object.entries(settings)) {
    await prisma.settings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  return NextResponse.json({ success: true });
}
