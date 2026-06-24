import type { Metadata } from "next";
import { A2APage } from "@/components/pages/A2APage";

export const metadata: Metadata = {
  title: "A2A Agents — IndiCarbon AI",
  description: "Agent-to-Agent protocol interface for inter-agent communication and task management.",
};

export default function Page() {
  return <A2APage />;
}
