"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Platform, PlatformFilters, SortDirection, SortField } from "@/types/platform";
import type { PlatformInputParsed } from "@/lib/validation";

interface UsePlatformsArgs {
  filters?: PlatformFilters;
  sort?: { field: SortField; direction: SortDirection };
  refreshIntervalMs?: number | false;
}

function buildQuery(filters: PlatformFilters = {}, sort?: UsePlatformsArgs["sort"]) {
  const sp = new URLSearchParams();
  if (filters.search) sp.set("search", filters.search);
  if (filters.category) sp.set("category", filters.category);
  if (filters.vendor) sp.set("vendor", filters.vendor);
  if (filters.priority) sp.set("priority", filters.priority);
  if (filters.hasSecurityUpdate) sp.set("hasSecurityUpdate", "true");
  if (filters.recentlyUpdated) sp.set("recentlyUpdated", "true");
  if (filters.monitoringEnabled) sp.set("monitoringEnabled", "true");
  if (filters.enabledOnly === false) sp.set("enabledOnly", "false");
  if (sort) {
    sp.set("sortField", sort.field);
    sp.set("sortDirection", sort.direction);
  }
  return sp.toString();
}

export function usePlatforms({ filters, sort, refreshIntervalMs = false }: UsePlatformsArgs) {
  const qs = buildQuery(filters, sort);
  return useQuery({
    queryKey: ["platforms", qs],
    queryFn: async () => {
      const res = await fetch(`/api/platforms?${qs}`);
      if (!res.ok) throw new Error("Failed to load platforms");
      const json = await res.json();
      return json.data as Platform[];
    },
    refetchInterval: refreshIntervalMs,
  });
}

export function useKpis(refreshIntervalMs: number | false = false) {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: async () => {
      const res = await fetch("/api/kpis");
      if (!res.ok) throw new Error("Failed to load KPIs");
      const json = await res.json();
      return json.data as { total: number; securityUpdates: number; pendingUpdates: number; newReleases: number };
    },
    refetchInterval: refreshIntervalMs,
  });
}

export function useCreatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlatformInputParsed) => {
      const res = await fetch("/api/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create platform");
      return (await res.json()).data as Platform;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
}

export function useUpdatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<PlatformInputParsed> }) => {
      const res = await fetch(`/api/platforms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update platform");
      return (await res.json()).data as Platform;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
}

export function useDeletePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/platforms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete platform");
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
}

export function useDuplicatePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/platforms/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to duplicate platform");
      return (await res.json()).data as Platform;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms"] }),
  });
}

export function useBulkAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: "delete" | "enable" | "disable" }) => {
      const res = await fetch("/api/platforms/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Bulk action failed");
      return (await res.json()) as { ok: boolean; count: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platforms"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
}

export function useReorderPlatforms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await fetch("/api/platforms/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return (await res.json()).data as Platform[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platforms"] }),
  });
}
