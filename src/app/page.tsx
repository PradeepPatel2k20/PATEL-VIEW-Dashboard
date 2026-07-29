"use client";

import { useState, useCallback, useMemo } from "react";
import { usePlatforms, useKpis } from "@/hooks/use-platforms";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@/hooks/use-session";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useDebounce } from "@/hooks/use-debounce";
import { Sidebar } from "@/components/features/sidebar";
import { DashboardHeader } from "@/components/features/dashboard-header";
import { KpiCards } from "@/components/features/kpi-cards";
import { PlatformCard } from "@/components/features/platform-card";
import { PlatformTable } from "@/components/features/platform-table";
import { CommandPalette } from "@/components/features/command-palette";
import { Skeleton } from "@/components/ui/skeleton";
import type { SortDirection, SortField } from "@/types/platform";

export default function DashboardPage() {
  const { data: settings } = useSettings();
  const { data: session } = useSession();

  const [category, setCategory] = useState("All");
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounce(searchRaw, 250);
  const [view, setView] = useLocalStorage<"cards" | "table">("dashboard-view", settings?.defaultView ?? "cards");
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection } | undefined>(undefined);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());

  const refreshIntervalMs = settings ? settings.refreshIntervalMinutes * 60 * 1000 : false;

  const {
    data: platforms,
    isLoading,
    isFetching,
    refetch,
  } = usePlatforms({
    filters: { search, category: category === "All" ? undefined : category, enabledOnly: true },
    sort,
    refreshIntervalMs,
  });

  const { data: kpis, isLoading: kpisLoading } = useKpis(refreshIntervalMs);

  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshedAt(Date.now());
  }, [refetch]);

  const handleSortChange = useCallback((field: SortField) => {
    setSort((prev) => {
      if (!prev || prev.field !== field) return { field, direction: "asc" };
      return { field, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }, []);

  const animationsEnabled = settings?.animationsEnabled ?? true;
  const thresholdDays = settings?.newReleaseThresholdDays ?? 30;
  const dateFormat = settings?.dateFormat ?? "MMM d, yyyy";

  const allForPalette = useMemo(() => platforms ?? [], [platforms]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        platforms={platforms ?? []}
        category={category}
        onCategoryChange={setCategory}
        search={searchRaw}
        onSearchChange={setSearchRaw}
        view={view}
        onViewChange={setView}
        isAdmin={session?.authenticated}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader lastRefreshedAt={lastRefreshedAt} onRefresh={handleRefresh} isFetching={isFetching} />

        <main className="flex-1 px-6 py-6">
          <KpiCards kpis={kpis} isLoading={kpisLoading} animationsEnabled={animationsEnabled} />

          <div className="mt-6 flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : view === "table" ? (
              <PlatformTable
                platforms={platforms ?? []}
                sort={sort}
                onSortChange={handleSortChange}
                dateFormat={dateFormat}
              />
            ) : (platforms ?? []).length === 0 ? (
              <div className="py-20 text-center text-sm text-textDim">No platforms match this search / filter.</div>
            ) : (
              (platforms ?? []).map((p) => (
                <PlatformCard
                  key={p.id}
                  platform={p}
                  animationsEnabled={animationsEnabled}
                  newReleaseThresholdDays={thresholdDays}
                />
              ))
            )}
          </div>
        </main>

        <footer className="no-print px-6 pb-8 pt-2 text-[11px] leading-relaxed text-textDim">
          Press <kbd className="rounded border border-border px-1 font-mono">⌘K</kbd> / <kbd className="rounded border border-border px-1 font-mono">Ctrl K</kbd> for the command palette. Data auto-refreshes every{" "}
          {settings?.refreshIntervalMinutes ?? 5} minute(s) — adjustable in Admin → Settings.
        </footer>
      </div>

      <CommandPalette platforms={allForPalette} onSelectView={setView} onRefresh={handleRefresh} />
    </div>
  );
}
