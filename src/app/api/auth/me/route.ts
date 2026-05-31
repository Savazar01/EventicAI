import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(null);
  }
  return NextResponse.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    force_password_change: user.force_password_change === 1,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  });
}
