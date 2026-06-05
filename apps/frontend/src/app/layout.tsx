import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/store/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://indicarbon.ajayv.online"),
  title: {
    default: "IndiCarbon AI — India's Net-Zero Intelligence Platform",
    template: "%s | IndiCarbon AI",
  },
  description:
    "Advanced predictive carbon accounting, AI-driven compliance, and localized offset trading to accelerate India's net-zero mission.",
  keywords: ["carbon credits", "net zero", "India", "sustainability", "carbon accounting", "ESG", "NDC goals", "BRSR compliance", "CPCB aligned"],
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "IndiCarbon AI — India's Net-Zero Intelligence Platform",
    description: "Advanced predictive carbon accounting, AI-driven compliance, and localized offset trading to accelerate India's net-zero mission.",
    url: "https://indicarbon.ajayv.online",
    siteName: "IndiCarbon AI",
    images: [
      {
        url: "/images/homePageIndia.png",
        width: 1200,
        height: 630,
        alt: "IndiCarbon AI Net-Zero Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoreProvider>
          {children}
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}
