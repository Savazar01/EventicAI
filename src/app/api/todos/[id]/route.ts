import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id } = await params;
  const { status } = await request.json();
  db.prepare("UPDATE Todo SET status = ? WHERE id = ?").run(status, id);
  return NextResponse.json({ id, status });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id } = await params;
  db.prepare("DELETE FROM Todo WHERE id = ?").run(id);
  return NextResponse.json({ message: "Deleted" });
}
