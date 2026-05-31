import { getSessionToken, deleteSession } from "@/lib/auth";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await deleteSession(token);
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/",
      "Set-Cookie": "session_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    },
  });
}
