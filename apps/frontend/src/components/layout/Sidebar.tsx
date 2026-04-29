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
  Settings,
  User,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard, badge: null },
  { href: "/simulator",  label: "AI Simulator",  icon: FlaskConical,    badge: "Beta" },
  { href: "/portfolio",  label: "Carbon Vault",  icon: Vault,           badge: null },
  { href: "/mission",    label: "Mission",       icon: Leaf,            badge: null },
  { href: "/admin",      label: "Admin Center",  icon: ShieldCheck,     badge: null },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-background border-r border-border shadow-sm transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-card border border-border overflow-hidden shrink-0 shadow-sm">
            <Image
              src="/images/Indicrabon%20logo.png"
              alt="IndiCarbon AI logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
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
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
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

        {!collapsed && (
          <div className="mt-3 p-3 rounded-xl bg-muted border border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                <span className="text-background text-xs font-bold">AV</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">Ajay Verma</p>
                <p className="text-[11px] text-muted-foreground truncate">Enterprise · Admin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
