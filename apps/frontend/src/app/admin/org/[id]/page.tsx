import { AdminOrgDetailPage } from "@/components/pages/AdminOrgDetailPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Audit Trail | IndiCarbon Admin Center",
  description: "Detailed regulatory audit trail for registered enterprise customer.",
};

export default function Page() {
  return <AdminOrgDetailPage />;
}
