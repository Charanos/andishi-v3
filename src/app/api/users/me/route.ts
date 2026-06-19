import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api/responses";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  return NextResponse.json({ user: session.user });
}

