"use client";

import { ExternalLink, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Platform, SortDirection, SortField } from "@/types/platform";
import { URGENCY_META } from "@/lib/constants";
import { format } from "date-fns";
import { looksLikeUrl } from "@/lib/utils";

interface PlatformTableProps {
  platforms: Platform[];
  sort?: { field: SortField; direction: SortDirection };
  onSortChange: (field: SortField) => void;
  dateFormat: string;
}

const columns: { field: SortField; label: string }[] = [
  { field: "productName", label: "Platform" },
  { field: "currentVersion", label: "Current" },
  { field: "priority", label: "Priority" },
  { field: "latestReleaseDate", label: "Latest release" },
  { field: "category", label: "Category" },
];

export function PlatformTable({ platforms, sort, onSortChange, dateFormat }: PlatformTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-borderSoft bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  className="sticky top-0 border-b border-borderSoft bg-surface2 px-3.5 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-wide text-textDim"
                >
                  <button
                    onClick={() => onSortChange(col.field)}
                    className="flex items-center gap-1 focus-ring"
                  >
                    {col.label}
                    <ArrowUpDown
                      className={`h-2.5 w-2.5 ${sort?.field === col.field ? "text-accent" : "opacity-40"}`}
                    />
                  </button>
                </th>
              ))}
              <th className="sticky top-0 border-b border-borderSoft bg-surface2 px-3.5 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-wide text-textDim">
                Links
              </th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((p) => {
              const meta = URGENCY_META[p.urgency] ?? URGENCY_META.watch;
              return (
                <tr key={p.id} className="border-b border-borderSoft last:border-none hover:bg-white/[0.02]">
                  <td className="px-3.5 py-3">
                    <div className="font-display text-[13px] font-semibold text-textPrimary">{p.productName}</div>
                    <div className="font-mono text-[10.5px] text-textDim">{p.vendor}</div>
                  </td>
                  <td className="px-3.5 py-3 font-mono text-[11.5px] text-textMuted">{p.currentVersion}</td>
                  <td className="px-3.5 py-3">
                    <Badge variant={meta.className as "urgent" | "watch" | "continuous" | "stable"}>{meta.label}</Badge>
                  </td>
                  <td className="px-3.5 py-3 font-mono text-[11.5px] text-textMuted">
                    {safeFormat(p.latestReleaseDate, dateFormat)}
                  </td>
                  <td className="px-3.5 py-3 text-textMuted">{p.category}</td>
                  <td className="px-3.5 py-3">
                    <div className="flex gap-2">
                      {p.releaseNotesUrl && looksLikeUrl(p.releaseNotesUrl) && (
                        <a href={p.releaseNotesUrl} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {platforms.length === 0 && (
          <div className="py-16 text-center text-[13px] text-textDim">No platforms match this search / filter.</div>
        )}
      </div>
    </div>
  );
}

function safeFormat(iso: string, fmt: string) {
  try {
    return format(new Date(iso), fmt);
  } catch {
    return iso;
  }
}
