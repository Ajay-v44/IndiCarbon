import { MarketplaceSellPage } from "@/components/pages/MarketplaceSellPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon Marketplace | Sell Credits",
  description: "List your verified carbon credits for sale on the marketplace.",
};

export default function Page() {
  return <MarketplaceSellPage />;
}
