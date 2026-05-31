import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET() {
  const [user, err] = await authenticate();
  if (err) return err;

  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const [user, err] = await authenticate();
  if (err) return err;

  try {
    const { title } = await request.json();
    const todo = await prisma.todo.create({ data: { title, status: "backlog" } });
    return NextResponse.json({ id: todo.id, title: todo.title, status: todo.status });
  } catch (error) {
    console.error("POST /api/todos error:", error);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
