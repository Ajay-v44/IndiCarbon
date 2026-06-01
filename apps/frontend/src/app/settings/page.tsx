import { SettingsPage } from "@/components/pages/SettingsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & Governance",
  description: "Manage organizational roles, user lists, and platform settings.",
};

export default function Page() {
  return <SettingsPage />;
}
