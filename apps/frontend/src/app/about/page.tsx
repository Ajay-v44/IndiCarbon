import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About Us — IndiCarbon AI",
  description:
    "Learn about IndiCarbon AI — the team, mission, and technology behind India's leading carbon trading and sustainability compliance platform.",
};

export default function About() {
  return <AboutPage />;
}
