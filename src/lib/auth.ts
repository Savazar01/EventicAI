import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";

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
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE).toISOString();
  db.prepare("INSERT INTO Session (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  db.prepare("DELETE FROM Session WHERE token = ?").run(token);
}

export async function deleteAllSessions(userId: number): Promise<void> {
  db.prepare("DELETE FROM Session WHERE user_id = ?").run(userId);
}

export function getCurrentUserFromDb(token: string): { id: number; username: string; name: string; role: string; force_password_change: number; first_name: string; last_name: string; email: string; event_ids: string } | null {
  const row = db.prepare(`
    SELECT tm.id, tm.username, tm.name, tm.role, tm.force_password_change, tm.first_name, tm.last_name, tm.email, tm.event_ids
    FROM Session s JOIN TeamMember tm ON s.user_id = tm.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as any;
  return row || null;
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
  const user = getCurrentUserFromDb(token);
  if (!user) {
    await clearSessionCookie();
    return null;
  }
  return user;
}

// ── Role & Access helpers ──────────────────────────────────────────

/**
 * Authenticate the current request. Returns [user, null] on success
 * or [null, errorResponse] on failure.
 */
export async function authenticate(): Promise<[any, null] | [null, NextResponse]> {
  const user = await getCurrentUser();
  if (!user) return [null, NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
  return [user, null];
}

/** Returns a 403 NextResponse if the user's role is not in the allowed list, or null. */
export function requireRole(user: any, roles: string[]): NextResponse | null {
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Checks whether the user has access to a specific event.
 * savadmin / event_manager → full access to all events.
 * event_user → only events listed in their event_ids JSON array.
 */
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

/** Resolves an activity_id to its parent event_id, or null. */
export function getEventIdFromActivity(activityId: number): number | null {
  const row = db.prepare("SELECT event_id FROM Activity WHERE id = ?").get(activityId) as any;
  return row?.event_id ?? null;
}
