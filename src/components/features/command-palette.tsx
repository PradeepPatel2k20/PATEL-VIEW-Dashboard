"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, LayoutGrid, Table2, RefreshCw, Settings, ExternalLink } from "lucide-react";
import type { Platform } from "@/types/platform";

interface CommandPaletteProps {
  platforms: Platform[];
  onSelectView: (v: "cards" | "table") => void;
  onRefresh: () => void;
}

export function CommandPalette({ platforms, onSelectView, onRefresh }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return platforms.filter((p) => p.productName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 6);
  }, [query, platforms]);

  const actions = [
    { label: "Switch to Card view", icon: LayoutGrid, run: () => onSelectView("cards") },
    { label: "Switch to Table view", icon: Table2, run: () => onSelectView("table") },
    { label: "Refresh data now", icon: RefreshCw, run: onRefresh },
    { label: "Open Admin panel", icon: Settings, run: () => router.push("/admin") },
  ];

  const filteredActions = query.trim()
    ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-borderSoft px-4 py-3">
          <Search className="h-4 w-4 text-textDim" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search platforms or run a command…"
            className="flex-1 bg-transparent text-sm text-textPrimary placeholder:text-textDim focus:outline-none"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-textDim">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {matches.length > 0 && (
            <>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-textDim">Platforms</div>
              {matches.map((p) => (
                <a
                  key={p.id}
                  href={p.releaseNotesUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm text-textMuted hover:bg-surface2 hover:text-textPrimary"
                  onClick={() => setOpen(false)}
                >
                  <span>{p.productName} <span className="text-textDim">· {p.category}</span></span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              ))}
            </>
          )}

          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-textDim">Actions</div>
          {filteredActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => {
                  a.run();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-textMuted hover:bg-surface2 hover:text-textPrimary"
              >
                <Icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            );
          })}
          {filteredActions.length === 0 && matches.length === 0 && (
            <div className="px-2.5 py-6 text-center text-sm text-textDim">No results.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
