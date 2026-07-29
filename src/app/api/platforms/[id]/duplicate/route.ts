import { NextRequest, NextResponse } from "next/server";
import { duplicatePlatform } from "@/services/platform-service";
import { requireAdmin } from "@/lib/require-admin";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const copy = await duplicatePlatform(id);
  if (!copy) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAuditEvent(guard.username, "platform_duplicated", { sourceId: id, newId: copy.id });
  return NextResponse.json({ data: copy }, { status: 201 });
}
