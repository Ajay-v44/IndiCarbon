"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth, logout } from "@/store/auth-slice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { tokens, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load tokens from localStorage on client side mount
    dispatch(initializeAuth());
  }, [dispatch]);

  const isInternal = tokens?.is_internal || tokens?.roles?.includes("SUPER_ADMIN") || tokens?.roles?.includes("SALES") || tokens?.roles?.includes("GOVT_AUDITOR");
  const hasNoOrg = tokens && !isInternal && !tokens.organization_id;

  useEffect(() => {
    // If auth state initialization is done and there are no tokens, redirect to sign in
    if (status !== "loading") {
      const stored = typeof window !== "undefined" ? localStorage.getItem("indicarbon_tokens") : null;
      if (!stored && !tokens) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (tokens) {
        if (isInternal && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
          router.push("/admin");
        } else if (!isInternal && !hasNoOrg && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
          router.push("/dashboard");
        }
      }
    }
  }, [tokens, status, router, pathname, isInternal, hasNoOrg]);

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

  if (hasNoOrg && (pathname.startsWith("/dashboard") || pathname === "/dashboard")) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full glass border border-border rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <span className="text-amber-500 text-3xl font-black">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground">No Organization Assigned</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account has not been associated with any organization on IndiCarbon. 
              Please request your administrator or manager to assign you to an organization.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                dispatch(logout());
                router.push("/auth/login");
              }}
              className="w-full py-2.5 rounded-xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If status is authenticated or we have tokens, let them pass
  return <>{children}</>;
}
