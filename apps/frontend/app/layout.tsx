import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IndiCarbon AI — Sustainability Compliance & Carbon Trading",
    template: "%s | IndiCarbon AI",
  },
  description:
    "India's first AI-powered sustainability compliance platform. Automate SEBI BRSR reporting, calculate GHG emissions, and trade verified carbon credits.",
  keywords: ["carbon trading", "BRSR", "ESG", "GHG", "sustainability", "India", "carbon credits"],
  openGraph: {
    title: "IndiCarbon AI",
    description: "AI-powered carbon compliance for Indian enterprises.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
