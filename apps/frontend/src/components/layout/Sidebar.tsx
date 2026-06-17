"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Vault,
  Leaf,
  ShieldCheck,
  MessageSquareText,
  Settings,
  LogOut,
  ShoppingBag,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";

const sidebarItems = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard, badge: null },
  { href: "/dashboard/chat", label: "Agenti Chat", icon: MessageSquareText, badge: "Live" },
  { href: "/simulator",  label: "AI Simulator",  icon: FlaskConical,    badge: "Beta" },
  { href: "/portfolio",  label: "Carbon Vault",  icon: Vault,           badge: null },
  { href: "/marketplace", label: "Marketplace",  icon: ShoppingBag,     badge: null },
  { href: "/dashboard/integration", label: "MCP & API", icon: Plug, badge: "New" },
  { href: "/admin",      label: "Admin Center",  icon: ShieldCheck,     badge: null },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.auth.tokens);

  const email = tokens?.email || "ajay@indicarbon.com";
  const name = email.split("@")[0].split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-background border-r border-border shadow-sm transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-card border border-border overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
            <Image
              src="/images/Indicrabon%20logo.png"
              alt="IndiCarbon AI logo"
              width={40}
              height={40}
              className="h-full w-full object-cover scale-110"
              priority
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-[15px] text-foreground tracking-tight block leading-none">
                IndiCarbon
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase block mt-0.5">
                AI Platform
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Live stats */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2.5 bg-muted border border-border rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground" />
            <span className="text-xs font-semibold text-foreground">Live Monitoring</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 pl-[18px]">−2.4 tCO₂ this hour</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Navigation
          </p>
        )}
        {sidebarItems.filter(item => {
          const isInternal = tokens?.is_internal || tokens?.roles?.includes("SUPER_ADMIN");
          if (item.href === "/admin") {
            return !!isInternal;
          }
          if (item.href === "/dashboard/integration") {
            return true;
          }
          if (isInternal) {
            return false;
          }
          return true;
        }).map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "bg-muted text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-foreground rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-foreground font-semibold border border-border">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-border pt-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={() => {
            dispatch(logout());
            window.location.href = "/auth/login";
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Log Out</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 p-3 rounded-xl bg-muted border border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                <span className="text-background text-xs font-bold">{initials}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
