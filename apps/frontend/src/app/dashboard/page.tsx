import type { Metadata } from "next";
import { DashboardPage } from "@/components/pages/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your carbon footprint monitoring and analytics workspace",
};

export default function Page() {
  return <DashboardPage />;
}
