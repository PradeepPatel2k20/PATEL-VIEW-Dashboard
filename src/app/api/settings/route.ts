import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/services/settings-service";
import { settingsSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/require-admin";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ data: settings });
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await updateSettings(parsed.data);
  await logAuditEvent(guard.username, "settings_updated", { keys: Object.keys(parsed.data) });
  return NextResponse.json({ data: settings });
}
