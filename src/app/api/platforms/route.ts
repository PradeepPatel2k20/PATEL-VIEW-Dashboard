import { NextRequest, NextResponse } from "next/server";
import { listPlatforms, createPlatform } from "@/services/platform-service";
import { platformInputSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/require-admin";
import { logAuditEvent } from "@/lib/audit";
import { getSettings } from "@/services/settings-service";
import type { SortDirection, SortField } from "@/types/platform";

// GET /api/platforms — public read (dashboard), supports search/filter/sort query params
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const settings = await getSettings();

  const sortField = sp.get("sortField") as SortField | null;
  const sortDirection = (sp.get("sortDirection") as SortDirection | null) ?? "asc";

  const platforms = await listPlatforms(
    {
      search: sp.get("search") ?? undefined,
      category: sp.get("category") ?? undefined,
      vendor: sp.get("vendor") ?? undefined,
      priority: sp.get("priority") ?? undefined,
      hasSecurityUpdate: sp.get("hasSecurityUpdate") === "true",
      recentlyUpdated: sp.get("recentlyUpdated") === "true",
      monitoringEnabled: sp.get("monitoringEnabled") === "true",
      enabledOnly: sp.get("enabledOnly") !== "false", // default true for public dashboard
    },
    sortField ? { field: sortField, direction: sortDirection } : undefined,
    settings.newReleaseThresholdDays
  );

  return NextResponse.json({ data: platforms });
}

// POST /api/platforms — admin only
export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const parsed = platformInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid platform data.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const platform = await createPlatform(parsed.data);
  await logAuditEvent(guard.username, "platform_created", { id: platform.id, name: platform.productName });
  return NextResponse.json({ data: platform }, { status: 201 });
}
