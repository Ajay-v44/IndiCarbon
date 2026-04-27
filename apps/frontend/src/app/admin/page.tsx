import { AdminPage } from "@/components/pages/AdminPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin Command Center",
  description: "Enterprise admin and sales intelligence dashboard",
};

export default function Page() {
  return <AdminPage />;
}
