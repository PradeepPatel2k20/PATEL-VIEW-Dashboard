"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Search, ChevronLeft, LayoutGrid, Table2, Settings, LogOut } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/hooks/use-theme";
import type { Platform } from "@/types/platform";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SidebarProps {
  platforms: Platform[];
  category: string;
  onCategoryChange: (c: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  view: "cards" | "table";
  onViewChange: (v: "cards" | "table") => void;
  isAdmin?: boolean;
}

export function Sidebar({
  platforms,
  category,
  onCategoryChange,
  search,
  onSearchChange,
  view,
  onViewChange,
  isAdmin,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);
  const theme = useTheme();
  const isLight = theme === "light";

  const categories = useMemo(() => {
    const set = new Set(platforms.map((p) => p.category));
    return ["All", ...Array.from(set).sort()];
  }, [platforms]);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-none flex-col overflow-y-auto overflow-x-hidden border-r transition-[width] duration-300",
        isLight
          ? "border-border bg-gradient-to-b from-slate-100 via-white to-slate-200"
          : "border-white/5 bg-gradient-to-b from-[#3B1747] via-[#2B1133] to-[#1D0A25]",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex flex-col items-start px-5 pb-4 pt-6", collapsed && "items-center px-2")}>
        <div
          className={cn(
            "inline-flex w-full items-center justify-center rounded-lg border px-3.5 py-2.5",
            isLight ? "border-border bg-white shadow-sm" : "border-white/10 bg-black/20"
          )}
        >
          {isLight ? (
            <Image
              src="/view-logo-light.png"
              alt="Altudo VIEW — Visibility, Insights & Enterprise Watch"
              width={220}
              height={80}
              className="h-auto w-full max-w-[210px] object-contain"
              priority
            />
          ) : (
            <Image src="/logo.png" alt="Altudo logo" width={96} height={30} className="h-6 w-auto object-contain" priority />
          )}
        </div>
        {!collapsed && (
          <div
            className={cn(
              "mt-3 font-display text-[11px] font-semibold tracking-[0.18em]",
              isLight ? "text-textMuted" : "text-white/70"
            )}
          >
            MANAGED SERVICES
          </div>
        )}

        {/* VIEW toggle — segmented Cards / Table control */}
        <div className={cn("mt-5 w-full", collapsed && "mt-4")}>
          {!collapsed && (
            <div
              className={cn(
                "mb-2 flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
                isLight ? "text-textDim" : "text-white/45"
              )}
            >
              View
            </div>
          )}
          <div
            className={cn(
              "relative flex overflow-hidden rounded-[9px] border",
              isLight
                ? "border-border bg-surface2"
                : "border-white/10 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.45))]",
              collapsed && "flex-col"
            )}
          >
            <button
              onClick={() => onViewChange("cards")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[11.5px] font-semibold transition-colors focus-ring",
                view === "cards"
                  ? isLight
                    ? "bg-white text-textPrimary shadow-sm"
                    : "bg-white/15 text-white"
                  : isLight
                    ? "text-textMuted hover:text-textPrimary"
                    : "text-white/60 hover:text-white"
              )}
              aria-pressed={view === "cards"}
              aria-label="Card view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {!collapsed && <span>Cards</span>}
            </button>
            <button
              onClick={() => onViewChange("table")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[11.5px] font-semibold transition-colors focus-ring",
                view === "table"
                  ? isLight
                    ? "bg-white text-textPrimary shadow-sm"
                    : "bg-white/15 text-white"
                  : isLight
                    ? "text-textMuted hover:text-textPrimary"
                    : "text-white/60 hover:text-white"
              )}
              aria-pressed={view === "table"}
              aria-label="Table view"
            >
              <Table2 className="h-3.5 w-3.5" />
              {!collapsed && <span>Table</span>}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-5 w-full">
            <div className="relative">
              <Search
                className={cn(
                  "pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2",
                  isLight ? "text-textDim" : "text-white/40"
                )}
              />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search platform…"
                className={cn(
                  "w-full rounded-md border py-2 pl-7 pr-2.5 text-[12.5px] focus-ring",
                  isLight
                    ? "border-border bg-white text-textPrimary placeholder:text-textDim"
                    : "border-white/10 bg-black/25 text-white placeholder:text-white/35"
                )}
                aria-label="Search platforms"
              />
            </div>
          </div>
        )}

        {!collapsed && (
          <div
            className={cn(
              "mb-2 mt-5 text-[9.5px] font-semibold uppercase tracking-[0.14em]",
              isLight ? "text-textDim" : "text-white/45"
            )}
          >
            Category
          </div>
        )}
        <nav className={cn("flex w-full flex-col gap-0.5", collapsed && "items-center")} aria-label="Categories">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium transition-colors focus-ring",
                collapsed ? "w-9 justify-center px-0" : "w-full",
                c === category
                  ? isLight
                    ? "border border-orange/40 bg-orange/10 text-textPrimary"
                    : "border border-orange/40 bg-orange/15 text-white"
                  : isLight
                    ? "text-textMuted hover:bg-surface2 hover:text-textPrimary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
              aria-current={c === category}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 flex-none rounded-full",
                  c === category ? "bg-orange" : isLight ? "bg-textDim/50" : "bg-white/35"
                )}
              />
              {!collapsed && <span className="truncate">{c}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className={cn("mt-auto flex flex-col gap-2 px-3 pb-5 pt-4", collapsed && "items-center px-2")}>
        {isAdmin ? (
          <>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-[11.5px] font-semibold focus-ring",
                collapsed && "w-9 justify-center px-0",
                isLight
                  ? "border-border bg-white text-textMuted hover:bg-surface2 hover:text-textPrimary"
                  : "border-white/10 bg-black/20 text-white/75 hover:bg-white/5 hover:text-white"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              {!collapsed && <span>Admin</span>}
            </Link>
          </>
        ) : (
          <Link
            href="/admin/login"
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-[11.5px] font-semibold focus-ring",
              collapsed && "w-9 justify-center px-0",
              isLight
                ? "border-border bg-white text-textMuted hover:bg-surface2 hover:text-textPrimary"
                : "border-white/10 bg-black/20 text-white/75 hover:bg-white/5 hover:text-white"
            )}
          >
            <LogOut className="h-3.5 w-3.5 rotate-180" />
            {!collapsed && <span>Admin Login</span>}
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border py-2 text-[11.5px] font-semibold transition-colors focus-ring",
            collapsed ? "h-9 w-9" : "w-full",
            isLight
              ? "border-border bg-white text-textMuted hover:bg-surface2 hover:text-textPrimary"
              : "border-white/10 bg-black/20 text-white/70 hover:bg-white/5 hover:text-white"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
