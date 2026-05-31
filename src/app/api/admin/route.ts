import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const settings = db.prepare("SELECT * FROM Settings").all();
  const config = Object.fromEntries(settings.map((s: any) => [s.key, s.value]));
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const settings = await request.json();
  const stmt = db.prepare("INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, String(value));
  }
  return NextResponse.json({ success: true });
}
