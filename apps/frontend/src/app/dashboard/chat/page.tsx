import type { Metadata } from "next";
import { SimpleAgentChatPage } from "@/components/pages/SimpleAgentChatPage";

export const metadata: Metadata = {
  title: "Agenti Chat",
  description: "Organization-scoped IndiCarbon AI chat workspace",
};

export default function Page() {
  return <SimpleAgentChatPage />;
}
