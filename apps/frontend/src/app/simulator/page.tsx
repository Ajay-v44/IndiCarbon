import { SimulatorPage } from "@/components/pages/SimulatorPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Climate Lab: AI Simulator",
  description: "What-if scenario modeling for carbon reduction strategies",
};

export default function Page() {
  return <SimulatorPage />;
}
