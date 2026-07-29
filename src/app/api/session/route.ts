import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/crypto";
import { SESSION_COOKIE_NAME } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 200 });
  return NextResponse.json({ authenticated: true, username: session.username, expiresAt: session.expiresAt });
}
