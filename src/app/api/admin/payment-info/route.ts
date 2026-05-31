import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const row = await prisma.paymentInfo.findFirst();
  return NextResponse.json(row || null);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { bank_name, account_number, ifsc_code, qr_code } = await request.json();
  const existing = await prisma.paymentInfo.findFirst({ select: { id: true } });
  if (existing) {
    await prisma.paymentInfo.update({
      where: { id: existing.id },
      data: { bank_name: bank_name || "", account_number: account_number || "", ifsc_code: ifsc_code || "", qr_code: qr_code || "" },
    });
    return NextResponse.json({ success: true });
  } else {
    await prisma.paymentInfo.create({
      data: { bank_name: bank_name || "", account_number: account_number || "", ifsc_code: ifsc_code || "", qr_code: qr_code || "" },
    });
    return NextResponse.json({ success: true });
  }
}
