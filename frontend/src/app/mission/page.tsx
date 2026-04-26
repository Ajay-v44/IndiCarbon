import { MissionPage } from "@/components/pages/MissionPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Mission: India's Net-Zero Journey",
  description: "IndiCarbon AI's mission to accelerate India's net-zero future",
};

export default function Page() {
  return <MissionPage />;
}
