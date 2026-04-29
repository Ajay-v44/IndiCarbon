"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff, Zap } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted border border-border mb-4">
          <Leaf className="w-7 h-7 text-foreground" />
        </div>
        <h1 className="text-2xl font-black text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to IndiCarbon AI</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Work Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Link
                href="/auth/forgot"
                className="text-xs text-foreground underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-background text-foreground placeholder:text-muted-foreground"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 font-bold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* SSO */}
        <Button
          variant="outline"
          className="w-full gap-2"
        >
          <Zap className="w-4 h-4" />
          Continue with SSO
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          New to IndiCarbon?{" "}
          <Link
            href="/auth/register"
            className="text-foreground underline underline-offset-4 font-medium hover:opacity-80 transition-opacity"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Enterprise note */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        SOC 2 Type II · End-to-end encrypted · CPCB Compliant
      </p>
    </div>
  );
}
