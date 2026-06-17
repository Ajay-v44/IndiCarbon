import type { Metadata } from "next";
import { TermsPage } from "@/components/pages/TermsPage";

export const metadata: Metadata = {
  title: "Terms of Service — IndiCarbon AI",
  description:
    "Terms and conditions governing use of the IndiCarbon AI platform, marketplace, and MCP services.",
};

export default function Terms() {
  return <TermsPage />;
}
