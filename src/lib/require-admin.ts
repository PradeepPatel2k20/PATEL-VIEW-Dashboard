import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./crypto";
import { SESSION_COOKIE_NAME } from "./env";

export async function requireAdmin(req: NextRequest): Promise<{ username: string } | NextResponse> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { username: session.username };
}
