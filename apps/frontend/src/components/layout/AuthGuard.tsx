"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/auth-slice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { tokens, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load tokens from localStorage on client side mount
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // If auth state initialization is done and there are no tokens, redirect to sign in
    if (status !== "loading") {
      const stored = typeof window !== "undefined" ? localStorage.getItem("indicarbon_tokens") : null;
      if (!stored && !tokens) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (tokens) {
        const isInternal = tokens.is_internal || tokens.roles?.includes("SUPER_ADMIN");
        if (isInternal && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
          router.push("/admin");
        } else if (!isInternal && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
          router.push("/dashboard");
        }
      }
    }
  }, [tokens, status, router, pathname]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground animate-pulse">
            Authenticating session...
          </p>
        </div>
      </div>
    );
  }

  // If status is authenticated or we have tokens, let them pass
  return <>{children}</>;
}
