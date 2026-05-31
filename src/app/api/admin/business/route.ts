import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const row = db.prepare("SELECT * FROM BusinessDetail LIMIT 1").get() as any;
  return NextResponse.json(row || null);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const body = await request.json();
  const allowed = [
    'business_name', 'address', 'street', 'location', 'city', 'state', 'country',
    'zip_code',
    'email', 'whatsapp',
    'website', 'youtube', 'linkedin', 'facebook', 'tiktok', 'instagram',
    'timezone', 'language'
  ];
  const existing = db.prepare("SELECT id FROM BusinessDetail LIMIT 1").get() as any;
  if (existing) {
    const setClauses = allowed.map(k => `${k} = ?`).join(", ");
    const values = allowed.map(k => body[k] ?? '');
    values.push(existing.id);
    db.prepare(`UPDATE BusinessDetail SET ${setClauses} WHERE id = ?`).run(...values);
    return NextResponse.json({ success: true, id: existing.id });
  } else {
    const keys = allowed.join(", ");
    const placeholders = allowed.map(() => "?").join(", ");
    const values = allowed.map(k => body[k] ?? '');
    const info = db.prepare(`INSERT INTO BusinessDetail (${keys}) VALUES (${placeholders})`).run(...values);
    return NextResponse.json({ success: true, id: Number(info.lastInsertRowid) });
  }
}
