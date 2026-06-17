import type { Metadata } from "next";
import { IntegrationPage } from "@/components/pages/IntegrationPage";

export const metadata: Metadata = {
  title: "MCP & API — IndiCarbon AI",
  description:
    "Integration documentation for IndiCarbon AI: MCP server, REST API, and AI agent workflows.",
};

export default function DashboardIntegration() {
  return <IntegrationPage embedded />;
}
