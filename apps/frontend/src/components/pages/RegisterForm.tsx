"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Mail,
  Lock,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Phone,
} from "lucide-react";

const STEPS = ["Account", "Organization", "Preferences"];

const industryOptions = [
  "Manufacturing",
  "Energy & Utilities",
  "Logistics & Transport",
  "Construction",
  "Agriculture",
  "IT & Services",
  "Retail",
  "Other",
];

export function RegisterForm() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    industry: "",
    size: "",
    phone: "",
  });

  const update = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        window.location.href = "/dashboard";
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/25 mb-3">
          <Leaf className="w-6 h-6 text-green-400" />
        </div>
        <h1 className="text-2xl font-black text-white">Create your account</h1>
        <p className="text-sm text-green-400/60 mt-1">Start your net-zero journey</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                i < step
                  ? "bg-green-500 text-black"
                  : i === step
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-green-950/60 text-green-600/40 border border-green-900/40"
              }`}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i === step ? "text-green-400" : "text-green-600/40"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < step ? "bg-green-500" : "bg-green-900/40"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="glass border border-green-900/30 rounded-2xl p-7 shadow-2xl">
        <form onSubmit={handleNext} className="space-y-4">
          {/* Step 0: Account */}
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-green-200/70">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                  <Input
                    id="name"
                    placeholder="Ajay Verma"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="pl-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium text-green-200/70">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="pl-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium text-green-200/70">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="pl-10 pr-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500/50 hover:text-green-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-green-600/40">Minimum 8 characters</p>
              </div>
            </>
          )}

          {/* Step 1: Organization */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-green-200/70">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                  <Input
                    id="company"
                    placeholder="Tata Steel Ltd."
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    className="pl-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-green-200/70">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="pl-10 bg-green-950/40 border-green-900/50 text-green-100 placeholder:text-green-600/40 focus:border-green-500/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-200/70">Industry Sector</Label>
                <div className="grid grid-cols-2 gap-2">
                  {industryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update("industry", opt)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                        form.industry === opt
                          ? "bg-green-500/15 border-green-500/40 text-green-300"
                          : "border-green-900/40 text-green-500/50 hover:border-green-500/20 hover:text-green-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/8 border border-green-500/15">
                <h3 className="text-sm font-semibold text-green-300 mb-3">Your account summary</h3>
                <div className="space-y-2 text-xs text-green-400/60">
                  <div className="flex justify-between">
                    <span>Name</span>
                    <span className="text-green-300">{form.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email</span>
                    <span className="text-green-300">{form.email || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company</span>
                    <span className="text-green-300">{form.company || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industry</span>
                    <span className="text-green-300">{form.industry || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-green-200/70">Plan</p>
                {[
                  { name: "Free Trial", desc: "30 days, 1 facility", price: "Free" },
                  { name: "Enterprise", desc: "Unlimited, full features", price: "Contact Sales" },
                ].map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg border border-green-900/40 hover:border-green-500/20 cursor-pointer transition-all">
                    <div>
                      <p className="text-sm font-medium text-green-200">{plan.name}</p>
                      <p className="text-xs text-green-500/50">{plan.desc}</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                      {plan.price}
                    </Badge>
                  </div>
                ))}
              </div>

              <p className="text-xs text-green-600/40 text-center">
                By creating an account, you agree to our{" "}
                <span className="text-green-500/60 underline cursor-pointer">Terms of Service</span>{" "}
                and{" "}
                <span className="text-green-500/60 underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-11 mt-2 glow-green"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating account...
              </div>
            ) : step < STEPS.length - 1 ? (
              <div className="flex items-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Create Account <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-green-500/50 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
