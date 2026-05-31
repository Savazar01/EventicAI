import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = db.prepare("SELECT id, username, name, role, password, force_password_change FROM TeamMember WHERE username = ?").get(username) as any;
  if (!user || !user.password) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const token = await createSession(user.id);
  const response = NextResponse.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    force_password_change: user.force_password_change === 1,
  });
  response.cookies.set("session_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
