import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { writeAllPlatforms, readAllPlatforms } from "@/repositories/platform-repository";
import { writeSettings, readSettings } from "@/repositories/settings-repository";
import { settingsSchema, platformInputSchema } from "@/lib/validation";
import { logAuditEvent } from "@/lib/audit";

const backupSchema = z.object({
  schemaVersion: z.literal(1),
  platforms: z.array(
    platformInputSchema.extend({
      id: z.string(),
      order: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
  settings: settingsSchema,
});

// POST /api/admin/restore — replaces platforms.json and settings.json from a
// previously downloaded backup file. Validated with Zod before anything is written,
// and the pre-restore state is captured in the audit log for traceability.
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const parsed = backupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid backup file.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const previousPlatforms = await readAllPlatforms();
  const previousSettings = await readSettings();

  await writeAllPlatforms(parsed.data.platforms);
  await writeSettings(parsed.data.settings);

  await logAuditEvent(guard.username, "backup_restored", {
    restoredPlatformCount: parsed.data.platforms.length,
    previousPlatformCount: previousPlatforms.length,
    previousSettingsSnapshot: previousSettings,
  });

  return NextResponse.json({ ok: true, restoredPlatforms: parsed.data.platforms.length });
}
