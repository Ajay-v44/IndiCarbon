import { CarbonProjectsPage } from "@/components/pages/CarbonProjectsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carbon Projects | IndiCarbon — Submit & Track Verification",
  description:
    "Submit carbon reduction projects for verification and credit issuance. Track PDD completeness, registry status, and estimated credit potential.",
};

export default function Page() {
  return <CarbonProjectsPage />;
}
