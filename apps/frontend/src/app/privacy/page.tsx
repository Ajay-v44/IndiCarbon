import type { Metadata } from "next";
import { PrivacyPage } from "@/components/pages/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy Policy — IndiCarbon AI",
  description:
    "How IndiCarbon AI collects, uses, and protects your data. DPDP Act 2023 compliant.",
};

export default function Privacy() {
  return <PrivacyPage />;
}
