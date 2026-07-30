"use client";

import { useSettings } from "@/hooks/use-settings";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function useTheme(): "dark" | "light" {
  const { data: settings } = useSettings();
  const [override] = useLocalStorage<"dark" | "light" | null>("theme-override", null);
  return override ?? settings?.theme ?? "dark";
}
