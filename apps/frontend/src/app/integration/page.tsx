import type { Metadata } from "next";
import { IntegrationPage } from "@/components/pages/IntegrationPage";

export const metadata: Metadata = {
  title: "Integration Guide — IndiCarbon AI",
  description:
    "Complete integration documentation for IndiCarbon AI: REST API, MCP server, authentication, and SDK quickstart for enterprise developers.",
};

export default function Integration() {
  return <IntegrationPage />;
}
