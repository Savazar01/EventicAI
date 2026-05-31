import { NextResponse } from "next/server";
import db from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;

  const todos = db.prepare("SELECT * FROM Todo ORDER BY createdAt DESC").all();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  try {
    const { title } = await request.json();
    const stmt = db.prepare("INSERT INTO Todo (title, status) VALUES (?, ?)");
    const info = stmt.run(title, "backlog");
    return NextResponse.json({ id: Number(info.lastInsertRowid), title, status: "backlog" });
  } catch (error) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
