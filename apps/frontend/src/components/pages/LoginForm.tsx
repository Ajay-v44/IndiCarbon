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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 mb-4 glow-green-sm">
          <Leaf className="w-7 h-7 text-green-400" />
        </div>
        <h1 className="text-2xl font-black text-white">Welcome back</h1>
        <p className="text-sm text-green-400/60 mt-1">Sign in to IndiCarbon AI</p>
      </div>

      {/* Card */}
      <div className="glass border border-green-900/30 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-green-200/70">
              Work Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50 focus:ring-green-500/20"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-green-200/70">
                Password
              </Label>
              <Link href="/auth/forgot" className="text-xs text-green-400/60 hover:text-green-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50 focus:ring-green-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500/50 hover:text-green-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-11 mt-2 glow-green"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
          <div className="flex-1 h-px bg-green-900/40" />
          <span className="text-xs text-green-600/50">or continue with</span>
          <div className="flex-1 h-px bg-green-900/40" />
        </div>

        {/* SSO */}
        <Button
          variant="outline"
          className="w-full border-green-900/50 text-green-300/70 hover:bg-green-500/8 hover:text-green-200 gap-2"
        >
          <Zap className="w-4 h-4 text-green-400" />
          Continue with SSO
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-green-500/50 mt-6">
          New to IndiCarbon?{" "}
          <Link href="/auth/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </div>

      {/* Enterprise note */}
      <p className="text-center text-xs text-green-600/40 mt-6">
        🔒 SOC 2 Type II · End-to-end encrypted · CPCB Compliant
      </p>
    </div>
  );
}
