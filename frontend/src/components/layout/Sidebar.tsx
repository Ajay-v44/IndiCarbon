"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Vault,
  Leaf,
  ShieldCheck,
  Settings,
  ChevronLeft,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { href: "/simulator", label: "AI Simulator", icon: FlaskConical, badge: "Beta" },
  { href: "/portfolio", label: "Carbon Vault", icon: Vault, badge: null },
  { href: "/mission", label: "Mission", icon: Leaf, badge: null },
  { href: "/admin", label: "Admin Center", icon: ShieldCheck, badge: null },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r border-green-900/30 bg-[#0c1610] transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-green-900/30 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center glow-green-sm shrink-0">
            <Leaf className="w-4 h-4 text-green-400" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base">
              <span className="text-gradient">IndiCarbon</span>
            </span>
          )}
        </Link>
      </div>

      {/* Live stats ticker */}
      {!collapsed && (
        <div className="px-3 py-2 border-b border-green-900/20 bg-green-500/5">
          <div className="flex items-center gap-2">
            <div className="status-dot-green" />
            <span className="text-xs text-green-400/70">Real-time monitoring active</span>
          </div>
          <p className="text-xs text-green-300/50 mt-0.5 pl-4">-2.4 tCO₂ this hour</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-green-500/15 text-green-400 border border-green-500/20 glow-green-sm"
                  : "text-green-100/50 hover:text-green-300 hover:bg-green-500/8"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-green-400")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-green-900/30">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-100/40 hover:text-green-300 hover:bg-green-500/8 transition-all"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        {!collapsed && (
          <div className="mt-2 p-3 rounded-xl bg-green-500/8 border border-green-900/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-green-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-green-100 truncate">Ajay Verma</p>
                <p className="text-[10px] text-green-500/60">Enterprise · Admin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
