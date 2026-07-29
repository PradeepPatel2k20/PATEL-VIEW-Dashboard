"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText, ShieldCheck, Map, Activity, ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClosestItem, Platform } from "@/types/platform";
import { URGENCY_META } from "@/lib/constants";
import { cn, isRecentRelease, looksLikeUrl } from "@/lib/utils";

interface PlatformCardProps {
  platform: Platform;
  animationsEnabled: boolean;
  newReleaseThresholdDays: number;
}

export function PlatformCard({ platform: p, animationsEnabled, newReleaseThresholdDays }: PlatformCardProps) {
  const [open, setOpen] = useState(false);
  const meta = URGENCY_META[p.urgency] ?? URGENCY_META.watch;
  const isNew = isRecentRelease(p.latestReleaseDate, newReleaseThresholdDays);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid w-full grid-cols-[18px_1fr_90px] items-start gap-4 p-4 text-left focus-ring md:grid-cols-[18px_1.2fr_1.6fr_1.6fr_90px]"
        aria-expanded={open}
      >
        <ChevronRight className={cn("mt-0.5 h-3 w-3 flex-none text-textDim transition-transform", open && "rotate-90 text-accent")} />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold text-textPrimary">{p.productName}</span>
            {isNew && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent">
                <Sparkles className="h-2.5 w-2.5" /> New
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[10.5px] text-textDim">{p.category}</div>
          <div className="mt-1.5 hidden text-[11px] leading-snug text-textMuted md:block">{p.description}</div>
        </div>

        <ClosestItemColumn label="Latest release note" icon={FileText} closest={p.closestReleaseNote} />
        <ClosestItemColumn label="Latest security item" icon={ShieldCheck} closest={p.closestSecurityItem} />

        <div className="flex justify-end">
          <Badge variant={meta.className as "urgent" | "watch" | "continuous" | "stable"}>{meta.label}</Badge>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={animationsEnabled ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-borderSoft"
          >
            <div className="p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoBox label="Current / latest version" value={p.currentVersion || "—"} />
                <InfoBox label="Previous version" value={p.previousVersion || "—"} />
                <InfoBox label="End of support (EOL)" value={p.supportLifecycle || "—"} />
                <InfoBox label="Release frequency" value={p.releaseFrequency || "—"} />
                <InfoBox label="Priority" value={p.priority} />
                <InfoBox label="Vendor" value={p.vendor || "—"} />
              </div>

              {p.notes && (
                <div className="mt-3 rounded-md border border-borderSoft bg-surface2 p-3 text-[12px] leading-relaxed text-textMuted">
                  {p.notes}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <LinkChip href={p.releaseNotesUrl} icon={FileText} label="Release notes hub" />
                <LinkChip href={p.securityAdvisoryUrl} icon={ShieldCheck} label="Security advisory hub" />
                <LinkChip href={p.documentationUrl} icon={Map} label="Roadmap / docs" />
                <LinkChip href={p.statusPageUrl} icon={Activity} label="Status page" />
              </div>

              {p.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-surface2 px-2 py-0.5 font-mono text-[10px] text-textDim">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function ClosestItemColumn({
  label,
  icon: Icon,
  closest,
}: {
  label: string;
  icon: typeof FileText;
  closest?: ClosestItem;
}) {
  if (!closest) {
    return (
      <div className="hidden md:block">
        <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-textDim">
          <Icon className="h-2.5 w-2.5" /> {label}
        </div>
        <div className="text-[11.5px] text-textDim">Not available</div>
      </div>
    );
  }

  const isUrl = looksLikeUrl(closest.url);

  return (
    <div className="hidden min-w-0 md:block">
      <div className="mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-textDim">
        <Icon className="h-2.5 w-2.5" /> {label}
      </div>
      {isUrl ? (
        <a
          href={closest.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-textPrimary hover:text-accent hover:underline focus-ring"
        >
          {closest.item}
        </a>
      ) : (
        <div className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-textPrimary">{closest.item}</div>
      )}
      <div className="mt-1 font-mono text-[10px] text-textDim">{closest.date}</div>
      {closest.why && <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-textMuted">{closest.why}</div>}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-borderSoft bg-surface2 p-3">
      <div className="text-[9px] uppercase tracking-wide text-textDim">{label}</div>
      <div className="mt-1 text-[12px] capitalize text-textPrimary">{value}</div>
    </div>
  );
}

function LinkChip({ href, icon: Icon, label }: { href: string; icon: typeof FileText; label: string }) {
  if (!href) return null;

  if (!looksLikeUrl(href)) {
    return (
      <span
        title={href}
        className="inline-flex max-w-[260px] items-center gap-1.5 truncate rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-[11px] text-textDim"
      >
        <Icon className="h-3 w-3 flex-none" /> <span className="truncate">{href}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-[11px] text-blue transition-colors hover:border-blue focus-ring"
    >
      <Icon className="h-3 w-3" /> {label} <ExternalLink className="h-2.5 w-2.5 opacity-60" />
    </a>
  );
}
