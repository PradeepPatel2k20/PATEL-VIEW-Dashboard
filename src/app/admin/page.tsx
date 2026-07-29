"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Copy, ArrowUp, ArrowDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlatformFormDialog } from "@/components/features/platform-form-dialog";
import {
  usePlatforms,
  useCreatePlatform,
  useUpdatePlatform,
  useDeletePlatform,
  useDuplicatePlatform,
  useBulkAction,
  useReorderPlatforms,
} from "@/hooks/use-platforms";
import type { Platform } from "@/types/platform";
import { URGENCY_META } from "@/lib/constants";
import { toast } from "sonner";

export default function AdminPlatformsPage() {
  const { data: platforms, isLoading } = usePlatforms({ filters: { enabledOnly: false } });
  const createMutation = useCreatePlatform();
  const updateMutation = useUpdatePlatform();
  const deleteMutation = useDeletePlatform();
  const duplicateMutation = useDuplicatePlatform();
  const bulkMutation = useBulkAction();
  const reorderMutation = useReorderPlatforms();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Platform | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Platform | null>(null);

  const filtered = useMemo(() => {
    if (!platforms) return [];
    if (!search.trim()) return platforms;
    const q = search.toLowerCase();
    return platforms.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [platforms, search]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))));
  }

  async function handleSave(values: Parameters<typeof createMutation.mutateAsync>[0]) {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, patch: values });
        toast.success(`${values.productName} updated`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success(`${values.productName} added`);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      toast.success(`${confirmDelete.productName} deleted`);
      setConfirmDelete(null);
    } catch {
      toast.error("Delete failed");
    }
  }

  async function handleBulk(action: "delete" | "enable" | "disable") {
    if (selected.size === 0) return;
    try {
      const res = await bulkMutation.mutateAsync({ ids: Array.from(selected), action });
      toast.success(`${action} applied to ${res.count} platform(s)`);
      setSelected(new Set());
    } catch {
      toast.error("Bulk action failed");
    }
  }

  async function move(id: string, direction: -1 | 1) {
    if (!platforms) return;
    const ids = platforms.map((p) => p.id);
    const idx = ids.indexOf(id);
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[idx], ids[swapWith]] = [ids[swapWith], ids[idx]];
    await reorderMutation.mutateAsync(ids);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-textPrimary">Platform management</h1>
          <p className="mt-1 text-[12.5px] text-textMuted">{platforms?.length ?? 0} platforms configured</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add platform
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textDim" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8" />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-borderSoft bg-surface2 px-3 py-1.5">
            <span className="text-[12px] text-textMuted">{selected.size} selected</span>
            <Button size="sm" variant="secondary" onClick={() => handleBulk("enable")}>Enable</Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulk("disable")}>Disable</Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulk("delete")}>Delete</Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-borderSoft bg-surface">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-borderSoft bg-surface2">
              <th className="w-10 px-3 py-3">
                <Checkbox checked={selected.size > 0 && selected.size === filtered.length} onCheckedChange={toggleSelectAll} />
              </th>
              <th className="px-3 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-wide text-textDim">Platform</th>
              <th className="px-3 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-wide text-textDim">Category</th>
              <th className="px-3 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-wide text-textDim">Status</th>
              <th className="px-3 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-wide text-textDim">Enabled</th>
              <th className="px-3 py-3 text-right font-display text-[10px] font-semibold uppercase tracking-wide text-textDim">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-textDim">Loading…</td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-textDim">No platforms found.</td>
              </tr>
            )}
            {filtered.map((p, idx) => {
              const meta = URGENCY_META[p.urgency] ?? URGENCY_META.watch;
              return (
                <tr key={p.id} className="border-b border-borderSoft last:border-none hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5">
                    <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-display text-[13px] font-semibold text-textPrimary">{p.productName}</div>
                    <div className="font-mono text-[10.5px] text-textDim">{p.vendor}</div>
                  </td>
                  <td className="px-3 py-2.5 text-textMuted">{p.category}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={meta.className as "urgent" | "watch" | "continuous" | "stable"}>{meta.label}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={p.enabled ? "text-success" : "text-textDim"}>{p.enabled ? "Enabled" : "Disabled"}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn label="Move up" onClick={() => move(p.id, -1)} disabled={idx === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn label="Move down" onClick={() => move(p.id, 1)} disabled={idx === filtered.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn label="Duplicate" onClick={() => duplicateMutation.mutate(p.id)}>
                        <Copy className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn
                        label="Edit"
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </IconBtn>
                      <IconBtn label="Delete" onClick={() => setConfirmDelete(p)} destructive>
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PlatformFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={handleSave}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete platform?</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>{confirmDelete?.productName}</strong> from the tracker. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  destructive,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-md border border-border text-textMuted transition-colors hover:bg-surface2 hover:text-textPrimary focus-ring disabled:opacity-30 ${
        destructive ? "hover:border-danger/50 hover:text-danger" : ""
      }`}
    >
      {children}
    </button>
  );
}
