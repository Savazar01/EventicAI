import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate, requireRole } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const contacts = db.prepare("SELECT * FROM BusinessContact ORDER BY id").all();
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { full_name, whatsapp, designation } = await request.json();
  const stmt = db.prepare("INSERT INTO BusinessContact (full_name, whatsapp, designation) VALUES (?, ?, ?)");
  const info = stmt.run(full_name || '', whatsapp || '', designation || '');
  return NextResponse.json({ id: Number(info.lastInsertRowid) });
}

export async function DELETE(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;
  const roleErr = requireRole(user, ["savadmin"]);
  if (roleErr) return roleErr;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  db.prepare("DELETE FROM BusinessContact WHERE id = ?").run(Number(id));
  return NextResponse.json({ success: true });
}
