"use client";

import { Moon, Sun } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { data: settings } = useSettings();
  const [override, setOverride] = useLocalStorage<"dark" | "light" | null>("theme-override", null);
  const active = override ?? settings?.theme ?? "dark";

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={active === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setOverride(active === "dark" ? "light" : "dark")}
    >
      {active === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
