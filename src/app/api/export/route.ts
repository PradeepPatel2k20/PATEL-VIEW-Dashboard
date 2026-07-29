import { NextRequest, NextResponse } from "next/server";
import { listPlatforms } from "@/services/platform-service";
import * as XLSX from "xlsx";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((h) => escape(row[h])).join(","));
  return lines.join("\n");
}

function flatten(platforms: Awaited<ReturnType<typeof listPlatforms>>) {
  return platforms.map((p) => ({
    productName: p.productName,
    vendor: p.vendor,
    category: p.category,
    currentVersion: p.currentVersion,
    previousVersion: p.previousVersion,
    latestReleaseDate: p.latestReleaseDate,
    priority: p.priority,
    urgency: p.urgency,
    supportLifecycle: p.supportLifecycle,
    releaseNotesUrl: p.releaseNotesUrl,
    securityAdvisoryUrl: p.securityAdvisoryUrl,
    statusPageUrl: p.statusPageUrl,
    tags: p.tags.join("; "),
  }));
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const platforms = await listPlatforms({ enabledOnly: false });
  const rows = flatten(platforms);

  if (format === "csv") {
    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="platforms-export.csv"',
      },
    });
  }

  if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Platforms");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="platforms-export.xlsx"',
      },
    });
  }

  // json (default) — PDF is generated client-side via print stylesheet (see /export/print)
  return new NextResponse(JSON.stringify(rows, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="platforms-export.json"',
    },
  });
}
