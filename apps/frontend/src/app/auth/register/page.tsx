import { RegisterForm } from "@/components/pages/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your IndiCarbon AI enterprise account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen gradient-hero grid-pattern flex items-center justify-center p-4 py-12">
      <RegisterForm />
    </div>
  );
}
