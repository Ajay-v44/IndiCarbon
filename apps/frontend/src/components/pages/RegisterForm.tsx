"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, register } from "@/store/auth-slice";
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
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    industry: "",
    size: "",
    phone: "",
  });
  const loading = authStatus === "loading";

  const update = (key: keyof typeof form, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const result = await dispatch(register({
        email: form.email,
        password: form.password,
        full_name: form.name,
        phone_number: form.phone || undefined,
        designation: [form.company, form.industry].filter(Boolean).join(" - ") || undefined,
      }));
      if (register.fulfilled.match(result)) {
        window.location.href = "/dashboard";
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted border border-border mb-3">
          <Leaf className="w-6 h-6 text-foreground" />
        </div>
        <h1 className="text-2xl font-black text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start your net-zero journey</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                i < step
                  ? "bg-foreground text-background"
                  : i === step
                  ? "bg-muted text-foreground border border-border"
                  : "bg-muted/50 text-muted-foreground border border-border"
              }`}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < step ? "bg-foreground" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
        <form onSubmit={handleNext} className="space-y-4">
          {authError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {authError}
            </div>
          )}

          {/* Step 0: Account */}
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ajay Verma"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="pl-10 bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium text-foreground">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="pl-10 bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="pl-10 pr-10 bg-background text-foreground placeholder:text-muted-foreground"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>
            </>
          )}

          {/* Step 1: Organization */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium text-foreground">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Tata Steel Ltd."
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    className="pl-10 bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="pl-10 bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Industry Sector</Label>
                <div className="grid grid-cols-2 gap-2">
                  {industryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update("industry", opt)}
                      className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                        form.industry === opt
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <input className="sr-only" value={form.industry} onChange={() => undefined} required />
              </div>
            </>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Your account summary</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Name</span>
                    <span className="text-foreground">{form.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email</span>
                    <span className="text-foreground">{form.email || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company</span>
                    <span className="text-foreground">{form.company || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Industry</span>
                    <span className="text-foreground">{form.industry || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-foreground">Plan</p>
                {[
                  { name: "Free Trial", desc: "30 days, 1 facility", price: "Free" },
                  { name: "Enterprise", desc: "Unlimited, full features", price: "Contact Sales" },
                ].map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer transition-all">
                    <div>
                      <p className="text-sm font-medium text-foreground">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.desc}</p>
                    </div>
                    <Badge className="bg-muted text-foreground border-border text-xs">
                      {plan.price}
                    </Badge>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <span className="text-foreground underline underline-offset-4 cursor-pointer">Terms of Service</span>{" "}
                and{" "}
                <span className="text-foreground underline underline-offset-4 cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 font-bold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
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

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-foreground underline underline-offset-4 font-medium hover:opacity-80 transition-opacity"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
