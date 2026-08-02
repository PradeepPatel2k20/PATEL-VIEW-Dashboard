"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Settings2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/");
  }

  const crumbs = [
    { href: "/admin", label: "Admin" },
    ...(pathname.includes("/settings") ? [{ href: "/admin/settings", label: "Settings" }] : []),
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-borderSoft bg-bg/85 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1.5 text-[12.5px] text-textMuted" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-textPrimary">Dashboard</Link>
              {crumbs.map((c) => (
                <span key={c.href} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-textDim" />
                  <Link href={c.href} className="hover:text-textPrimary">{c.label}</Link>
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button size="sm" variant={pathname === "/admin" ? "secondary" : "ghost"}>
                <LayoutDashboard className="h-3.5 w-3.5" /> Platforms
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button size="sm" variant={pathname.includes("/settings") ? "secondary" : "ghost"}>
                <Settings2 className="h-3.5 w-3.5" /> Settings
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
