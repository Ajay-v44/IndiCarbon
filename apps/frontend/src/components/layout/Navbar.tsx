"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Leaf,
  FlaskConical,
  Vault,
  ShieldCheck,
  MessageSquareText,
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/auth-slice";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "Agenti Chat", icon: MessageSquareText },
  { href: "/simulator",  label: "AI Simulator",    icon: FlaskConical },
  { href: "/portfolio",  label: "Carbon Vault",    icon: Vault },
  { href: "/dashboard/integration", label: "MCP & API", icon: Plug },
  { href: "/admin",      label: "Command Center",  icon: ShieldCheck },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.auth.tokens);

  const email = tokens?.email || "ajay@indicarbon.com";
  const firstName = email.split("@")[0].split(/[._-]/)[0];
  const name = email.split("@")[0].split(/[._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 h-16 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="h-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

        {/* Logo – only shown when sidebar is hidden */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 lg:hidden">
          <div className="w-10 h-10 rounded-2xl bg-card border border-border overflow-hidden shadow-sm flex items-center justify-center">
            <Image
              src="/images/Indicrabon%20logo.png"
              alt="IndiCarbon AI logo"
              width={40}
              height={40}
              className="h-full w-full object-cover scale-110"
              priority
            />
          </div>
          <span className="font-bold text-[15px] text-foreground tracking-tight">
            IndiCarbon <span className="opacity-70">AI</span>
          </span>
        </Link>

        {/* Desktop nav (hidden on desktop – sidebar handles it; shown only if sidebar absent) */}
        <div className="hidden md:flex lg:hidden items-center gap-1">
          {navItems.filter(item => {
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
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-muted text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Spacer so right items stay right on desktop */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
            <div className="w-2 h-2 rounded-full bg-foreground" />
            <span className="text-xs font-semibold text-foreground">Live</span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full" />
          </Button>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all border border-transparent hover:border-border"
            >
              <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-background text-xs font-bold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{firstName}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {profileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-md z-20">
                  <div className="px-2.5 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        dispatch(logout());
                        window.location.href = "/auth/login";
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm text-destructive hover:text-destructive hover:bg-destructive/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl" />
              }
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background border-border p-0">
              <div className="p-5 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <div className="w-10 h-10 rounded-2xl bg-card border border-border overflow-hidden shadow-sm flex items-center justify-center">
                    <Image
                      src="/images/Indicrabon%20logo.png"
                      alt="IndiCarbon AI logo"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover scale-110"
                      priority
                    />
                  </div>
                  <div>
                    <span className="font-bold text-[15px] text-foreground tracking-tight block leading-none">IndiCarbon</span>
                    <span className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase block mt-0.5">AI Platform</span>
                  </div>
                </Link>
              </div>

              <div className="p-3 space-y-0.5">
                {navItems.filter(item => {
                  const isInternal = tokens?.is_internal || tokens?.roles?.includes("SUPER_ADMIN");
                  if (item.href === "/admin") {
                    return !!isInternal;
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
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "bg-muted text-foreground border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? "text-foreground" : "text-muted-foreground")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2.5 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center shrink-0">
                      <span className="text-background text-sm font-bold">{initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      dispatch(logout());
                      window.location.href = "/auth/login";
                    }}
                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
