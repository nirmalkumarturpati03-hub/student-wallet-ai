import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import AssistantPage from "@/features/assistant/AssistantPage";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · Student Wallet AI" }] }),
  component: () => <AppShell><AssistantPage /></AppShell>,
});
