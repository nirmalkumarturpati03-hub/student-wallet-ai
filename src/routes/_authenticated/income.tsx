import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/layout/AppShell";
import IncomePage from "@/features/income/IncomePage";

export const Route = createFileRoute("/_authenticated/income")({
  head: () => ({ meta: [{ title: "Income · Student Wallet AI" }] }),
  component: () => <AppShell><IncomePage /></AppShell>,
});
