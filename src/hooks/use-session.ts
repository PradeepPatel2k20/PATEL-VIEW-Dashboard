"use client";
import { useQuery } from "@tanstack/react-query";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/session");
      return (await res.json()) as { authenticated: boolean; username?: string };
    },
    staleTime: 30_000,
  });
}
