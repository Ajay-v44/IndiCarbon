import { PortfolioPage } from "@/components/pages/PortfolioPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon Portfolio: Digital Vault",
  description: "Your verified carbon credits and offset portfolio",
};

export default function Page() {
  return <PortfolioPage />;
}
