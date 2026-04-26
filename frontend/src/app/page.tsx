import type { Metadata } from "next";
import { LandingPage } from "@/components/pages/LandingPage";

export const metadata: Metadata = {
  title: "IndiCarbon AI — Accelerating India's Net-Zero Future",
  description:
    "Advanced predictive carbon accounting and localized offset trading to meet India's NDC goals with precision.",
};

export default function HomePage() {
  return <LandingPage />;
}
