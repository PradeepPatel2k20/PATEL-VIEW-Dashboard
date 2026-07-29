"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { REFRESH_INTERVAL_OPTIONS } from "@/lib/constants";
import type { AppSettings } from "@/types/settings";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (isLoading || !form) {
    return <div className="mx-auto max-w-2xl text-textDim">Loading settings…</div>;
  }

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-display text-xl font-semibold text-textPrimary">Settings</h1>
      <p className="mb-6 text-[12.5px] text-textMuted">
        Changes apply immediately — the dashboard's polling interval updates on next refresh.
      </p>

      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <Row label="Application name">
            <Input value={form.appName} onChange={(e) => set("appName", e.target.value)} />
          </Row>

          <Row label="Auto-refresh interval" hint="How often the dashboard polls for updates">
            <select
              value={form.refreshIntervalMinutes}
              onChange={(e) => set("refreshIntervalMinutes", Number(e.target.value) as AppSettings["refreshIntervalMinutes"])}
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-textPrimary focus-ring"
            >
              {REFRESH_INTERVAL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  Every {m} minute{m > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Default theme" hint="Users can still override this locally via the header toggle">
            <select
              value={form.theme}
              onChange={(e) => set("theme", e.target.value as AppSettings["theme"])}
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-textPrimary focus-ring"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Row>

          <Row label="Default view">
            <select
              value={form.defaultView}
              onChange={(e) => set("defaultView", e.target.value as AppSettings["defaultView"])}
              className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-textPrimary focus-ring"
            >
              <option value="cards">Cards</option>
              <option value="table">Table</option>
            </select>
          </Row>

          <Row label="Default category">
            <Input value={form.defaultCategory} onChange={(e) => set("defaultCategory", e.target.value)} />
          </Row>

          <Row label="New-release badge threshold" hint="Days since release to count as 'New'">
            <Input
              type="number"
              min={1}
              max={365}
              value={form.newReleaseThresholdDays}
              onChange={(e) => set("newReleaseThresholdDays", Number(e.target.value))}
            />
          </Row>

          <Row label="Session timeout (minutes)">
            <Input
              type="number"
              min={5}
              max={1440}
              value={form.sessionTimeoutMinutes}
              onChange={(e) => set("sessionTimeoutMinutes", Number(e.target.value))}
            />
          </Row>

          <Row label="Table page size">
            <Input
              type="number"
              min={5}
              max={200}
              value={form.tablePageSize}
              onChange={(e) => set("tablePageSize", Number(e.target.value))}
            />
          </Row>

          <Row label="Date format" hint="date-fns format string">
            <Input value={form.dateFormat} onChange={(e) => set("dateFormat", e.target.value)} />
          </Row>

          <Row label="Timezone">
            <Input value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
          </Row>

          <div className="flex items-center justify-between rounded-md border border-borderSoft bg-surface2 px-4 py-3">
            <div>
              <div className="text-sm text-textPrimary">Animations</div>
              <div className="text-[11.5px] text-textDim">Subtle motion on cards and KPIs</div>
            </div>
            <Switch checked={form.animationsEnabled} onCheckedChange={(v) => set("animationsEnabled", v)} />
          </div>

          <div className="flex items-center justify-between rounded-md border border-borderSoft bg-surface2 px-4 py-3">
            <div>
              <div className="text-sm text-textPrimary">Sidebar collapsed by default</div>
              <div className="text-[11.5px] text-textDim">Applies to new sessions / cleared local storage</div>
            </div>
            <Switch checked={form.sidebarDefaultCollapsed} onCheckedChange={(v) => set("sidebarDefaultCollapsed", v)} />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <BackupRestoreCard />
    </div>
  );
}

function BackupRestoreCard() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);

  function handleDownload() {
    window.location.href = "/api/admin/backup";
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = ""; // allow re-selecting the same file later
  }

  async function confirmRestore() {
    if (!pendingFile) return;
    setRestoring(true);
    try {
      const text = await pendingFile.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Restore failed");
      }
      const result = await res.json();
      toast.success(`Restored ${result.restoredPlatforms} platform(s)`);
      qc.invalidateQueries({ queryKey: ["platforms"] });
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed — check the file is a valid backup export.");
    } finally {
      setRestoring(false);
      setPendingFile(null);
    }
  }

  return (
    <Card className="mt-5">
      <CardContent className="pt-6">
        <h2 className="font-display text-sm font-semibold text-textPrimary">Backup &amp; restore</h2>
        <p className="mt-1 text-[12px] text-textMuted">
          Download a JSON snapshot of your platforms and settings, or restore from a previous export.
          User credentials are never included in a backup file.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> Download backup
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Restore from file
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
        </div>
      </CardContent>

      <Dialog open={!!pendingFile} onOpenChange={(o) => !o && setPendingFile(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Restore from backup?
            </DialogTitle>
            <DialogDescription>
              This will overwrite ALL current platforms and settings with the contents of{" "}
              <strong>{pendingFile?.name}</strong>. This cannot be undone from the UI — download a fresh
              backup first if you want to keep the current state.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingFile(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRestore} disabled={restoring}>
              {restoring ? "Restoring…" : "Overwrite and restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <span className="text-[11px] text-textDim">{hint}</span>}
    </div>
  );
}
