import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your IndiCarbon AI account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen gradient-hero grid-pattern flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}

import { LoginForm } from "@/components/pages/LoginForm";
