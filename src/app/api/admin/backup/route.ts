import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { readAllPlatforms } from "@/repositories/platform-repository";
import { readSettings } from "@/repositories/settings-repository";
import { logAuditEvent } from "@/lib/audit";

// GET /api/admin/backup — downloads a single JSON snapshot of platforms + settings.
// Deliberately excludes users.json (never ship password hashes in a downloadable file).
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const [platforms, settings] = await Promise.all([readAllPlatforms(), readSettings()]);

  const backup = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: guard.username,
    platforms,
    settings,
  };

  await logAuditEvent(guard.username, "backup_downloaded", { platformCount: platforms.length });

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="platform-tracker-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
