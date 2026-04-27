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
        "hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-gray-100 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-[15px] text-gray-900 tracking-tight block leading-none">
                IndiCarbon
              </span>
              <span className="text-[10px] font-medium text-green-600 tracking-widest uppercase block mt-0.5">
                AI Platform
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Live stats */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2.5 bg-green-50 border border-green-100 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="status-dot-green" />
            <span className="text-xs font-semibold text-green-700">Live Monitoring</span>
          </div>
          <p className="text-[11px] text-green-600 mt-0.5 pl-[18px]">−2.4 tCO₂ this hour</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
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
                  ? "bg-green-50 text-green-700 border border-green-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-600 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">
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
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {!collapsed && (
          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AV</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate leading-tight">Ajay Verma</p>
                <p className="text-[11px] text-gray-500 truncate">Enterprise · Admin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
