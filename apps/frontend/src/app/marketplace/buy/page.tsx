import { MarketplaceBuyPage } from "@/components/pages/MarketplaceBuyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon Marketplace | Buy Credits",
  description: "Browse and purchase verified carbon credits from top projects.",
};

export default function Page() {
  return <MarketplaceBuyPage />;
}
