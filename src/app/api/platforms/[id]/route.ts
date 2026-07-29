import { NextRequest, NextResponse } from "next/server";
import { getPlatform, updatePlatform, deletePlatform } from "@/services/platform-service";
import { platformUpdateSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/require-admin";
import { logAuditEvent } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const platform = await getPlatform(id);
  if (!platform) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: platform });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = platformUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid platform data.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updatePlatform(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAuditEvent(guard.username, "platform_updated", { id });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const ok = await deletePlatform(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAuditEvent(guard.username, "platform_deleted", { id });
  return NextResponse.json({ ok: true });
}
