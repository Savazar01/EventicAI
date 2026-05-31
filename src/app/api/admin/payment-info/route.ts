import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const row = db.prepare("SELECT * FROM PaymentInfo LIMIT 1").get() as any;
  return NextResponse.json(row || null);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { bank_name, account_number, ifsc_code, qr_code } = await request.json();
  const existing = db.prepare("SELECT id FROM PaymentInfo LIMIT 1").get() as any;
  if (existing) {
    db.prepare("UPDATE PaymentInfo SET bank_name = ?, account_number = ?, ifsc_code = ?, qr_code = ? WHERE id = ?")
      .run(bank_name || '', account_number || '', ifsc_code || '', qr_code || '', existing.id);
    return NextResponse.json({ success: true });
  } else {
    db.prepare("INSERT INTO PaymentInfo (bank_name, account_number, ifsc_code, qr_code) VALUES (?, ?, ?, ?)")
      .run(bank_name || '', account_number || '', ifsc_code || '', qr_code || '');
    return NextResponse.json({ success: true });
  }
}
