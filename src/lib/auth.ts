import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SESSION_COOKIE = "session_token";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
  await prisma.session.create({
    data: { token, user_id: userId, expires_at: expiresAt },
  });
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {});
}

export async function deleteAllSessions(userId: number): Promise<void> {
  await prisma.session.deleteMany({ where: { user_id: userId } });
}

export async function getCurrentUserFromDb(token: string) {
  const row = await prisma.session.findFirst({
    where: { token, expires_at: { gt: new Date() } },
    include: {
      user: {
        select: {
          id: true, username: true, name: true, role: true,
          force_password_change: true, first_name: true, last_name: true,
          email: true, event_ids: true,
        },
      },
    },
  });
  return row?.user ?? null;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE / 1000,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;
  const user = await getCurrentUserFromDb(token);
  if (!user) {
    await clearSessionCookie();
    return null;
  }
  return user;
}

export async function authenticate(): Promise<[any, null] | [null, NextResponse]> {
  const user = await getCurrentUser();
  if (!user) return [null, NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
  return [user, null];
}

export function requireRole(user: any, roles: string[]): NextResponse | null {
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function hasEventAccess(user: any, eventId: number): boolean {
  if (user.role === "savadmin" || user.role === "event_manager") return true;
  if (user.role === "event_user") {
    try {
      const ids: number[] = JSON.parse(user.event_ids || "[]");
      return ids.includes(eventId);
    } catch {
      return false;
    }
  }
  return false;
}

export async function getEventIdFromActivity(activityId: number): Promise<number | null> {
  const row = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { event_id: true },
  });
  return row?.event_id ?? null;
}
