"use client";

import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useLocalStorage } from "@/hooks/use-local-storage";

/**
 * Applies the active theme to <html data-theme="...">. Resolution order:
 * 1. A user's personal override (toggled via ThemeToggle, persisted locally)
 * 2. The admin-configured default from Settings
 * 3. "dark" as a hard fallback before settings have loaded
 */
export function ThemeProvider() {
  const { data: settings } = useSettings();
  const [override] = useLocalStorage<"dark" | "light" | null>("theme-override", null);

  useEffect(() => {
    const theme = override ?? settings?.theme ?? "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, [override, settings?.theme]);

  return null;
}
