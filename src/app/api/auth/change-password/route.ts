import { NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword, deleteAllSessions, clearSessionCookie, createSession, setSessionCookie } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { current_password, new_password } = await request.json();
  if (!current_password || !new_password) {
    return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  }
  if (new_password.length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const row = db.prepare("SELECT password FROM TeamMember WHERE id = ?").get(user.id) as any;
  const valid = await verifyPassword(current_password, row.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const newHash = await hashPassword(new_password);
  db.prepare("UPDATE TeamMember SET password = ?, force_password_change = 0 WHERE id = ?").run(newHash, user.id);

  const newToken = await createSession(user.id);
  await setSessionCookie(newToken);

  return NextResponse.json({ success: true, message: "Password changed successfully" });
}
