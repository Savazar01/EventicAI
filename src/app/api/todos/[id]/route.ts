import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id } = await params;
  const { status } = await request.json();
  await prisma.todo.update({ where: { id: Number(id) }, data: { status } });
  return NextResponse.json({ id: Number(id), status });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [user, err] = await authenticate();
  if (err) return err;

  const { id } = await params;
  await prisma.todo.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Deleted" });
}
