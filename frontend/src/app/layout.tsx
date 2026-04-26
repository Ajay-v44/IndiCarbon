import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IndiCarbon AI — India's Net-Zero Intelligence Platform",
    template: "%s | IndiCarbon AI",
  },
  description:
    "Advanced predictive carbon accounting, AI-driven compliance, and localized offset trading to accelerate India's net-zero mission.",
  keywords: ["carbon credits", "net zero", "India", "sustainability", "carbon accounting", "ESG"],
  openGraph: {
    title: "IndiCarbon AI",
    description: "Accelerating India's Net-Zero Future with AI-powered carbon intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
