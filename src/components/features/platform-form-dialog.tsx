"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { platformInputSchema, type PlatformInputParsed } from "@/lib/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Platform } from "@/types/platform";

interface PlatformFormDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Platform | null;
  onSubmit: (values: PlatformInputParsed) => Promise<void>;
  submitting: boolean;
}

const emptyDefaults: PlatformInputParsed = {
  productName: "",
  vendor: "",
  category: "",
  currentVersion: "",
  previousVersion: "",
  latestReleaseDate: new Date().toISOString().slice(0, 10),
  securityAdvisoryUrl: "",
  releaseNotesUrl: "",
  statusPageUrl: "",
  documentationUrl: "",
  releaseFrequency: "",
  supportLifecycle: "",
  autoRefreshEnabled: true,
  monitoringEnabled: true,
  priority: "medium",
  tags: [],
  description: "",
  notes: "",
  enabled: true,
  urgency: "watch",
  urgencyNote: "",
};

export function PlatformFormDialog({ open, onOpenChange, initial, onSubmit, submitting }: PlatformFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlatformInputParsed>({
    resolver: zodResolver(platformInputSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              productName: initial.productName,
              vendor: initial.vendor,
              category: initial.category,
              currentVersion: initial.currentVersion,
              previousVersion: initial.previousVersion,
              latestReleaseDate: initial.latestReleaseDate.slice(0, 10),
              securityAdvisoryUrl: initial.securityAdvisoryUrl,
              releaseNotesUrl: initial.releaseNotesUrl,
              statusPageUrl: initial.statusPageUrl,
              documentationUrl: initial.documentationUrl,
              releaseFrequency: initial.releaseFrequency,
              supportLifecycle: initial.supportLifecycle,
              autoRefreshEnabled: initial.autoRefreshEnabled,
              monitoringEnabled: initial.monitoringEnabled,
              priority: initial.priority,
              tags: initial.tags,
              description: initial.description,
              notes: initial.notes,
              enabled: initial.enabled,
              urgency: initial.urgency,
              urgencyNote: initial.urgencyNote,
            }
          : emptyDefaults
      );
    }
  }, [open, initial, reset]);

  const autoRefresh = watch("autoRefreshEnabled");
  const monitoring = watch("monitoringEnabled");
  const enabled = watch("enabled");

  async function submit(values: PlatformInputParsed) {
    await onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit platform" : "Add platform"}</DialogTitle>
          <DialogDescription>All fields are validated before saving.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Product name" error={errors.productName?.message}>
            <Input {...register("productName")} />
          </Field>
          <Field label="Vendor" error={errors.vendor?.message}>
            <Input {...register("vendor")} />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <Input {...register("category")} />
          </Field>
          <Field label="Priority">
            <select {...register("priority")} className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-textPrimary focus-ring">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Current version" error={errors.currentVersion?.message}>
            <Input {...register("currentVersion")} />
          </Field>
          <Field label="Previous version">
            <Input {...register("previousVersion")} />
          </Field>
          <Field label="Latest release date" error={errors.latestReleaseDate?.message}>
            <Input type="date" {...register("latestReleaseDate")} />
          </Field>
          <Field label="Release frequency">
            <Input {...register("releaseFrequency")} placeholder="e.g. Monthly" />
          </Field>
          <Field label="Release notes URL">
            <Input {...register("releaseNotesUrl")} placeholder="https://" />
          </Field>
          <Field label="Security advisory URL">
            <Input {...register("securityAdvisoryUrl")} placeholder="https://" />
          </Field>
          <Field label="Status page URL">
            <Input {...register("statusPageUrl")} placeholder="https://" />
          </Field>
          <Field label="Documentation URL">
            <Input {...register("documentationUrl")} placeholder="https://" />
          </Field>
          <Field label="Support lifecycle" full>
            <Input {...register("supportLifecycle")} placeholder="e.g. EOL Dec 2026" />
          </Field>
          <Field label="Description" full>
            <textarea
              {...register("description")}
              rows={2}
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-textPrimary focus-ring"
            />
          </Field>
          <Field label="Notes" full>
            <textarea
              {...register("notes")}
              rows={2}
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-textPrimary focus-ring"
            />
          </Field>

          <div className="col-span-full flex flex-wrap gap-6 rounded-md border border-borderSoft bg-surface2 p-3.5">
            <ToggleField label="Auto refresh" checked={autoRefresh} onChange={(v) => setValue("autoRefreshEnabled", v)} />
            <ToggleField label="Monitoring" checked={monitoring} onChange={(v) => setValue("monitoringEnabled", v)} />
            <ToggleField label="Enabled" checked={enabled} onChange={(v) => setValue("enabled", v)} />
          </div>

          <DialogFooter className="col-span-full">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : initial ? "Save changes" : "Add platform"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-[12.5px] text-textMuted">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}
